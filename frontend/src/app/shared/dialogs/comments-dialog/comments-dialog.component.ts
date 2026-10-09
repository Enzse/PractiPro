import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../../core/auth/session.service';
import { CommentService } from '../../../core/api/comment.service';
import { Comment, CommentTable } from '../../../core/models/records';
import { DialogShellComponent } from '../../ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { ToastService } from '../../ui/toast/toast.service';

export interface CommentsDialogData {
  submissionID: number;
  fileName: string;
  table: CommentTable;
}

/** The conversation about one submission, oldest first, with a reply box. */
@Component({
  selector: 'app-comments-dialog',
  imports: [DatePipe, ReactiveFormsModule, DialogShellComponent, IconComponent, EmptyStateComponent],
  template: `
    <app-dialog-shell title="Comments" [description]="data.fileName" icon="chat-circle-text">
      <div #thread class="-mx-1 max-h-[50vh] min-h-[10rem] overflow-y-auto px-1">
        @if (comments() === null) {
          <div class="space-y-3">
            <div class="skeleton h-16 w-3/4 rounded-xl"></div>
            <div class="skeleton ml-auto h-12 w-2/3 rounded-xl"></div>
          </div>
        } @else if (comments()!.length === 0) {
          <app-empty-state icon="chat-circle-text:duotone" title="No comments yet" description="Start the conversation about this submission." [compact]="true" />
        } @else {
          <ol class="space-y-4">
            @for (comment of comments(); track comment.id) {
              @let mine = comment.commenter === myName;
              <li class="flex gap-3" [class.flex-row-reverse]="mine">
                <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  [class]="mine ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-600'">{{ initials(comment.commenter) }}</span>
                <div class="max-w-[80%]" [class.text-right]="mine">
                  <p class="mb-1 text-xs text-slate-500">
                    <span class="font-medium text-slate-700">{{ mine ? 'You' : comment.commenter }}</span>
                    · {{ comment.created_at | date: 'MMM d, h:mm a' }}
                  </p>
                  <p class="inline-block whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6"
                    [class]="mine ? 'rounded-tr-md bg-brand-800 text-white' : 'rounded-tl-md bg-slate-100 text-slate-800'">{{ comment.comments }}</p>
                </div>
              </li>
            }
          </ol>
        }
      </div>

      <form dialogFooter class="border-t border-slate-100 bg-slate-50/70 px-6 py-4" [formGroup]="form" (ngSubmit)="send()">
        <label for="new-comment" class="sr-only">Write a comment</label>
        <div class="flex items-end gap-2">
          <textarea id="new-comment" rows="2" class="input min-h-[2.75rem] flex-1 resize-none" placeholder="Write a comment…"
            formControlName="comments" (keydown.control.enter)="send()" (keydown.meta.enter)="send()"></textarea>
          <button type="submit" class="btn btn-primary h-11 w-11 shrink-0 px-0" [disabled]="sending() || form.invalid">
            <app-icon [name]="sending() ? 'circle-notch' : 'paper-plane-tilt'" [size]="18" [class.animate-spin]="sending()" label="Send" />
          </button>
        </div>
        <p class="mt-1.5 text-[11px] text-slate-400">Ctrl + Enter to send</p>
      </form>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsDialogComponent implements OnInit {
  protected readonly data = inject<CommentsDialogData>(MAT_DIALOG_DATA);
  private readonly commentApi = inject(CommentService);
  private readonly toast = inject(ToastService);
  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');

  protected readonly myName = (() => {
    const name = inject(SessionService).userName();
    return name ? `${name.firstName} ${name.lastName}` : '';
  })();
  protected readonly comments = signal<Comment[] | null>(null);
  protected readonly sending = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    comments: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  ngOnInit(): void {
    this.load();
  }

  /** First and last initial: "Dionne Maerkz Perez" -> "DP". */
  protected initials(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
    return letters.map((part) => part.charAt(0).toUpperCase()).join('');
  }

  protected send(): void {
    if (this.form.invalid || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.commentApi.add(this.data.table, this.data.submissionID, { comments: this.form.getRawValue().comments.trim() }).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.load();
      },
      error: () => {
        this.sending.set(false);
        this.toast.error('Couldn’t send your comment', 'Please try again.');
      },
    });
  }

  private load(): void {
    this.commentApi.list(this.data.table, this.data.submissionID).subscribe((res) => {
      this.comments.set([...res.payload].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)));
      // Show the newest message.
      setTimeout(() => {
        const el = this.thread()?.nativeElement;
        el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    });
  }
}
