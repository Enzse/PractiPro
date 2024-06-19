
import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-classes-studentpopup',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './classes-studentpopup.component.html',
  styleUrl: './classes-studentpopup.component.css'
})
export class ClassesStudentpopupComponent {
  constructor(private router: Router, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ClassesStudentpopupComponent>, private sanitizer: DomSanitizer) { }

  datalist: any[] = [];
  avatarlist: any[] = [];

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getAllStudentsFromClass(this.data.usercode).subscribe(
        (res: any) => {
          this.datalist = res.payload.map((user: any) => {
            return { ...user, avatar: '' };
          });

          this.datalist.forEach(student => {
            this.service.getAvatar(student.id).subscribe(res => {
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
