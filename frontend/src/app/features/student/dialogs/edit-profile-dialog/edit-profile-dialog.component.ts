import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionService } from '../../../../core/auth/session.service';
import { StudentService } from '../../../../core/api/student.service';
import { DialogShellComponent } from '../../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

/** Edits the signed-in student's profile. Closes with true when saved. */
@Component({
  selector: 'app-edit-profile-dialog',
  imports: [ReactiveFormsModule, DialogShellComponent, IconComponent],
  templateUrl: './edit-profile-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileDialogComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject<MatDialogRef<EditProfileDialogComponent, boolean>>(MatDialogRef);

  protected readonly programs = ['BSCS', 'BSEMC', 'BSIT'];
  protected readonly years = [1, 2, 3, 4];
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    studentId: ['', [Validators.pattern(/^\d{9}$/)]],
    program: [''],
    year: [''],
    phoneNumber: ['', [Validators.pattern(/^\d{11}$/)]],
    address: [''],
    dateOfBirth: [''],
  });

  ngOnInit(): void {
    this.studentApi.get(this.session.requireUserId()).subscribe((res) => {
      const student = res.payload[0];
      this.form.setValue({
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: String(student.studentId ?? ''),
        program: student.program ?? '',
        year: String(student.year ?? ''),
        phoneNumber: student.phoneNumber ?? '',
        address: student.address ?? '',
        dateOfBirth: student.dateOfBirth ?? '',
      });
    });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.studentApi.update(this.session.requireUserId(), this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Profile updated');
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Couldn’t save your profile', 'Please try again.');
      },
    });
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
