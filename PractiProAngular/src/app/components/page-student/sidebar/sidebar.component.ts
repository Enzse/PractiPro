import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
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
    this.service.getStudentProfile(this.studentId).subscribe(
      (data: any[]) => {
        this.registrationStatus = data[0].registrationstatus;
        console.log(`Registration Status: ${this.registrationStatus}`)
      },
      (error: any) => {
        console.error('Error fetching student requirements:', error);
      }
    );
  }


}
