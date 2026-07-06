import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="drawer-backdrop" [class.open]="open" (click)="closed.emit()"></div>
    <aside class="notif-drawer" [class.open]="open">
      <div class="drawer-header">
        <h3>Notifications</h3>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-ghost btn-sm" (click)="state.markAllNotificationsRead()">Mark all read</button>
          <button class="icon-btn" (click)="closed.emit()"><mat-icon>close</mat-icon></button>
        </div>
      </div>
      <div class="drawer-body">
        @for (n of state.notifications(); track n.id) {
          <div class="notif-item" [class.unread]="!n.read" (click)="state.markNotificationRead(n.id)">
            <div class="notif-icon icon-wrap" [ngClass]="iconClass(n.type)">
              <mat-icon>{{ n.icon }}</mat-icon>
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-msg">{{ n.message }}</div>
              <div class="notif-time">{{ timeAgo(n.created_at) }}</div>
            </div>
            @if (!n.read) {
              <span class="notif-dot"></span>
            }
          </div>
        }
      </div>
      <div class="drawer-footer">
        <a routerLink="/app/notifications" (click)="closed.emit()" class="btn btn-outline w-full" style="justify-content:center">View All Notifications</a>
      </div>
    </aside>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0);
      pointer-events: none;
      z-index: 299;
      transition: background var(--transition-slow);
    }
    .drawer-backdrop.open {
      background: rgba(0,0,0,0.3);
      pointer-events: all;
    }
    .notif-drawer {
      position: fixed; top: 0; right: -420px; bottom: 0;
      width: 400px;
      background: var(--bg-card);
      border-left: 1px solid var(--border);
      z-index: 300;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
      transition: right var(--transition-slow);
    }
    .notif-drawer.open { right: 0; }
    .drawer-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .drawer-header h3 {
      font-size: 18px;
      font-weight: 700;
    }
    .icon-btn {
      width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: none;
      border-radius: 8px; cursor: pointer;
      color: var(--text-secondary);
      transition: all var(--transition);
    }
    .icon-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 24px;
      cursor: pointer;
      transition: background var(--transition);
      position: relative;
    }
    .notif-item:hover { background: var(--bg-subtle); }
    .notif-item.unread { background: rgba(46,125,50,0.04); }
    .notif-icon { width: 40px; height: 40px; font-size: 20px; flex-shrink: 0; border-radius: 10px; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
    .notif-msg { font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
    .notif-time { font-size: 11px; color: var(--text-muted); }
    .notif-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
      margin-top: 4px;
    }
    .drawer-footer { padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; }
    @media (max-width: 480px) { .notif-drawer { width: 100%; right: -100%; } }
  `],
})
export class NotificationDrawerComponent {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  state = inject(AppStateService);

  iconClass(type: string): string {
    const map: Record<string, string> = {
      weather: 'icon-wrap-info',
      disease: 'icon-wrap-danger',
      market: 'icon-wrap-primary',
      planner: 'icon-wrap-warning',
      ai: 'icon-wrap-primary',
      system: 'icon-wrap-neutral',
    };
    return map[type] || 'icon-wrap-primary';
  }

  timeAgo(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
