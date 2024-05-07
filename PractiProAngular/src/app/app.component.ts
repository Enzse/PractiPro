import { Component, DoCheck, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { DashboardComponent } from './components/page-student/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/page-student/sidebar/sidebar.component';
import { FeedbackComponent } from './components/page-student/feedback/feedback.component';
import { AboutusComponent } from './components/page-student/aboutus/aboutus.component';
import { NavbarComponent } from './components/page-student/navbar/navbar.component';
import { ProfileComponent } from './components/page-student/profile/profile.component';
import { Router } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { JwtService } from './services/jwt.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, DashboardComponent, SidebarComponent, FeedbackComponent, AboutusComponent, NavbarComponent, ProfileComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';
  ismenurequired = false;
  isadminuser = false;
  constructor(private router: Router, private service: AuthService, 
    @Inject(PLATFORM_ID) private platformId: Object, private jwtservice: JwtService) {

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }

  // ngDoCheck(): void {
  //   let currenturl = this.router.url;
  //   if (currenturl == '/login' || currenturl == '/registration') {
  //     this.ismenurequired = false;
  //   } else {
  //     this.ismenurequired = true;
  //   }
  //   if (this.jwtservice.getUserRole() === 'admin') {
  //     this.isadminuser = true;
  //   } else {
  //     this.isadminuser = false;
  //   }
  // }


}
