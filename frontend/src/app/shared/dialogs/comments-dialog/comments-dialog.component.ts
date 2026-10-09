import { Component, Inject, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';
import { UserService } from '../../../core/api/user.service';
import { CommentService } from '../../../core/api/comment.service';
import { Comment } from '../../../core/models/records';
import { User } from '../../../core/models/user';

@Component({
    selector: 'app-comments-dialog',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './comments-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './comments-dialog.component.css'
})
export class CommentsDialogComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly userApi = inject(UserService);
  private readonly commentApi = inject(CommentService);

  fileID: number;
  fileName: string;
  commentsList: Comment[] | undefined;
  user: User | undefined;
  userName: string | undefined;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private builder: NonNullableFormBuilder, private dialog: MatDialogRef<CommentsDialogComponent>) {
    console.log(data);
    this.fileID = data.submissionID;
    this.fileName = data.fileName;

  }


  ngOnInit(): void {
    this.loadData();

    const currentUser = this.session.requireUserId();
    this.userApi.get(currentUser).subscribe((res) => {
      this.user = res.payload[0];
      this.userName = `${this.user.firstName} ${this.user.lastName}`;
      this.commentForm.patchValue({
        commenter: this.userName
      });
    })
  }

  loadData() {
    this.commentApi.list(this.data.table, this.fileID).subscribe((res) => {
      this.commentsList = res.payload.sort((a, b) => {
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
      this.commentApi.add(this.data.table, this.fileID, this.commentForm.getRawValue()).subscribe((res) => {
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
