import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-coord-evaluationspopup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coord-evaluationspopup.component.html',
  styleUrl: './coord-evaluationspopup.component.css'
})
export class CoordEvaluationspopupComponent {
  isLoading: boolean = true;
  private subscriptions = new Subscription();
  evaluationForm: any;
  existingForm: any;
  constructor(private changeDetection: ChangeDetectionService, private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CoordEvaluationspopupComponent>, private dialog2: MatDialog) {

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getEvaluationForStudent(this.data.student.id).subscribe(res => {
        this.existingForm = res.payload[0]
        this.evaluationForm.patchValue(this.existingForm)
        this.isLoading = false;
      }
      ));
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.subscriptions.add(
      this.service.updateAdvisorApproval('student_supervisor_evaluation', record.id, updateData).subscribe(
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
    const popup = this.dialog2.open(CommentspopupComponent, {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
