
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NonNullableFormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { ClassJoinService } from '../../../services/api/class-join.service';

@Component({
    selector: 'app-joinclasses-by-link',
    imports: [RouterLink],
    templateUrl: './joinclasses-by-link.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './joinclasses-by-link.component.css'
})
export class JoinclassesByLinkComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly classJoinApi = inject(ClassJoinService);
  private subscriptions = new Subscription();
  token: any;
  status: any;
  userID: any = this.session.userId();
  tokenData: any;
  student: any;

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
      this.studentApi.get(this.userID).subscribe((res: any) => {
        this.student = res.payload[0];

        if (this.student.block) {
          this.status = 'conflict'
        }
        else {
          this.subscriptions.add(
            this.classJoinApi.checkLink(this.token).subscribe(
              (res: any) => {
                this.tokenData = res.payload;
                this.subscriptions.add(
                  this.studentApi.joinClass(this.userID, {
                    block_name: this.tokenData.class,
                    token: this.token, // proves the student was given the link
                  }).subscribe((res: any) => {
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
