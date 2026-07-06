import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../core/services/app-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationDrawerComponent } from '../../shared/components/notification-drawer/notification-drawer.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatBadgeModule, MatTooltipModule, MatMenuModule, MatButtonModule, MatDividerModule, NotificationDrawerComponent],
  template: `
    @if (state.isOffline()) {
      <div class="offline-banner">
        <mat-icon>wifi_off</mat-icon>
        You are offline — showing cached data
      </div>
    }

    <div class="shell" [class.collapsed]="!state.sidebarOpen()">
      <aside class="sidebar" [class.open]="state.sidebarOpen()">
        <div class="sidebar-logo" routerLink="/app/dashboard" style="cursor:pointer">
          <div class="logo-mark">A</div>
          @if (state.sidebarOpen()) {
            <div class="logo-text">
              <span class="logo-name">AgriGrow</span>
              <span class="logo-africa">Africa</span>
            </div>
          }
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="nav-group-label">{{ state.sidebarOpen() ? 'Main' : '' }}</span>
            @for (item of mainNav; track item.path) {
              <a class="nav-item" [routerLink]="'/app/' + item.path" routerLinkActive="active"
                 [matTooltip]="!state.sidebarOpen() ? item.label : ''" matTooltipPosition="right"
                 (click)="onNavClick()">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (state.sidebarOpen()) { <span class="nav-label">{{ item.label }}</span> }
              </a>
            }
          </div>
          <div class="nav-group">
            <span class="nav-group-label">{{ state.sidebarOpen() ? 'AI Tools' : '' }}</span>
            @for (item of aiNav; track item.path) {
              <a class="nav-item" [routerLink]="'/app/' + item.path" routerLinkActive="active"
                 [matTooltip]="!state.sidebarOpen() ? item.label : ''" matTooltipPosition="right"
                 (click)="onNavClick()">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (state.sidebarOpen()) { <span class="nav-label">{{ item.label }}</span> }
              </a>
            }
          </div>
          <div class="nav-group">
            <span class="nav-group-label">{{ state.sidebarOpen() ? 'Commerce' : '' }}</span>
            @for (item of commerceNav; track item.path) {
              <a class="nav-item" [routerLink]="'/app/' + item.path" routerLinkActive="active"
                 [matTooltip]="!state.sidebarOpen() ? item.label : ''" matTooltipPosition="right"
                 (click)="onNavClick()">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (state.sidebarOpen()) { <span class="nav-label">{{ item.label }}</span> }
              </a>
            }
          </div>
          <div class="nav-group">
            <span class="nav-group-label">{{ state.sidebarOpen() ? 'More' : '' }}</span>
            @for (item of otherNav; track item.path) {
              <a class="nav-item" [routerLink]="'/app/' + item.path" routerLinkActive="active"
                 [matTooltip]="!state.sidebarOpen() ? item.label : ''" matTooltipPosition="right"
                 (click)="onNavClick()">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (state.sidebarOpen()) { <span class="nav-label">{{ item.label }}</span> }
                @if (item.path === 'notifications' && state.unreadNotifications() > 0 && state.sidebarOpen()) {
                  <span class="nav-badge">{{ state.unreadNotifications() }}</span>
                }
              </a>
            }
          </div>
        </nav>

        <div class="sidebar-user" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">
            @if (state.profile()?.avatar) {
              <img [src]="state.profile()!.avatar" [alt]="state.profile()!.name" />
            } @else {
              {{ state.profile()?.name?.charAt(0) }}
            }
          </div>
          @if (state.sidebarOpen()) {
            <div class="user-meta">
              <span class="user-name">{{ state.profile()?.name }}</span>
              <span class="user-loc">{{ state.profile()?.province }}, {{ state.profile()?.country }}</span>
            </div>
            <mat-icon class="user-chevron">unfold_more</mat-icon>
          }
        </div>
        <mat-menu #userMenu="matMenu" xPosition="after" yPosition="above">
          <a mat-menu-item routerLink="/app/settings"><mat-icon>settings</mat-icon> Settings</a>
          <button mat-menu-item (click)="state.toggleDarkMode()">
            <mat-icon>{{ state.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            {{ state.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/auth/login"><mat-icon>logout</mat-icon> Sign Out</a>
        </mat-menu>
      </aside>

      @if (state.sidebarOpen() && isMobile()) {
        <div class="sidebar-mask" (click)="state.toggleSidebar()"></div>
      }

      <div class="main">
        <header class="topbar">
          <button class="topbar-btn" (click)="state.toggleSidebar()">
            <mat-icon>{{ state.sidebarOpen() ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
          <div class="topbar-search hide-mobile">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search crops, markets, AI advice..." />
          </div>
          <div class="topbar-right">
            <button class="topbar-btn hide-mobile" (click)="state.toggleDarkMode()" [matTooltip]="state.isDarkMode() ? 'Light Mode' : 'Dark Mode'">
              <mat-icon>{{ state.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <button class="topbar-btn notif-btn" (click)="notifOpen.set(!notifOpen())" [matTooltip]="'Notifications'">
              <mat-icon>notifications_none</mat-icon>
              @if (state.unreadNotifications() > 0) {
                <span class="notif-dot">{{ state.unreadNotifications() }}</span>
              }
            </button>
            <button class="topbar-btn" routerLink="/app/ai-assistant" [matTooltip]="'AI Assistant'">
              <mat-icon>psychology</mat-icon>
            </button>
            <div class="topbar-avatar" [matMenuTriggerFor]="topMenu">
              <div class="user-avatar sm">
                @if (state.profile()?.avatar) {
                  <img [src]="state.profile()!.avatar" [alt]="state.profile()!.name" />
                } @else {
                  {{ state.profile()?.name?.charAt(0) }}
                }
              </div>
              <div class="hide-mobile">
                <div class="topbar-user-name">{{ state.profile()?.name }}</div>
                <div class="topbar-user-role">{{ state.profile()?.role }}</div>
              </div>
            </div>
            <mat-menu #topMenu="matMenu">
              <a mat-menu-item routerLink="/app/settings"><mat-icon>settings</mat-icon> Settings</a>
              <a mat-menu-item routerLink="/auth/login"><mat-icon>logout</mat-icon> Sign Out</a>
            </mat-menu>
          </div>
        </header>

        <main class="content page-enter">
          <router-outlet />
        </main>

        <nav class="bottom-nav hide-desktop">
          @for (item of bottomNav; track item.path) {
            <a class="bnav-item" [routerLink]="'/app/' + item.path" routerLinkActive="active">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </div>
    </div>

    <app-notification-drawer [open]="notifOpen()" (closed)="notifOpen.set(false)" />
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }

    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      transition: width var(--transition-slow);
      z-index: 100;
    }
    .collapsed .sidebar { width: 68px; }

    .sidebar-logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      overflow: hidden;
    }
    .logo-mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--primary);
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      flex-shrink: 0;
    }
    .logo-text { display: flex; flex-direction: column; overflow: hidden; white-space: nowrap; }
    .logo-name { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.3; }
    .logo-africa { font-size: 10px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }

    .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px; }
    .nav-group { margin-bottom: 4px; }
    .nav-group-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); padding: 10px 8px 4px; display: block; white-space: nowrap; min-height: 28px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 10px;
      color: var(--text-secondary); text-decoration: none;
      font-size: 13.5px; font-weight: 500;
      transition: all var(--transition);
      position: relative; white-space: nowrap; margin-bottom: 1px; overflow: hidden;
    }
    .nav-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .nav-item:hover { background: var(--bg-subtle); color: var(--text-primary); }
    .nav-item.active { background: rgba(27,67,50,0.1); color: var(--primary); font-weight: 600; }
    .nav-item.active::before {
      content: ''; position: absolute; left: 0; top: 6px; bottom: 6px;
      width: 3px; background: var(--primary); border-radius: 0 3px 3px 0;
    }
    .nav-badge {
      margin-left: auto; background: var(--danger); color: #fff;
      font-size: 10px; font-weight: 700; padding: 2px 6px;
      border-radius: 99px; min-width: 18px; text-align: center;
    }

    .sidebar-user {
      padding: 12px; border-top: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; border-radius: 12px; margin: 4px 8px 8px;
      transition: background var(--transition); overflow: hidden; flex-shrink: 0;
    }
    .sidebar-user:hover { background: var(--bg-subtle); }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-mid));
      color: #fff; font-weight: 600; font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    .user-avatar.sm { width: 32px; height: 32px; font-size: 12px; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-meta { flex: 1; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-loc { font-size: 11px; color: var(--text-muted); display: block; }
    .user-chevron { font-size: 16px; color: var(--text-muted); flex-shrink: 0; }
    .sidebar-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 99; }

    .main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

    .topbar {
      height: var(--topbar-height);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 12px; padding: 0 24px; flex-shrink: 0;
    }
    .topbar-btn {
      width: 36px; height: 36px; border-radius: 10px;
      border: none; background: none; color: var(--text-secondary);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all var(--transition); position: relative; flex-shrink: 0;
    }
    .topbar-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
    .topbar-btn mat-icon { font-size: 20px; }
    .notif-dot {
      position: absolute; top: 5px; right: 5px;
      width: 16px; height: 16px; background: var(--danger); color: #fff;
      font-size: 9px; font-weight: 700; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg-card);
    }
    .topbar-search {
      flex: 1; max-width: 480px; display: flex; align-items: center; gap: 10px;
      background: var(--bg-subtle); border: 1px solid var(--border);
      border-radius: 10px; padding: 8px 14px; transition: all var(--transition);
    }
    .topbar-search:focus-within { border-color: var(--primary); background: var(--bg-card); box-shadow: 0 0 0 3px rgba(27,67,50,0.1); }
    .topbar-search mat-icon { font-size: 18px; color: var(--text-muted); }
    .topbar-search input { border: none; background: transparent; font-size: 13px; color: var(--text-primary); outline: none; width: 100%; font-family: 'Inter', sans-serif; }
    .topbar-search input::placeholder { color: var(--text-muted); }
    .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
    .topbar-avatar { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 10px; cursor: pointer; transition: all var(--transition); }
    .topbar-avatar:hover { background: var(--bg-subtle); }
    .topbar-user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
    .topbar-user-role { font-size: 11px; color: var(--text-muted); text-transform: capitalize; }

    .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 28px 32px; background: var(--bg); }

    .bottom-nav { display: flex; background: var(--bg-card); border-top: 1px solid var(--border); height: 60px; flex-shrink: 0; }
    .bnav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--text-muted); text-decoration: none; font-size: 9.5px; font-weight: 600; transition: color var(--transition); }
    .bnav-item mat-icon { font-size: 22px; }
    .bnav-item.active { color: var(--primary); }

    @media (max-width: 768px) {
      .sidebar { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(-100%); z-index: 200; width: var(--sidebar-width) !important; }
      .sidebar.open { transform: translateX(0); }
      .collapsed .sidebar { transform: translateX(-100%); }
      .content { padding: 16px; padding-bottom: 72px; }
      .topbar { padding: 0 16px; }
    }
  `],
})
export class DashboardLayoutComponent {
  state = inject(AppStateService);
  notifOpen = signal(false);

  mainNav: NavItem[] = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'farm', label: 'My Farm', icon: 'yard' },
    { path: 'planner', label: 'Planner', icon: 'calendar_month' },
    { path: 'analytics', label: 'Analytics', icon: 'bar_chart' },
  ];

  aiNav: NavItem[] = [
    { path: 'ai-assistant', label: 'AI Assistant', icon: 'psychology' },
    { path: 'disease-detection', label: 'Disease Detection', icon: 'biotech' },
    { path: 'crop-advisor', label: 'Crop Advisor', icon: 'tips_and_updates' },
    { path: 'yield-forecast', label: 'Yield Forecast', icon: 'trending_up' },
    { path: 'weather', label: 'Weather', icon: 'wb_sunny' },
  ];

  commerceNav: NavItem[] = [
    { path: 'market-prices', label: 'Market Prices', icon: 'price_check' },
    { path: 'marketplace', label: 'Marketplace', icon: 'storefront' },
  ];

  otherNav: NavItem[] = [
    { path: 'community', label: 'Community', icon: 'groups' },
    { path: 'notifications', label: 'Notifications', icon: 'notifications_none' },
    { path: 'settings', label: 'Settings', icon: 'settings' },
  ];

  bottomNav: NavItem[] = [
    { path: 'dashboard', label: 'Home', icon: 'home' },
    { path: 'farm', label: 'Farm', icon: 'yard' },
    { path: 'ai-assistant', label: 'AI', icon: 'psychology' },
    { path: 'market-prices', label: 'Market', icon: 'price_check' },
    { path: 'settings', label: 'More', icon: 'more_horiz' },
  ];

  isMobile() { return window.innerWidth <= 768; }
  onNavClick() { if (this.isMobile()) this.state.sidebarOpen.set(false); }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768) this.state.sidebarOpen.set(true);
  }
}
