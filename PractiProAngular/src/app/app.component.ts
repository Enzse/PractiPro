import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestComponent } from './test/test.component';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
<<<<<<< HEAD
import { DashboardComponent } from './dashboard/dashboard.component';

=======
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
>>>>>>> 83991bd1fb1949e26355b16458dcbab7cc523f3e

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, TestComponent, DashboardComponent],
=======
  imports: [RouterOutlet, TestComponent, SidebarComponent, DashboardComponent,LoginComponent],
>>>>>>> 83991bd1fb1949e26355b16458dcbab7cc523f3e
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';

  ngOnInit(): void {
    initFlowbite();
  }
}