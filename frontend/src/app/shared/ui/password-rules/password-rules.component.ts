import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** The password rules (the same ones the API enforces), ticked off as they're met. */
@Component({
  selector: 'app-password-rules',
  imports: [IconComponent],
  template: `
    <ul class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-live="polite">
      @for (rule of rules(); track rule.label) {
        <li class="flex items-center gap-1.5" [class]="rule.met ? 'text-emerald-700' : 'text-slate-500'">
          <app-icon [name]="rule.met ? 'check-circle' : 'minus'" [size]="14" />
          {{ rule.label }}
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordRulesComponent {
  readonly value = input('');

  protected readonly rules = computed(() => {
    const v = this.value();
    return [
      { label: 'At least 8 characters', met: v.length >= 8 },
      { label: 'An uppercase letter', met: /[A-Z]/.test(v) },
      { label: 'A lowercase letter', met: /[a-z]/.test(v) },
      { label: 'A number', met: /\d/.test(v) },
    ];
  });
}
