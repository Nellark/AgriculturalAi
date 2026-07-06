import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { supabase, type Profile, type Farm, type Crop, type Livestock, type Task, type Notification, type CropPrice } from '../supabase/supabase.client';
import type { User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface FarmWithDetails extends Farm {
  crops: Crop[];
  livestock: Livestock[];
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  forecast: WeatherForecast[];
  uvIndex: number;
  rainfall: number;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rain: number;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Auth state
  readonly user = signal<User | null>(null);
  readonly profile = signal<Profile | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly authLoading = signal<boolean>(true);

  // Farm state
  readonly farm = signal<FarmWithDetails | null>(null);
  readonly farmLoading = signal<boolean>(false);

  // Data state
  readonly tasks = signal<Task[]>([]);
  readonly notifications = signal<Notification[]>([]);
  readonly prices = signal<CropPrice[]>([]);
  readonly weather = signal<WeatherData | null>(null);

  // UI state
  readonly isDarkMode = signal<boolean>(false);
  readonly isOffline = signal<boolean>(!navigator.onLine);
  readonly sidebarOpen = signal<boolean>(true);
  readonly language = signal<string>('en');

  // Computed
  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  constructor() {
    this.initializeAuth();
    this.setupOnlineListener();
    this.loadPrices();
    this.loadWeather();
  }

  private async initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      this.user.set(session.user);
      this.isAuthenticated.set(true);
      await this.loadProfile(session.user.id);
      await this.loadUserData(session.user.id);
    }

    this.authLoading.set(false);

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.user.set(session.user);
          this.isAuthenticated.set(true);
          await this.loadProfile(session.user.id);
          await this.loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.user.set(null);
          this.profile.set(null);
          this.isAuthenticated.set(false);
          this.farm.set(null);
          this.tasks.set([]);
          this.notifications.set([]);
        }
        this.authLoading.set(false);
      })();
    });
  }

  private async loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      this.profile.set(data);
      this.language.set(data.language || 'en');
    }
  }

  private async loadUserData(userId: string) {
    this.farmLoading.set(true);

    // Load farm with crops and livestock
    const { data: farms } = await supabase
      .from('farms')
      .select('*, crops(*), livestock(*)')
      .eq('user_id', userId)
      .limit(1);

    if (farms && farms.length > 0) {
      const f = farms[0];
      this.farm.set({
        ...f,
        crops: (f as unknown as { crops: Crop[] }).crops || [],
        livestock: (f as unknown as { livestock: Livestock[] }).livestock || []
      });
    }

    // Load tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (tasks) {
      this.tasks.set(tasks);
    }

    // Load notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifications) {
      this.notifications.set(notifications);
    }

    this.farmLoading.set(false);
  }

  private async loadPrices() {
    const { data, error } = await supabase
      .from('crop_prices')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      this.prices.set(data);
    } else {
      // Fetch from edge function if database is empty
      await this.fetchPricesFromAPI();
    }
  }

  async loadWeather() {
    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/weather`);
      if (response.ok) {
        const data = await response.json();
        this.weather.set(data);
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  }

  async fetchPricesFromAPI() {
    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/market-prices`);
      if (response.ok) {
        const data = await response.json();
        if (data.prices) {
          this.prices.set(data.prices);
        }
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }

  async analyzeDisease(imageUrl: string, cropType: string): Promise<{ success: boolean; result?: any; error?: string }> {
    const userId = this.user()?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/disease-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, imageUrl, cropType })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, result: data.result };
      }
      return { success: false, error: 'Analysis failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));
  }

  async refreshData() {
    const userId = this.user()?.id;
    if (userId) {
      await this.loadUserData(userId);
      await this.loadPrices();
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    document.body.classList.toggle('dark-theme', this.isDarkMode());
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  async markNotificationRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      this.notifications.update(ns =>
        ns.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  }

  async markAllNotificationsRead() {
    const userId = this.user()?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (!error) {
      this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
    }
  }

  // Farm operations
  async createFarm(name: string, size: number, sizeUnit: 'ha' | 'acres' = 'ha'): Promise<{ success: boolean; error?: string }> {
    const userId = this.user()?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('farms')
      .insert({ user_id: userId, name, size, size_unit: sizeUnit })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    this.farm.set({ ...data, crops: [], livestock: [] });
    return { success: true };
  }

  async addCropToFarm(crop: Omit<Crop, 'id' | 'farm_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    const farmId = this.farm()?.id;
    if (!farmId) return { success: false, error: 'No farm selected' };

    const { data, error } = await supabase
      .from('crops')
      .insert({ ...crop, farm_id: farmId })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    this.farm.update(f => f ? { ...f, crops: [...f.crops, data] } : f);
    return { success: true };
  }

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', cropId);

    if (error) {
      return { success: false, error: error.message };
    }

    this.farm.update(f => {
      if (!f) return f;
      return { ...f, crops: f.crops.map(c => c.id === cropId ? { ...c, ...updates } : c) };
    });
    return { success: true };
  }

  async deleteCrop(cropId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);

    if (error) {
      return { success: false, error: error.message };
    }

    this.farm.update(f => f ? { ...f, crops: f.crops.filter(c => c.id !== cropId) } : f);
    return { success: true };
  }

  // Task operations
  async createTask(task: { title: string; description?: string; due_date: string; category: Task['category']; priority: Task['priority']; status: Task['status']; farm_id?: string }): Promise<{ success: boolean; error?: string }> {
    const userId = this.user()?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: userId, farm_id: task.farm_id || null })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    this.tasks.update(tasks => [...tasks, data]);
    return { success: true };
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      return { success: false, error: error.message };
    }

    this.tasks.update(tasks => tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    return { success: true };
  }

  async deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return { success: false, error: error.message };
    }

    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    return { success: true };
  }

  // Profile operations
  async updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    const userId = this.user()?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    this.profile.update(p => p ? { ...p, ...updates } : p);
    return { success: true };
  }
}
