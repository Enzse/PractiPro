<?php

declare(strict_types=1);

namespace PractiPro\Controllers;

use PractiPro\Auth\Jwt;
use PractiPro\Auth\Role;
use PractiPro\Config;
use PractiPro\Database\Database;
use PractiPro\Http\HttpException;
use PractiPro\Http\Request;
use PractiPro\Http\Response;
use PractiPro\Repositories\OwnershipRepository;
use PractiPro\Repositories\UserRepository;
use PractiPro\Support\Mailer;
use PractiPro\Support\Passwords;

/**
 * Login, registration, account activation and password reset.
 */
final class AuthController extends Controller
{
    private const RESET_TOKEN_TTL_SECONDS = 30 * 60;

    public function __construct(
        OwnershipRepository $ownership,
        private readonly UserRepository $users,
        private readonly Database $db,
        private readonly Jwt $jwt,
        private readonly Mailer $mailer,
        private readonly Config $config,
    ) {
        parent::__construct($ownership);
    }

    public function login(Request $request): Response
    {
        ['email' => $email, 'password' => $password] = $request->require(['email', 'password']);

        $user = $this->users->findForLogin((string) $email);
        // Same response for an unknown email and a wrong password, so the
        // endpoint can't be used to find out who has an account.
        if ($user === null || $user['password'] === null || !password_verify((string) $password, $user['password'])) {
            throw HttpException::unauthorized('Invalid credentials.');
        }
        if ((int) $user['isActive'] !== 1) {
            throw HttpException::forbidden('This account has not been activated yet.');
        }
        if ($user['approved_at'] === null) {
            throw HttpException::forbidden('Your account is waiting for approval from an administrator.');
        }

        $token = $this->jwt->encode([
            'id' => (int) $user['id'],
            'firstName' => $user['firstName'],
            'lastName' => $user['lastName'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]);

        return Response::json(['token' => $token]);
    }

    public function register(Request $request): Response
    {
        $data = $request->require(['firstName', 'lastName', 'email', 'password', 'role']);
        $role = (string) $data['role'];

        $actingUser = $request->optionalUser();
        $canCreateAdmins = $actingUser !== null && $actingUser->isAdmin();
        if (!in_array($role, Role::SELF_REGISTRABLE, true) && !($role === Role::ADMIN && $canCreateAdmins)) {
            throw HttpException::forbidden("You can't register an account with the role '$role'.");
        }

        $email = trim((string) $data['email']);
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw HttpException::unprocessable('Please enter a valid email address.');
        }
        $password = Passwords::assertStrong($data['password']);

        if ($this->users->emailExists($email)) {
            throw HttpException::conflict('A user with this email already exists.');
        }

        [$activationToken, $activationHash] = Passwords::newToken();

        // Coordinators and supervisors see student data, so a self-registered
        // one waits for an admin. Accounts an admin creates are approved already.
        $approved = $canCreateAdmins || !in_array($role, Role::REQUIRES_APPROVAL, true);
        $approvedBy = $canCreateAdmins ? $actingUser->id : null;

        // If the email can't be sent the whole registration is rolled back, so
        // the person can simply try again.
        $this->db->transaction(function () use ($request, $data, $email, $password, $role, $activationToken, $activationHash, $approved, $approvedBy) {
            $this->users->create(
                (string) $data['firstName'],
                (string) $data['lastName'],
                $email,
                password_hash($password, PASSWORD_DEFAULT),
                $role,
                $activationHash,
                $approved,
                $approvedBy,
            );
            $this->completeProfile($request, $role, $email);

            $link = $this->config->frontendUrl . '/activate-account?token=' . $activationToken;
            $this->sendMail($email, 'Account Activation', "Click <a href=\"$link\">here</a> to activate your account.");
        });

        return $this->done('Successfully sent activation email');
    }

    private function completeProfile(Request $request, string $role, string $email): void
    {
        switch ($role) {
            case Role::STUDENT:
                $student = $request->require(['studentId', 'program', 'year']);
                if ($this->users->studentIdTaken((string) $student['studentId'])) {
                    throw HttpException::conflict('The student ID is already in use.');
                }
                $this->users->completeStudentProfile($email, (string) $student['studentId'], (string) $student['program'], (int) $student['year']);
                break;
            case Role::ADVISOR:
                $this->users->completeAdvisorProfile($email, (string) $request->require(['department'])['department']);
                break;
            case Role::SUPERVISOR:
                $companyName = (string) $request->require(['company_name'])['company_name'];
                $this->users->completeSupervisorProfile(
                    $email,
                    $companyName,
                    $request->input('address'),
                    $request->input('position'),
                    $request->input('phone'),
                );
                break;
        }
    }

    public function checkActivationToken(Request $request): Response
    {
        if (!$this->users->hasActivationToken(Passwords::hashToken($request->param('token')))) {
            throw HttpException::notFound('Token Not Found');
        }

        return $this->done('Token Found!');
    }

    public function activate(Request $request): Response
    {
        $tokenHash = Passwords::hashToken((string) $request->require(['token'])['token']);
        $role = $this->users->roleOfActivationToken($tokenHash);
        if ($role === null || $this->users->activate($tokenHash) === 0) {
            throw HttpException::notFound('This activation link is invalid or has already been used.');
        }

        return in_array($role, Role::REQUIRES_APPROVAL, true)
            ? $this->done('Successfully activated account. An administrator must approve it before you can log in.', ['awaitingApproval' => true])
            : $this->done('Successfully activated account.');
    }

    public function requestPasswordReset(Request $request): Response
    {
        $email = (string) $request->require(['email'])['email'];
        if (!$this->users->emailExists($email)) {
            throw HttpException::notFound('Email not found.');
        }

        [$token, $tokenHash] = Passwords::newToken();
        $expiresAt = date('Y-m-d H:i:s', time() + self::RESET_TOKEN_TTL_SECONDS);

        $this->db->transaction(function () use ($email, $token, $tokenHash, $expiresAt) {
            $this->users->setResetToken($email, $tokenHash, $expiresAt);
            $link = $this->config->frontendUrl . '/reset-password?token=' . $token;
            $this->sendMail($email, 'Password Reset', "Click <a href=\"$link\">here</a> to reset your password.");
        });

        return $this->done('Successfully generated reset token.');
    }

    public function checkResetToken(Request $request): Response
    {
        $expiry = $this->users->resetTokenExpiry(Passwords::hashToken($request->param('token')));
        if ($expiry === null) {
            throw HttpException::notFound('Token Not Found');
        }
        if (strtotime($expiry) <= time()) {
            throw HttpException::unauthorized('Token Expired');
        }

        return $this->done('Token Found!');
    }

    public function resetPassword(Request $request): Response
    {
        $data = $request->require(['token', 'password']);
        $password = Passwords::assertStrong($data['password']);

        $updated = $this->users->resetPassword(Passwords::hashToken((string) $data['token']), password_hash($password, PASSWORD_DEFAULT));
        if ($updated === 0) {
            throw HttpException::badRequest('This reset link is invalid or has expired.');
        }

        return $this->done('Successfully reset password');
    }

    private function sendMail(string $to, string $subject, string $body): void
    {
        try {
            $this->mailer->send($to, $subject, $body);
        } catch (\RuntimeException $e) {
            error_log('[PractiPro] ' . $e->getMessage());
            throw new HttpException(502, 'We could not send the email. Please try again later.');
        }
    }
}
