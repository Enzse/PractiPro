import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

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
    ) {

  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }

  sendHiringRequest(student: any) {



  }
}
