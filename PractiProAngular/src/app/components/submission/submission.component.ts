import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent {

  }