import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-joinclasses-by-link',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './joinclasses-by-link.component.html',
  styleUrl: './joinclasses-by-link.component.css'
})
export class JoinclassesByLinkComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  token: any;
  status: any;
  userID: any = this.service.getCurrentUserId();
  tokenData: any;
  student: any;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.token = this.route.snapshot.queryParams['token'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {

    this.subscriptions.add(
      this.service.getStudent(this.userID).subscribe((res: any) => {
        this.student = res.payload[0];

        if (this.student.block) {
          this.status = 'conflict'
        }
        else {
          this.subscriptions.add(
            this.service.getClassJoinToken(this.token).subscribe(
              (res: any) => {
                this.tokenData = res.payload;
                const joinForm = this.builder.group({
                  block_name: this.tokenData.class
                })
                this.subscriptions.add(
                  this.service.assignClassToStudent(this.userID, joinForm.value).subscribe((res: any) => {
                    this.status = 'valid';
                    Swal.fire({
                      title: `Successfully joined ${this.tokenData.class}!`,
                      icon: 'success',
                    })
                  }));
              },
              (error) => {
                this.status = 'invalid';
                if (error.status === 401) {
                  Swal.fire({
                    title: 'Token expired!',
                    text: 'Please ask your advisor for a fresh new token.',
                    icon: 'warning',
                  })
                }
                if (error.status === 404) {
                  Swal.fire({
                    title: 'No such token is found!',
                    icon: 'error',
                  })
                }
                this.router.navigate(['/login']);
              }
            ));
        }
      })
    )

  }


}
