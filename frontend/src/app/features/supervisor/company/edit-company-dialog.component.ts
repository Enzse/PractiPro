import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyService } from '../../../core/api/company.service';
import { Company } from '../../../core/models/company';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Stored values (kept as they were) and how they read on screen. */
export const EQUIPMENT: { value: string; label: string }[] = [
  { value: 'desktop', label: 'Desktop computers' },
  { value: 'laptop', label: 'Laptops' },
  { value: 'ipad', label: 'iPads' },
  { value: 'tablet', label: 'Tablets' },
  { value: 'smartphone', label: 'Smartphones' },
  { value: 'server', label: 'Servers' },
  { value: 'router', label: 'Routers' },
  { value: 'printer', label: 'Printers' },
  { value: 'scanner', label: 'Scanners' },
  { value: 'virtual-machine', label: 'Virtual machines' },
  { value: 'cabling', label: 'Network cabling' },
  { value: 'other', label: 'Other' },
];

/** Edits the company's details. Closes with true when saved. */
@Component({
  selector: 'app-edit-company-dialog',
  imports: [ReactiveFormsModule, DialogShellComponent, IconComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <app-dialog-shell title="Edit company profile" [description]="data.company_name" icon="buildings">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="industry">Industry</label>
            <input id="industry" type="text" class="input" placeholder="e.g. Software development" formControlName="industry" />
          </div>
          <div>
            <label class="label" for="size">Number of employees</label>
            <input id="size" type="number" min="1" class="input" formControlName="company_size" />
          </div>
          <div>
            <label class="label" for="ceo">CEO or head</label>
            <input id="ceo" type="text" class="input" formControlName="company_ceo" />
          </div>
          <div>
            <label class="label" for="address">Address</label>
            <input id="address" type="text" class="input" formControlName="address" />
          </div>
          <div class="sm:col-span-2">
            <label class="label" for="scope">Scope of business</label>
            <textarea id="scope" rows="3" class="input" formControlName="scope_of_business"></textarea>
          </div>
          <fieldset class="sm:col-span-2">
            <legend class="label">IT equipment trainees will use</legend>
            <div class="flex flex-wrap gap-2">
              @for (item of equipment; track item.value) {
                <button type="button" class="chip" [class.chip-active]="selected().includes(item.value)"
                  [attr.aria-pressed]="selected().includes(item.value)" (click)="toggle(item.value)">
                  @if (selected().includes(item.value)) {
                    <app-icon name="check" [size]="12" />
                  }
                  {{ item.label }}
                </button>
              }
            </div>
          </fieldset>
        </div>

        <footer dialogFooter class="dialog-footer">
          <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) {
              <app-icon name="circle-notch" [size]="16" class="animate-spin" />
            }
            Save changes
          </button>
        </footer>
      </app-dialog-shell>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyDialogComponent {
  protected readonly data = inject<Company & { equipment: string[] }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<EditCompanyDialogComponent, boolean>>(MatDialogRef);
  private readonly companyApi = inject(CompanyService);
  private readonly toast = inject(ToastService);

  protected readonly equipment = EQUIPMENT;
  protected readonly selected = signal<string[]>(this.data.equipment ?? []);
  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    industry: [this.data.industry ?? ''],
    company_size: [this.data.company_size ?? 0, [Validators.min(0)]],
    company_ceo: [this.data.company_ceo ?? ''],
    address: [this.data.address ?? ''],
    scope_of_business: [this.data.scope_of_business ?? ''],
  });

  protected toggle(value: string): void {
    this.selected.update((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const values = this.form.getRawValue();
    this.companyApi.update({ id: this.data.id, ...values, company_size: Number(values.company_size), itEquipment: this.selected() }).subscribe({
      next: () => {
        this.toast.success('Company profile saved');
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Couldn’t save the company profile', 'Please try again.');
      },
    });
  }
}
