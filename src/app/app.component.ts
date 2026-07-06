import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private state = inject(AppStateService);

  ngOnInit() {
    // Restore dark mode preference
    const dark = localStorage.getItem('darkMode') === 'true';
    if (dark) {
      this.state.isDarkMode.set(true);
      document.body.classList.add('dark-theme');
    }
    // Detect offline
    window.addEventListener('online', () => this.state.isOffline.set(false));
    window.addEventListener('offline', () => this.state.isOffline.set(true));
  }
}
