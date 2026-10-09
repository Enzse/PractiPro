
import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StudentService } from '../../../../core/api/student.service';
import { MediaService } from '../../../../core/api/media.service';

@Component({
    selector: 'app-class-students-dialog',
    imports: [MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './class-students-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './class-students-dialog.component.css'
})
export class ClassStudentsDialogComponent {
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);
  constructor(private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ClassStudentsDialogComponent>, private sanitizer: DomSanitizer) { }

  datalist: any[] = [];
  avatarlist: any[] = [];

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.studentApi.inClass(this.data.usercode).subscribe((res) => {
          this.datalist = res.payload.map((user) => {
            return { ...user, avatar: '' };
          });

          this.datalist.forEach(student => {
            this.mediaApi.avatar(student.id).subscribe(res => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);

              }
            })
          });
        },
        (error: any) => {
          console.error('Error fetching students', error);
        }
      );
    }
  }

  redirect() {
    this.router.navigate(['admin-students'])
    this.dialog.close();
  }
}
