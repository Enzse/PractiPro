import { Routes } from '@angular/router';
import { supervisorGuard } from '../../core/auth/guards/supervisor.guard';

/** Supervisor pages, shown inside the supervisor layout (navbar + sidebar). */
export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/supervisor-layout/supervisor-layout.component').then(m => m.SupervisorLayoutComponent),
    canActivateChild: [supervisorGuard],
    children: [
      { path: 'supervisor-dashboard', loadComponent: () => import('./dashboard/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent), title: 'Dashboard' },
      { path: 'supervisor-hirestudents', loadComponent: () => import('./hire-students/hire-students.component').then(m => m.HireStudentsComponent), title: 'Hire Students' },
      { path: 'supervisor-profile', loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent), title: 'Company Profile' },
      { path: 'supervisor-dtr', loadComponent: () => import('./dtr/supervisor-dtr.component').then(m => m.SupervisorDtrComponent), title: 'Daily Time Records' },
      { path: 'supervisor-war', loadComponent: () => import('./weekly-reports/supervisor-weekly-reports.component').then(m => m.SupervisorWeeklyReportsComponent), title: 'Weekly Accomplishment Reports' },
      { path: 'supervisor-evaluation', loadComponent: () => import('./evaluations/supervisor-evaluations.component').then(m => m.SupervisorEvaluationsComponent), title: 'Student Performance Evaluation' },
    ],
  },
];
