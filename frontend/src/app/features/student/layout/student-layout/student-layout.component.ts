import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, MenuLink, NavGroup } from '../../../../shared/layout/app-shell/app-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { REQUIRED_SEMINAR_HOURS, REQUIRED_TRAINING_HOURS, StudentStatusService } from '../../student-status.service';

/** The student area: navigation that unlocks step by step as the practicum progresses. */
@Component({
  selector: 'app-student-layout',
  imports: [AppShellComponent, RouterOutlet, IconComponent, DecimalPipe],
  templateUrl: './student-layout.component.html',
  // Tied to the layout: created when a student's area opens, discarded on sign-out.
  providers: [StudentStatusService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLayoutComponent {
  protected readonly status = inject(StudentStatusService);
  protected readonly requiredTraining = REQUIRED_TRAINING_HOURS;
  protected readonly requiredSeminar = REQUIRED_SEMINAR_HOURS;

  protected readonly menuLinks: MenuLink[] = [
    { label: 'Profile', icon: 'user-circle', link: '/student/profile' },
    { label: 'Change password', icon: 'key', link: '/reset-password' },
  ];

  protected readonly nav = computed<NavGroup[]>(() => {
    const s = this.status;
    // Until the status arrives nothing is locked; the route guards still apply.
    const known = s.loaded();
    const noClass = known && !s.hasClass() ? 'Join a class first.' : null;
    const notRegistered = noClass ?? (known && !s.isRegistered() ? 'Unlocks once all your requirements are approved.' : null);
    const notPlaced = notRegistered ?? (known && !s.isPlaced() ? 'Unlocks once a company takes you in.' : null);
    const fewHours = notPlaced ?? (known && s.trainingHours() < REQUIRED_TRAINING_HOURS
      ? `Unlocks at ${REQUIRED_TRAINING_HOURS} approved training hours.`
      : null);

    return [
      {
        items: [
          known && !s.hasClass()
            ? { label: 'Join a class', icon: 'users-three', link: '/student/join-classes' }
            : { label: 'Dashboard', icon: 'squares-four', link: '/student/dashboard' },
          { label: 'Profile', icon: 'user-circle', link: '/student/profile' },
        ],
      },
      {
        label: 'Before the practicum',
        items: [{ label: 'Requirements', icon: 'clipboard-text', link: '/student/requirements', locked: noClass }],
      },
      {
        label: 'During the practicum',
        items: [
          { label: 'Attendance', icon: 'clock', link: '/student/dtr', locked: notPlaced },
          { label: 'Weekly reports', icon: 'note-pencil', link: '/student/weekly-reports', locked: notPlaced },
          { label: 'Documentation', icon: 'notebook', link: '/student/documentation', locked: notPlaced },
          { label: 'Seminars', icon: 'chalkboard-teacher', link: '/student/seminars', locked: notPlaced },
        ],
      },
      {
        label: 'Wrapping up',
        items: [{ label: 'Final report', icon: 'seal-check', link: '/student/final-report', locked: fewHours }],
      },
    ];
  });
}
