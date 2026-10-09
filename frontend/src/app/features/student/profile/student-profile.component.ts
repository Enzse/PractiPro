import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StudentService } from '../../../core/api/student.service';
import { MediaService } from '../../../core/api/media.service';
import { Student } from '../../../core/models/student';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { EditProfileDialogComponent } from '../dialogs/edit-profile-dialog/edit-profile-dialog.component';
import { StudentStatusService } from '../student-status.service';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-student-profile',
  imports: [DatePipe, OrdinalPipe, PageHeaderComponent, IconComponent],
  templateUrl: './student-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toast = inject(ToastService);

  protected readonly student = signal<Student | null>(null);
  protected readonly avatarUrl = signal<SafeUrl | null>(null);
  protected readonly uploading = signal(false);
  private objectUrl: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.objectUrl && URL.revokeObjectURL(this.objectUrl));
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadAvatar();
  }

  protected initials(student: Student): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  }

  protected edit(): void {
    this.dialog
      .open(EditProfileDialogComponent, { panelClass: 'app-dialog', width: '640px' })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.loadProfile();
          this.status.refresh();
        }
      });
  }

  protected onAvatarPicked(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.toast.error('That isn’t an image', 'Choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      this.toast.error('That photo is too large', 'Photos can be up to 2 MB.');
      return;
    }
    this.uploading.set(true);
    this.mediaApi.uploadAvatar(this.status.studentId, file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.toast.success('Profile photo updated');
        this.loadAvatar();
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Couldn’t upload the photo', 'Please try again.');
      },
    });
  }

  private loadProfile(): void {
    this.studentApi.get(this.status.studentId).subscribe((res) => this.student.set(res.payload[0] ?? null));
  }

  private loadAvatar(): void {
    this.mediaApi.avatar(this.status.studentId).subscribe({
      next: (blob) => {
        if (this.objectUrl) {
          URL.revokeObjectURL(this.objectUrl);
          this.objectUrl = null;
        }
        if (blob.size > 0) {
          this.objectUrl = URL.createObjectURL(blob);
          this.avatarUrl.set(this.sanitizer.bypassSecurityTrustUrl(this.objectUrl));
        } else {
          this.avatarUrl.set(null);
        }
      },
      // 404: no photo uploaded yet.
      error: () => this.avatarUrl.set(null),
    });
  }
}
