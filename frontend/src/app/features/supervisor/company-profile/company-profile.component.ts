import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { EditCompanyProfileDialogComponent } from '../dialogs/edit-company-profile-dialog/edit-company-profile-dialog.component';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { SessionService } from '../../../core/auth/session.service';
import { CompanyService } from '../../../core/api/company.service';
import { MediaService } from '../../../core/api/media.service';
import { Supervisor } from '../../../core/models/company';
import { WithAvatar } from '../../../core/models/display';

@Component({
    selector: 'app-company-profile',
    imports: [CommonModule, MatIconModule],
    templateUrl: './company-profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  company: any;
  userId: number;
  user: WithAvatar<Supervisor> | undefined;
  file: any;
  subscriptions: Subscription = new Subscription();

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: DataRefreshService) {
    this.userId = this.session.requireUserId();
  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected && this.user?.company_id) {
          this.loadCompany(this.user.company_id);
        }
      })
    );
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
          ? this.mediaApi.uploadAvatar(this.userId, this.file)
          : this.mediaApi.uploadLogo(this.company.id, this.file);

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
      this.companyApi.supervisor(this.userId).subscribe((res) => {
        const supervisor: WithAvatar<Supervisor> = { ...res.payload[0], avatar: '' };
        this.user = supervisor;

        this.subscriptions.add(
          this.mediaApi.avatar(supervisor.id).subscribe((avatarRes) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              supervisor.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          })
        );

        if (supervisor.company_id) {
          this.loadCompany(supervisor.company_id);
        }
      })
    );
  }

  private loadCompany(companyId: any) {
    this.subscriptions.add(
      this.companyApi.get(companyId).subscribe((res) => {
        this.company = res.payload[0];
        const itEquipmentArray: string[] = JSON.parse(res.payload[0].it_equipment ?? '[]');
        this.company.it_equipment = itEquipmentArray
        this.company.logo = '';

        this.subscriptions.add(
          this.mediaApi.logo(this.company.id).subscribe((logoRes: any) => {
            if (logoRes.size > 0) {
              const url = URL.createObjectURL(logoRes);
              this.company.logo = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          })
        );
      })
    );

  }

  editCompanyProfile(company: any) {
    const popup = this.dialog.open(EditCompanyProfileDialogComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        company: company
      }
    });
  }
}
