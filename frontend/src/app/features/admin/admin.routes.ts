import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/guards/admin.guard';

/** Admin pages under /admin. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent), title: 'Accounts' },
      { path: 'students', loadComponent: () => import('./students/students.component').then(m => m.StudentsComponent), title: 'Students' },
      { path: 'coordinators', loadComponent: () => import('./coordinators/coordinators.component').then(m => m.CoordinatorsComponent), title: 'Coordinators' },
      { path: 'admins', loadComponent: () => import('./admins/admins.component').then(m => m.AdminsComponent), title: 'Administrators' },
      { path: 'classes', loadComponent: () => import('./classes/classes.component').then(m => m.ClassesComponent), title: 'Classes' },
    ],
  },
];
