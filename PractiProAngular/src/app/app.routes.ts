import { Routes } from '@angular/router';
import { DashboardComponent } from './components/page-student/dashboard/dashboard.component';
import { ProfileComponent } from './components/page-student/profile/profile.component';
import { SubmissionComponent } from './components/page-student/submission/submission.component';
import { DocumentationComponent } from './components/page-student/documentation/documentation.component';
import { FeedbackComponent } from './components/page-student/feedback/feedback.component';
import { AboutusComponent } from './components/page-student/aboutus/aboutus.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { authGuard } from './guard/auth.guard';
import { AdminUsersComponent } from './components/page-admin/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/page-admin/admin-admins/admin-admins.component';
import { AdminStudentsComponent } from './components/page-admin/admin-students/admin-students.component';
import { WeeklyAccomplishmentRepComponent } from './components/page-student/weekly-accomplishment-rep/weekly-accomplishment-rep.component';
import { CoordinatorSubmissionComponent } from './components/page-coordinator/coordinator-submission/coordinator-submission.component';
import { CoordAccomplishmentReportComponent } from './components/page-coordinator/coord-accomplishment-report/coord-accomplishment-report.component';
import { CoordDtrComponent } from './components/page-coordinator/coord-dtr/coord-dtr.component';
import { ExitPollComponent } from './components/page-student/exit-poll/exit-poll.component';

import { SidebarComponent } from './components/page-student/sidebar/sidebar.component';
import { NavbarComponent } from './components/page-student/navbar/navbar.component';
import { AdminNavbarComponent } from './components/page-admin/admin-navbar/admin-navbar.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'registration', component: RegistrationComponent, title: 'Registration' },
    //Student Pages
    {
        path: '',
        component: NavbarComponent,
        children: [
            { path: 'student-dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [authGuard] },
            { path: 'student-profile', component: ProfileComponent, title: 'Profile', canActivate: [authGuard] },
            { path: 'student-submission', component: SubmissionComponent, title: 'Submit a File', canActivate: [authGuard] },
            { path: 'student-documentation', component: DocumentationComponent, title: 'Documentation', canActivate: [authGuard] },
            { path: 'student-feedback', component: FeedbackComponent, title: 'Feedback', canActivate: [authGuard] },
            { path: 'student-aboutus', component: AboutusComponent, title: 'About us', canActivate: [authGuard] },
            { path: 'student-weekly-report', component: WeeklyAccomplishmentRepComponent, title: 'Weekly Report', canActivate: [authGuard] },
            { path: 'student-student-submissions', component: CoordinatorSubmissionComponent, title: 'Student Submissions', canActivate: [authGuard] },
            { path: 'student-accomplishment-reports', component: CoordAccomplishmentReportComponent, title: 'Student Reports', canActivate: [authGuard] },
            { path: 'student-students-dtr', component: CoordDtrComponent, title: 'Daily Time Record', canActivate: [authGuard] },
            { path: 'student-exit-poll', component: ExitPollComponent, title: 'Exit Poll', canActivate: [authGuard] },

        ]
    },
    //Admin Pages
    {
        path: '',
        component: AdminNavbarComponent,
        children: [
            { path: 'admin-users', component: AdminUsersComponent, title: 'Users', canActivate: [authGuard] },
            { path: 'admin-admins', component: AdminAdminsComponent, title: 'Admins', canActivate: [authGuard] },
            { path: 'admin-students', component: AdminStudentsComponent, title: 'Students', canActivate: [authGuard] },

        ]
    }


];

