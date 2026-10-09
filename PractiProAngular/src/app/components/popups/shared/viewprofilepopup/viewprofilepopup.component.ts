import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../../services/api/student.service';
import { CompanyService } from '../../../../services/api/company.service';
import { MediaService } from '../../../../services/api/media.service';

@Component({
    selector: 'app-viewprofilepopup',
    imports: [CommonModule],
    templateUrl: './viewprofilepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './viewprofilepopup.component.css'
})
export class ViewprofilepopupComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  studentProfile: any;
  avatarUrl?: SafeUrl;
  private subscriptions = new Subscription();
  companyView = false;
  company: any;

  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewprofilepopupComponent>, private sanitizer: DomSanitizer, private dialog2: MatDialog) { }

  ngOnInit(): void {
    this.loadInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInfo() {
    this.subscriptions.add(
      this.studentApi.ojtStatus(this.data.student_id).subscribe(
        (res: any) => {
          this.studentProfile = res.payload[0];
          this.studentProfile.avatar = '';
          this.mediaApi.avatar(this.studentProfile.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              this.studentProfile.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          });
          if (this.studentProfile.company_id) {
            this.loadCompany(this.studentProfile.company_id);
          }
        }));
  }

  private loadCompany(companyId: any) {
    this.subscriptions.add(
      this.companyApi.get(companyId).subscribe((res: any) => {
        this.company = res.payload[0];
        const itEquipmentArray: string[] = JSON.parse(res.payload[0].it_equipment);
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
