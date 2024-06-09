import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { EditinformationpopupComponent } from '../../popups/popups-student/editinformationpopup/editinformationpopup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-supervisor-profile',
  standalone: true,
  imports: [CommonModule, EditinformationpopupComponent, MatIconModule, DatePipe],
  templateUrl: './supervisor-profile.component.html',
  styleUrls: ['./supervisor-profile.component.css']
})
export class SupervisorProfileComponent implements OnInit, OnDestroy {
  company: any;
  userId: any;
  user: any;
  file: any;
  subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onAvatarChange(event: any) {
    this.handleFileChange(event, 'avatar');
  }

  onLogoChange(event: any) {
    this.handleFileChange(event, 'logo');
  }

  private handleFileChange(event: any, type: 'avatar' | 'logo') {
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
          this.resetInput(type);
          return;
        }

        const uploadObservable = type === 'avatar'
          ? this.authService.uploadAvatar(this.userId, this.file)
          : this.authService.uploadLogo(this.company.id, this.file);

        this.subscriptions.add(uploadObservable.subscribe((data: any) => {
          console.log("File Uploaded Successfully");
          this.loadData();
          this.resetInput(type);
        }));
      }
    }
  }
  private resetInput(type: 'avatar' | 'logo') {
    const inputId = type === 'avatar' ? 'avatar-input-file' : 'logo-input-file';
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  private loadData() {
    this.loadSupervisor();
  }

  private loadSupervisor() {
    this.subscriptions.add(
      this.authService.getSupervisors(this.userId).subscribe((res: any) => {
        this.user = res.payload[0];
        this.user.avatar = '';

        this.subscriptions.add(
          this.authService.getAvatar(this.user.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              this.user.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          })
        );

        this.loadCompany(this.user.company_id);
      })
    );
  }

  private loadCompany(companyId: any) {
    this.subscriptions.add(
      this.authService.getCompanies(companyId).subscribe((res: any) => {
        this.company = res.payload[0];
        this.company.logo = '';

        this.subscriptions.add(
          this.authService.getLogo(this.company.id).subscribe((logoRes: any) => {
            if (logoRes.size > 0) {
              const url = URL.createObjectURL(logoRes);
              this.company.logo = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          })
        );
      })
    );
  }

  editInfo(code: any) {
    const popup = this.dialog.open(EditinformationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
      }
    });

    this.subscriptions.add(
      popup.afterClosed().subscribe(() => {
        this.loadSupervisor();
      })
    );
  }
}
