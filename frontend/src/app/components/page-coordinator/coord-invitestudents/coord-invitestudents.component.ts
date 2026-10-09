import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-coord-invitestudents',
    imports: [ReactiveFormsModule, RouterOutlet, RouterLinkActive, RouterLink],
    templateUrl: './coord-invitestudents.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-invitestudents.component.css'
})
export class CoordInvitestudentsComponent {


  constructor(
    ) {

  }

  ngOnInit(): void {

  }

  sendHiringRequest(student: any) {



  }
}
