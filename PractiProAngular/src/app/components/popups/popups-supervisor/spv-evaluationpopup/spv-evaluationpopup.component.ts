import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { Subscription } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-spv-evaluationpopup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './spv-evaluationpopup.component.html',
  styleUrl: './spv-evaluationpopup.component.css'
})
export class SpvEvaluationpopupComponent implements OnInit, OnDestroy {
  userId: any;
  datalist: any[] = [];
  existingEvaluation: any;
  evaluationForm: any;
  private subscriptions = new Subscription();

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<SpvEvaluationpopupComponent>) {
    this.userId = this.service.getCurrentUserId();

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEvaluation() {
    this.subscriptions.add(
      this.service.getEvaluationForStudent(this.data.student.id).subscribe((res: any) => {
        this.existingEvaluation = res.payload[0];
        console.log(this.existingEvaluation);
        this.evaluationForm.patchValue(this.existingEvaluation);
      })
    )
  }

  submitEvaluation() {
    if (!this.evaluationForm.valid) {
      Swal.fire({
        title: "It seems you might've missed some questions.",
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
          this.service.createStudentEvaluation(this.evaluationForm.value).subscribe((res: any) => {
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
        this.service.deleteSubmission(submissionId, 'supervisor_student_evaluations').subscribe((res: any) => {
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
    // popup.afterClosed().subscribe(res => {
    //   this.loadData()
    // });
  }
}
