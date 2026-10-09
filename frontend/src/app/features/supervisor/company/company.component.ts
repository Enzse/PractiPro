import { ChangeDetectionStrategy, Component, DestroyRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { CompanyService } from '../../../core/api/company.service';
import { MediaService } from '../../../core/api/media.service';
import { StudentService } from '../../../core/api/student.service';
import { Company } from '../../../core/models/company';
import { CompanyStudent } from '../../../core/models/student';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { SupervisorContextService } from '../supervisor-context.service';
import { EQUIPMENT, EditCompanyDialogComponent } from './edit-company-dialog.component';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** The supervisor's company, their own profile, and the students placed there. */
@Component({
  selector: 'app-company',
  imports: [PageHeaderComponent, IconComponent, EmptyStateComponent],
  templateUrl: './company.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent {
  protected readonly context = inject(SupervisorContextService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  private readonly studentApi = inject(StudentService);
  private readonly dialog = inject(MatDialog);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly company = signal<Company | null>(null);
  protected readonly students = signal<CompanyStudent[] | null>(null);
  protected readonly logo = signal<SafeUrl | null>(null);
  protected readonly avatar = signal<SafeUrl | null>(null);
  protected readonly uploading = signal<'logo' | 'avatar' | null>(null);
  private readonly objectUrls: string[] = [];

  /** it_equipment is stored as a JSON list of values. */
  protected readonly equipment = computed(() => {
    let values: string[] = [];
    try {
      values = JSON.parse(this.company()?.it_equipment ?? '[]');
    } catch {
      values = [];
    }
    return values.map((value) => EQUIPMENT.find((e) => e.value === value)?.label ?? value);
  });
  protected readonly equipmentValues = computed(() => {
    try {
      return JSON.parse(this.company()?.it_equipment ?? '[]') as string[];
    } catch {
      return [];
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.objectUrls.forEach((url) => URL.revokeObjectURL(url)));
    effect(() => {
      const companyId = this.context.profile()?.company_id;
      if (companyId) {
        this.loadCompany(companyId);
      }
    });
    this.loadImage(this.mediaApi.avatar(this.context.supervisorId), this.avatar);
  }

  protected edit(): void {
    const company = this.company();
    if (!company) {
      return;
    }
    this.dialog
      .open(EditCompanyDialogComponent, { data: { ...company, equipment: this.equipmentValues() }, panelClass: 'app-dialog', width: '640px' })
      .afterClosed()
      .subscribe((saved) => saved && this.loadCompany(company.id));
  }

  protected upload(kind: 'logo' | 'avatar', input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    const company = this.company();
    if (!file || (kind === 'logo' && !company)) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.toast.error('That isn’t an image', 'Choose a JPG, PNG or WebP picture.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.toast.error('That picture is too large', 'Pictures can be up to 2 MB.');
      return;
    }
    this.uploading.set(kind);
    const upload$ = kind === 'logo' ? this.mediaApi.uploadLogo(company!.id, file) : this.mediaApi.uploadAvatar(this.context.supervisorId, file);
    upload$.subscribe({
      next: () => {
        this.uploading.set(null);
        this.toast.success(kind === 'logo' ? 'Logo updated' : 'Profile photo updated');
        kind === 'logo'
          ? this.loadImage(this.mediaApi.logo(company!.id), this.logo)
          : this.loadImage(this.mediaApi.avatar(this.context.supervisorId), this.avatar);
      },
      error: () => {
        this.uploading.set(null);
        this.toast.error('Upload failed', 'Please try again.');
      },
    });
  }

  protected removeStudent(student: CompanyStudent): void {
    const company = this.company();
    if (!company) {
      return;
    }
    this.confirm
      .ask({
        title: `Remove ${student.firstName} ${student.lastName} from ${company.company_name}?`,
        message: 'They’ll no longer be placed at your company, and will need a new placement to continue their practicum.',
        confirmText: 'Remove student',
        tone: 'danger',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.companyApi.removeStudent(company.id, student.id).subscribe({
          next: () => {
            this.toast.info(`${student.firstName} was removed from your company`);
            this.loadCompany(company.id);
            this.context.refresh();
          },
          error: () => this.toast.error('Couldn’t remove the student', 'You may not have permission to do this.'),
        });
      });
  }

  protected initials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  private loadCompany(companyId: number): void {
    this.companyApi.get(companyId).subscribe((res) => this.company.set(res.payload[0] ?? null));
    this.studentApi.atCompany(companyId).subscribe({
      next: (res) => this.students.set(res.payload),
      error: () => this.students.set([]),
    });
    this.loadImage(this.mediaApi.logo(companyId), this.logo);
  }

  private loadImage(request: Observable<Blob>, target: WritableSignal<SafeUrl | null>): void {
    request.subscribe({
      next: (blob) => {
        if (blob.size === 0) {
          target.set(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        target.set(this.sanitizer.bypassSecurityTrustUrl(url));
      },
      error: () => target.set(null),
    });
  }
}
