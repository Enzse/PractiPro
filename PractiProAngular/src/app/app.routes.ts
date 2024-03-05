import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent  } from './components/profile/profile.component';
import { SubmissionComponent } from './components/submission/submission.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AboutusComponent } from './components/aboutus/aboutus.component';

export const routes: Routes = [
    {path: 'profile', component: ProfileComponent, title: 'Profile'},
    {path: 'submission', component: SubmissionComponent, title: 'Submit a File'},
    {path: 'documentation', component: DocumentationComponent, title: 'Documentation'},
    {path: 'feedback', component: FeedbackComponent, title: 'Feedback'},
    {path: 'aboutus', component: AboutusComponent, title: 'About us'},
    {path: 'dashboard', component: DashboardComponent, title: 'Dashboard'},
    
];

