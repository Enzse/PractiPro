import { Component, ElementRef, Inject, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { Subscription } from 'rxjs';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionService } from '../../../../core/auth/session.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { ReportService } from '../../../../core/api/report.service';

@Component({
    selector: 'app-evaluation-form-dialog',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './evaluation-form-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './evaluation-form-dialog.component.css'
})
export class EvaluationFormDialogComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly reportApi = inject(ReportService);
  userId: number;
  datalist: any[] = [];
  existingEvaluation: any;
  evaluationForm: any;
  private subscriptions = new Subscription();

  constructor(
    private builder: NonNullableFormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<EvaluationFormDialogComponent>,
    private el: ElementRef) {
    this.userId = this.session.requireUserId();

    this.evaluationForm = this.builder.group({
      supervisor_id: this.userId,
      student_id: this.data.student.id,
      p1q1: ['', Validators.required],
      p1q2: ['', Validators.required],
      p1q3: ['', Validators.required],
      p1q4: ['', Validators.required],
      p1q5: ['', Validators.required],

      p2q1: ['', Validators.required],
      p2q2: ['', Validators.required],
      p2q3: ['', Validators.required],
      p2q4: ['', Validators.required],
      p2q5: ['', Validators.required],
      p2q6: ['', Validators.required],
      p2q7: ['', Validators.required],
      p2q8: ['', Validators.required],

      p3q1: ['', Validators.required],
      p3q2: ['', Validators.required],
      p3q3: ['', Validators.required],
      p3q4: ['', Validators.required],
      p3q5: ['', Validators.required],
      p3q6: ['', Validators.required],
      p3q7: ['', Validators.required],
      p3q8: ['', Validators.required],
      p3q9: ['', Validators.required],
      p3q10: ['', Validators.required],
      p3q11: ['', Validators.required],
      p3q12: ['', Validators.required],
      p3q13: ['', Validators.required],

      p4q1: ['', Validators.required],

      p5q1: ['', Validators.required],
      p5q2: ['', Validators.required],
      p5q3: ['', Validators.required],
      p5q4: ['', Validators.required],
      p5q5: ['', Validators.required],
      p5q6x1: ['', Validators.required],
      p5q6: ['', Validators.required],

    })
  }

  ngOnInit(): void {
    this.loadEvaluation();
  }
  closePopup() {
    this.dialogref.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEvaluation() {
    this.subscriptions.add(
      this.reportApi.evaluationOf(this.data.student.id).subscribe((res) => {
        this.existingEvaluation = res.payload[0];
        console.log(this.existingEvaluation);
        this.evaluationForm.patchValue(this.existingEvaluation);
      })
    )
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector('form .ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidControl.focus();
    }
  }

  submitEvaluation() {
    if (!this.evaluationForm.valid) {
      this.scrollToFirstInvalidControl();
      Swal.fire({
        title: "It seems you have missed some questions.",
        text: "Please answer all the questions first before submitting the evaluation.",
        confirmButtonColor: '#233876',
        icon: 'warning'
      })
      return;
    }
    Swal.fire({
      title: 'Are you sure you want to submit this evaluation?',
      text: "You will not be able to edit the evaluation once you have submitted it. Please make sure you've answered it carefully.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#233876',
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.reportApi.createEvaluation(this.evaluationForm.value).subscribe((res) => {
            Swal.fire({
              title: `Successfully submitted evaluation for ${this.data.student.firstName} ${this.data.student.lastName}`,
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



  deleteSubmission(submissionId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.submissionApi.delete('supervisor_student_evaluations', submissionId).subscribe((res) => {
          Swal.fire({
            title: "Your submission has been deleted",
            icon: "success"
          });
          // this.loadData();
        }, error => {
          Swal.fire({
            title: "Delete failed",
            text: "You may not have permission to delete this file.",
            icon: "error"
          });
        });
      }
    });
  }


  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_finalreports'
      }
    })
    // popup.afterClosed().subscribe(res => {
    //   this.loadData()
    // });
  }


  scrollToTop(): void {
    const scrollContainer = document.querySelector('.scroll-container');
    if (scrollContainer) {
      (scrollContainer as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.error('Scroll container not found');
    }
  }
}
