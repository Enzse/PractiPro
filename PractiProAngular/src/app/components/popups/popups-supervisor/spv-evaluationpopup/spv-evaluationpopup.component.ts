import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-spv-evaluationpopup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spv-evaluationpopup.component.html',
  styleUrl: './spv-evaluationpopup.component.css'
})
export class SpvEvaluationpopupComponent {
  userId: any;
  datalist: any[] = [];
  file:any;
  pdfPreview?: SafeResourceUrl;
  constructor(
    private service: AuthService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<SpvEvaluationpopupComponent>,
    private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getStudentEvaluation(this.data.student.id).subscribe(res => {
      console.log(res);
      this.datalist = res.payload;
    });
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewPDF(); 
    }
  }

  previewPDF() {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileURL = e.target?.result as string;
      this.pdfPreview = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    };
    reader.readAsDataURL(this.file);
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.service.uploadEvaluation(this.userId, this.data.student.id, file).subscribe(
          response => {
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "You can view your uploaded evaluations for this student in the table below",
              icon: "success"
            });
            this.loadData();
            this.pdfPreview = '';
            fileInput.value = '';
          },
          error => {
            console.error('Error uploading file:', error);
          }
        );
      }
      else if (file == null) {
        Swal.fire({
          title: "No File to Upload",
          text: "Please select a file to upload first.",
          icon: "error"
        });
      }
    });
  }
  viewTemplate() {
    const popup = this.dialog.open(PdfviewerComponent, {
      enterAnimationDuration: "0ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        templateName: '../../assets/pdfTemplates/Evaluation.pdf'
      }
    })
  }


  viewFile(submissionId: number) {
    this.service.getSubmissionFile('supervisor_student_evaluations', submissionId).subscribe(
      (data: any) => {
        const popup = this.dialog.open(PdfviewerComponent, {
          enterAnimationDuration: "0ms",
          exitAnimationDuration: "500ms",
          width: "90%",
          data: {
            selectedPDF: data
          }
        })
      },
      (error: any) => {
        console.error('Error viewing submission:', error);
      }
    );
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
          this.loadData();
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
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }
}
