import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';

@Component({
    selector: 'app-activate-account',
    imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule
],
    templateUrl: './activate-account.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './activate-account.component.css'
})
export class ActivateAccountComponent implements OnInit, OnDestroy {
  private readonly authApi = inject(AuthService);
  token: string;
  status: any;
  subscriptions = new Subscription();

  constructor(
    private builder: NonNullableFormBuilder,
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
      this.authApi.checkActivationToken(this.token).subscribe((res) => {
          const activationForm = this.builder.group({
            token: this.token,
          })
          this.subscriptions.add(
            this.authApi.activate(activationForm.getRawValue()).subscribe((res) => {
              this.status = 'valid';
              Swal.fire({
                title: 'Account Activated',
                text: res.payload?.awaitingApproval
                  ? 'An administrator will review your account. You can log in once it is approved.'
                  : undefined,
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
