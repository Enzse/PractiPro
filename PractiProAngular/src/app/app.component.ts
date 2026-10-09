import { Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { LoginComponent } from './components/login/login.component';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoginComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PractiProAngular';
  constructor(private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object) {

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }




}
