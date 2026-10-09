import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../../core/api/company.service';
import { Schedule } from '../../../../core/models/company';
import { dateRangeValidator } from '../../../../shared/validators/date-range.validator';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';
import { SupervisorContextService } from '../../supervisor-context.service';
import { TraineeContextService } from '../trainee-context.service';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const OFF = '00:00:00';

interface DayRow {
  day: string;
  works: boolean;
  start: string;
  end: string;
}

/** The trainee's job and weekly work schedule, edited in place. */
@Component({
  selector: 'app-job-tab',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './job-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobTabComponent {
  private readonly trainee = inject(TraineeContextService);
  private readonly supervisor = inject(SupervisorContextService);
  private readonly companyApi = inject(CompanyService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly jobForm = inject(NonNullableFormBuilder).group(
    {
      job_title: ['', Validators.required],
      job_description: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
    },
    { validators: dateRangeValidator() },
  );
  protected readonly savingJob = signal(false);

  protected readonly days = signal<DayRow[]>(DAYS.map((day) => ({ day, works: false, start: '09:00', end: '17:00' })));
  protected readonly savingSchedule = signal(false);
  protected readonly hasSchedule = signal(false);

  constructor() {
    effect(() => {
      const id = this.trainee.studentId();
      this.companyApi.jobOf(id).subscribe((res) => {
        const job = res.payload[0];
        this.jobForm.reset(job ? { job_title: job.job_title, job_description: job.job_description, start_date: job.start_date, end_date: job.end_date } : {});
      });
      this.loadSchedule(id);
    });
  }

  protected invalid(name: keyof typeof this.jobForm.controls): boolean {
    const control = this.jobForm.controls[name];
    return control.invalid && control.touched;
  }

  protected saveJob(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }
    this.savingJob.set(true);
    this.companyApi.assignJob({ ...this.jobForm.getRawValue(), student_id: this.trainee.studentId(), supervisor_id: this.supervisor.supervisorId }).subscribe({
      next: () => {
        this.savingJob.set(false);
        this.jobForm.markAsPristine();
        this.toast.success('Job saved');
        this.trainee.changed();
      },
      error: () => {
        this.savingJob.set(false);
        this.toast.error('Couldn’t save the job', 'Please try again.');
      },
    });
  }

  protected toggleDay(row: DayRow): void {
    this.days.update((days) => days.map((d) => (d.day === row.day ? { ...d, works: !d.works } : d)));
  }

  protected setTime(row: DayRow, field: 'start' | 'end', value: string): void {
    this.days.update((days) => days.map((d) => (d.day === row.day ? { ...d, [field]: value } : d)));
  }

  protected saveSchedule(): void {
    const days = this.days();
    if (!days.some((d) => d.works)) {
      this.toast.warning('Choose at least one work day', 'Or clear the schedule if the trainee has none yet.');
      return;
    }
    if (days.some((d) => d.works && (!d.start || !d.end || d.end <= d.start))) {
      this.toast.warning('Check the times', 'Each work day needs an end time after its start time.');
      return;
    }
    const schedules: Schedule[] = days.map((d) => ({
      day_of_week: d.day,
      start_time: d.works ? `${d.start}:00` : OFF,
      end_time: d.works ? `${d.end}:00` : OFF,
      has_work: d.works ? 1 : 0,
    }));
    this.savingSchedule.set(true);
    this.companyApi.setSchedules(this.trainee.studentId(), schedules).subscribe({
      next: () => {
        this.savingSchedule.set(false);
        this.hasSchedule.set(true);
        this.toast.success('Schedule saved', 'The trainee sees it on their dashboard.');
      },
      error: () => {
        this.savingSchedule.set(false);
        this.toast.error('Couldn’t save the schedule', 'Please try again.');
      },
    });
  }

  protected clearSchedule(): void {
    this.confirm
      .ask({ title: 'Clear the schedule?', message: 'The trainee won’t have any work days listed until you set them again.', confirmText: 'Clear schedule', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.companyApi.clearSchedules(this.trainee.studentId()).subscribe({
          next: () => {
            this.toast.info('Schedule cleared');
            this.loadSchedule(this.trainee.studentId());
          },
          error: () => this.toast.error('Couldn’t clear the schedule', 'Please try again.'),
        });
      });
  }

  private loadSchedule(id: number): void {
    this.companyApi.schedulesOf(id).subscribe({
      next: (res) => {
        const saved = new Map(res.payload.map((s) => [s.day_of_week, s]));
        this.hasSchedule.set(res.payload.some((s) => !!Number(s.has_work)));
        this.days.set(
          DAYS.map((day) => {
            const s = saved.get(day);
            const works = !!s && !!Number(s.has_work) && s.start_time !== OFF;
            return { day, works, start: works ? s!.start_time.slice(0, 5) : '09:00', end: works ? s!.end_time.slice(0, 5) : '17:00' };
          }),
        );
      },
      error: () => this.hasSchedule.set(false),
    });
  }
}
