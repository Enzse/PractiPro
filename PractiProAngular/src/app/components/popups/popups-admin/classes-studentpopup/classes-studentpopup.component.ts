
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-classes-studentpopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './classes-studentpopup.component.html',
  styleUrl: './classes-studentpopup.component.css'
})
export class ClassesStudentpopupComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ClassesStudentpopupComponent>, private sanitizer: DomSanitizer) { }

  datalist: any[] = [];
  avatarlist: any[] = [];

  ngOnInit(): void {
    console.log(this.data.usercode)
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getAllStudentsFromClass(this.data.usercode).subscribe(
        (data: any[]) => {
          this.datalist = data.map(user => {
            return { ...user, avatar: '' };
          });
          console.log(this.datalist);
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
          console.error('Error fetching student submissions:', error);
        }
      );
    }

  }

  
  getAvatars() {
    console.log("this works")
  }

}
