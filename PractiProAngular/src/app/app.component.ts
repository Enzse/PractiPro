import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestComponent } from './test/test.component';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TestComponent, LoginComponent, DashboardComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';

  ngOnInit(): void {
    initFlowbite();
  }
}
