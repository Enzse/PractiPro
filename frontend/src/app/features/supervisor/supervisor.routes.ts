import { Routes } from '@angular/router';
import { supervisorGuard } from '../../core/auth/guards/supervisor.guard';

/** Supervisor pages under /supervisor. Each trainee has a page with a tab per kind of work. */
export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/supervisor-layout/supervisor-layout.component').then(m => m.SupervisorLayoutComponent),
    canActivateChild: [supervisorGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./overview/supervisor-overview.component').then(m => m.SupervisorOverviewComponent), title: 'Overview' },
      { path: 'trainees', loadComponent: () => import('./trainees/trainee-list.component').then(m => m.TraineeListComponent), title: 'Trainees' },
      {
        path: 'trainees/:studentId',
        loadComponent: () => import('./trainee/trainee.component').then(m => m.TraineeComponent),
        title: 'Trainee',
        children: [
          { path: '', redirectTo: 'attendance', pathMatch: 'full' },
          { path: 'attendance', loadComponent: () => import('./trainee/tabs/attendance-tab.component').then(m => m.AttendanceTabComponent) },
          { path: 'weekly-reports', loadComponent: () => import('./trainee/tabs/weekly-reports-tab.component').then(m => m.WeeklyReportsTabComponent) },
          { path: 'evaluation', loadComponent: () => import('./trainee/tabs/evaluation-tab.component').then(m => m.EvaluationTabComponent) },
          { path: 'job', loadComponent: () => import('./trainee/tabs/job-tab.component').then(m => m.JobTabComponent) },
        ],
      },
      { path: 'hiring', loadComponent: () => import('./hiring/hiring.component').then(m => m.HiringComponent), title: 'Hiring' },
      { path: 'company', loadComponent: () => import('./company/company.component').then(m => m.CompanyComponent), title: 'Company profile' },
    ],
  },
];
