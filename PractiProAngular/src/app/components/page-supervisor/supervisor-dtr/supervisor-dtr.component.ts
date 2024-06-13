import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-supervisor-dtr',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-dtr.component.html',
  styleUrl: './supervisor-dtr.component.css'
})
export class SupervisorDtrComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
  }


  



}
