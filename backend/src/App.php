<?php

declare(strict_types=1);

namespace PractiPro;

use PDOException;
use PractiPro\Auth\AuthUser;
use PractiPro\Auth\InvalidTokenException;
use PractiPro\Auth\Jwt;
use PractiPro\Database\Database;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Http\Router;
use PractiPro\Http\UnauthenticatedException;
use PractiPro\Support\FileStorage;
use PractiPro\Support\LogMailer;
use PractiPro\Support\Mailer;
use PractiPro\Support\SmtpMailer;
use Throwable;

/**
 * Turns a Request into a Response. This is the single place where routing,
 * authentication, authorization, CORS and error handling happen, so
 * controllers only deal with their own feature.
 */
final class App
{
    public function __construct(
        private readonly Config $config,
        private readonly Router $router,
        private readonly Container $container,
    ) {
    }

    /**
     * Wires up the production services.
     */
    public static function create(Config $config): self
    {
        $container = new Container();
        $container->bind(Config::class, fn () => $config);
        $container->bind(Database::class, fn () => Database::connect($config));
        $container->bind(Jwt::class, fn () => new Jwt($config->secretKey, $config->tokenTtlSeconds));
        $container->bind(FileStorage::class, fn () => new FileStorage($config->storagePath));
        $container->bind(Mailer::class, fn (Container $c) => $config->mailUsername === ''
            ? new LogMailer()
            : $c->get(SmtpMailer::class));

        $router = new Router();
        (require __DIR__ . '/../routes/api.php')($router);

        return new self($config, $router, $container);
    }

    public function container(): Container
    {
        return $this->container;
    }

    public function handle(Request $request): Response
    {
        if ($request->method() === 'OPTIONS') {
            return $this->withCors(Response::empty(204));
        }

        try {
            $response = $this->dispatch($request);
        } catch (UnauthenticatedException $e) {
            $response = Response::error($e->getMessage(), 401)->withHeader('WWW-Authenticate', 'Bearer');
        } catch (HttpException $e) {
            $response = Response::error($e->getMessage(), $e->status());
        } catch (PDOException $e) {
            $response = $this->databaseError($e);
        } catch (Throwable $e) {
            $response = $this->serverError($e);
        }

        return $this->withCors($response);
    }

    private function dispatch(Request $request): Response
    {
        [$route, $params] = $this->router->match($request->method(), $request->path());
        $request = $request->withParams($params)->withUser($this->authenticate($request, $route->isPublic()));

        if (!$route->isPublic()) {
            $user = $request->user();
            if (!$route->allows($user)) {
                throw HttpException::forbidden();
            }
        }

        [$class, $method] = $route->handler;

        return $this->container->get($class)->$method($request);
    }

    /**
     * Reads the user from the "Authorization: Bearer <token>" header.
     * Public routes accept a missing or invalid token; other routes reject it.
     */
    private function authenticate(Request $request, bool $isPublicRoute): ?AuthUser
    {
        $token = $request->bearerToken();
        if ($token === null) {
            if ($isPublicRoute) {
                return null;
            }
            throw new UnauthenticatedException();
        }

        try {
            return AuthUser::fromClaims($this->container->get(Jwt::class)->decode($token));
        } catch (InvalidTokenException) {
            if ($isPublicRoute) {
                return null;
            }
            throw new UnauthenticatedException('Your session has expired. Please log in again.');
        }
    }

    private function databaseError(PDOException $e): Response
    {
        // SQLSTATE 23000: a unique key or foreign key constraint was violated.
        // (PDOException's code is the SQLSTATE string, despite getCode()'s declared int type.)
        if ((string) $e->getCode() === '23000') {
            return Response::error('This conflicts with existing data.', 409);
        }

        return $this->serverError($e);
    }

    private function serverError(Throwable $e): Response
    {
        error_log(sprintf('[PractiPro] %s: %s in %s:%d', $e::class, $e->getMessage(), $e->getFile(), $e->getLine()));

        $message = $this->config->debug
            ? sprintf('%s: %s (%s:%d)', $e::class, $e->getMessage(), basename($e->getFile()), $e->getLine())
            : 'Something went wrong on the server.';

        return Response::error($message, 500);
    }

    private function withCors(Response $response): Response
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', $this->config->frontendUrl)
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Expose-Headers', 'WWW-Authenticate, Content-Disposition')
            ->withHeader('Vary', 'Origin');
    }
}
