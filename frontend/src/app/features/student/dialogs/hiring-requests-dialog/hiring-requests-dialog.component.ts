import { Component, Inject, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { CompanyService } from '../../../../core/api/company.service';
import { MediaService } from '../../../../core/api/media.service';

@Component({
    selector: 'app-hiring-requests-dialog',
    imports: [CommonModule],
    templateUrl: './hiring-requests-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './hiring-requests-dialog.component.css'
})
export class HiringRequestsDialogComponent implements OnInit {
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  datalist: any[] = []
  private subscriptions = new Subscription();
  constructor(private changeDetection: DataRefreshService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<HiringRequestsDialogComponent>, private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.companyApi.hiringRequestsOf(this.data.student_id).subscribe((res) => {
        this.datalist = res.payload.map((user) => {
          return { ...user, avatar: '' };
        });
        this.subscriptions.add(
          this.datalist.forEach((company) => {
            this.mediaApi.logo(company.company_id).subscribe((res) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                company.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            })
          }));
      }))
  }

  JoinCompany(request: any) {

    Swal.fire({
      title: `Are you sure you want to work under '${request.company_name}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#253d75",
      cancelButtonColor: "#858c94",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.companyApi.addStudent(request).subscribe((res) => {
            this.changeDetection.notifyChange(true);
            Swal.fire("Success", "You have successfully joined the company", "success");
            this.subscriptions.add(
              this.companyApi.deleteHiringRequest(request.id).subscribe((res) => {
                this.dialog.close();
              }));
          }, error => {
            Swal.fire({ title: "Error", text: "You may not have permission to join this company", icon: "error" });
          }));
      }
    });
  }

  declineRequest(id: any) {
    Swal.fire({
      title: `Are you sure you want to decline this invitation?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#858c94",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.companyApi.deleteHiringRequest(id).subscribe((res) => {
            this.loadData();
          }));
      }
    });
  }


}
