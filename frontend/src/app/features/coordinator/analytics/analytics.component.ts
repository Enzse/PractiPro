import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import Swal from 'sweetalert2';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-analytics',
    imports: [RouterOutlet, RouterLinkActive, RouterLink],
    templateUrl: './analytics.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, OnDestroy {

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
