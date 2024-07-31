import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-selecttraineespopup',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule],
  templateUrl: './selecttraineespopup.component.html',
  styleUrl: './selecttraineespopup.component.css'
})
export class SelecttraineespopupComponent implements OnInit, OnDestroy {
  traineesList: any;
  searchtext: any;
  selectionForm: FormGroup;
  changeDetected: any;
  private subscriptions = new Subscription()

  constructor(private router: Router, private builder: FormBuilder, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelecttraineespopupComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {
    this.changeDetected = [false];
    this.selectionForm = this.builder.group({
      student_id: [''],
      supervisor_id: ['']
    });
  }

  ngOnInit(): void {
    this.loadData()
  }
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getStudentsByCompany(this.data.company_id).subscribe((res: any) => {
        this.traineesList = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });
        this.traineesList.forEach((student: any) => {
          this.subscriptions.add(
            this.service.getAvatar(student.id).subscribe((res: any) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            }))
        });
      }))
  }

  hireStudents() {
    this.router.navigate(['supervisor-hirestudents']);
    this.dialog.close();
  }

  addStudentToSelection(id: number) {
    this.selectionForm.patchValue({
      student_id: id,
      supervisor_id: this.data.supervisor_id
    });
    this.subscriptions.add(
      this.service.addStudentToSupervisor(this.selectionForm.value).subscribe((res: any) => {
        this.changeDetected = true;
        this.dialog.close(this.changeDetected);
      }, error => {
        if (error.status === 409) {
          Swal.fire({
            title: "That student is already in your selection.",
            icon: "warning"
          });
        }
        else {
          Swal.fire({
            title: "Error",
            text: "Failed to add student to company.",
            icon: "error"
          });
        }
      }));
  }

  option1Action(id: number, firstName: string, lastName: string) {
    Swal.fire({
      title: "Request Confirmation",
      text: `Are you sure you want to remove ${firstName} ${lastName} from your company?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Remove student"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.removeStudentFromCompany(this.data.company_id, id).subscribe((res: any) => {
            this.changeDetection.notifyChange(true);
            Swal.fire({
              title: "Student Removed!",
              text: "The student has been successfully removed from your company.",
              icon: "success"
            });
          }, error => {
            Swal.fire({
              title: "Request failed",
              text: "You may not have permission to remove this user.",
              icon: "error"
            });
          }));
        this.dialog.close();
      }
    });
  }
}
