import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { EditinformationpopupComponent } from '../../popups/popups-student/editinformationpopup/editinformationpopup.component';

@Component({
  selector: 'app-supervisor-profile',
  standalone: true,
  imports: [CommonModule, EditinformationpopupComponent, MatIconModule, DatePipe],
  templateUrl: './supervisor-profile.component.html',
  styleUrl: './supervisor-profile.component.css'
})
export class SupervisorProfileComponent {
  studentProfile: any[] = [];
  userId = this.service.getCurrentUserId();
  avatarUrl?: SafeUrl;

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
  }


  ngOnInit(): void {
    this.loadInfo();
    this.loadAvatar();
  }


  file: any;


  onFileChange(event: any) {
    if (this.userId) {
      const files = event.target.files as FileList;

      if (files.length > 0) {
        this.file = files[0];


        if (this.file.size > 2097152) {
          Swal.fire({
            title: "Uh-oh...",
            text: "We only take photos under 2MB in file size, sorry about that.",
            icon: "warning"
          });
          this.resetInput();
          return;
        }

        console.log(this.file);
        this.service.uploadAvatar(this.userId, this.file).subscribe((data: any) => {
          console.log("File Uploaded Successfully");
          this.loadAvatar();
          this.resetInput();
        });
      }
    }
  }

  resetInput() {
    const input = document.getElementById('avatar-input-file') as HTMLInputElement;
    if (input) {
      input.value = "";
    }

  }


  loadAvatar() {
    console.log("Loading Avatar...");
    if (this.userId) {
      this.service.getAvatar(this.userId).subscribe(
        blob => {
          console.log("Loading Blob");
          console.log(`blob: ${blob}`);
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
            console.log(`this.avatarUrl: ${this.avatarUrl}`);
          } else {
            console.log("User has not uploaded an avatar yet.");
            this.avatarUrl = undefined;
          }
        },
        error => {
          if (error.status === 404) {
            console.log('No avatar found for the user.');
            this.avatarUrl = undefined;
          } else {
            console.error('Failed to load avatar:', error);
          }
        }
      );
    }
  }

  loadInfo() {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe(
        (data: any[]) => {
          console.log(data);
          this.studentProfile = data;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }

  editInfo(code: any) {
    const popup = this.dialog.open(EditinformationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      // height: "70%",
      data: {
        usercode: code
      }
    });
    popup.afterClosed().subscribe(res => {
      this.loadInfo()
    });
  }
}
