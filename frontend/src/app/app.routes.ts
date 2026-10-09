import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { classJoinLinkGuard } from './features/student/guards/class-join-link.guard';

/**
 * Public pages are listed here. Each role's pages live under its own URL
 * prefix (/student, /coordinator, /supervisor, /admin) and are defined in
 * features/<role>/<role>.routes.ts, loaded on demand.
 */
export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Login' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'welcome', loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent), title: 'PractiPro' },
  { path: 'register/student', loadComponent: () => import('./features/auth/registration/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent), title: 'Registration' },
  { path: 'register/coordinator', loadComponent: () => import('./features/auth/registration/coordinator-registration/coordinator-registration.component').then(m => m.CoordinatorRegistrationComponent), title: 'Registration' },
  { path: 'register/admin', loadComponent: () => import('./features/auth/registration/admin-registration/admin-registration.component').then(m => m.AdminRegistrationComponent), title: 'Registration' },
  { path: 'register/supervisor', loadComponent: () => import('./features/auth/registration/supervisor-registration/supervisor-registration.component').then(m => m.SupervisorRegistrationComponent), title: 'Registration' },
  // The next three are linked from emails the backend sends.
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), title: 'Reset Password' },
  { path: 'activate-account', loadComponent: () => import('./features/auth/activate-account/activate-account.component').then(m => m.ActivateAccountComponent), title: 'Activate Account' },
  { path: 'join-class', loadComponent: () => import('./features/student/join-class-by-link/join-class-by-link.component').then(m => m.JoinClassByLinkComponent), title: 'Join Class by Link', canActivate: [classJoinLinkGuard] },

  { path: 'student', loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES) },
  { path: 'coordinator', loadChildren: () => import('./features/coordinator/coordinator.routes').then(m => m.COORDINATOR_ROUTES) },
  { path: 'supervisor', loadChildren: () => import('./features/supervisor/supervisor.routes').then(m => m.SUPERVISOR_ROUTES) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },

  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
