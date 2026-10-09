import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SessionService } from '../../../services/session.service';
import { SubmissionService } from '../../../services/api/submission.service';

@Component({
    selector: 'app-documentation',
    imports: [MatTabsModule, FilterPipe, FormsModule, CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule],
    templateUrl: './documentation.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './documentation.component.css'
})
export class DocumentationComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly submissionApi = inject(SubmissionService);
  userId: any;
  datalist: any[] = [];
  origlist: any
  searchtext: any;
  pdfPreview?: SafeResourceUrl;
  file: any;
  tabWeekNumbers: number[] = [1];
  p: number = 1;
  private subscriptions = new Subscription();
  isUploading = false;

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.session.userId();
  }


  ngOnInit() {
    this.loadData();
    this.subscriptions.add(
      this.submissionApi.weekNumbers('documentations', this.userId).subscribe(
        res => {
          this.tabWeekNumbers = res;
        },
        error => {
          console.error('Error fetching week numbers:', error);
        }
      ));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.submissionApi.list('documentations', this.userId).subscribe(res => {
        this.datalist = res.payload.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        this.origlist = this.datalist;
      }));
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

  //SUBMISSION LOGIC
  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  selectedTabLabel: number = 1;
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = parseInt(event.tab.textLabel.replace('Week ', ''), 10);
    this.pdfPreview = undefined;
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    this.isUploading = true;
    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.subscriptions.add(
          this.submissionApi.upload('documentations', this.userId, file, this.selectedTabLabel).subscribe(
            response => {
              console.log('File uploaded successfully:', response);
              Swal.fire({
                title: "Uploaded Successfully!",
                text: "Please wait for your coordinator's approval.",
                icon: "success"
              });
              this.loadData();
              this.pdfPreview = undefined;
              fileInput.value = '';
              this.isUploading = false;
            },
            error => {
              console.error('Error uploading file:', error);
              this.isUploading = false;
            }
          ));
      }
      else if (file == null) {
        Swal.fire({
          title: "No File to Upload",
          text: "Please select a file to upload first.",
          icon: "error"
        });
        this.isUploading = false;
      }
    });
  }

  setFilter(filter: string) {
    this.p = 1;
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'approved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Pending');
        break;
    }
  }

  setFilterWeek(week: any) {
    this.datalist = this.origlist;
    this.datalist = this.datalist.filter((user: any) => user.week === week);

  }

  downloadFile(submissionId: number, fileName: string) {
    this.subscriptions.add(
      this.submissionApi.download('documentations', submissionId).subscribe(
        (data: any) => {
          saveAs(data, fileName);
        },
        (error: any) => {
          console.error('Error downloading submission:', error);
        }
      ));
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
        this.subscriptions.add(
          this.submissionApi.delete('documentations', submissionId).subscribe((res: any) => {
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
          }));
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
        table: 'comments_documentation'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
