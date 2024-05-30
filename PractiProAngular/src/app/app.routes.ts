import { Routes } from '@angular/router';
import { coordGuard } from './guard/coord.guard';
import { adminGuard } from './guard/admin.guard';
import { studentGuard } from './guard/student.guard';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
//Student Imports
import { NavbarComponent } from './components/page-student/navbar/navbar.component';
import { DashboardComponent } from './components/page-student/dashboard/dashboard.component';
import { ProfileComponent } from './components/page-student/profile/profile.component';
import { SubmissionComponent } from './components/page-student/submission/submission.component';
import { DocumentationComponent } from './components/page-student/documentation/documentation.component';
import { DtrComponent } from './components/page-student/dtr/dtr.component';
import { WeeklyAccomplishmentRepComponent } from './components/page-student/weekly-accomplishment-rep/weekly-accomplishment-rep.component';
import { ExitPollComponent } from './components/page-student/exit-poll/exit-poll.component';
import { FeedbackComponent } from './components/page-student/feedback/feedback.component';
import { AboutusComponent } from './components/page-student/aboutus/aboutus.component';
//Admin Imports
import { AdminNavbarComponent } from './components/page-admin/admin-navbar/admin-navbar.component';
import { AdminUsersComponent } from './components/page-admin/admin-users/admin-users.component';
import { AdminAdminsComponent } from './components/page-admin/admin-admins/admin-admins.component';
import { AdminStudentsComponent } from './components/page-admin/admin-students/admin-students.component';
import { AdminCoordinatorsComponent } from './components/page-admin/admin-coordinators/admin-coordinators.component';
//Coordinator Imports
import { CoordNavbarComponent } from './components/page-coordinator/coord-navbar/coord-navbar.component';
import { CoordinatorSubmissionComponent } from './components/page-coordinator/coordinator-submission/coordinator-submission.component';
import { CoordAccomplishmentReportComponent } from './components/page-coordinator/coord-accomplishment-report/coord-accomplishment-report.component';
import { CoordDtrComponent } from './components/page-coordinator/coord-dtr/coord-dtr.component';
import { CoordDocumentationComponent } from './components/page-coordinator/coord-documentation/coord-documentation.component';
import { CoordFinalreportComponent } from './components/page-coordinator/coord-finalreport/coord-finalreport.component';
import { AdminClassesComponent } from './components/page-admin/admin-classes/admin-classes.component';
//landing page
import { LandingPageComponent } from './components/landing-page/landing-page.component';


export const routes: Routes = [

    { path: '', component: LoginComponent, title: 'Login' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'registration', component: RegistrationComponent, title: 'Registration' },
    { path: 'PractiPro', component: LandingPageComponent, title: 'PractiPro' },

    //Student Pages
    {
        path: '',
        component: NavbarComponent,
        canActivateChild: [studentGuard], 
        children: [
            { path: 'student-dashboard', component: DashboardComponent, title: 'Dashboard',  },
            { path: 'student-profile', component: ProfileComponent, title: 'Profile',  },
            { path: 'student-submission', component: SubmissionComponent, title: 'Submit a File',  },
            { path: 'student-documentation', component: DocumentationComponent, title: 'Documentation',  },
            { path: 'student-dtr', component: DtrComponent, title: 'Daily Time Record',  },
            { path: 'student-weekly-report', component: WeeklyAccomplishmentRepComponent, title: 'Weekly Accomplishment Report',  },
            { path: 'student-exit-poll', component: ExitPollComponent, title: 'Exit Poll',  },
            { path: 'student-feedback', component: FeedbackComponent, title: 'Feedback',  },
            { path: 'student-aboutus', component: AboutusComponent, title: 'About us',  },
        ]
    },
    //Admin Pages
    {
        path: '',
        component: AdminNavbarComponent,
        canActivateChild: [adminGuard],
        children: [
            { path: 'admin-users', component: AdminUsersComponent, title: 'Users',  },
            { path: 'admin-admins', component: AdminAdminsComponent, title: 'Admins',  },
            { path: 'admin-students', component: AdminStudentsComponent, title: 'Students',  },
            { path: 'admin-coordinators', component: AdminCoordinatorsComponent, title: 'Advisors',  },
            { path: 'admin-classes', component: AdminClassesComponent, title: 'Classes',  },
        ]
    },
    //Coordinator Pages
    {
        path: '',
        component: CoordNavbarComponent,  
        canActivateChild: [coordGuard],      
        children: [
            { path: 'coord-submissions', component: CoordinatorSubmissionComponent, title: 'Submissions',  },
            { path: 'coord-documentations', component: CoordDocumentationComponent, title: 'Documentations',  },
            { path: 'coord-dtr', component: CoordDtrComponent, title: 'Daily Time Record',  },
            { path: 'coord-accomplishmentreport', component: CoordAccomplishmentReportComponent, title: 'Accomplishment Reports',  },
            { path: 'coord-finalreport', component: CoordFinalreportComponent, title: 'Final Reports',  },
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }

];

