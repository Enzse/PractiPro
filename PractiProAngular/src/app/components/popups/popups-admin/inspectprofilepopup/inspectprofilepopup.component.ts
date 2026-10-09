import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Component({
    selector: 'app-inspectprofilepopup',
    imports: [CommonModule, MatDialogActions, MatDialogClose],
    templateUrl: './inspectprofilepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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

}
