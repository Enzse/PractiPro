
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NonNullableFormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { JoinLink } from '../../../core/models/class';
import { Student } from '../../../core/models/student';

@Component({
    selector: 'app-join-class-by-link',
    imports: [RouterLink],
    templateUrl: './join-class-by-link.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './join-class-by-link.component.css'
})
export class JoinClassByLinkComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly classJoinApi = inject(ClassJoinService);
  private subscriptions = new Subscription();
  token: any;
  status: any;
  userID: any = this.session.requireUserId();
  tokenData: JoinLink | undefined;
  student: Student | undefined;

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
      this.studentApi.get(this.userID).subscribe((res) => {
        this.student = res.payload[0];

        if (this.student.block) {
          this.status = 'conflict'
        }
        else {
          this.subscriptions.add(
            this.classJoinApi.checkLink(this.token).subscribe((res) => {
                this.tokenData = res.payload;
                this.subscriptions.add(
                  this.studentApi.joinClass(this.userID, {
                    block_name: this.tokenData.class,
                    token: this.token, // proves the student was given the link
                  }).subscribe((res) => {
                    this.status = 'valid';
                    Swal.fire({
                      title: `Successfully joined ${this.tokenData?.class}!`,
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
