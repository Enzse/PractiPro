import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { EditinformationpopupComponent } from '../../page-student/editinformationpopup/editinformationpopup.component';

@Component({
  selector: 'app-inspectprofilepopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './inspectprofilepopup.component.html',
  styleUrl: './inspectprofilepopup.component.css'
})
export class InspectprofilepopupComponent {

  studentProfile: any[] = [];
  avatarUrl?: SafeUrl;

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<InspectprofilepopupComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    this.loadInfo();
    this.loadAvatar();
  }

  //This serves as a placeholder for the student data.
  loadAvatar() {
    console.log("Loading Avatar...");
    if (this.data.usercode) {
      this.service.getAvatar(this.data.usercode).subscribe(
        blob => {
          console.log("Loading Blob");
          console.log(`blob: ${blob}`);
          if (blob.size > 0) { 
            const url = URL.createObjectURL(blob);
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
            console.log(`this.avatarUrl: ${this.avatarUrl}`);
          } else {
            console.log("User has not uploaded an avatar yet.");
            this.avatarUrl = undefined;
          }
        },
        error => {
          if (error.status === 404) {
            console.log('No avatar found for the user.');
            this.avatarUrl = undefined;
          } else {
            console.error('Failed to load avatar:', error);
          }
        }
      );
    }
  }

  loadInfo() {
    if (this.data.usercode) {
      this.service.getStudentProfile(this.data.usercode).subscribe(
        (data: any[]) => {
          console.log(data);
          this.studentProfile = data;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }

  //This is for the Submit button functionality.
  editInfo(code: any) {
    const popup = this.dialog2.open(EditinformationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      // height: "70%",
      data: {
        usercode: code
      }
    });
    popup.afterClosed().subscribe(res => {
      this.loadInfo()
    });
  }
}
