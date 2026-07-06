import { Injectable, signal, computed } from '@angular/core';
import { supabase, type Task } from '../supabase/supabase.client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly tasks = computed(() => this._tasks());
  readonly pendingTasks = computed(() => this._tasks().filter(t => t.status === 'pending'));
  readonly completedTasks = computed(() => this._tasks().filter(t => t.status === 'done'));
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  constructor(private authService: AuthService) {}

  async loadTasks(): Promise<void> {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this._loading.set(true);
    this._error.set(null);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      this._error.set(error.message);
    } else {
      this._tasks.set(data || []);
    }

    this._loading.set(false);
  }

  async createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data?: Task; error?: string }> {
    this._loading.set(true);

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      this._error.set(error.message);
      this._loading.set(false);
      return { error: error.message };
    }

    this._tasks.update(tasks => [...tasks, data]);
    this._loading.set(false);
    return { data };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      this._error.set(error.message);
      return { success: false, error: error.message };
    }

    this._tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );

    return { success: true };
  }

  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      this._error.set(error.message);
      return { success: false, error: error.message };
    }

    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
    return { success: true };
  }

  async toggleTaskStatus(id: string): Promise<{ success: boolean; error?: string }> {
    const task = this._tasks().find(t => t.id === id);
    if (!task) return { success: false, error: 'Task not found' };

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    return this.updateTask(id, { status: newStatus });
  }

  clearError() {
    this._error.set(null);
  }
}
