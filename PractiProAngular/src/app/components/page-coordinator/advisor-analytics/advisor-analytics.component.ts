import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-advisor-analytics',
    imports: [RouterOutlet, RouterLinkActive, RouterLink],
    templateUrl: './advisor-analytics.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
