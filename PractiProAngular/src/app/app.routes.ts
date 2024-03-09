import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent  } from './components/profile/profile.component';
import { SubmissionComponent } from './components/submission/submission.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AboutusComponent } from './components/aboutus/aboutus.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent, title: 'Login'},
    {path: 'profile', component: ProfileComponent, title: 'Profile'},
    {path: 'submission', component: SubmissionComponent, title: 'Submit a File'},
    {path: 'documentation', component: DocumentationComponent, title: 'Documentation'},
    {path: 'feedback', component: FeedbackComponent, title: 'Feedback'},
    {path: 'aboutus', component: AboutusComponent, title: 'About us'},
    {path: 'dashboard', component: DashboardComponent, title: 'Dashboard'},
    {path: 'registration', component: RegistrationComponent, title: 'Registration'},
];

