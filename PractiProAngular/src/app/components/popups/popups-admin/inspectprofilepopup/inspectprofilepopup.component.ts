import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { EditinformationpopupComponent } from '../../popups-student/editinformationpopup/editinformationpopup.component';

@Component({
  selector: 'app-inspectprofilepopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './inspectprofilepopup.component.html',
  styleUrl: './inspectprofilepopup.component.css'
})
export class InspectprofilepopupComponent {

  studentProfile: any;
  avatarUrl?: SafeUrl;

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<InspectprofilepopupComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    this.loadInfo();
  }


  loadInfo() {
    this.service.getStudentsByStudentID(this.data.studentId).subscribe(
      (res: any) => {
        this.studentProfile = res.payload[0];
        this.studentProfile.avatar = '';
                
        console.log(this.studentProfile);
        
        this.service.getAvatar(this.studentProfile.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
                const url = URL.createObjectURL(avatarRes);
                this.studentProfile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
        });
      }
    );
  }

  //This is for the Submit button functionality.
  editInfo(code: any) {
    const popup = this.dialog2.open(EditinformationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
      }
    });
    popup.afterClosed().subscribe(res => {
      this.loadInfo()
    });
  }
}
