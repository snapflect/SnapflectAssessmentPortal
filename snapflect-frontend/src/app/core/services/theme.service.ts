import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'snapflect_theme';
  private currentTheme: 'light' | 'dark' = 'dark'; // Default to dark since the app was built for it

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else {
      // Check OS preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.currentTheme = 'light';
      }
    }
    
    this.applyTheme(this.currentTheme);
  }

  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  public toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
  }

  public setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark') {
    localStorage.setItem(this.THEME_KEY, theme);
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
