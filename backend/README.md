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
├── bin/migrate.php  Applies new database migrations (composer migrate).
├── database/        schema.sql (base structure), migrations/ (later changes), seed.sql (dev data).
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
- **Roles, then ownership.** `routes/api.php` limits which roles can call an endpoint. Controllers then check the specific record through the `authorize*` helpers in `Controllers/Controller.php`. A student's records (submissions, time records, reports, evaluations, comments, files) are visible only to:
  - the student;
  - the coordinator of the student's class;
  - a supervisor at the company the student is placed in;
  - admins.
- **Directory lookups.** Coordinators and supervisors can look a student up by student number (to invite or hire them), but phone number, address and birth date are blanked unless the student is theirs.
- **Approval.** Self-registered coordinator and supervisor accounts can't log in until an admin approves them (`POST /approveuser/{id}`). Accounts an admin creates are approved immediately.
- **Joining classes.** A student joins a class only by accepting an invitation or presenting a valid join-link token. A coordinator adds a student only by accepting that student's join request.
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
composer migrate         # apply new files in database/migrations/
```

With `MAIL_USERNAME` empty, emails (activation and reset links) are written to Apache's error log instead of being sent.

### Changing the database

Don't edit `schema.sql`. Add a new file to `database/migrations/` named so it sorts after the existing ones (for example `2026_11_02_01_add_x.sql`), then run `composer migrate`. The tests apply migrations automatically.

## Known limitations

- Uploaded files are stored in the database as BLOBs. Moving them to disk or object storage would make the database much smaller.
- Some business rules live in MySQL triggers (for example, creating the student, coordinator or supervisor row when a `user` is inserted). See `database/schema.sql`.
