import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, model, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { ToastService } from '../toast/toast.service';

/**
 * Picks one file, by dropping it or browsing. [(file)] holds the choice;
 * PDFs can be previewed before uploading.
 */
@Component({
  selector: 'app-file-drop',
  imports: [IconComponent],
  template: `
    <input #picker type="file" class="sr-only" tabindex="-1" [accept]="accept()" (change)="pick($any($event.target))" />

    @if (file(); as file) {
      <div class="rounded-xl bg-white ring-1 ring-slate-200">
        <div class="flex items-center gap-3 p-3">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-600">
            <app-icon [name]="isPdf() ? 'file-pdf' : 'file-text'" [size]="22" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900">{{ file.name }}</p>
            <p class="text-xs text-slate-500">{{ sizeLabel() }}</p>
          </div>
          @if (isPdf()) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="previewing.set(!previewing())">
              <app-icon name="eye" [size]="16" /> {{ previewing() ? 'Hide' : 'Preview' }}
            </button>
          }
          <button type="button" class="icon-btn" (click)="clear(picker)">
            <app-icon name="x" [size]="16" label="Remove file" />
          </button>
        </div>
        @if (previewing() && previewUrl(); as url) {
          <object [data]="url" type="application/pdf" class="h-[28rem] w-full rounded-b-xl border-t border-slate-100">
            <p class="p-4 text-sm text-slate-500">This browser can't show PDFs inline.</p>
          </object>
        }
      </div>
    } @else {
      <button type="button"
        class="group flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition"
        [class]="dragging() ? 'border-brand-500 bg-brand-50/70' : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'"
        [class.py-10]="!compact()" [class.py-6]="compact()"
        (click)="picker.click()" (dragover)="onDragOver($event)" (dragleave)="dragging.set(false)" (drop)="onDrop($event)">
        <span class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-slate-900/5 transition group-hover:-translate-y-0.5">
          <app-icon name="cloud-arrow-up" [size]="22" />
        </span>
        <span class="text-sm font-medium text-slate-900">
          <span class="text-brand-700 underline-offset-4 group-hover:underline">Choose a file</span> or drag it here
        </span>
        <span class="mt-1 text-xs text-slate-500">{{ hint() }}</span>
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDropComponent {
  readonly file = model<File | null>(null);
  readonly accept = input('application/pdf');
  readonly hint = input('PDF, up to 25 MB');
  readonly maxSizeMb = input(25);
  readonly compact = input(false);

  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly dragging = signal(false);
  protected readonly previewing = signal(false);
  protected readonly isPdf = computed(() => this.file()?.type === 'application/pdf');
  protected readonly sizeLabel = computed(() => {
    const bytes = this.file()?.size ?? 0;
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  });

  protected readonly previewUrl = signal<SafeResourceUrl | null>(null);
  private objectUrl: string | null = null;

  constructor() {
    // A fresh preview URL for each chosen PDF; the previous one is released.
    effect(() => {
      const file = this.file();
      this.releasePreview();
      this.previewing.set(false);
      if (file?.type === 'application/pdf') {
        this.objectUrl = URL.createObjectURL(file);
        this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl));
      }
    });
    inject(DestroyRef).onDestroy(() => this.releasePreview());
  }

  private releasePreview(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.previewUrl.set(null);
  }

  protected pick(input: HTMLInputElement): void {
    this.choose(input.files?.[0]);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.choose(event.dataTransfer?.files?.[0]);
  }

  protected clear(input: HTMLInputElement): void {
    input.value = '';
    this.file.set(null);
  }

  private choose(file: File | undefined): void {
    if (!file) {
      return;
    }
    if (!this.matchesAccept(file)) {
      this.toast.error('That file type isn’t accepted', this.hint());
      return;
    }
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.toast.error('That file is too large', `Files can be up to ${this.maxSizeMb()} MB.`);
      return;
    }
    this.file.set(file);
  }

  private matchesAccept(file: File): boolean {
    const accepted = this.accept().split(',').map((type) => type.trim()).filter(Boolean);
    return accepted.length === 0 || accepted.some((type) =>
      type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : file.type === type,
    );
  }
}
