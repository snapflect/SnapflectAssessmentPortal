import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public toasts = signal<Toast[]>([]);

  show(type: ToastType, title: string, message: string, durationMs: number = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, title, message, durationMs };
    
    this.toasts.update(t => [...t, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.remove(id), durationMs);
    }
  }

  success(title: string, message: string, durationMs?: number) {
    this.show('success', title, message, durationMs);
  }

  error(title: string, message: string, durationMs: number = 8000) {
    this.show('error', title, message, durationMs);
  }

  warning(title: string, message: string, durationMs?: number) {
    this.show('warning', title, message, durationMs);
  }

  info(title: string, message: string, durationMs?: number) {
    this.show('info', title, message, durationMs);
  }

  remove(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
