import { Injectable, signal, computed } from '@angular/core';
import { supabase, type Farm, type Crop, type Livestock } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

export interface FarmWithDetails extends Farm {
  crops: Crop[];
  livestock: Livestock[];
}

@Injectable({ providedIn: 'root' })
export class FarmService {
  private _farms = signal<Farm[]>([]);
  private _currentFarm = signal<FarmWithDetails | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly farms = computed(() => this._farms());
  readonly currentFarm = computed(() => this._currentFarm());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  constructor(private authService: AuthService) {}

  async loadFarms(): Promise<void> {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this._loading.set(true);
    this._error.set(null);

    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this._error.set(error.message);
    } else {
      this._farms.set(data || []);
    }

    this._loading.set(false);
  }

  async loadFarmWithDetails(farmId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .maybeSingle();

    if (farmError) {
      this._error.set(farmError.message);
      this._loading.set(false);
      return;
    }

    if (!farm) {
      this._currentFarm.set(null);
      this._loading.set(false);
      return;
    }

    const { data: crops, error: cropsError } = await supabase
      .from('crops')
      .select('*')
      .eq('farm_id', farmId);

    const { data: livestock, error: livestockError } = await supabase
      .from('livestock')
      .select('*')
      .eq('farm_id', farmId);

    this._currentFarm.set({
      ...farm,
      crops: crops || [],
      livestock: livestock || []
    });

    this._loading.set(false);
  }

  async createFarm(farm: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data?: Farm; error?: string }> {
    this._loading.set(true);

    const { data, error } = await supabase
      .from('farms')
      .insert(farm)
      .select()
      .single();

    if (error) {
      this._error.set(error.message);
      this._loading.set(false);
      return { error: error.message };
    }

    this._farms.update(farms => [...farms, data]);
    this._loading.set(false);
    return { data };
  }

  async updateFarm(id: string, updates: Partial<Farm>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('farms')
      .update(updates)
      .eq('id', id);

    if (error) {
      this._error.set(error.message);
      return { success: false, error: error.message };
    }

    await this.loadFarms();
    return { success: true };
  }

  async deleteFarm(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', id);

    if (error) {
      this._error.set(error.message);
      return { success: false, error: error.message };
    }

    this._farms.update(farms => farms.filter(f => f.id !== id));
    return { success: true };
  }

  async addCrop(farmId: string, crop: Omit<Crop, 'id' | 'farm_id' | 'created_at' | 'updated_at'>): Promise<{ data?: Crop; error?: string }> {
    const { data, error } = await supabase
      .from('crops')
      .insert({ ...crop, farm_id: farmId })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    this._currentFarm.update(farm => {
      if (!farm) return farm;
      return { ...farm, crops: [...farm.crops, data] };
    });

    return { data };
  }

  async updateCrop(cropId: string, updates: Partial<Crop>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', cropId);

    if (error) {
      return { success: false, error: error.message };
    }

    const currentFarm = this._currentFarm();
    if (currentFarm) {
      await this.loadFarmWithDetails(currentFarm.id);
    }

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

    this._currentFarm.update(farm => {
      if (!farm) return farm;
      return { ...farm, crops: farm.crops.filter(c => c.id !== cropId) };
    });

    return { success: true };
  }

  async addLivestock(farmId: string, animal: Omit<Livestock, 'id' | 'farm_id' | 'created_at' | 'updated_at'>): Promise<{ data?: Livestock; error?: string }> {
    const { data, error } = await supabase
      .from('livestock')
      .insert({ ...animal, farm_id: farmId })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    this._currentFarm.update(farm => {
      if (!farm) return farm;
      return { ...farm, livestock: [...farm.livestock, data] };
    });

    return { data };
  }

  async updateLivestock(livestockId: string, updates: Partial<Livestock>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('livestock')
      .update(updates)
      .eq('id', livestockId);

    if (error) {
      return { success: false, error: error.message };
    }

    const currentFarm = this._currentFarm();
    if (currentFarm) {
      await this.loadFarmWithDetails(currentFarm.id);
    }

    return { success: true };
  }

  async deleteLivestock(livestockId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('livestock')
      .delete()
      .eq('id', livestockId);

    if (error) {
      return { success: false, error: error.message };
    }

    this._currentFarm.update(farm => {
      if (!farm) return farm;
      return { ...farm, livestock: farm.livestock.filter(l => l.id !== livestockId) };
    });

    return { success: true };
  }

  clearError() {
    this._error.set(null);
  }
}
