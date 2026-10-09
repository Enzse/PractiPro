import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/api/auth.service';
import { Registration, Role } from '../../../core/models/user';
import { emailDomainValidator } from '../../../shared/validators/email-domain.validator';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PasswordRulesComponent } from '../../../shared/ui/password-rules/password-rules.component';
import { AuthShellComponent } from '../auth-shell.component';
import { SupervisorNoticeDialogComponent, TermsDialogComponent } from './legal-dialogs.component';

type SignUpRole = 'student' | 'coordinator' | 'supervisor';

const SCHOOL_DOMAIN = 'gordoncollege.edu.ph';
const PROGRAMS = ['BSCS', 'BSEMC', 'BSIT'];
const DEPARTMENTS = ['CCS', 'CEAS', 'CHTM', 'CAHS', 'CBA'];
const TITLES: Record<SignUpRole, string> = {
  student: 'Sign up as a student',
  coordinator: 'Sign up as a coordinator',
  supervisor: 'Sign up as a company supervisor',
};
/** The API's name for each role. */
const API_ROLE: Record<SignUpRole, Role> = { student: 'student', coordinator: 'advisor', supervisor: 'supervisor' };

/** Sign-up for students, coordinators and supervisors (/register/:role). */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, PasswordRulesComponent, AuthShellComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authApi = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly role: SignUpRole;
  protected readonly title: string;
  protected readonly programs = PROGRAMS;
  protected readonly departments = DEPARTMENTS;
  protected readonly schoolDomain = SCHOOL_DOMAIN;

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sentTo = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    terms: [false, Validators.requiredTrue],
    // Students
    studentId: new FormControl('', { nonNullable: true }),
    program: new FormControl('', { nonNullable: true }),
    year: new FormControl('', { nonNullable: true }),
    // Coordinators
    department: new FormControl('', { nonNullable: true }),
    // Supervisors
    company_name: new FormControl('', { nonNullable: true }),
    position: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
  });
  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly needsApproval: boolean;

  constructor() {
    const param = inject(ActivatedRoute).snapshot.paramMap.get('role');
    const known = param === 'student' || param === 'coordinator' || param === 'supervisor';
    if (!known) {
      this.router.navigate(['/register']);
    }
    this.role = known ? param : 'student';
    this.title = TITLES[this.role];
    this.needsApproval = this.role !== 'student';
    this.requireFieldsForRole();
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected openTerms(event: Event): void {
    event.preventDefault();
    this.dialog.open(TermsDialogComponent, { panelClass: 'app-dialog', width: '680px' });
  }

  protected openNotice(event: Event): void {
    event.preventDefault();
    this.dialog.open(SupervisorNoticeDialogComponent, { panelClass: 'app-dialog', width: '640px' });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const registration: Registration = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      password: v.password,
      role: API_ROLE[this.role],
      ...(this.role === 'student' && { studentId: v.studentId, program: v.program, year: v.year }),
      ...(this.role === 'coordinator' && { department: v.department }),
      ...(this.role === 'supervisor' && { company_name: v.company_name, position: v.position, phone: v.phone, address: v.address }),
    };
    this.authApi.register(registration).subscribe({
      next: () => {
        this.busy.set(false);
        this.sentTo.set(registration.email);
      },
      error: (error) => {
        this.busy.set(false);
        // The API explains what went wrong (email or student ID taken, weak password, ...).
        this.error.set(error.error?.status?.message ?? 'We couldn’t create your account right now. Please try again.');
      },
    });
  }

  /** Each role has its own required fields; students and coordinators use a school email. */
  private requireFieldsForRole(): void {
    const c = this.form.controls;
    const require = (...controls: FormControl<string>[]) => controls.forEach((control) => control.addValidators(Validators.required));
    if (this.role === 'student') {
      require(c.program, c.year);
      c.studentId.addValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
    } else if (this.role === 'coordinator') {
      require(c.department);
    } else {
      require(c.company_name, c.position, c.phone, c.address);
    }
    if (this.role !== 'supervisor') {
      c.email.addValidators(emailDomainValidator(SCHOOL_DOMAIN));
    }
  }
}
