import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _state = signal<{ isOpen: boolean; options: ConfirmOptions | null }>({ isOpen: false, options: null });
  public state = this._state.asReadonly();
  
  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this._state.set({ isOpen: true, options });
    return new Promise(resolve => {
      this.resolver = resolve;
    });
  }

  resolve(value: boolean) {
    if (this.resolver) {
      this.resolver(value);
      this.resolver = null;
    }
    this._state.set({ isOpen: false, options: null });
  }
}
