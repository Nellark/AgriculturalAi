import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">{{ state.unreadNotifications() }} unread notifications</p>
        </div>
        <button class="btn btn-outline" (click)="state.markAllNotificationsRead()">
          <mat-icon>done_all</mat-icon> Mark All Read
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="notif-tabs" style="margin-bottom:20px">
        @for (tab of tabs; track tab.id) {
          <button class="chip" [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
            <mat-icon>{{ tab.icon }}</mat-icon> {{ tab.label }}
            @if (tab.id !== 'all' && countByType(tab.id) > 0) {
              <span class="tab-badge">{{ countByType(tab.id) }}</span>
            }
          </button>
        }
      </div>

      <div class="notif-list">
        @for (n of filteredNotifications(); track n.id) {
          <div class="notif-card card" [class.unread]="!n.read" (click)="state.markNotificationRead(n.id)">
            <div class="notif-icon-wrap icon-wrap {{ iconClass(n.type) }}" style="width:46px;height:46px;font-size:22px;border-radius:12px;flex-shrink:0">
              <mat-icon>{{ n.icon }}</mat-icon>
            </div>
            <div class="notif-body">
              <div class="notif-header-row">
                <h4 class="notif-title">{{ n.title }}</h4>
                <div class="notif-meta">
                  <span class="badge {{ priorityBadge(n.priority) }}" style="font-size:10px">{{ n.priority }}</span>
                  <span class="notif-time">{{ timeAgo(n.created_at) }}</span>
                </div>
              </div>
              <p class="notif-msg">{{ n.message }}</p>
            </div>
            @if (!n.read) {
              <div class="unread-dot"></div>
            }
          </div>
        }

        @if (filteredNotifications().length === 0) {
          <div class="empty-state card" style="text-align:center;padding:64px">
            <mat-icon style="font-size:48px;color:var(--text-muted);margin-bottom:12px">notifications_none</mat-icon>
            <h3>No notifications</h3>
            <p style="color:var(--text-secondary)">You're all caught up! Check back later for updates.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .notif-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab-badge { background: var(--danger); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 99px; margin-left: 2px; }
    .notif-list { display: flex; flex-direction: column; gap: 10px; }
    .notif-card { display: flex; align-items: flex-start; gap: 16px; padding: 18px; cursor: pointer; transition: all var(--transition); }
    .notif-card.unread { background: rgba(46,125,50,0.03); border-color: rgba(46,125,50,0.15); }
    .notif-body { flex: 1; }
    .notif-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 6px; }
    .notif-title { font-size: 14.5px; font-weight: 700; }
    .notif-meta { display: flex; align-items: center; gap: 8px; }
    .notif-time { font-size: 11.5px; color: var(--text-muted); }
    .notif-msg { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; }
    .unread-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 4px; }
  `],
})
export class NotificationsComponent {
  state = inject(AppStateService);
  activeTab = 'all';

  tabs = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'weather', label: 'Weather', icon: 'thunderstorm' },
    { id: 'disease', label: 'Disease', icon: 'bug_report' },
    { id: 'market', label: 'Market', icon: 'price_check' },
    { id: 'ai', label: 'AI', icon: 'psychology' },
  ];

  filteredNotifications() {
    if (this.activeTab === 'all') return this.state.notifications();
    return this.state.notifications().filter(n => n.type === this.activeTab);
  }

  countByType(type: string) {
    return this.state.notifications().filter(n => n.type === type && !n.read).length;
  }

  iconClass(type: string) {
    const map: Record<string, string> = {
      weather: 'icon-wrap-info', disease: 'icon-wrap-danger',
      market: 'icon-wrap-primary', planner: 'icon-wrap-warning',
      ai: 'icon-wrap-primary', system: 'icon-wrap-neutral',
    };
    return map[type] || 'icon-wrap-primary';
  }

  priorityBadge(p: string) {
    return p === 'high' ? 'badge-danger' : p === 'medium' ? 'badge-warning' : 'badge-neutral';
  }

  timeAgo(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
