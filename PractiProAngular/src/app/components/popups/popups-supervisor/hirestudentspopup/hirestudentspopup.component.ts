import { Component } from '@angular/core';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-hirestudentspopup',
  standalone: true,
  imports: [FilterPipe, FormsModule],
  templateUrl: './hirestudentspopup.component.html',
  styleUrl: './hirestudentspopup.component.css'
})
export class HirestudentspopupComponent {
  constructor(private service: AuthService) {

  }
  
  searchForStudentID() {

  }
}
