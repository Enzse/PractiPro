import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/**
 * Placeholder: sending feedback has no backend yet, so this page says so
 * instead of showing a form that silently does nothing.
 */
@Component({
  selector: 'app-feedback',
  imports: [PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Feedback" />
    <section class="card">
      <app-empty-state icon="chat-circle-text:duotone" title="Feedback isn’t available yet"
        description="Sending feedback through PractiPro is coming. Until then, please share your thoughts with your coordinator." />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackComponent {}
