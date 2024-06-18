import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  studentId: any;
  student: any;
  registrationStatus: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private service: AuthService,) {
  }
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();

    
    this.studentId = this.service.getCurrentUserId();
    this.service.getStudentOjtInfo(this.studentId).subscribe(
      (res: any) => {
        this.student = res.payload[0];
        console.log(this.student)
        this.registrationStatus = res.payload[0].registration_status;
      },
      (error: any) => {
        console.error('Error fetching student requirements:', error);
      }
    );
  }


}
