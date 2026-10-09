import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StudentService } from '../../../../core/api/student.service';
import { MediaService } from '../../../../core/api/media.service';
import { StudentLookup } from '../../../../core/models/student';
import { WithAvatar } from '../../../../core/models/display';
@Component({
    selector: 'app-student-lookup-dialog',
    imports: [CommonModule],
    templateUrl: './student-lookup-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './student-lookup-dialog.component.css'
})
export class StudentLookupDialogComponent {
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);

  studentProfile: WithAvatar<StudentLookup> | undefined;
  avatarUrl?: SafeUrl;

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<StudentLookupDialogComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    this.loadInfo();
  }


  loadInfo() {
    this.studentApi.byStudentNumber(this.data.studentId).subscribe((res) => {
        const profile: WithAvatar<StudentLookup> = { ...res.payload[0], avatar: '' };
        this.studentProfile = profile;

        this.mediaApi.avatar(profile.id).subscribe((avatarRes) => {
            if (avatarRes.size > 0) {
                const url = URL.createObjectURL(avatarRes);
                profile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
        });
      }
    );
  }

}
