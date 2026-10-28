import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<'light' | 'dark'>(this.initialTheme());
  constructor() { this.apply(); }
  toggle() {
    this.mode.update(mode => mode === 'dark' ? 'light' : 'dark');
    try { localStorage.setItem('metas-center-theme', this.mode()); } catch { /* Storage can be unavailable. */ }
    this.apply();
  }
  private initialTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem('metas-center-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Use the device preference. */ }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  private apply() {
    this.document.documentElement.dataset['theme'] = this.mode();
    this.document.documentElement.style.colorScheme = this.mode();
  }
}
