import { Routes } from '@angular/router';
import { coordinatorGuard } from './core/auth/guards/coordinator.guard';
import { adminGuard } from './core/auth/guards/admin.guard';
import { studentGuard } from './core/auth/guards/student.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { supervisorGuard } from './core/auth/guards/supervisor.guard';
import { studentRequirementsGuard } from './features/student/guards/student-requirements.guard';
import { studentHoursWorkedGuard } from './features/student/guards/student-hours-worked.guard';
import { studentClassGuard } from './features/student/guards/student-class.guard';
import { classJoinLinkGuard } from './features/student/guards/class-join-link.guard';

export const routes: Routes = [

    { path: '', component: LoginComponent, title: 'Login' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'PractiPro', loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent), title: 'PractiPro' },
    { path: 'registration', loadComponent: () => import('./features/auth/registration/student-registration/student-registration.component').then(m => m.StudentRegistrationComponent), title: 'Registration' },
    { path: 'registrationadvisor', loadComponent: () => import('./features/auth/registration/coordinator-registration/coordinator-registration.component').then(m => m.CoordinatorRegistrationComponent), title: 'Registration' },
    { path: 'registrationadmin', loadComponent: () => import('./features/auth/registration/admin-registration/admin-registration.component').then(m => m.AdminRegistrationComponent), title: 'Registration' },
    { path: 'registrationsupervisor', loadComponent: () => import('./features/auth/registration/supervisor-registration/supervisor-registration.component').then(m => m.SupervisorRegistrationComponent), title: 'Registration' },
    { path: 'resetpassword', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), title: 'Reset Password' },
    { path: 'activateaccount', loadComponent: () => import('./features/auth/activate-account/activate-account.component').then(m => m.ActivateAccountComponent), title: 'Activate Account' },
    { path: 'joinclassbylink', loadComponent: () => import('./features/student/join-class-by-link/join-class-by-link.component').then(m => m.JoinClassByLinkComponent), title: 'Join Class by Link', canActivate: [classJoinLinkGuard] },

    //Student Pages
    {
        path: '',
        loadComponent: () => import('./features/student/layout/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
        canActivateChild: [studentGuard],
        children: [
            { path: 'student-dashboard', loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent), title: 'Dashboard', canActivate: [studentClassGuard] },
            { path: 'student-join-classes', loadComponent: () => import('./features/student/join-classes/join-classes.component').then(m => m.JoinClassesComponent), title: 'Join Classes', },
            { path: 'student-profile', loadComponent: () => import('./features/student/profile/student-profile.component').then(m => m.StudentProfileComponent), title: 'Profile', },
            { path: 'student-submission', loadComponent: () => import('./features/student/requirements/requirements.component').then(m => m.RequirementsComponent), title: 'Submit a File', canActivate: [studentClassGuard] },
            { path: 'student-documentation', loadComponent: () => import('./features/student/documentation/student-documentation.component').then(m => m.StudentDocumentationComponent), title: 'Documentation', canActivate: [studentRequirementsGuard] },
            { path: 'student-dtr', loadComponent: () => import('./features/student/dtr/student-dtr.component').then(m => m.StudentDtrComponent), title: 'Daily Time Records', canActivate: [studentRequirementsGuard] },
            { path: 'student-weekly-report', loadComponent: () => import('./features/student/weekly-reports/student-weekly-reports.component').then(m => m.StudentWeeklyReportsComponent), title: 'Weekly Accomplishment Report', canActivate: [studentRequirementsGuard] },
            { path: 'student-exit-poll', loadComponent: () => import('./features/student/final-report/final-report.component').then(m => m.FinalReportComponent), title: 'Final Report', canActivate: [studentRequirementsGuard, studentHoursWorkedGuard] },
            { path: 'student-seminars', loadComponent: () => import('./features/student/seminars/student-seminars.component').then(m => m.StudentSeminarsComponent), title: 'Seminars Attended', canActivate: [studentRequirementsGuard] },
            { path: 'feedback', loadComponent: () => import('./features/student/feedback/feedback.component').then(m => m.FeedbackComponent), title: 'Feedback', },
        ]
    },
    //Admin Pages
    {
        path: '',
        loadComponent: () => import('./features/admin/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivateChild: [adminGuard],
        children: [
            { path: 'admin-users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent), title: 'Users', },
            { path: 'admin-admins', loadComponent: () => import('./features/admin/admins/admin-admins.component').then(m => m.AdminAdminsComponent), title: 'Admins', },
            { path: 'admin-students', loadComponent: () => import('./features/admin/students/admin-students.component').then(m => m.AdminStudentsComponent), title: 'Students', },
            { path: 'admin-coordinators', loadComponent: () => import('./features/admin/coordinators/admin-coordinators.component').then(m => m.AdminCoordinatorsComponent), title: 'Advisors', },
            { path: 'admin-classes', loadComponent: () => import('./features/admin/classes/admin-classes.component').then(m => m.AdminClassesComponent), title: 'Classes', },
        ]
    },
    //Coordinator Pages
    {
        path: '',
        loadComponent: () => import('./features/coordinator/layout/coordinator-layout/coordinator-layout.component').then(m => m.CoordinatorLayoutComponent),
        canActivateChild: [coordinatorGuard],
        children: [
            {
                path: '', loadComponent: () => import('./features/coordinator/layout/class-selection-sidebar/class-selection-sidebar.component').then(m => m.ClassSelectionSidebarComponent),
                children: [
                    { path: 'coord-classes', loadComponent: () => import('./features/coordinator/class-selection/class-selection.component').then(m => m.ClassSelectionComponent), title: 'Class Selection', },
                ]
            },
            {
                path: '', loadComponent: () => import('./features/coordinator/layout/coordinator-sidebar/coordinator-sidebar.component').then(m => m.CoordinatorSidebarComponent),
                children: [
                    { path: 'coord-dashboard', loadComponent: () => import('./features/coordinator/dashboard/coordinator-dashboard.component').then(m => m.CoordinatorDashboardComponent), title: 'Dashboard', },
                    { path: 'coord-registrations', loadComponent: () => import('./features/coordinator/registrations/coordinator-registrations.component').then(m => m.CoordinatorRegistrationsComponent), title: 'Registrations', },
                    {
                        path: 'coord-invitestudents', loadComponent: () => import('./features/coordinator/invite-students/invite-students.component').then(m => m.InviteStudentsComponent), title: 'Invite Students', children:
                            [
                                { path: 'invite-by-studentid', loadComponent: () => import('./features/coordinator/invite-students/invite-by-student-id/invite-by-student-id.component').then(m => m.InviteByStudentIdComponent), },
                                { path: 'invite-by-link', loadComponent: () => import('./features/coordinator/invite-students/invite-by-link/invite-by-link.component').then(m => m.InviteByLinkComponent), },
                            ]
                    },
                    { path: 'coord-submissions', loadComponent: () => import('./features/coordinator/submissions/coordinator-submissions.component').then(m => m.CoordinatorSubmissionsComponent), title: 'Submissions', },
                    { path: 'coord-dtr', loadComponent: () => import('./features/coordinator/dtr/coordinator-dtr.component').then(m => m.CoordinatorDtrComponent), title: 'Daily Time Records', },
                    { path: 'coord-seminars', loadComponent: () => import('./features/coordinator/seminars/coordinator-seminars.component').then(m => m.CoordinatorSeminarsComponent), title: 'Seminar Records', },
                    { path: 'coord-accomplishmentreport', loadComponent: () => import('./features/coordinator/weekly-reports/coordinator-weekly-reports.component').then(m => m.CoordinatorWeeklyReportsComponent), title: 'Accomplishment Reports', },
                    { path: 'coord-evaluations', loadComponent: () => import('./features/coordinator/evaluations/coordinator-evaluations.component').then(m => m.CoordinatorEvaluationsComponent), title: 'Performance Evaluations', },
                    { path: 'coord-finalreport', loadComponent: () => import('./features/coordinator/final-reports/coordinator-final-reports.component').then(m => m.CoordinatorFinalReportsComponent), title: 'Final Reports', },
                    {
                        path: 'advisor-analytics', loadComponent: () => import('./features/coordinator/analytics/analytics.component').then(m => m.AnalyticsComponent), title: 'Analytics', children:
                            [
                                { path: 'analytics-finalreports', loadComponent: () => import('./features/coordinator/analytics/final-report-analytics/final-report-analytics.component').then(m => m.FinalReportAnalyticsComponent), },
                                { path: 'analytics-performanceevaluations', loadComponent: () => import('./features/coordinator/analytics/evaluation-analytics/evaluation-analytics.component').then(m => m.EvaluationAnalyticsComponent), },
                            ]
                    }
                ]
            },
        ]
    },
    //Supervisor Pages
    {
        path: '',
        loadComponent: () => import('./features/supervisor/layout/supervisor-layout/supervisor-layout.component').then(m => m.SupervisorLayoutComponent),
        canActivateChild: [supervisorGuard],
        children: [
            { path: 'supervisor-dashboard', loadComponent: () => import('./features/supervisor/dashboard/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent), title: 'Dashboard', },
            { path: 'supervisor-hirestudents', loadComponent: () => import('./features/supervisor/hire-students/hire-students.component').then(m => m.HireStudentsComponent), title: 'Hire Students', },
            { path: 'supervisor-profile', loadComponent: () => import('./features/supervisor/company-profile/company-profile.component').then(m => m.CompanyProfileComponent), title: 'Company Profile', },
            { path: 'supervisor-dtr', loadComponent: () => import('./features/supervisor/dtr/supervisor-dtr.component').then(m => m.SupervisorDtrComponent), title: 'Daily Time Records', },
            { path: 'supervisor-war', loadComponent: () => import('./features/supervisor/weekly-reports/supervisor-weekly-reports.component').then(m => m.SupervisorWeeklyReportsComponent), title: 'Weekly Accomplishment Reports', },
            { path: 'supervisor-evaluation', loadComponent: () => import('./features/supervisor/evaluations/supervisor-evaluations.component').then(m => m.SupervisorEvaluationsComponent), title: 'Student Performance Evaluation', },
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }

];

