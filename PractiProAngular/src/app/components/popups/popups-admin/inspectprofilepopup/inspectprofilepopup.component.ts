import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StudentService } from '../../../../services/api/student.service';
import { MediaService } from '../../../../services/api/media.service';
@Component({
    selector: 'app-inspectprofilepopup',
    imports: [CommonModule],
    templateUrl: './inspectprofilepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './inspectprofilepopup.component.css'
})
export class InspectprofilepopupComponent {
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);

  studentProfile: any;
  avatarUrl?: SafeUrl;

  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<InspectprofilepopupComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    this.loadInfo();
  }


  loadInfo() {
    this.studentApi.byStudentNumber(this.data.studentId).subscribe(
      (res: any) => {
        this.studentProfile = res.payload[0];
        this.studentProfile.avatar = '';
                
        console.log(this.studentProfile);
        
        this.mediaApi.avatar(this.studentProfile.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
                const url = URL.createObjectURL(avatarRes);
                this.studentProfile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
        });
      }
    );
  }

}
