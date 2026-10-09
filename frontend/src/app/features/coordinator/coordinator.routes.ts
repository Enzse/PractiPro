import { Routes } from '@angular/router';
import { coordinatorGuard } from '../../core/auth/guards/coordinator.guard';

/**
 * Coordinator pages. Two nested layouts: picking a class (before one is
 * chosen), and working within the selected class.
 */
export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/coordinator-layout/coordinator-layout.component').then(m => m.CoordinatorLayoutComponent),
    canActivateChild: [coordinatorGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./layout/class-selection-sidebar/class-selection-sidebar.component').then(m => m.ClassSelectionSidebarComponent),
        children: [
          { path: 'coord-classes', loadComponent: () => import('./class-selection/class-selection.component').then(m => m.ClassSelectionComponent), title: 'Class Selection' },
        ],
      },
      {
        path: '',
        loadComponent: () => import('./layout/coordinator-sidebar/coordinator-sidebar.component').then(m => m.CoordinatorSidebarComponent),
        children: [
          { path: 'coord-dashboard', loadComponent: () => import('./dashboard/coordinator-dashboard.component').then(m => m.CoordinatorDashboardComponent), title: 'Dashboard' },
          { path: 'coord-registrations', loadComponent: () => import('./registrations/coordinator-registrations.component').then(m => m.CoordinatorRegistrationsComponent), title: 'Registrations' },
          {
            path: 'coord-invitestudents',
            loadComponent: () => import('./invite-students/invite-students.component').then(m => m.InviteStudentsComponent),
            title: 'Invite Students',
            children: [
              { path: 'invite-by-studentid', loadComponent: () => import('./invite-students/invite-by-student-id/invite-by-student-id.component').then(m => m.InviteByStudentIdComponent) },
              { path: 'invite-by-link', loadComponent: () => import('./invite-students/invite-by-link/invite-by-link.component').then(m => m.InviteByLinkComponent) },
            ],
          },
          { path: 'coord-submissions', loadComponent: () => import('./submissions/coordinator-submissions.component').then(m => m.CoordinatorSubmissionsComponent), title: 'Submissions' },
          { path: 'coord-dtr', loadComponent: () => import('./dtr/coordinator-dtr.component').then(m => m.CoordinatorDtrComponent), title: 'Daily Time Records' },
          { path: 'coord-seminars', loadComponent: () => import('./seminars/coordinator-seminars.component').then(m => m.CoordinatorSeminarsComponent), title: 'Seminar Records' },
          { path: 'coord-accomplishmentreport', loadComponent: () => import('./weekly-reports/coordinator-weekly-reports.component').then(m => m.CoordinatorWeeklyReportsComponent), title: 'Accomplishment Reports' },
          { path: 'coord-evaluations', loadComponent: () => import('./evaluations/coordinator-evaluations.component').then(m => m.CoordinatorEvaluationsComponent), title: 'Performance Evaluations' },
          { path: 'coord-finalreport', loadComponent: () => import('./final-reports/coordinator-final-reports.component').then(m => m.CoordinatorFinalReportsComponent), title: 'Final Reports' },
          {
            path: 'advisor-analytics',
            loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent),
            title: 'Analytics',
            children: [
              { path: 'analytics-finalreports', loadComponent: () => import('./analytics/final-report-analytics/final-report-analytics.component').then(m => m.FinalReportAnalyticsComponent) },
              { path: 'analytics-performanceevaluations', loadComponent: () => import('./analytics/evaluation-analytics/evaluation-analytics.component').then(m => m.EvaluationAnalyticsComponent) },
            ],
          },
        ],
      },
    ],
  },
];
