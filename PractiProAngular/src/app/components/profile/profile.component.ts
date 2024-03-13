import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  studentProfile: any[] = [];

  constructor(private service: AuthService) { }

  ngOnInit(): void {
    const userId = this.service.getCurrentUserId();
    if (userId) {
      this.service.getStudentProfile(userId).subscribe(
        (data: any[]) => {
          this.studentProfile = data;
          console.log(this.studentProfile)
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }
}
