import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

/**
 * Short, non-blocking notices shown in the corner of the screen (rendered by
 * <app-toast-host> in the app root). Use ConfirmService when the user has to answer.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message, 7000);
  }

  warning(title: string, message?: string): void {
    this.show('warning', title, message, 6000);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(tone: ToastTone, title: string, message?: string, durationMs = 4500): void {
    const toast: Toast = { id: this.nextId++, tone, title, message };
    // Keep at most three on screen; the oldest goes first.
    this.items.update((toasts) => [...toasts.slice(-2), toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }
}
