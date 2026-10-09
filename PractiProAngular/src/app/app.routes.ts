import { Routes } from '@angular/router';
import { coordGuard } from './guard/coord.guard';
import { adminGuard } from './guard/admin.guard';
import { studentGuard } from './guard/student.guard';
import { LoginComponent } from './components/login/login.component';
import { supervisorGuard } from './guard/supervisor.guard';
import { studentrequirementsGuard } from './guard/studentrequirements.guard';
import { studenthoursworkedGuard } from './guard/studenthoursworked.guard';
import { studentclassGuard } from './guard/studentclass.guard';
import { classjoinlinkGuard } from './guard/classjoinlink.guard';

export const routes: Routes = [

    { path: '', component: LoginComponent, title: 'Login' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'PractiPro', loadComponent: () => import('./components/landing-page/landing-page.component').then(m => m.LandingPageComponent), title: 'PractiPro' },
    { path: 'registration', loadComponent: () => import('./components/register/registration/registration.component').then(m => m.RegistrationComponent), title: 'Registration' },
    { path: 'registrationadvisor', loadComponent: () => import('./components/register/registration/registrationadvisor/registrationadvisor.component').then(m => m.RegistrationadvisorComponent), title: 'Registration' },
    { path: 'registrationadmin', loadComponent: () => import('./components/register/registration/registrationadmin/registrationadmin.component').then(m => m.RegistrationadminComponent), title: 'Registration' },
    { path: 'registrationsupervisor', loadComponent: () => import('./components/register/registration/registrationsupervisor/registrationsupervisor.component').then(m => m.RegistrationsupervisorComponent), title: 'Registration' },
    { path: 'resetpassword', loadComponent: () => import('./components/reset-password/reset-password-form/reset-password-form.component').then(m => m.ResetPasswordFormComponent), title: 'Reset Password' },
    { path: 'activateaccount', loadComponent: () => import('./components/redirects/activate-account/activate-account/activate-account.component').then(m => m.ActivateAccountComponent), title: 'Activate Account' },
    { path: 'joinclassbylink', loadComponent: () => import('./components/page-student/joinclasses-by-link/joinclasses-by-link.component').then(m => m.JoinclassesByLinkComponent), title: 'Join Class by Link', canActivate: [classjoinlinkGuard] },

    //Student Pages
    {
        path: '',
        loadComponent: () => import('./components/page-student/navbar/navbar.component').then(m => m.NavbarComponent),
        canActivateChild: [studentGuard],
        children: [
            { path: 'student-dashboard', loadComponent: () => import('./components/page-student/dashboard/dashboard.component').then(m => m.DashboardComponent), title: 'Dashboard', canActivate: [studentclassGuard] },
            { path: 'student-join-classes', loadComponent: () => import('./components/page-student/joinclasses/joinclasses.component').then(m => m.JoinclassesComponent), title: 'Join Classes', },
            { path: 'student-profile', loadComponent: () => import('./components/page-student/profile/profile.component').then(m => m.ProfileComponent), title: 'Profile', },
            { path: 'student-submission', loadComponent: () => import('./components/page-student/submission-requirement/submission.component').then(m => m.SubmissionComponent), title: 'Submit a File', canActivate: [studentclassGuard] },
            { path: 'student-documentation', loadComponent: () => import('./components/page-student/submission-documentation/documentation.component').then(m => m.DocumentationComponent), title: 'Documentation', canActivate: [studentrequirementsGuard] },
            { path: 'student-dtr', loadComponent: () => import('./components/page-student/submission-dtr/dtr.component').then(m => m.DtrComponent), title: 'Daily Time Records', canActivate: [studentrequirementsGuard] },
            { path: 'student-weekly-report', loadComponent: () => import('./components/page-student/submission-war/weekly-accomplishment-rep.component').then(m => m.WeeklyAccomplishmentRepComponent), title: 'Weekly Accomplishment Report', canActivate: [studentrequirementsGuard] },
            { path: 'student-exit-poll', loadComponent: () => import('./components/page-student/submission-finalreport/exit-poll.component').then(m => m.ExitPollComponent), title: 'Final Report', canActivate: [studentrequirementsGuard, studenthoursworkedGuard] },
            { path: 'student-seminars', loadComponent: () => import('./components/page-student/submission-seminars/submission-seminars.component').then(m => m.SubmissionSeminarsComponent), title: 'Seminars Attended', canActivate: [studentrequirementsGuard] },
            { path: 'feedback', loadComponent: () => import('./components/page-student/feedback/feedback.component').then(m => m.FeedbackComponent), title: 'Feedback', },
        ]
    },
    //Admin Pages
    {
        path: '',
        loadComponent: () => import('./components/page-admin/admin-navbar/admin-navbar.component').then(m => m.AdminNavbarComponent),
        canActivateChild: [adminGuard],
        children: [
            { path: 'admin-users', loadComponent: () => import('./components/page-admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent), title: 'Users', },
            { path: 'admin-admins', loadComponent: () => import('./components/page-admin/admin-admins/admin-admins.component').then(m => m.AdminAdminsComponent), title: 'Admins', },
            { path: 'admin-students', loadComponent: () => import('./components/page-admin/admin-students/admin-students.component').then(m => m.AdminStudentsComponent), title: 'Students', },
            { path: 'admin-coordinators', loadComponent: () => import('./components/page-admin/admin-coordinators/admin-coordinators.component').then(m => m.AdminCoordinatorsComponent), title: 'Advisors', },
            { path: 'admin-classes', loadComponent: () => import('./components/page-admin/admin-classes/admin-classes.component').then(m => m.AdminClassesComponent), title: 'Classes', },
        ]
    },
    //Coordinator Pages
    {
        path: '',
        loadComponent: () => import('./components/page-coordinator/coord-navbar/coord-navbar.component').then(m => m.CoordNavbarComponent),
        canActivateChild: [coordGuard],
        children: [
            {
                path: '', loadComponent: () => import('./components/page-coordinator/coord-sidebarmain/coord-sidebarmain.component').then(m => m.CoordSidebarmainComponent),
                children: [
                    { path: 'coord-classes', loadComponent: () => import('./components/page-coordinator/coord-landingpage/coord-landingpage.component').then(m => m.CoordLandingpageComponent), title: 'Class Selection', },
                ]
            },
            {
                path: '', loadComponent: () => import('./components/page-coordinator/coord-sidebar/coord-sidebar.component').then(m => m.CoordSidebarComponent),
                children: [
                    { path: 'coord-dashboard', loadComponent: () => import('./components/page-coordinator/coord-dashboard/coord-dashboard.component').then(m => m.CoordDashboardComponent), title: 'Dashboard', },
                    { path: 'coord-registrations', loadComponent: () => import('./components/page-coordinator/coordinator-submission/coordinator-submission.component').then(m => m.CoordinatorSubmissionComponent), title: 'Registrations', },
                    {
                        path: 'coord-invitestudents', loadComponent: () => import('./components/page-coordinator/coord-invitestudents/coord-invitestudents.component').then(m => m.CoordInvitestudentsComponent), title: 'Invite Students', children:
                            [
                                { path: 'invite-by-studentid', loadComponent: () => import('./components/page-coordinator/coord-invitestudents/invitestudents-by-studentid/invitestudents-by-studentid.component').then(m => m.InvitestudentsByStudentidComponent), },
                                { path: 'invite-by-link', loadComponent: () => import('./components/page-coordinator/coord-invitestudents/invitestudents-by-link/invitestudents-by-link.component').then(m => m.InvitestudentsByLinkComponent), },
                            ]
                    },
                    { path: 'coord-submissions', loadComponent: () => import('./components/page-coordinator/coord-documentation/coord-documentation.component').then(m => m.CoordDocumentationComponent), title: 'Submissions', },
                    { path: 'coord-dtr', loadComponent: () => import('./components/page-coordinator/coord-dtr/coord-dtr.component').then(m => m.CoordDtrComponent), title: 'Daily Time Records', },
                    { path: 'coord-seminars', loadComponent: () => import('./components/page-coordinator/coord-seminars/coord-seminars.component').then(m => m.CoordSeminarsComponent), title: 'Seminar Records', },
                    { path: 'coord-accomplishmentreport', loadComponent: () => import('./components/page-coordinator/coord-accomplishment-report/coord-accomplishment-report.component').then(m => m.CoordAccomplishmentReportComponent), title: 'Accomplishment Reports', },
                    { path: 'coord-evaluations', loadComponent: () => import('./components/page-coordinator/coord-evaluations/coord-evaluations.component').then(m => m.CoordEvaluationsComponent), title: 'Performance Evaluations', },
                    { path: 'coord-finalreport', loadComponent: () => import('./components/page-coordinator/coord-finalreport/coord-finalreport.component').then(m => m.CoordFinalreportComponent), title: 'Final Reports', },
                    {
                        path: 'advisor-analytics', loadComponent: () => import('./components/page-coordinator/advisor-analytics/advisor-analytics.component').then(m => m.AdvisorAnalyticsComponent), title: 'Analytics', children:
                            [
                                { path: 'analytics-finalreports', loadComponent: () => import('./components/page-coordinator/advisor-analytics/analytics-finalreports/analytics-finalreports.component').then(m => m.AnalyticsFinalreportsComponent), },
                                { path: 'analytics-performanceevaluations', loadComponent: () => import('./components/page-coordinator/advisor-analytics/analytics-performanceevaluation/analytics-performanceevaluation.component').then(m => m.AnalyticsPerformanceevaluationComponent), },
                            ]
                    }
                ]
            },
        ]
    },
    //Supervisor Pages
    {
        path: '',
        loadComponent: () => import('./components/page-supervisor/supervisor-navbar/supervisor-navbar.component').then(m => m.SupervisorNavbarComponent),
        canActivateChild: [supervisorGuard],
        children: [
            { path: 'supervisor-dashboard', loadComponent: () => import('./components/page-supervisor/supervisor-dashboard/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent), title: 'Dashboard', },
            { path: 'supervisor-hirestudents', loadComponent: () => import('./components/page-supervisor/supervisor-hirestudents/supervisor-hirestudents.component').then(m => m.SupervisorHirestudentsComponent), title: 'Hire Students', },
            { path: 'supervisor-profile', loadComponent: () => import('./components/page-supervisor/supervisor-profile/supervisor-profile.component').then(m => m.SupervisorProfileComponent), title: 'Company Profile', },
            { path: 'supervisor-dtr', loadComponent: () => import('./components/page-supervisor/supervisor-dtr/supervisor-dtr.component').then(m => m.SupervisorDtrComponent), title: 'Daily Time Records', },
            { path: 'supervisor-war', loadComponent: () => import('./components/page-supervisor/supervisor-war/supervisor-war.component').then(m => m.SupervisorWarComponent), title: 'Weekly Accomplishment Reports', },
            { path: 'supervisor-evaluation', loadComponent: () => import('./components/page-supervisor/supervisor-evaluation/supervisor-evaluation.component').then(m => m.SupervisorEvaluationComponent), title: 'Student Performance Evaluation', },
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }

];

