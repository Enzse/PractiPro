import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Whether the sidebar is shown on small screens, where it slides in over the
 * page. (On wider screens it is always visible.) Shared by each role's navbar,
 * which has the toggle button, and sidebar.
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly open = signal(false);
  readonly isOpen = this.open.asReadonly();

  constructor() {
    // Close after following a link, so the new page isn't hidden behind it.
    inject(Router).events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.close());
  }

  toggle(): void {
    this.open.update((open) => !open);
  }

  close(): void {
    this.open.set(false);
  }
}
