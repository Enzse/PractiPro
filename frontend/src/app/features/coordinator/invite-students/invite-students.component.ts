import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-invite-students',
    imports: [ReactiveFormsModule, RouterOutlet, RouterLinkActive, RouterLink],
    templateUrl: './invite-students.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invite-students.component.css'
})
export class InviteStudentsComponent {


  constructor(
    ) {

  }

  ngOnInit(): void {

  }

  sendHiringRequest(student: any) {



  }
}
