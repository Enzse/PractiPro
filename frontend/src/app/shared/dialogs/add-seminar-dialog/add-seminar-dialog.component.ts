import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, of, switchMap } from 'rxjs';
import { SeminarService } from '../../../core/api/seminar.service';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { DialogShellComponent } from '../../ui/dialog-shell/dialog-shell.component';
import { FileDropComponent } from '../../ui/file-drop/file-drop.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { ToastService } from '../../ui/toast/toast.service';

/** Records a seminar or webinar a student attended, with an optional certificate. Closes with true when saved. */
@Component({
  selector: 'app-add-seminar-dialog',
  imports: [ReactiveFormsModule, DialogShellComponent, FileDropComponent, IconComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <app-dialog-shell title="Add a seminar" description="Your coordinator approves it before the hours count." icon="chalkboard-teacher">
        <div class="space-y-4">
          <div>
            <label class="label" for="event-name">Event name</label>
            <input id="event-name" type="text" class="input" placeholder="e.g. Intro to Cloud Security" formControlName="event_name" />
            @if (invalid('event_name')) {
              <p class="field-error">Enter the name of the event.</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="event-date">Date</label>
              <input id="event-date" type="date" class="input" [max]="today" formControlName="event_date" />
              @if (invalid('event_date')) {
                <p class="field-error">Choose the date it took place.</p>
              }
            </div>
            <div>
              <label class="label" for="duration">Duration (hours)</label>
              <input id="duration" type="number" min="0.5" step="0.5" class="input" placeholder="e.g. 3" formControlName="duration" />
              @if (invalid('duration')) {
                <p class="field-error">Enter how many hours it lasted.</p>
              }
            </div>
          </div>

          <div>
            <p class="label">Type</p>
            <div class="segmented" role="radiogroup" aria-label="Type">
              <label><input type="radio" class="sr-only" value="Seminar" formControlName="event_type" />Seminar</label>
              <label><input type="radio" class="sr-only" value="Webinar" formControlName="event_type" />Webinar</label>
            </div>
            @if (invalid('event_type')) {
              <p class="field-error">Choose whether it was a seminar or a webinar.</p>
            }
          </div>

          <div>
            <p class="label">Certificate <span class="font-normal text-slate-400">(optional)</span></p>
            <app-file-drop [(file)]="certificate" [compact]="true" hint="PDF, up to 25 MB. You can add it later." />
          </div>
        </div>

        <footer dialogFooter class="dialog-footer">
          <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) {
              <app-icon name="circle-notch" [size]="16" class="animate-spin" />
            }
            Add seminar
          </button>
        </footer>
      </app-dialog-shell>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSeminarDialogComponent {
  private readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<AddSeminarDialogComponent, boolean>>(MatDialogRef);
  private readonly seminarApi = inject(SeminarService);
  private readonly refresh = inject(DataRefreshService);
  private readonly toast = inject(ToastService);

  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly certificate = signal<File | null>(null);
  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    event_name: ['', Validators.required],
    event_date: ['', Validators.required],
    event_type: ['', Validators.required],
    duration: ['', [Validators.required, Validators.min(0.5)]],
  });

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const certificate = this.certificate();
    this.seminarApi
      .create(this.data.id, this.form.getRawValue())
      .pipe(
        switchMap((res) =>
          certificate ? this.seminarApi.uploadCertificate(res.payload.record_id, certificate).pipe(map(() => true)) : of(false),
        ),
      )
      .subscribe({
        next: (withCertificate) => {
          this.refresh.notifyChange(true);
          this.toast.success('Seminar added', withCertificate ? 'Certificate attached. Your coordinator will review it.' : 'Your coordinator will review it.');
          this.dialogRef.close(true);
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Couldn’t add the seminar', 'Please try again.');
        },
      });
  }
}
