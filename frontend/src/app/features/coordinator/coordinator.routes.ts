import { Routes } from '@angular/router';
import { coordinatorGuard } from '../../core/auth/guards/coordinator.guard';

/**
 * Coordinator pages under /coordinator. The class being worked on is part of the
 * URL (/coordinator/classes/BSCS2-B/...), so pages survive a reload and can be linked.
 */
export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/coordinator-layout/coordinator-layout.component').then(m => m.CoordinatorLayoutComponent),
    canActivateChild: [coordinatorGuard],
    children: [
      { path: '', redirectTo: 'classes', pathMatch: 'full' },
      { path: 'classes', loadComponent: () => import('./classes/class-list.component').then(m => m.ClassListComponent), title: 'Your classes' },
      {
        path: 'classes/:block',
        loadComponent: () => import('./classes/class-layout.component').then(m => m.ClassLayoutComponent),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', loadComponent: () => import('./overview/class-overview.component').then(m => m.ClassOverviewComponent), title: 'Overview' },
          { path: 'students', loadComponent: () => import('./students/student-list.component').then(m => m.StudentListComponent), title: 'Students' },
          {
            path: 'students/:studentId',
            loadComponent: () => import('./student-review/student-review.component').then(m => m.StudentReviewComponent),
            title: 'Student',
            children: [
              { path: '', redirectTo: 'requirements', pathMatch: 'full' },
              { path: 'requirements', loadComponent: () => import('./student-review/tabs/requirements-tab.component').then(m => m.RequirementsTabComponent) },
              { path: 'attendance', loadComponent: () => import('./student-review/tabs/attendance-tab.component').then(m => m.AttendanceTabComponent) },
              { path: 'weekly-reports', loadComponent: () => import('./student-review/tabs/weekly-reports-tab.component').then(m => m.WeeklyReportsTabComponent) },
              { path: 'documentation', loadComponent: () => import('./student-review/tabs/documentation-tab.component').then(m => m.DocumentationTabComponent) },
              { path: 'seminars', loadComponent: () => import('./student-review/tabs/seminars-tab.component').then(m => m.SeminarsTabComponent) },
              { path: 'evaluation', loadComponent: () => import('./student-review/tabs/evaluation-tab.component').then(m => m.EvaluationTabComponent) },
              { path: 'final-report', loadComponent: () => import('./student-review/tabs/final-report-tab.component').then(m => m.FinalReportTabComponent) },
            ],
          },
          { path: 'enrollment', loadComponent: () => import('./enrollment/enrollment.component').then(m => m.EnrollmentComponent), title: 'Enrollment' },
          { path: 'analytics', loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent), title: 'Analytics' },
        ],
      },
    ],
  },
];
