<?php

declare(strict_types=1);

namespace PractiPro\Http;

/**
 * Holds the route table and finds the route for a request.
 */
final class Router
{
    /** @var list<Route> */
    private array $routes = [];

    /**
     * @param array{0: class-string, 1: string} $handler
     */
    public function get(string $pattern, array $handler): Route
    {
        return $this->add('GET', $pattern, $handler);
    }

    /**
     * @param array{0: class-string, 1: string} $handler
     */
    public function post(string $pattern, array $handler): Route
    {
        return $this->add('POST', $pattern, $handler);
    }

    /**
     * @param array{0: class-string, 1: string} $handler
     */
    public function delete(string $pattern, array $handler): Route
    {
        return $this->add('DELETE', $pattern, $handler);
    }

    /**
     * @param array{0: class-string, 1: string} $handler
     */
    public function add(string $method, string $pattern, array $handler): Route
    {
        $route = new Route($method, $pattern, $handler);
        $this->routes[] = $route;

        return $route;
    }

    /**
     * @return array{0: Route, 1: array<string, string>}
     *
     * @throws HttpException 404 if no route has the path, 405 if none has the method.
     */
    public function match(string $method, string $path): array
    {
        $pathExists = false;
        foreach ($this->routes as $route) {
            $params = $route->match($path);
            if ($params === null) {
                continue;
            }
            if ($route->method === $method) {
                return [$route, $params];
            }
            $pathExists = true;
        }

        if ($pathExists) {
            throw new HttpException(405, 'Method not allowed.');
        }
        throw HttpException::notFound('Endpoint not found.');
    }

    /**
     * @return list<Route>
     */
    public function routes(): array
    {
        return $this->routes;
    }
}
