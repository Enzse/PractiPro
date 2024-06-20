import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import saveAs from 'file-saver';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, FilterPipe, CommonModule, FormsModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent implements OnInit, OnDestroy {
  userId: any;
  searchtext: any;
  students: any;
  datalist: any[] = [];
  origlist: any;
  private subscriptions = new Subscription();
  selectedTabLabel: string = 'Resume';
  p: number = 1;
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }


  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel.split(" ").join("");
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (!this.userId) {
      console.error('User ID not found.');
      return;
    }
    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.subscriptions.add(
          this.service.uploadSubmission('submissions', this.userId, file, this.selectedTabLabel).subscribe(
            response => {
              console.log('File uploaded successfully:', response);
              Swal.fire({
                title: "Uploaded Successfully!",
                text: "You can view your submissions and their approval status on the table below.",
                icon: "success"
              });
              this.loadData();

              fileInput.value = '';
            },
            error => {
              console.error('Error uploading file:', error);
            }
          ));
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


  loadData() {
    this.subscriptions.add(
      this.service.getSubmissionsByStudent('submissions', this.userId).subscribe(res => {
        if (res) {
          this.datalist = res.payload;
          this.origlist = this.datalist;
        } else {
          console.log("No submissions yet.")
        }
      }, error => {
        console.log(error);
      }));
  }



  setFilter(filter: string) {
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'resume':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'Resume');
        break;
      case 'application':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'ApplicationLetter');
        break;
      case 'acceptance':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'AcceptanceLetter');
        break;
      case 'endorsement':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'EndorsementLetter');
        break;
      case 'parents':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === "Parent's");
        break;
      case 'vaccination':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'VaccinationCard');
        break;
      case 'barangay':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'BarangayClearance');
        break;
      case 'medcert':
        this.datalist = this.datalist.filter((user: any) => user.submission_name === 'MedicalCertificate');
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







  downloadFile(submissionId: number, fileName: string) {
    this.subscriptions.add(
      this.service.getSubmissionFile('submissions', submissionId).subscribe(
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
          this.service.deleteSubmission(submissionId, 'submissions').subscribe((res: any) => {
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
        table: 'comments_requirements'
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData()
      }));
  }

}