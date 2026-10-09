import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

type State = 'joining' | 'joined' | 'already-in-class' | 'expired' | 'invalid';

/** Where a coordinator's shareable join link leads: joins the signed-in student to the class. */
@Component({
  selector: 'app-join-class-by-link',
  imports: [RouterLink, IconComponent],
  template: `
    <main class="flex min-h-dvh items-center justify-center bg-canvas px-4 py-12">
      <div class="w-full max-w-md animate-fade-up">
        <div class="mb-6 flex items-center justify-center gap-2.5">
          <img src="assets/logo.png" alt="" class="h-9 w-9 rounded-full" />
          <span class="font-display text-lg font-semibold tracking-[-0.01em] text-slate-900">PractiPro</span>
        </div>

        <section class="card p-8 text-center">
          @switch (state()) {
            @case ('joining') {
              <app-icon name="circle-notch" [size]="36" class="mx-auto animate-spin text-brand-600" />
              <h1 class="mt-5 font-display text-xl font-semibold">Joining the class…</h1>
              <p class="mt-1 text-sm text-slate-500">This only takes a moment.</p>
            }
            @case ('joined') {
              <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <app-icon name="check-circle" [size]="30" />
              </span>
              <h1 class="mt-5 font-display text-2xl font-semibold tracking-[-0.02em]">You joined {{ block() }}</h1>
              <p class="mt-2 text-sm text-slate-500">Next, upload your requirements so your coordinator can clear you for the practicum.</p>
              <a routerLink="/student/requirements" class="btn btn-primary mt-6 w-full">Upload requirements</a>
              <a routerLink="/student/dashboard" class="btn btn-ghost mt-2 w-full">Go to dashboard</a>
            }
            @case ('already-in-class') {
              <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <app-icon name="users-three" [size]="30" />
              </span>
              <h1 class="mt-5 font-display text-2xl font-semibold tracking-[-0.02em]">You’re already in a class</h1>
              <p class="mt-2 text-sm text-slate-500">You’re in {{ block() }}. A student can only be in one class.</p>
              <a routerLink="/student/dashboard" class="btn btn-primary mt-6 w-full">Go to dashboard</a>
            }
            @default {
              <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <app-icon name="link-break:duotone" [size]="30" />
              </span>
              <h1 class="mt-5 font-display text-2xl font-semibold tracking-[-0.02em]">
                {{ state() === 'expired' ? 'This link has expired' : 'This link doesn’t work' }}
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                {{ state() === 'expired' ? 'Join links only last 30 minutes.' : 'It may have been mistyped or replaced.' }}
                Ask your coordinator for a new one.
              </p>
              <a routerLink="/student/join-classes" class="btn btn-primary mt-6 w-full">Find your class another way</a>
            }
          }
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinClassByLinkComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly classJoinApi = inject(ClassJoinService);
  private readonly token: string = inject(ActivatedRoute).snapshot.queryParams['token'] ?? '';

  protected readonly state = signal<State>('joining');
  protected readonly block = signal('');

  ngOnInit(): void {
    const studentId = this.session.requireUserId();
    this.studentApi.get(studentId).subscribe((res) => {
      const student = res.payload[0];
      if (student?.block) {
        this.block.set(student.block);
        this.state.set('already-in-class');
        return;
      }
      if (!this.token) {
        this.state.set('invalid');
        return;
      }
      this.classJoinApi
        .checkLink(this.token)
        .pipe(
          switchMap((link) => {
            this.block.set(link.payload.class);
            // The token proves the student was given the link.
            return this.studentApi.joinClass(studentId, { block_name: link.payload.class, token: this.token });
          }),
        )
        .subscribe({
          next: () => this.state.set('joined'),
          error: (error) => this.state.set(error.status === 401 ? 'expired' : 'invalid'),
        });
    });
  }
}
