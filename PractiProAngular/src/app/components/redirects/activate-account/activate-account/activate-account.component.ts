import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
  ],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css',
})
export class ActivateAccountComponent implements OnInit, OnDestroy {
  token: string;
  status: any;
  subscriptions = new Subscription();

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
      this.service.getAccountActivationToken(this.token).subscribe(
        (res: any) => {
          const activationForm = this.builder.group({
            token: this.token,
          })
          this.subscriptions.add(
            this.service.activateAccount(activationForm.value).subscribe((res: any) => {
              this.status = 'valid';
              Swal.fire({
                title: 'Account Activated',
                icon: 'success',
              })
            }));
        },
        (error) => {
          if (error.status === 404) {
            this.status = 'invalid';
            alert(
              'No such token is found. You are now being redirected to the login page.'
            );
            this.router.navigate(['/login']);
          }
        }
      ));
  }
}
