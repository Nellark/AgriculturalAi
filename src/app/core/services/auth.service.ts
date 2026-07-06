import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { supabase, type Profile } from '../supabase/supabase.client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _state = signal<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  readonly user = computed(() => this._state().user);
  readonly profile = computed(() => this._state().profile);
  readonly session = computed(() => this._state().session);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly isAuthenticated = computed(() => !!this._state().session);

  constructor(private router: Router) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      this._state.update(s => ({ ...s, loading: false, error: error.message }));
      return;
    }

    if (session) {
      await this.loadProfile(session.user.id);
      this._state.update(s => ({
        ...s,
        session,
        user: session.user,
        loading: false
      }));
    } else {
      this._state.update(s => ({ ...s, loading: false }));
    }

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session) {
          await this.loadProfile(session.user.id);
          this._state.update(s => ({
            ...s,
            session,
            user: session.user,
            loading: false,
            error: null
          }));
        } else if (event === 'SIGNED_OUT') {
          this._state.update(s => ({
            ...s,
            session: null,
            user: null,
            profile: null,
            loading: false
          }));
        }
      })();
    });
  }

  private async loadProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    this._state.update(s => ({ ...s, profile }));
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    this._state.update(s => ({ ...s, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      this._state.update(s => ({ ...s, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { success: true };
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this._state.update(s => ({ ...s, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      this._state.update(s => ({ ...s, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.router.navigate(['/']);
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    const userId = this._state().user?.id;
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await this.loadProfile(userId);
    return { success: true };
  }

  clearError() {
    this._state.update(s => ({ ...s, error: null }));
  }
}
