import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { LoginComponent } from './components/login/login.component';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { JwtService } from './services/jwt.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, HttpClientModule, PdfViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';
  constructor(private router: Router, private service: AuthService, 
    @Inject(PLATFORM_ID) private platformId: Object, private jwtservice: JwtService) {

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }




}
