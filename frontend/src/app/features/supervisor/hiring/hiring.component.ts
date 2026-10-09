import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/api/company.service';
import { StudentService } from '../../../core/api/student.service';
import { StudentLookup } from '../../../core/models/student';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SupervisorContextService } from '../supervisor-context.service';

/** Inviting a student to do their practicum at the supervisor's company. */
@Component({
  selector: 'app-hiring',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, IconComponent],
  template: `
    <app-page-header title="Hiring"
      description="Invite a student to do their practicum at your company. They accept the invitation from their dashboard." />

    <div class="grid gap-6 lg:grid-cols-5">
      <section class="card card-pad lg:col-span-3">
        <h2 class="section-title">Find a student</h2>
        <p class="mt-1 text-sm text-slate-500">Ask the student for their school-issued student ID.</p>

        <form class="mt-4 flex gap-2" [formGroup]="form" (ngSubmit)="search()" novalidate>
          <label class="sr-only" for="student-number">Student ID</label>
          <input id="student-number" type="text" inputmode="numeric" class="input flex-1" placeholder="e.g. 202211557" formControlName="studentId" />
          <button type="submit" class="btn btn-primary" [disabled]="searching()">
            <app-icon [name]="searching() ? 'circle-notch' : 'magnifying-glass'" [size]="16" [class.animate-spin]="searching()" /> Find
          </button>
        </form>
        @if (form.controls.studentId.invalid && form.controls.studentId.touched) {
          <p class="field-error">Enter the student’s ID number.</p>
        }

        @if (notFound()) {
          <p class="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No registered student has that ID. Check the number, or ask the student to sign up for PractiPro first.
          </p>
        }

        @if (found(); as s) {
          <div class="mt-5 rounded-xl p-4 ring-1 ring-slate-200">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {{ s.firstName.charAt(0) }}{{ s.lastName.charAt(0) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-900">{{ s.firstName }} {{ s.lastName }}</p>
                <p class="text-sm text-slate-500">{{ s.program || 'No program' }}@if (s.year) { · year {{ s.year }} } · {{ s.block || 'Not in a class' }}</p>
                @if (s.registration_status !== 1 && !s.company_id) {
                  <p class="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                    <app-icon name="warning-circle" [size]="14" /> Their requirements aren’t all approved yet. You can still invite them.
                  </p>
                }
              </div>
            </div>
            <div class="mt-4 flex justify-end border-t border-slate-100 pt-4">
              @if (s.company_id && s.company_id === context.profile()?.company_id) {
                <span class="badge badge-success">Already at your company</span>
              } @else if (s.company_id) {
                <span class="text-sm text-slate-500">Already placed at {{ s.company_name }}</span>
              } @else if (alreadyInvited()) {
                <span class="badge badge-brand"><app-icon name="check" [size]="12" /> Invitation sent</span>
              } @else {
                <button type="button" class="btn btn-primary" [disabled]="sending()" (click)="invite(s)">
                  <app-icon [name]="sending() ? 'circle-notch' : 'paper-plane-tilt'" [size]="16" [class.animate-spin]="sending()" /> Send invitation
                </button>
              }
            </div>
          </div>
        }
      </section>

      <section class="card card-pad self-start lg:col-span-2">
        <h2 class="section-title">How hiring works</h2>
        <ol class="mt-4 space-y-4">
          @for (step of steps; track step; let i = $index) {
            <li class="flex gap-3">
              <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{{ i + 1 }}</span>
              <p class="text-sm text-slate-600">{{ step }}</p>
            </li>
          }
        </ol>
        <a routerLink="/supervisor/trainees" class="link mt-5 inline-flex items-center gap-1 text-sm">Go to your trainees <app-icon name="arrow-right" [size]="14" /></a>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringComponent {
  protected readonly context = inject(SupervisorContextService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly toast = inject(ToastService);

  protected readonly steps = [
    'Find the student by their student ID and send an invitation.',
    'The student accepts it from their PractiPro dashboard, which places them at your company.',
    'Add them to your trainees, then set their job and weekly schedule.',
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    studentId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });
  protected readonly searching = signal(false);
  protected readonly sending = signal(false);
  protected readonly found = signal<StudentLookup | null>(null);
  protected readonly notFound = signal(false);
  protected readonly alreadyInvited = signal(false);

  protected search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.searching.set(true);
    this.found.set(null);
    this.notFound.set(false);
    this.alreadyInvited.set(false);
    this.studentApi.byStudentNumber(this.form.getRawValue().studentId).subscribe({
      next: (res) => {
        this.searching.set(false);
        const student = res.payload[0] ?? null;
        this.found.set(student);
        this.notFound.set(!student);
        const companyId = this.context.profile()?.company_id;
        if (student && companyId) {
          this.companyApi
            .assignmentCount('company_hiring_requests', 'company_id', 'student_id', companyId, student.id)
            .subscribe((count) => this.alreadyInvited.set(Number(count.payload[0]?.assignment_count ?? 0) > 0));
        }
      },
      error: () => {
        this.searching.set(false);
        this.notFound.set(true);
      },
    });
  }

  protected invite(student: StudentLookup): void {
    const companyId = this.context.profile()?.company_id;
    if (!companyId) {
      this.toast.error('Your account isn’t linked to a company', 'Ask an administrator to link it.');
      return;
    }
    this.sending.set(true);
    this.companyApi.sendHiringRequest({ company_id: companyId, student_id: student.id, supervisor_id: this.context.supervisorId }).subscribe({
      next: () => {
        this.sending.set(false);
        this.alreadyInvited.set(true);
        this.toast.success(`Invitation sent to ${student.firstName}`, 'They’ll see it on their dashboard.');
      },
      error: () => {
        this.sending.set(false);
        this.toast.error('Couldn’t send the invitation', 'Please try again.');
      },
    });
  }
}
