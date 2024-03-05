import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestComponent } from './test/test.component';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { DashboardComponent } from './dashboard/dashboard.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TestComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';

  ngOnInit(): void {
    initFlowbite();
  }
}
