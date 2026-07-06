import { Injectable, signal, computed } from '@angular/core';
import { supabase, type Notification } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly notifications = computed(() => this._notifications());
  readonly unreadNotifications = computed(() => this._notifications().filter(n => !n.read));
  readonly unreadCount = computed(() => this.unreadNotifications().length);
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  constructor(private authService: AuthService) {}

  async loadNotifications(): Promise<void> {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this._loading.set(true);
    this._error.set(null);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      this._error.set(error.message);
    } else {
      this._notifications.set(data || []);
    }

    this._loading.set(false);
  }

  async markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    this._notifications.update(notifications =>
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );

    return { success: true };
  }

  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    const userId = this.authService.user()?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return { success: false, error: error.message };
    }

    this._notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );

    return { success: true };
  }

  async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    this._notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );

    return { success: true };
  }

  clearError() {
    this._error.set(null);
  }
}
