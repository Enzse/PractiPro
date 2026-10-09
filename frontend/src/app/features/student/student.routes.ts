import { Routes } from '@angular/router';
import { studentGuard } from '../../core/auth/guards/student.guard';
import { studentClassGuard } from './guards/student-class.guard';
import { studentHoursWorkedGuard } from './guards/student-hours-worked.guard';
import { studentRequirementsGuard } from './guards/student-requirements.guard';

/** Student pages, shown inside the student layout (navbar + sidebar). */
export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
    canActivateChild: [studentGuard],
    children: [
      { path: 'student-dashboard', loadComponent: () => import('./dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent), title: 'Dashboard', canActivate: [studentClassGuard] },
      { path: 'student-join-classes', loadComponent: () => import('./join-classes/join-classes.component').then(m => m.JoinClassesComponent), title: 'Join Classes' },
      { path: 'student-profile', loadComponent: () => import('./profile/student-profile.component').then(m => m.StudentProfileComponent), title: 'Profile' },
      { path: 'student-submission', loadComponent: () => import('./requirements/requirements.component').then(m => m.RequirementsComponent), title: 'Submit a File', canActivate: [studentClassGuard] },
      { path: 'student-documentation', loadComponent: () => import('./documentation/student-documentation.component').then(m => m.StudentDocumentationComponent), title: 'Documentation', canActivate: [studentRequirementsGuard] },
      { path: 'student-dtr', loadComponent: () => import('./dtr/student-dtr.component').then(m => m.StudentDtrComponent), title: 'Daily Time Records', canActivate: [studentRequirementsGuard] },
      { path: 'student-weekly-report', loadComponent: () => import('./weekly-reports/student-weekly-reports.component').then(m => m.StudentWeeklyReportsComponent), title: 'Weekly Accomplishment Report', canActivate: [studentRequirementsGuard] },
      { path: 'student-exit-poll', loadComponent: () => import('./final-report/final-report.component').then(m => m.FinalReportComponent), title: 'Final Report', canActivate: [studentRequirementsGuard, studentHoursWorkedGuard] },
      { path: 'student-seminars', loadComponent: () => import('./seminars/student-seminars.component').then(m => m.StudentSeminarsComponent), title: 'Seminars Attended', canActivate: [studentRequirementsGuard] },
      { path: 'feedback', loadComponent: () => import('./feedback/feedback.component').then(m => m.FeedbackComponent), title: 'Feedback' },
    ],
  },
];
