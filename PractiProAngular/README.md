# PractiPro web app

The Angular 22 frontend. See the [root README](../README.md) for setup.

## Layout

```
src/app/
├── app.routes.ts      Every page and the guard that protects it. Pages load on demand.
├── components/        Pages, grouped by role (page-student, page-coordinator, ...), and popups.
├── services/
│   ├── api/           One service per feature area. All HTTP calls live here.
│   ├── session.service.ts   The logged-in user, read from the login token.
│   └── sidebar.service.ts   Whether the sidebar is open on small screens.
├── models/            TypeScript types for what the API sends and accepts.
├── interceptors/      Adds the login token to API requests; logs out on an expired session.
├── guard/             Route guards (role checks and student prerequisites).
├── pipes/, validators/, utils/
```

## Calling the API

Inject the service for the feature and subscribe:

```ts
private readonly dtrApi = inject(DtrService);

this.dtrApi.forStudent(studentId).subscribe((res) => {
  this.records = res.payload; // TimeRecord[]
});
```

Most endpoints return `ApiResponse<T>` (`{ status, payload, timestamp }`), defined in `models/api.ts`. The login token is attached automatically by `interceptors/auth.interceptor.ts`.

## Commands

```sh
npm start                        # dev server at http://localhost:4200
npx ng test --watch=false        # unit tests (Vitest)
npx ng build                     # production build into dist/
```
