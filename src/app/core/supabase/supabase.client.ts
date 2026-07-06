import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          avatar: string | null;
          role: 'farmer' | 'admin' | 'expert';
          country: string;
          province: string | null;
          language: string;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          avatar?: string | null;
          role?: 'farmer' | 'admin' | 'expert';
          country?: string;
          province?: string | null;
          language?: string;
          onboarding_complete?: boolean;
        };
        Update: {
          name?: string;
          phone?: string | null;
          avatar?: string | null;
          role?: 'farmer' | 'admin' | 'expert';
          country?: string;
          province?: string | null;
          language?: string;
          onboarding_complete?: boolean;
        };
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          size: number;
          size_unit: 'ha' | 'acres';
          province: string | null;
          country: string;
          soil_type: string | null;
          water_source: string | null;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          name: string;
          size: number;
          size_unit?: 'ha' | 'acres';
          province?: string | null;
          country?: string;
          soil_type?: string | null;
          water_source?: string | null;
          image?: string | null;
        };
        Update: {
          name?: string;
          size?: number;
          size_unit?: 'ha' | 'acres';
          province?: string | null;
          country?: string;
          soil_type?: string | null;
          water_source?: string | null;
          image?: string | null;
        };
      };
      crops: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          variety: string | null;
          planted_date: string | null;
          expected_harvest_date: string | null;
          area: number;
          area_unit: 'ha' | 'acres';
          status: 'planted' | 'growing' | 'ready' | 'harvested';
          health_score: number;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          farm_id: string;
          name: string;
          variety?: string | null;
          planted_date?: string | null;
          expected_harvest_date?: string | null;
          area: number;
          area_unit?: 'ha' | 'acres';
          status?: 'planted' | 'growing' | 'ready' | 'harvested';
          health_score?: number;
          icon?: string;
        };
        Update: {
          name?: string;
          variety?: string | null;
          planted_date?: string | null;
          expected_harvest_date?: string | null;
          area?: number;
          area_unit?: 'ha' | 'acres';
          status?: 'planted' | 'growing' | 'ready' | 'harvested';
          health_score?: number;
          icon?: string;
        };
      };
      livestock: {
        Row: {
          id: string;
          farm_id: string;
          type: string;
          breed: string | null;
          count: number;
          health_status: 'good' | 'fair' | 'poor';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          farm_id: string;
          type: string;
          breed?: string | null;
          count?: number;
          health_status?: 'good' | 'fair' | 'poor';
        };
        Update: {
          type?: string;
          breed?: string | null;
          count?: number;
          health_status?: 'good' | 'fair' | 'poor';
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string;
          category: 'planting' | 'irrigation' | 'harvesting' | 'spraying' | 'fertilizing' | 'other';
          status: 'pending' | 'in-progress' | 'done';
          priority: 'low' | 'medium' | 'high';
          farm_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          title: string;
          description?: string | null;
          due_date: string;
          category?: 'planting' | 'irrigation' | 'harvesting' | 'spraying' | 'fertilizing' | 'other';
          status?: 'pending' | 'in-progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          farm_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string;
          category?: 'planting' | 'irrigation' | 'harvesting' | 'spraying' | 'fertilizing' | 'other';
          status?: 'pending' | 'in-progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          farm_id?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'weather' | 'disease' | 'market' | 'planner' | 'ai' | 'system';
          title: string;
          message: string;
          read: boolean;
          priority: 'low' | 'medium' | 'high';
          icon: string;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          type: 'weather' | 'disease' | 'market' | 'planner' | 'ai' | 'system';
          title: string;
          message: string;
          read?: boolean;
          priority?: 'low' | 'medium' | 'high';
          icon?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      disease_detections: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          crop_type: string;
          disease: string;
          confidence: number;
          severity: 'low' | 'medium' | 'high';
          treatment: string[];
          recommendations: string[];
          created_at: string;
        };
        Insert: {
          user_id?: string;
          image_url: string;
          crop_type: string;
          disease: string;
          confidence: number;
          severity: 'low' | 'medium' | 'high';
          treatment?: string[];
          recommendations?: string[];
        };
        Update: {};
      };
      marketplace_listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          unit: string;
          category: 'produce' | 'inputs' | 'equipment' | 'services';
          location: string | null;
          image: string | null;
          rating: number;
          reviews: number;
          stock: number;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          unit: string;
          category: 'produce' | 'inputs' | 'equipment' | 'services';
          location?: string | null;
          image?: string | null;
          rating?: number;
          reviews?: number;
          stock?: number;
          verified?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          unit?: string;
          category?: 'produce' | 'inputs' | 'equipment' | 'services';
          location?: string | null;
          image?: string | null;
          rating?: number;
          reviews?: number;
          stock?: number;
          verified?: boolean;
        };
      };
      crop_prices: {
        Row: {
          id: string;
          name: string;
          price: number;
          unit: string;
          currency: string;
          change: number;
          change_percent: number;
          market: string;
          trend: 'up' | 'down' | 'stable';
          last_updated: string;
          created_at: string;
        };
        Insert: {
          name: string;
          price: number;
          unit?: string;
          currency?: string;
          change?: number;
          change_percent?: number;
          market?: string;
          trend?: 'up' | 'down' | 'stable';
          last_updated?: string;
        };
        Update: {
          name?: string;
          price?: number;
          unit?: string;
          currency?: string;
          change?: number;
          change_percent?: number;
          market?: string;
          trend?: 'up' | 'down' | 'stable';
          last_updated?: string;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Farm = Database['public']['Tables']['farms']['Row'];
export type Crop = Database['public']['Tables']['crops']['Row'];
export type Livestock = Database['public']['Tables']['livestock']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type DiseaseDetection = Database['public']['Tables']['disease_detections']['Row'];
export type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];
export type CropPrice = Database['public']['Tables']['crop_prices']['Row'];
