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
      let lat = -23.9;
      let lon = 29.4;
      let locationName = 'Limpopo Farm';

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) { reject('No geolocation'); }
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        locationName = 'Current Location';
      } catch (e) {
        console.warn('Geolocation failed, using default location.');
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        const mapWMO = (code: number, isDay: boolean = true) => {
          if (code === 0) return { condition: 'Clear', icon: isDay ? 'wb_sunny' : 'bedtime' };
          if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: isDay ? 'partly_cloudy_day' : 'cloud' };
          if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
          if (code === 45 || code === 48) return { condition: 'Fog', icon: 'foggy' };
          if (code >= 51 && code <= 57) return { condition: 'Drizzle', icon: 'grain' };
          if (code >= 61 && code <= 67) return { condition: 'Rain', icon: 'water_drop' };
          if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'ac_unit' };
          if (code >= 80 && code <= 82) return { condition: 'Showers', icon: 'rainy' };
          if (code >= 85 && code <= 86) return { condition: 'Snow Showers', icon: 'ac_unit' };
          if (code >= 95) return { condition: 'Thunderstorm', icon: 'thunderstorm' };
          return { condition: 'Unknown', icon: 'cloud' };
        };

        const currentWmo = mapWMO(data.current.weather_code, data.current.is_day === 1);
        const forecastDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const forecast: WeatherForecast[] = data.daily.time.slice(0, 7).map((t: string, i: number) => {
          const date = new Date(t);
          const dayName = i === 0 ? 'Today' : forecastDays[date.getDay()];
          const fWmo = mapWMO(data.daily.weather_code[i], true);
          return {
            day: dayName,
            high: Math.round(data.daily.temperature_2m_max[i]),
            low: Math.round(data.daily.temperature_2m_min[i]),
            condition: fWmo.condition,
            icon: fWmo.icon,
            rain: data.daily.precipitation_probability_max[i]
          };
        });

        this.weather.set({
          location: locationName,
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          condition: currentWmo.condition,
          icon: currentWmo.icon,
          uvIndex: Math.round(data.daily.uv_index_max[0] || 8),
          rainfall: data.current.precipitation,
          forecast: forecast
        });
        return;
      }
    } catch (error) {
      console.error('Error loading weather from Open-Meteo:', error);
    }

    // Fallback to mock data if API fails or is not available
    this.weather.set({
      location: 'Limpopo Farm',
      temperature: 28,
      feelsLike: 31,
      humidity: 62,
      windSpeed: 14,
      condition: 'Partly Cloudy',
      icon: 'partly_cloudy_day',
      uvIndex: 8,
      rainfall: 0,
      forecast: [
        { day: 'Mon', high: 28, low: 18, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', rain: 10 },
        { day: 'Tue', high: 29, low: 19, condition: 'Sunny', icon: 'wb_sunny', rain: 0 },
        { day: 'Wed', high: 31, low: 20, condition: 'Sunny', icon: 'wb_sunny', rain: 5 },
        { day: 'Thu', high: 26, low: 18, condition: 'Heavy Rain', icon: 'thunderstorm', rain: 85 },
        { day: 'Fri', high: 25, low: 17, condition: 'Rain', icon: 'water_drop', rain: 65 },
        { day: 'Sat', high: 27, low: 18, condition: 'Sunny', icon: 'wb_sunny', rain: 10 },
        { day: 'Sun', high: 28, low: 18, condition: 'Sunny', icon: 'wb_sunny', rain: 0 }
      ]
    });
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
