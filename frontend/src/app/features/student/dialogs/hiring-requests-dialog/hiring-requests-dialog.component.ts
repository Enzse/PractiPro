import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { CompanyService } from '../../../../core/api/company.service';
import { MediaService } from '../../../../core/api/media.service';
import { HiringRequest } from '../../../../core/models/company';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { DialogShellComponent } from '../../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';

type Invitation = HiringRequest & { logo: SafeUrl | null };

/** Invitations from companies; accepting one places the student there. */
@Component({
  selector: 'app-hiring-requests-dialog',
  imports: [DatePipe, DialogShellComponent, IconComponent, EmptyStateComponent],
  templateUrl: './hiring-requests-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringRequestsDialogComponent implements OnInit {
  private readonly data = inject<{ student_id: number }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<HiringRequestsDialogComponent>);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly refresh = inject(DataRefreshService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly invitations = signal<Invitation[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  private readonly objectUrls: string[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.objectUrls.forEach((url) => URL.revokeObjectURL(url)));
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.companyApi.hiringRequestsOf(this.data.student_id).subscribe({
      next: (res) => {
        this.invitations.set(res.payload.map((request) => ({ ...request, logo: null })));
        this.loading.set(false);
        for (const request of res.payload) {
          this.mediaApi.logo(request.company_id).subscribe({
            next: (blob) => {
              if (blob.size === 0) {
                return;
              }
              const url = URL.createObjectURL(blob);
              this.objectUrls.push(url);
              const logo = this.sanitizer.bypassSecurityTrustUrl(url);
              this.invitations.update((list) => list.map((item) => (item.id === request.id ? { ...item, logo } : item)));
            },
            error: () => undefined,
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  protected accept(invitation: Invitation): void {
    this.confirm
      .ask({
        title: `Do your practicum at ${invitation.company_name}?`,
        message: 'You’ll be placed with this company, and its supervisor will see your attendance and reports.',
        confirmText: 'Accept invitation',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.busyId.set(invitation.id);
        const { company_id, student_id, supervisor_id } = invitation;
        this.companyApi
          .addStudent({ company_id, student_id, supervisor_id })
          .pipe(switchMap(() => this.companyApi.deleteHiringRequest(invitation.id)))
          .subscribe({
            next: () => {
              this.refresh.notifyChange(true);
              this.toast.success(`You’re now with ${invitation.company_name}`, 'Your practicum pages are open. Good luck!');
              this.dialogRef.close(true);
            },
            error: () => {
              this.busyId.set(null);
              this.toast.error('Couldn’t accept the invitation', 'Please try again.');
            },
          });
      });
  }

  protected decline(invitation: Invitation): void {
    this.confirm
      .ask({ title: `Decline ${invitation.company_name}’s invitation?`, confirmText: 'Decline', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.busyId.set(invitation.id);
        this.companyApi.deleteHiringRequest(invitation.id).subscribe({
          next: () => {
            this.busyId.set(null);
            this.toast.info('Invitation declined');
            this.load();
          },
          error: () => {
            this.busyId.set(null);
            this.toast.error('Couldn’t decline the invitation', 'Please try again.');
          },
        });
      });
  }
}
