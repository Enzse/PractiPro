import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-viewhiringrequests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewhiringrequests.component.html',
  styleUrl: './viewhiringrequests.component.css'
})
export class ViewhiringrequestsComponent implements OnInit {
  datalist: any[] = []
  private subscriptions = new Subscription();
  constructor(private changeDetection: ChangeDetectionService, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewhiringrequestsComponent>, private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getHiringRequests(this.data.student_id).subscribe((res: any) => {
        this.datalist = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });
        this.subscriptions.add(
          this.datalist.forEach((company: any) => {
            this.service.getLogo(company.company_id).subscribe((res: any) => {
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
          this.service.addStudentToCompany(request).subscribe((res: any) => {
            this.changeDetection.notifyChange(true);
            Swal.fire("Success", "You have successfully joined the company", "success");
            this.subscriptions.add(
              this.service.deleteHiringRequest(request.id).subscribe((res: any) => {
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
          this.service.deleteHiringRequest(id).subscribe((res: any) => {
            this.loadData();
          }));
      }
    });
  }


}
