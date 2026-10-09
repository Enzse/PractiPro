import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../../core/api/student.service';
import { CompanyService } from '../../../../core/api/company.service';
import { MediaService } from '../../../../core/api/media.service';
import { StudentOjtStatus } from '../../../../core/models/student';
import { WithAvatar } from '../../../../core/models/display';

@Component({
    selector: 'app-student-profile-dialog',
    imports: [CommonModule],
    templateUrl: './student-profile-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './student-profile-dialog.component.css'
})
export class StudentProfileDialogComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  studentProfile: WithAvatar<StudentOjtStatus> | undefined;
  avatarUrl?: SafeUrl;
  private subscriptions = new Subscription();
  companyView = false;
  company: any;

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<StudentProfileDialogComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }

  ngOnInit(): void {
    this.loadInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInfo() {
    this.subscriptions.add(
      this.studentApi.ojtStatus(this.data.student_id).subscribe((res) => {
          const profile: WithAvatar<StudentOjtStatus> = { ...res.payload[0], avatar: '' };
          this.studentProfile = profile;
          this.mediaApi.avatar(profile.id).subscribe((avatarRes) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              profile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          });
          if (profile.company_id) {
            this.loadCompany(profile.company_id);
          }
        }));
  }

  private loadCompany(companyId: any) {
    this.subscriptions.add(
      this.companyApi.get(companyId).subscribe((res) => {
        this.company = res.payload[0];
        const itEquipmentArray: string[] = JSON.parse(res.payload[0].it_equipment ?? '[]');
        this.company.it_equipment = itEquipmentArray

        // this.company.logo = '';
        // this.subscriptions.add(
        //   this.mediaApi.logo(this.company.id).subscribe((logoRes: any) => {
        //     if (logoRes.size > 0) {
        //       const url = URL.createObjectURL(logoRes);
        //       this.company.logo = this.sanitizer.bypassSecurityTrustUrl(url);
        //     }
        //   })
        // );
      })
    );
  }

  closePopup() {
    this.dialog.close();
  }

  toggleCompanyView() {
    this.companyView = !this.companyView
  }

}
