import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-exit-poll',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, ReactiveFormsModule, CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule],
  templateUrl: './exit-poll.component.html',
  styleUrl: './exit-poll.component.css'
})
export class ExitPollComponent implements OnInit, OnDestroy {
  userId: any;
  existingReport: any;
  p: number = 1;
  private subscriptions = new Subscription();
  exitPollForm: any;

  constructor(private service: AuthService, private builder: FormBuilder, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
    this.exitPollForm = this.builder.group({
      user_id: this.userId,
      p1q1: ['', Validators.required],
      p1q2: ['', Validators.required],
      p1q3: ['', Validators.required],
      p1q4: ['', Validators.required],
      p1q5: ['', Validators.required],
      p1q6: ['', Validators.required],
      p1q7: ['', Validators.required],
      p1q7x1: [''],
      p1q7x2: [''],

      p2q1: ['', Validators.required],
      p2q1x1: ['', Validators.required],
      p2q2: ['', Validators.required],
      p2q2x1: ['', Validators.required],
      p2q3: ['', Validators.required],
      p2q3x1: ['', Validators.required],
      p2q4: ['', Validators.required],
      p2q4x1: ['', Validators.required],
      p2q5: ['', Validators.required],
      p2q5x1: ['', Validators.required],

      p3q1: ['', Validators.required],

      p4q1: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.getReport();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getReport() {
    this.subscriptions.add(
      this.service.getFinalReport(this.userId).subscribe((res: any) => {
        this.existingReport = res.payload[0];
        console.log(this.existingReport);
      })
    )
  }

  submitReport() {
    if (!this.exitPollForm.valid) {
      Swal.fire({
        title: "It seems you might've missed some questions.",
        text: "Please answer all the questions first before submitting the report.",
        confirmButtonColor: '#233876',
        icon: 'warning'
      })
      return;
    }
    Swal.fire({
      title: 'Are you sure you want to submit this report?',
      text: "You will not be able to edit the report once you have submitted it. Please make sure you've answered it carefully.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#233876',
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.createFinalReport(this.exitPollForm.value).subscribe((res: any) => {
            Swal.fire({
              title: `Successfully submitted record`,
              text: `Please wait for your advisor's feedback.`,
              icon: "success",
              timer: 3000,
              timerProgressBar: true,
              confirmButtonColor: '#233876',
            });
          })
        );
      }
    });
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_finalreports'
      }
    })
    // this.subscriptions.add(
    //   popup.afterClosed().subscribe(res => {
    //     this.loadData()
    //   }));
  }

}
