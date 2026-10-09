import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClassService } from '../../../core/api/class.service';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Creates a class (block). Closes with true when created. */
@Component({
  selector: 'app-new-class-dialog',
  imports: [ReactiveFormsModule, DialogShellComponent, IconComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="create()" novalidate>
      <app-dialog-shell title="New class" description="Students in this program and year will be able to find and join it." icon="users-three">
        <div class="space-y-4">
          <div>
            <label class="label" for="block">Class name</label>
            <input id="block" type="text" class="input" placeholder="e.g. BSCS3-A" formControlName="block_name" />
            @if (form.controls.block_name.invalid && form.controls.block_name.touched) {
              <p class="field-error">Give the class a name.</p>
            }
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label" for="course">Program</label>
              <select id="course" class="input" formControlName="course">
                <option value="" disabled>Choose</option>
                @for (program of programs; track program) {
                  <option [value]="program">{{ program }}</option>
                }
              </select>
            </div>
            <div>
              <label class="label" for="year">Year level</label>
              <select id="year" class="input" formControlName="year_level">
                <option value="" disabled>Choose</option>
                @for (year of [1, 2, 3, 4]; track year) {
                  <option [value]="'' + year">Year {{ year }}</option>
                }
              </select>
            </div>
          </div>
          @if ((form.controls.course.invalid && form.controls.course.touched) || (form.controls.year_level.invalid && form.controls.year_level.touched)) {
            <p class="field-error">Choose the program and year level.</p>
          }
        </div>

        <footer dialogFooter class="dialog-footer">
          <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) {
              <app-icon name="circle-notch" [size]="16" class="animate-spin" />
            }
            Create class
          </button>
        </footer>
      </app-dialog-shell>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewClassDialogComponent {
  protected readonly dialogRef = inject<MatDialogRef<NewClassDialogComponent, boolean>>(MatDialogRef);
  private readonly classApi = inject(ClassService);
  private readonly toast = inject(ToastService);

  protected readonly programs = ['BSCS', 'BSEMC', 'BSIT'];
  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    block_name: ['', Validators.required],
    course: ['', Validators.required],
    year_level: ['', Validators.required],
  });

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.classApi.create({ ...value, block_name: value.block_name.trim().toUpperCase() }).subscribe({
      next: () => {
        this.toast.success(`Class ${value.block_name.trim().toUpperCase()} created`);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error('Couldn’t create the class', error.status === 409 ? 'A class with that name already exists.' : 'Please try again.');
      },
    });
  }
}
