import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { filter, map } from 'rxjs';
import { AppShellComponent, NavGroup } from '../../../../shared/layout/app-shell/app-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { CoordinatorClassesService } from '../../coordinator-classes.service';

/** The class in a coordinator URL: /coordinator/classes/<block>/... */
function blockIn(url: string): string | null {
  const match = url.match(/^\/coordinator\/classes\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** The coordinator area: a class switcher, and navigation for the chosen class. */
@Component({
  selector: 'app-coordinator-layout',
  imports: [AppShellComponent, RouterOutlet, RouterLink, MatMenuModule, IconComponent],
  templateUrl: './coordinator-layout.component.html',
  // Tied to the layout: loaded at sign-in, discarded at sign-out.
  providers: [CoordinatorClassesService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatorLayoutComponent {
  protected readonly classes = inject(CoordinatorClassesService);
  private readonly router = inject(Router);

  protected readonly block = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => blockIn(this.router.url)),
    ),
    { initialValue: blockIn(this.router.url) },
  );

  protected readonly nav = computed<NavGroup[]>(() => {
    const block = this.block();
    const groups: NavGroup[] = [{ items: [{ label: 'Your classes', icon: 'squares-four', link: '/coordinator/classes', exact: true }] }];
    if (block) {
      const base = `/coordinator/classes/${encodeURIComponent(block)}`;
      groups.push({
        label: block,
        items: [
          { label: 'Overview', icon: 'list-checks', link: `${base}/overview` },
          { label: 'Students', icon: 'users-three', link: `${base}/students` },
          { label: 'Enrollment', icon: 'envelope-simple', link: `${base}/enrollment` },
          { label: 'Analytics', icon: 'chart-bar', link: `${base}/analytics` },
        ],
      });
    }
    return groups;
  });

  protected switchTo(block: string): void {
    this.router.navigate(['/coordinator/classes', block, 'overview']);
  }
}
