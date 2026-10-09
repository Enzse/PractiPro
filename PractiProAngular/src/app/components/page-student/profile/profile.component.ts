import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditinformationpopupComponent } from '../../popups/popups-student/editinformationpopup/editinformationpopup.component';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { OrdinalPipe } from '../../../pipes/ordinal.pipe';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { MediaService } from '../../../services/api/media.service';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, MatIconModule, DatePipe, OrdinalPipe],
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);
  studentProfile: any[] = [];
  userId = this.session.userId();
  avatarUrl?: SafeUrl;

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.session.userId();    
  }


  ngOnInit(): void {
    this.loadInfo();
    this.loadAvatar();
    console.log(this.avatarUrl);
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
        this.mediaApi.uploadAvatar(this.userId, this.file).subscribe((data: any) => {
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
      this.mediaApi.avatar(this.userId).subscribe(
        blob => {          
          if (blob.size > 0) { 
            const url = URL.createObjectURL(blob);
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
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
      this.studentApi.get(this.userId).subscribe(
        (res: any) => {
          this.studentProfile = res.payload;
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
