import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/guards/admin.guard';

/** Admin pages, shown inside the admin layout (navbar + sidebar). */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivateChild: [adminGuard],
    children: [
      { path: 'admin-users', loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent), title: 'Users' },
      { path: 'admin-admins', loadComponent: () => import('./admins/admin-admins.component').then(m => m.AdminAdminsComponent), title: 'Admins' },
      { path: 'admin-students', loadComponent: () => import('./students/admin-students.component').then(m => m.AdminStudentsComponent), title: 'Students' },
      { path: 'admin-coordinators', loadComponent: () => import('./coordinators/admin-coordinators.component').then(m => m.AdminCoordinatorsComponent), title: 'Advisors' },
      { path: 'admin-classes', loadComponent: () => import('./classes/admin-classes.component').then(m => m.AdminClassesComponent), title: 'Classes' },
    ],
  },
];
