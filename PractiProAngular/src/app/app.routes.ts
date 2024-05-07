import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent  } from './components/profile/profile.component';
import { SubmissionComponent } from './components/submission/submission.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AboutusComponent } from './components/aboutus/aboutus.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { authGuard } from './guard/auth.guard';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/admin-admins/admin-admins.component';
import { AdminStudentsComponent } from './components/admin-students/admin-students.component';
import { WeeklyAccomplishmentRepComponent } from './components/weekly-accomplishment-rep/weekly-accomplishment-rep.component';
import { CoordinatorSubmissionComponent } from './components/coordinator-submission/coordinator-submission.component';
import { CoordAccomplishmentReportComponent } from './components/coord-accomplishment-report/coord-accomplishment-report.component';
import { CoordDtrComponent } from './components/coord-dtr/coord-dtr.component';
import { ExitPollComponent } from './exit-poll/exit-poll.component';

export const routes: Routes = [    
    {path: '', component:DashboardComponent, canActivate: [authGuard]},
    {path: 'login', component: LoginComponent, title: 'Login'},
    {path: 'registration', component: RegistrationComponent, title: 'Registration'},
    //Student Pages
    {path: 'student-dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [authGuard]},
    {path: 'student-profile', component: ProfileComponent, title: 'Profile', canActivate: [authGuard]},
    {path: 'student-submission', component: SubmissionComponent, title: 'Submit a File', canActivate: [authGuard]},
    {path: 'student-documentation', component: DocumentationComponent, title: 'Documentation', canActivate: [authGuard]},
    {path: 'student-feedback', component: FeedbackComponent, title: 'Feedback', canActivate: [authGuard]},
    {path: 'student-aboutus', component: AboutusComponent, title: 'About us', canActivate: [authGuard]},
    {path: 'student-weekly-report', component: WeeklyAccomplishmentRepComponent , title:'Weekly Report', canActivate: [authGuard]},
    {path: 'student-student-submissions', component: CoordinatorSubmissionComponent, title:'Student Submissions', canActivate: [authGuard]},
    {path: 'student-accomplishment-reports', component: CoordAccomplishmentReportComponent, title:'Student Reports', canActivate: [authGuard]},
    {path: 'student-students-dtr', component: CoordDtrComponent, title:'Daily Time Record', canActivate: [authGuard]},
    {path: 'student-exit-poll', component: ExitPollComponent, title:'Exit Poll', canActivate: [authGuard]},
    //Admin Pages
    {path: 'admin-users', component: AdminUsersComponent, title: 'Users', canActivate: [authGuard]},
    {path: 'admin-admins', component: AdminAdminsComponent, title: 'Admins', canActivate: [authGuard]},
    {path: 'admin-students', component: AdminStudentsComponent, title: 'Students', canActivate: [authGuard]},



    
];
 
