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

export const routes: Routes = [    
    {path: '', component:DashboardComponent, canActivate: [authGuard]},
    {path: 'login', component: LoginComponent, title: 'Login'},
    {path: 'registration', component: RegistrationComponent, title: 'Registration'},
    {path: 'profile', component: ProfileComponent, title: 'Profile', canActivate: [authGuard]},
    {path: 'submission', component: SubmissionComponent, title: 'Submit a File', canActivate: [authGuard]},
    {path: 'documentation', component: DocumentationComponent, title: 'Documentation', canActivate: [authGuard]},
    {path: 'feedback', component: FeedbackComponent, title: 'Feedback', canActivate: [authGuard]},
    {path: 'aboutus', component: AboutusComponent, title: 'About us', canActivate: [authGuard]},
    {path: 'dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [authGuard]},
    {path: 'users', component: AdminUsersComponent, title: 'Users', canActivate: [authGuard]},
    {path: 'admins', component: AdminAdminsComponent, title: 'Admins', canActivate: [authGuard]}
];

