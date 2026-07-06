import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Farm Planner</h1>
          <p class="page-subtitle">Manage your farming schedule, tasks, and AI-powered recommendations</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="goToToday()"><mat-icon>today</mat-icon> Today</button>
          <button class="btn btn-primary" (click)="showAdd.set(true)"><mat-icon>add</mat-icon> Add Task</button>
        </div>
      </div>

      <!-- Add Task Modal -->
      @if (showAdd()) {
        <div class="modal-overlay" (click)="showAdd.set(false)">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Add New Task</h3>
              <button class="icon-btn" (click)="showAdd.set(false)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="modal-body">
              <div class="field-group">
                <label>Task Title</label>
                <input class="input-field" [(ngModel)]="newTask.title" placeholder="e.g. Apply fertilizer to maize field" />
              </div>
              <div class="field-row-3">
                <div class="field-group">
                  <label>Category</label>
                  <select class="input-field" [(ngModel)]="newTask.category">
                    <option value="planting">Planting</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="harvesting">Harvesting</option>
                    <option value="spraying">Spraying</option>
                    <option value="fertilizing">Fertilizing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>Priority</label>
                  <select class="input-field" [(ngModel)]="newTask.priority">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>Due Date</label>
                  <input class="input-field" type="date" [(ngModel)]="newTask.due_date" />
                </div>
              </div>
              <div class="field-group">
                <label>Notes (optional)</label>
                <textarea class="input-field" rows="2" placeholder="Additional details..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="showAdd.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="addTask()"><mat-icon>add</mat-icon> Add Task</button>
            </div>
          </div>
        </div>
      }

      <div class="planner-layout">
        <!-- Main Calendar Area -->
        <div class="calendar-main">
          <div class="card calendar-card">
            <div class="calendar-toolbar">
              <button class="nav-btn" (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
              <h2 class="calendar-title">{{ monthYear() }}</h2>
              <button class="nav-btn" (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
            </div>
            <div class="cal-weekdays">
              @for (d of weekDays; track d) {
                <div class="weekday-cell">{{ d }}</div>
              }
            </div>
            <div class="cal-grid">
              @for (day of calendarDays(); track day.date) {
                <div class="cal-cell" [class.other-month]="!day.currentMonth" [class.today]="day.isToday" [class.selected]="day.date === selectedDate()" (click)="selectDate(day)">
                  <span class="cal-day-num">{{ day.day }}</span>
                  @if (day.tasks.length > 0) {
                    <div class="cal-tasks">
                      @for (t of day.tasks.slice(0, 2); track t.id) {
                        <div class="cal-task-pill {{ categoryClass(t.category) }}" [matTooltip]="t.title">{{ t.title }}</div>
                      }
                      @if (day.tasks.length > 2) {
                        <div class="cal-task-more">+{{ day.tasks.length - 2 }} more</div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Week Tasks Overview -->
          <div class="week-overview card">
            <div class="section-header">
              <h3><mat-icon>event_note</mat-icon> This Week's Tasks</h3>
              <span class="badge badge-neutral">{{ weekTasks().length }} tasks</span>
            </div>
            <div class="week-tasks-grid">
              @for (day of weekDaysWithTasks(); track day.date) {
                <div class="day-column">
                  <div class="day-header" [class.today]="day.isToday">
                    <span class="day-name">{{ day.dayName }}</span>
                    <span class="day-num">{{ day.dayNum }}</span>
                  </div>
                  <div class="day-tasks">
                    @for (t of day.tasks; track t.id) {
                      <div class="week-task {{ categoryClass(t.category) }}">
                        <span class="task-dot"></span>
                        <div class="task-content">
                          <span class="task-title">{{ t.title }}</span>
                          <span class="task-time">Due {{ t.due_date }}</span>
                        </div>
                      </div>
                    }
                    @if (day.tasks.length === 0) {
                      <div class="no-tasks">No tasks</div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="planner-sidebar">
          <!-- Selected Day Details -->
          <div class="card selected-day-card">
            <div class="selected-header">
              <div class="selected-date-display">
                <span class="selected-day-name">{{ selectedDayName() }}</span>
                <span class="selected-day-date">{{ selectedDayFormatted() }}</span>
              </div>
              <button class="btn btn-sm btn-outline" (click)="showAdd.set(true)"><mat-icon>add</mat-icon></button>
            </div>
            <div class="selected-tasks">
              @if (selectedDayTasks().length > 0) {
                @for (t of selectedDayTasks(); track t.id) {
                  <div class="selected-task-item">
                    <button class="task-status-btn {{ statusClass(t.status) }}" (click)="cycleStatus(t.id)">
                      <mat-icon>{{ statusIcon(t.status) }}</mat-icon>
                    </button>
                    <div class="task-details">
                      <span class="task-name">{{ t.title }}</span>
                      <div class="task-meta">
                        <span class="badge {{ categoryBadge(t.category) }}" style="font-size:10px">{{ t.category }}</span>
                        <span class="badge {{ priorityBadge(t.priority) }}" style="font-size:10px">{{ t.priority }}</span>
                      </div>
                    </div>
                    <button class="icon-btn-sm" (click)="deleteTask(t.id)"><mat-icon>delete_outline</mat-icon></button>
                  </div>
                }
              } @else {
                <div class="no-selected-tasks">
                  <mat-icon>event_available</mat-icon>
                  <p>No tasks for this day</p>
                </div>
              }
            </div>
          </div>

          <!-- AI Suggestions -->
          <div class="card ai-card">
            <div class="ai-header">
              <div class="icon-wrap icon-wrap-primary" style="width:36px;height:36px;font-size:18px"><mat-icon>psychology</mat-icon></div>
              <div>
                <h4>AI Planner</h4>
                <span style="font-size:11px;color:var(--text-muted)">Smart suggestions</span>
              </div>
            </div>
            <div class="ai-suggestions">
              @for (s of aiSuggestions; track s.title) {
                <div class="ai-suggestion-item">
                  <div class="suggestion-icon {{ s.iconClass }}"><mat-icon>{{ s.icon }}</mat-icon></div>
                  <div class="suggestion-content">
                    <span class="suggestion-title">{{ s.title }}</span>
                    <span class="suggestion-desc">{{ s.desc }}</span>
                  </div>
                  <button class="btn btn-sm btn-ghost" (click)="addAiSuggestion(s.title)"><mat-icon>add</mat-icon></button>
                </div>
              }
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card stats-card">
            <h4 style="font-size:13px;font-weight:700;margin-bottom:14px">Task Summary</h4>
            <div class="stat-row">
              <span class="stat-stat">
                <span class="stat-val stat-pending">{{ pendingCount() }}</span>
                <span class="stat-label">Pending</span>
              </span>
              <span class="stat-stat">
                <span class="stat-val stat-progress">{{ inProgressCount() }}</span>
                <span class="stat-label">In Progress</span>
              </span>
              <span class="stat-stat">
                <span class="stat-val stat-done">{{ doneCount() }}</span>
                <span class="stat-label">Done</span>
              </span>
            </div>
            <div class="progress-bar-track" style="margin-top:12px;height:8px;border-radius:4px">
              <div class="progress-bar-fill" [style.width]="completionRate() + '%'" style="background:var(--primary)"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px">
              <span style="font-size:11px;color:var(--text-muted)">{{ completionRate().toFixed(0) }}% completed</span>
              <span style="font-size:11px;color:var(--text-muted)">{{ totalTasks() }} total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 10px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-card { width: 100%; max-width: 520px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .modal-header h3 { font-size: 18px; font-weight: 700; }
    .modal-body { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .field-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .field-group label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-light); padding-top: 16px; }
    .planner-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }

    /* Calendar */
    .calendar-card { overflow: hidden; }
    .calendar-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-light); }
    .calendar-title { font-size: 18px; font-weight: 700; font-family: 'Poppins', sans-serif; }
    .nav-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition); }
    .nav-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    .nav-btn mat-icon { font-size: 20px; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); padding: 12px 16px; background: var(--bg-subtle); border-bottom: 1px solid var(--border-light); }
    .weekday-cell { text-align: center; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
    .cal-cell { min-height: 100px; padding: 8px; border-right: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background var(--transition); }
    .cal-cell:nth-child(7n) { border-right: none; }
    .cal-cell:hover { background: rgba(46,125,50,0.04); }
    .cal-cell.other-month { background: var(--bg-subtle); opacity: 0.5; }
    .cal-cell.today { background: rgba(46,125,50,0.08); }
    .cal-cell.selected { background: rgba(46,125,50,0.12); }
    .cal-day-num { font-size: 13px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px; }
    .cal-cell.today .cal-day-num { color: var(--primary); }
    .cal-tasks { display: flex; flex-direction: column; gap: 2px; }
    .cal-task-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cal-task-pill.planting { background: rgba(76,175,80,0.15); color: #2E7D32; }
    .cal-task-pill.irrigation { background: rgba(33,150,243,0.15); color: #1976D2; }
    .cal-task-pill.harvesting { background: rgba(255,152,0,0.15); color: #EF6C00; }
    .cal-task-pill.spraying { background: rgba(156,39,176,0.15); color: #7B1FA2; }
    .cal-task-pill.fertilizing { background: rgba(121,85,72,0.15); color: #5D4037; }
    .cal-task-pill.other { background: rgba(107,114,128,0.15); color: #6B7280; }
    .cal-task-more { font-size: 9px; color: var(--text-muted); padding: 1px 6px; }

    /* Week Overview */
    .week-overview { margin-top: 24px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
    .section-header h3 mat-icon { font-size: 18px; color: var(--primary); }
    .week-tasks-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
    .day-column { min-height: 180px; }
    .day-header { text-align: center; padding: 10px; border-radius: var(--radius-sm); margin-bottom: 10px; background: var(--bg-subtle); }
    .day-header.today { background: var(--primary); }
    .day-header.today .day-name, .day-header.today .day-num { color: #fff; }
    .day-name { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; }
    .day-num { font-size: 18px; font-weight: 700; font-family: 'Poppins', sans-serif; display: block; margin-top: 2px; }
    .day-tasks { display: flex; flex-direction: column; gap: 6px; }
    .week-task { padding: 8px; border-radius: var(--radius-sm); border-left: 3px solid var(--border); background: var(--bg-subtle); }
    .week-task.planting { border-left-color: #4CAF50; }
    .week-task.irrigation { border-left-color: #2196F3; }
    .week-task.harvesting { border-left-color: #FF9800; }
    .week-task.spraying { border-left-color: #9C27B0; }
    .week-task.fertilizing { border-left-color: #795548; }
    .week-task { display: flex; align-items: flex-start; gap: 6px; }
    .task-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 5px; }
    .task-content { flex: 1; min-width: 0; }
    .task-title { font-size: 12px; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-time { font-size: 10px; color: var(--text-muted); }
    .no-tasks { font-size: 11px; color: var(--text-muted); text-align: center; padding: 12px 0; }

    /* Sidebar */
    .selected-day-card { margin-bottom: 16px; }
    .selected-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); }
    .selected-day-name { font-size: 18px; font-weight: 700; display: block; margin-bottom: 2px; }
    .selected-day-date { font-size: 13px; color: var(--text-muted); }
    .selected-tasks { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
    .selected-task-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .task-status-btn { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all var(--transition); }
    .task-status-btn.done { background: var(--success); border-color: var(--success); color: #fff; }
    .task-status-btn.progress { background: var(--warning); border-color: var(--warning); color: #fff; }
    .task-status-btn mat-icon { font-size: 14px; }
    .task-details { flex: 1; min-width: 0; }
    .task-name { font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px; }
    .task-meta { display: flex; gap: 4px; }
    .icon-btn-sm { width: 28px; height: 28px; border-radius: 6px; border: none; background: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all var(--transition); }
    .icon-btn-sm:hover { background: rgba(239,68,68,0.1); color: var(--danger); }
    .icon-btn-sm mat-icon { font-size: 16px; }
    .no-selected-tasks { text-align: center; padding: 24px; color: var(--text-muted); }
    .no-selected-tasks mat-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.5; }
    .no-selected-tasks p { font-size: 13px; }

    /* AI Card */
    .ai-card { margin-bottom: 16px; }
    .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ai-header h4 { font-size: 14px; font-weight: 700; }
    .ai-suggestions { display: flex; flex-direction: column; gap: 8px; }
    .ai-suggestion-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .suggestion-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .suggestion-icon.water { background: rgba(33,150,243,0.15); color: #1976D2; }
    .suggestion-icon.bug { background: rgba(156,39,176,0.15); color: #9C27B0; }
    .suggestion-icon.fert { background: rgba(121,85,72,0.15); color: #5D4037; }
    .suggestion-icon mat-icon { font-size: 16px; }
    .suggestion-content { flex: 1; }
    .suggestion-title { font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px; }
    .suggestion-desc { font-size: 11px; color: var(--text-muted); }

    /* Stats Card */
    .stats-card { }
    .stat-row { display: flex; justify-content: space-between; }
    .stat-stat { text-align: center; }
    .stat-val { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 800; display: block; }
    .stat-pending { color: var(--warning); }
    .stat-progress { color: #2196F3; }
    .stat-done { color: var(--success); }
    .stat-label { font-size: 11px; color: var(--text-muted); }

    @media (max-width: 1200px) {
      .planner-layout { grid-template-columns: 1fr; }
      .week-tasks-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 768px) {
      .cal-cell { min-height: 70px; padding: 4px; }
      .cal-task-pill { font-size: 9px; padding: 1px 4px; }
      .week-tasks-grid { grid-template-columns: repeat(2, 1fr); }
      .field-row-3 { grid-template-columns: 1fr; }
    }
  `],
})
export class PlannerComponent {
  state = inject(AppStateService);
  showAdd = signal(false);
  currentMonth = signal(new Date());
  selectedDate = signal<string>(this.formatDate(new Date()));

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  newTask = { title: '', category: 'other', priority: 'medium', due_date: '' };

  categoryColors: Record<string, string> = {
    planting: 'badge-success', irrigation: 'badge-info', harvesting: 'badge-warning',
    spraying: 'badge-purple', fertilizing: 'badge-brown', other: 'badge-neutral',
  };

  tasks$ = this.state.tasks;

  totalTasks = computed(() => this.state.tasks().length);
  pendingCount = computed(() => this.state.tasks().filter(t => t.status === 'pending').length);
  inProgressCount = computed(() => this.state.tasks().filter(t => t.status === 'in-progress').length);
  doneCount = computed(() => this.state.tasks().filter(t => t.status === 'done').length);
  completionRate = computed(() => this.totalTasks() > 0 ? (this.doneCount() / this.totalTasks()) * 100 : 0);

  monthYear() {
    return this.currentMonth().toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }

  goToToday() {
    this.currentMonth.set(new Date());
    this.selectedDate.set(this.formatDate(new Date()));
  }

  prevMonth() {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() - 1);
    this.currentMonth.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    this.currentMonth.set(d);
  }

  calendarDays() {
    const m = this.currentMonth();
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const last = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const days: { day: number; date: string; isToday: boolean; currentMonth: boolean; tasks: any[] }[] = [];
    const today = new Date();
    const tasks = this.state.tasks();

    // Previous month days
    for (let i = 0; i < first.getDay(); i++) {
      const prevDay = new Date(m.getFullYear(), m.getMonth(), -first.getDay() + i + 1);
      days.push({
        day: prevDay.getDate(),
        date: this.formatDate(prevDay),
        isToday: false,
        currentMonth: false,
        tasks: []
      });
    }

    // Current month days
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d);
      const dateStr = this.formatDate(date);
      const dayTasks = tasks.filter(t => t.due_date === dateStr);
      days.push({
        day: d,
        date: dateStr,
        isToday: date.toDateString() === today.toDateString(),
        currentMonth: true,
        tasks: dayTasks
      });
    }

    // Next month days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDay = new Date(m.getFullYear(), m.getMonth() + 1, i);
      days.push({
        day: nextDay.getDate(),
        date: this.formatDate(nextDay),
        isToday: false,
        currentMonth: false,
        tasks: []
      });
    }

    return days;
  }

  weekDaysWithTasks() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days = [];
    const tasks = this.state.tasks();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = this.formatDate(date);
      days.push({
        date: dateStr,
        dayName: dayNames[i],
        dayNum: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        tasks: tasks.filter(t => t.due_date === dateStr)
      });
    }
    return days;
  }

  weekTasks() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.state.tasks().filter(t => {
      const d = new Date(t.due_date);
      return d >= startOfWeek && d <= endOfWeek;
    });
  }

  selectDate(day: any) {
    this.selectedDate.set(day.date);
  }

  selectedDayTasks() {
    return this.state.tasks().filter(t => t.due_date === this.selectedDate());
  }

  selectedDayName() {
    const d = new Date(this.selectedDate());
    return d.toLocaleDateString('en', { weekday: 'long' });
  }

  selectedDayFormatted() {
    const d = new Date(this.selectedDate());
    return d.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cycleStatus(id: string) {
    const cycle: Record<string, string> = { pending: 'in-progress', 'in-progress': 'done', done: 'pending' };
    this.state.tasks.update(ts => ts.map(t => t.id === id ? { ...t, status: cycle[t.status] as any } : t));
  }

  async deleteTask(id: string) {
    await this.state.deleteTask(id);
  }

  async addTask() {
    if (!this.newTask.title || !this.newTask.due_date) return;
    await this.state.createTask({
      title: this.newTask.title,
      category: this.newTask.category as any,
      priority: this.newTask.priority as any,
      due_date: this.newTask.due_date,
      status: 'pending',
      description: ''
    });
    this.newTask = { title: '', category: 'other', priority: 'medium', due_date: '' };
    this.showAdd.set(false);
  }

  async addAiSuggestion(title: string) {
    await this.state.createTask({
      title,
      category: 'other',
      priority: 'medium',
      due_date: this.formatDate(new Date()),
      status: 'pending',
      description: ''
    });
  }

  categoryClass(c: string) { return c; }
  categoryBadge(c: string) { return this.categoryColors[c] || 'badge-neutral'; }
  priorityBadge(p: string) {
    const m: Record<string, string> = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-neutral' };
    return m[p] || 'badge-neutral';
  }
  statusClass(s: string) { return s === 'done' ? 'done' : s === 'in-progress' ? 'progress' : ''; }
  statusIcon(s: string) { return s === 'done' ? 'check' : s === 'in-progress' ? 'pending' : 'radio_button_unchecked'; }

  aiSuggestions = [
    { icon: 'water_drop', title: 'Irrigate maize field', desc: 'Weather shows no rain for 5 days', iconClass: 'water' },
    { icon: 'bug_report', title: 'Apply pesticide to tomatoes', desc: 'Early blight risk elevated', iconClass: 'bug' },
    { icon: 'compost', title: 'Top-dress with LAN fertilizer', desc: 'Maize at V6 stage', iconClass: 'fert' },
  ];
}
