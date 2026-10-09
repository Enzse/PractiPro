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
  { path: 'register', loadComponent: () => import('./features/auth/register/choose-role.component').then(m => m.ChooseRoleComponent), title: 'Create an account' },
  // Administrators are added by other administrators, from the admin pages.
  { path: 'register/:role', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent), title: 'Create an account' },
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
