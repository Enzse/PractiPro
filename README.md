# PractiPro

A practicum (OJT) management system for students, coordinators, industry supervisors and administrators. It covers class enrollment, requirement submissions, daily time records, weekly accomplishment reports, seminars, evaluations and final reports.

| Part | Stack | Location |
|---|---|---|
| Frontend | Angular 17, Tailwind CSS | [PractiProAngular/](PractiProAngular/) |
| API | PHP 8.2, PDO (no framework) | [backend/](backend/) |
| Database | MySQL / MariaDB 10.4+ | [backend/database/](backend/database/) |

## Local setup

Requirements: [XAMPP](https://www.apachefriends.org/) (Apache, PHP 8.2+, MariaDB), [Composer](https://getcomposer.org/), and Node.js 18+.

1. **Clone into XAMPP's web root** so Apache serves the API at `http://localhost/PractiPro/backend/public`:

   ```sh
   cd C:/xampp/htdocs
   git clone <repo-url> PractiPro
   ```

   Apache needs `mod_rewrite` and `mod_headers` enabled (both are on by default in XAMPP).

2. **Create the database** and load the schema and development seed:

   ```sh
   mysql -u root -e "CREATE DATABASE practipro CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
   mysql -u root practipro < backend/database/schema.sql
   mysql -u root practipro < backend/database/seed.sql
   ```

3. **Install the API's dependencies and configure it:**

   ```sh
   cd backend
   composer install
   cp .env.example .env
   ```

   Open `.env` and set `SECRET_KEY` (the file explains how to generate one). Leave the `MAIL_*` values empty to have emails written to Apache's error log instead of being sent.

4. **Start the frontend:**

   ```sh
   cd PractiProAngular
   npm install
   npm start
   ```

   Open http://localhost:4200 and sign in as `admin@practipro.test` with password `password`.

## Configuration

- **API:** `backend/.env`, which is never committed. [`.env.example`](backend/.env.example) lists every setting.
- **Frontend:** the API URL is in [`src/environments/`](PractiProAngular/src/environments/). `ng serve` uses `environment.development.ts`, and `ng build` uses `environment.ts`.

## Tests

```sh
cd backend
composer test      # API tests (needs MySQL; uses its own `practipro_test` database)
composer analyse   # static analysis

cd PractiProAngular
npm test
```

See [backend/README.md](backend/README.md) for how the API is put together.
