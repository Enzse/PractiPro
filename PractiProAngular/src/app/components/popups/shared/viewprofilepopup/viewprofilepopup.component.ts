import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-viewprofilepopup',
  standalone: true,
  imports: [CommonModule, MatDialogActions, MatDialogClose],
  templateUrl: './viewprofilepopup.component.html',
  styleUrl: './viewprofilepopup.component.css'
})
export class ViewprofilepopupComponent implements OnInit, OnDestroy {
  studentProfile: any;
  avatarUrl?: SafeUrl;
  private subscriptions = new Subscription();

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewprofilepopupComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }

  ngOnInit(): void {
    this.loadInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInfo() {
    this.subscriptions.add(
      this.service.getStudentOjtInfo(this.data.student_id).subscribe(
        (res: any) => {
          this.studentProfile = res.payload[0];
          this.studentProfile.avatar = '';
          this.service.getAvatar(this.studentProfile.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              this.studentProfile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          });
        }));
  }

  closePopup() {
    this.dialog.close();
  }

}
