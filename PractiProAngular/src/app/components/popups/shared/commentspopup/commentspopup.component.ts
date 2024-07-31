import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-commentspopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './commentspopup.component.html',
  styleUrl: './commentspopup.component.css'
})
export class CommentspopupComponent implements OnInit {

  fileID: number;
  fileName: string;
  commentsList: any;
  user: any;
  userName: any;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private builder: FormBuilder, private dialog: MatDialogRef<CommentspopupComponent>, private service: AuthService) {
    console.log(data);
    this.fileID = data.submissionID;
    this.fileName = data.fileName;

  }


  ngOnInit(): void {
    this.loadData();

    const currentUser = this.service.getCurrentUserId();
    this.service.getUser(currentUser).subscribe((res: any) => {
      this.user = res.payload[0];
      this.userName = `${this.user.firstName} ${this.user.lastName}`;
      this.commentForm.patchValue({
        commenter: this.userName
      });
    })
  }

  loadData() {
    this.service.getSubmissionComments(this.data.table, this.fileID).subscribe((res: any) => {
      this.commentsList = res.payload.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
  }

  commentForm = this.builder.group({
    comments: this.builder.control('', Validators.required),
    commenter: this.builder.control('', Validators.required),
  });

  submitComment() {
    if (this.commentForm.valid) {
      this.service.addComment(this.data.table, this.fileID, this.commentForm.value).subscribe((res: any) => {
        Swal.fire({
          title: "Comment Submitted!",
          icon: "success"
        });
        this.loadData();
        this.commentForm.patchValue({
          comments: ''
        });
      })
    } else {
      Swal.fire({
        title: "Atleast write something first!",
        icon: "error"
      });
    }
  }

  closePopup() {
    this.dialog.close()
  }
}
