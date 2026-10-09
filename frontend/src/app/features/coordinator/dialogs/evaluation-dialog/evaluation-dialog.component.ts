import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from '../../../../shared/utils/save-file';
import { PdfViewerDialogComponent } from '../../../../shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { ReportService } from '../../../../core/api/report.service';

@Component({
    selector: 'app-evaluation-dialog',
    imports: [CommonModule, MatButtonModule, MatMenuModule, FormsModule, ReactiveFormsModule],
    templateUrl: './evaluation-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './evaluation-dialog.component.css'
})
export class EvaluationDialogComponent {
  private readonly submissionApi = inject(SubmissionService);
  private readonly reportApi = inject(ReportService);
  isLoading: boolean = true;
  private subscriptions = new Subscription();
  evaluationForm: any;
  existingForm: any;
  constructor(private changeDetection: DataRefreshService, private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EvaluationDialogComponent>, private dialog2: MatDialog) {

    this.evaluationForm = this.builder.group({
      supervisor_id: [''],
      student_id: [''],
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
    this.loadData();
  }
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.reportApi.evaluationOf(this.data.student.id).subscribe(res => {
        this.existingForm = res.payload[0]
        this.evaluationForm.patchValue(this.existingForm)
        this.isLoading = false;
      }
      ));
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.subscriptions.add(
      this.submissionApi.setAdvisorApproval('student_supervisor_evaluation', record.id, updateData).subscribe(
        res => {
          this.changeDetection.notifyChange(true);
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Submission successfully set to '${record.advisor_approval}'.`,
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error => {
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Error occured. You might no have permission to edit this record.`,
            icon: "error",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      ));
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_evaluations'
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData()
      }));
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
