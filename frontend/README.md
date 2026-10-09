# PractiPro web app

The Angular 22 frontend. See the [root README](../README.md) for setup.

## Layout

Code is grouped by feature (Angular style guide):

```
src/app/
├── app.routes.ts       Public pages; each role's pages load from features/<role>/<role>.routes.ts.
├── core/               App-wide, one instance each
│   ├── api/            One service per feature area. All HTTP calls live here.
│   ├── models/         Types for what the API sends and accepts.
│   ├── auth/           SessionService, the token interceptor, role guards.
│   ├── layout/         SidebarService (sidebar open/closed on small screens).
│   └── data-refresh.service.ts   "Data changed, reload" notifications between components.
├── shared/             Reusable across roles
│   ├── components/     chart, accordion
│   ├── dialogs/        comments, PDF viewer, submissions, requirements, add seminar
│   └── pipes/, validators/, utils/
└── features/
    ├── auth/           login, registration (one page per role), reset password, activation
    ├── landing/
    ├── student/        layout/, one folder per page, dialogs/, guards/, student.routes.ts
    ├── coordinator/    same shape; also class selection and selected-class.service.ts
    ├── supervisor/
    └── admin/
```

A page's dialogs live in its feature's `dialogs/` folder; a dialog used by more than one role lives in `shared/dialogs/`.

## Calling the API

Inject the service for the feature and subscribe:

```ts
private readonly dtrApi = inject(DtrService); // core/api/dtr.service.ts

this.dtrApi.forStudent(studentId).subscribe((res) => {
  this.records = res.payload; // TimeRecord[]
});
```

Most endpoints return `ApiResponse<T>` (`{ status, payload, timestamp }`), defined in `core/models/api.ts`. The login token is attached automatically by `core/auth/auth.interceptor.ts`.

## Commands

```sh
npm start                        # dev server at http://localhost:4200
npx ng test --watch=false        # unit tests (Vitest)
npx ng build                     # production build into dist/
```
