import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PractiProAngular';
  constructor(private router: Router) {

  }





}
