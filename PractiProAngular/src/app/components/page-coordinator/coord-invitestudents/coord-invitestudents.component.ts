import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-coord-invitestudents',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './coord-invitestudents.component.html',
  styleUrl: './coord-invitestudents.component.css'
})
export class CoordInvitestudentsComponent {


  constructor(
    private service: AuthService,
  ) {

  }

  ngOnInit(): void {

  }

  sendHiringRequest(student: any) {



  }
}
