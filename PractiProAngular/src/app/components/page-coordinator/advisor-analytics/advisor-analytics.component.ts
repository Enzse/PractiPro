import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-advisor-analytics',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './advisor-analytics.component.html',
  styleUrl: './advisor-analytics.component.css'
})
export class AdvisorAnalyticsComponent implements OnInit, OnDestroy {

  constructor(
    private service: AuthService,
  ) {

  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }

  sendHiringRequest(student: any) {



  }
}
