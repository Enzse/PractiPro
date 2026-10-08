# PractiPro API

A JSON API in plain PHP 8.2: no framework, just Composer autoloading and two libraries (phpdotenv and PHPMailer).

## Layout

```
backend/
├── public/          The only web-accessible folder. index.php is the front controller.
├── routes/api.php   Every endpoint: URL, controller method, and who may call it.
├── src/
│   ├── App.php          Request -> Response: routing, auth, CORS, error handling.
│   ├── Container.php    Builds controllers and their dependencies from type hints.
│   ├── Http/            Request, Response, Router, HttpException.
│   ├── Auth/            JWT encoding/verification, roles, the current user.
│   ├── Controllers/     One per feature area. Validate input, check access, call repositories.
│   ├── Repositories/    The only classes that contain SQL.
│   ├── Database/        PDO wrapper with transactions, and a .sql file loader.
│   └── Support/         Mail, passwords and upload handling.
├── database/        schema.sql (structure) and seed.sql (development data).
└── tests/           PHPUnit: Unit/ for single classes, Feature/ for full requests.
```

## How a request is handled

1. Apache sends every request under `public/` to `index.php` (see `public/.htaccess`).
2. `index.php` loads `.env` and hands a `Request` to `App::handle()`.
3. The `Router` finds the route matching the method and path, or returns 404/405.
4. Unless the route is `public()`, the `Authorization: Bearer <token>` header must hold a valid, unexpired JWT (401 otherwise), and the user's role must be allowed by the route (403 otherwise).
5. The `Container` builds the controller, and the controller method returns a `Response`.
6. Any `HttpException` becomes a JSON error with its status code. Other errors are logged and returned as a generic 500, with details shown only when `APP_DEBUG=true`.

## Security rules

- **Secure by default.** Routes require login unless marked `->public()`.
- **Roles, then ownership.** `routes/api.php` limits which roles can call an endpoint. Controllers then check the specific record: students can only access their own records, coordinators only their assigned classes, supervisors only their own company. See the `authorize*` helpers in `Controllers/Controller.php`.
- **No values in SQL.** Every value is a bound parameter. Where a client picks a table or column, it must be on a constant allow-list in the repository.
- **IDs from the token, not the request.** Actions such as commenting take the user's identity from the token, not from the request body.
- **Tokens are hashed.** Activation and reset tokens are stored as SHA-256 hashes, and passwords with `password_hash()`.

## Responses

Most endpoints return the original envelope, which the frontend relies on:

```json
{ "status": { "remarks": "success", "message": "..." }, "payload": [...], "timestamp": "..." }
```

Exceptions: `POST /login` returns `{ "token": "..." }`, `GET /submissionmaxweeks/...` returns a bare array, and the file and image endpoints return the raw file.

## Development

```sh
composer install
cp .env.example .env     # then set SECRET_KEY
composer test            # PHPUnit; creates and rebuilds the `practipro_test` database
composer analyse         # PHPStan, level 8
```

With `MAIL_USERNAME` empty, emails (activation and reset links) are written to Apache's error log instead of being sent.

## Known limitations

- Uploaded files are stored in the database as BLOBs. Moving them to disk or object storage would make the database much smaller.
- Some business rules live in MySQL triggers (for example, creating the student, coordinator or supervisor row when a `user` is inserted). See `database/schema.sql`.
- Coordinators and supervisors can read any student's records by id. Only class- and company-level endpoints are scoped to their own students.
