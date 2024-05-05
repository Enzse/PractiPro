import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, NgIf } from '@angular/common';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent {
studentRequirements: any;

}
