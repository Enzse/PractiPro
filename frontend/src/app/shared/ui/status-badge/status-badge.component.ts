import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Full class names (not built from parts), so Tailwind keeps them in the stylesheet.
const STATUSES: Record<string, { label: string; badge: string }> = {
  Approved: { label: 'Approved', badge: 'badge-success' },
  Pending: { label: 'Pending', badge: 'badge-warning' },
  Unapproved: { label: 'Not approved', badge: 'badge-danger' },
};

/**
 * An approval status (Approved / Pending / Unapproved) as a coloured label.
 * `emptyLabel` is shown when there is no status yet.
 */
@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [class]="view().badge">
      <span class="h-1.5 w-1.5 rounded-full bg-current opacity-80"></span>
      {{ view().label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input<string | null | undefined>();
  readonly emptyLabel = input('Not submitted');

  protected readonly view = computed(() => {
    const status = this.status();
    if (!status) {
      return { label: this.emptyLabel(), badge: 'badge-neutral' };
    }
    return STATUSES[status] ?? { label: status, badge: 'badge-neutral' };
  });
}
