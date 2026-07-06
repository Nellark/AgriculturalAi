import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../core/services/app-state.service';
import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, RouterLink, MatIconModule],
  template: `
    <div class="dashboard-root">

      <!-- ── Weather Hero Card ── -->
      <div class="weather-hero">
        <div class="wh-bg"></div>
        <div class="wh-content">
          <div class="wh-left">
            <div class="wh-forecast-badge">
              <mat-icon>location_on</mat-icon>
              LOCAL FORECAST &middot; FARMING
            </div>
            <h2 class="wh-title">Your crops are thriving today.</h2>
            <p class="wh-sub">AI analysis shows optimal growing conditions across your farm. Keep up the great work!</p>
            <div class="wh-meta-row">
              <div class="wh-temp">
                <mat-icon>wb_sunny</mat-icon>
                <span class="temp-num">{{ state.weather()?.temperature }}°C</span>
                <span class="temp-label">{{ state.weather()?.condition }}</span>
              </div>
              <div class="wh-meta-item">
                <mat-icon>water_drop</mat-icon>
                {{ state.weather()?.humidity }}% Humidity
              </div>
              <div class="wh-meta-item">
                <mat-icon>air</mat-icon>
                {{ state.weather()?.windSpeed }} km/h
              </div>
              <div class="wh-meta-item">
                <mat-icon>location_on</mat-icon>
                {{ state.weather()?.location }}
              </div>
            </div>
          </div>
          <div class="wh-right">
            <div class="wh-forecast-strip">
              @for (day of state.weather()?.forecast?.slice(0,5); track day.day) {
                <div class="wf-day">
                  <span class="wf-name">{{ day.day }}</span>
                  <mat-icon class="wf-icon">{{ day.icon }}</mat-icon>
                  <span class="wf-hi">{{ day.high }}°</span>
                  <span class="wf-lo">{{ day.low }}°</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main Dashboard Grid ── -->
      <div class="main-grid">

        <!-- ── Left Column ── -->
        <div class="left-col">

          <!-- Tips for Today -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Tips for Today</h3>
              <a routerLink="/app/ai-assistant" class="sc-link">Ask AI</a>
            </div>
            <div class="tips-list">
              @for (tip of todaysTips; track tip.title) {
                <div class="tip-item">
                  <div class="tip-icon" [ngClass]="tip.iconClass">
                    <mat-icon>{{ tip.icon }}</mat-icon>
                  </div>
                  <div class="tip-body">
                    <span class="tip-title">{{ tip.title }}</span>
                    <span class="tip-desc">{{ tip.desc }}</span>
                  </div>
                  <a routerLink="/app/ai-assistant" class="tip-more">More →</a>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Quick Actions</h3>
            </div>
            <div class="qa-grid">
              @for (qa of quickActions; track qa.label) {
                <a class="qa-btn" [routerLink]="qa.route">
                  <div class="qa-icon-wrap" [ngClass]="qa.iconClass">
                    <mat-icon>{{ qa.icon }}</mat-icon>
                  </div>
                  <span class="qa-label">{{ qa.label }}</span>
                </a>
              }
            </div>
          </div>

          <!-- Field Health -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Field Health</h3>
              <a routerLink="/app/farm" class="sc-link">See All</a>
            </div>

            <!-- Alert Banner -->
            <div class="field-alert">
              <mat-icon>warning_amber</mat-icon>
              <div class="fa-text">
                <strong>Field Alert:</strong>
                Low soil moisture detected in East Basin (3a). Immediately increase irrigation frequency.
              </div>
            </div>

            <div class="crop-health-grid">
              @for (crop of state.farm()?.crops?.slice(0,4); track crop.id) {
                <div class="crop-health-card">
                  <div class="chc-header">
                    <div class="chc-icon icon-primary">
                      <mat-icon>{{ crop.icon }}</mat-icon>
                    </div>
                    <div class="chc-info">
                      <span class="chc-name">{{ crop.name }}</span>
                      <span class="chc-area">{{ crop.area }} {{ crop.area_unit }}</span>
                    </div>
                    <div class="chc-score" [style.color]="healthColor(crop.health_score)">
                      {{ crop.health_score }}%
                    </div>
                  </div>
                  <div class="chc-bar-track">
                    <div class="chc-bar-fill" [style.width]="crop.health_score + '%'" [style.background]="healthColor(crop.health_score)"></div>
                  </div>
                  <div class="chc-status-row">
                    <span class="badge" [ngClass]="statusBadge(crop.status)">{{ crop.status }}</span>
                    <span class="chc-harvest">Harvest: {{ crop.expected_harvest_date | date:'MMM d' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Market Snapshot -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Market / Prices</h3>
              <a routerLink="/app/market-prices" class="sc-link">View All →</a>
            </div>
            <div class="market-table">
              <div class="mt-header">
                <span>Commodity</span>
                <span>Price</span>
                <span>Change</span>
                <span>Trend</span>
              </div>
              @for (price of state.prices().slice(0,5); track price.id) {
                <div class="mt-row">
                  <span class="mt-name">{{ price.name }}</span>
                  <span class="mt-price">R{{ price.price < 100 ? price.price.toFixed(2) : price.price.toLocaleString() }}/{{ price.unit }}</span>
                  <span class="mt-change" [class.up]="price.trend === 'up'" [class.down]="price.trend === 'down'">
                    {{ price.change_percent > 0 ? '+' : '' }}{{ price.change_percent }}%
                  </span>
                  <div class="mt-trend-bar">
                    <div class="mt-bar" [class.up]="price.trend === 'up'" [class.down]="price.trend === 'down'" [style.width]="Math.abs(price.change_percent) * 8 + 20 + 'px'"></div>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- ── Right Column ── -->
        <div class="right-col">

          <!-- Weekly Planner -->
          <div class="section-card planner-card">
            <div class="sc-header">
              <h3 class="sc-title">Weekly Planner</h3>
              <a routerLink="/app/planner" class="sc-btn-sm">Save Draft</a>
            </div>

            <!-- Calendar Grid -->
            <div class="planner-cal">
              <div class="cal-week-header">
                @for (d of weekDays; track d) {
                  <span>{{ d }}</span>
                }
              </div>
              <div class="cal-days-grid">
                @for (day of calendarDays(); track day.num) {
                  <div class="cal-day" [class.today]="day.isToday" [class.has-task]="day.hasTask">
                    <span>{{ day.num }}</span>
                    @if (day.hasTask) {
                      <div class="cal-task-dot"></div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Tasks for Today -->
            <div class="planner-tasks">
              @for (task of state.tasks().slice(0,3); track task.id) {
                <div class="planner-task-item">
                  <div class="pti-left">
                    <div class="pti-dot" [ngClass]="priorityDot(task.priority)"></div>
                    <div class="pti-info">
                      <span class="pti-title">{{ task.title }}</span>
                      <span class="pti-field">{{ task.category | titlecase }}</span>
                    </div>
                  </div>
                  <span class="pti-status" [ngClass]="task.status === 'done' ? 'status-done' : 'status-pending'">
                    {{ task.status === 'done' ? 'Done' : 'Pending' }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Recent Identifications -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Recent Identifications</h3>
              <a routerLink="/app/disease-detection" class="sc-link">See All</a>
            </div>
            <div class="detections-grid">
              @for (d of recentDetections(); track d.id) {
                <div class="detection-card">
                  <div class="dc-img-placeholder">
                    <mat-icon>biotech</mat-icon>
                  </div>
                  <div class="dc-info">
                    <span class="dc-disease">{{ d.disease }}</span>
                    <span class="dc-crop">{{ d.crop_type }}</span>
                    <div class="dc-confidence">
                      <span class="dc-conf-val">{{ d.confidence }}%</span>
                      <span class="dc-conf-label">confidence</span>
                    </div>
                  </div>
                </div>
              }
              @if (recentDetections().length === 0) {
                <div class="empty-state">
                  <mat-icon>biotech</mat-icon>
                  <span>No disease detections yet</span>
                  <a routerLink="/app/disease-detection" class="btn btn-primary btn-sm">Start Scanning</a>
                </div>
              }
            </div>
          </div>

          <!-- AI Field Forecast -->
          <div class="section-card forecast-card">
            <div class="sc-header">
              <h3 class="sc-title">AI Field Forecast</h3>
              <a routerLink="/app/yield-forecast" class="sc-link">View Report</a>
            </div>
            <div class="forecast-body">
              @for (f of fieldForecasts(); track f.crop) {
                <div class="ff-item">
                  <div class="ff-left">
                    <span class="ff-crop">{{ f.crop }}</span>
                    <span class="ff-status">{{ f.status }}</span>
                  </div>
                  <div class="ff-bar-area">
                    <div class="ff-bar-track">
                      <div class="ff-bar-fill" [style.width]="f.progress + '%'" [ngClass]="f.colorClass"></div>
                    </div>
                    <span class="ff-val">{{ f.progress }}%</span>
                  </div>
                </div>
              }
              @if (fieldForecasts().length === 0) {
                <div class="empty-state small">
                  <span>Add crops to your farm to see forecasts</span>
                </div>
              }
            </div>
            <div class="forecast-tip">
              <mat-icon>psychology</mat-icon>
              <span>Based on current data, you can expect a <strong>+18% yield increase</strong> this season. Keep up your irrigation schedule.</span>
            </div>
          </div>

          <!-- Recent Alerts -->
          <div class="section-card">
            <div class="sc-header">
              <h3 class="sc-title">Recent Alerts</h3>
              <span class="badge-danger-sm">{{ state.unreadNotifications() }} new</span>
            </div>
            <div class="alerts-list">
              @for (n of state.notifications().slice(0,3); track n.id) {
                <div class="alert-item" [class.unread]="!n.read">
                  <div class="alert-icon" [ngClass]="alertIconClass(n.type)">
                    <mat-icon>{{ n.icon }}</mat-icon>
                  </div>
                  <div class="alert-body">
                    <span class="alert-title">{{ n.title }}</span>
                    <span class="alert-msg">{{ n.message.slice(0,65) }}...</span>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-root {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Weather Hero ── */
    .weather-hero {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: linear-gradient(135deg, #0f2d1c 0%, #1B4332 55%, #2E7D32 100%);
    }
    .wh-bg {
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .wh-content {
      position: relative;
      z-index: 1;
      padding: 28px 32px;
      display: flex;
      align-items: center;
      gap: 40px;
      flex-wrap: wrap;
    }
    .wh-left { flex: 1; min-width: 280px; }
    .wh-forecast-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(200,227,106,0.15);
      border: 1px solid rgba(200,227,106,0.25);
      color: #C8E36A;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .wh-forecast-badge mat-icon { font-size: 13px; }
    .wh-title {
      font-family: 'Poppins', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    .wh-sub { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 16px; max-width: 480px; }
    .wh-meta-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .wh-temp {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      padding: 6px 14px;
      border-radius: 99px;
    }
    .wh-temp mat-icon { font-size: 18px; color: #C8E36A; }
    .temp-num { font-size: 20px; font-weight: 800; color: #fff; font-family: 'Poppins', sans-serif; }
    .temp-label { font-size: 12px; color: rgba(255,255,255,0.7); }
    .wh-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12.5px;
      color: rgba(255,255,255,0.75);
    }
    .wh-meta-item mat-icon { font-size: 14px; color: rgba(255,255,255,0.5); }
    .wh-right { flex-shrink: 0; }
    .wh-forecast-strip {
      display: flex;
      gap: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 12px;
    }
    .wf-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .wf-day:hover { background: rgba(255,255,255,0.1); }
    .wf-name { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; }
    .wf-icon { font-size: 20px; color: rgba(255,255,255,0.9); width: 20px; height: 20px; }
    .wf-hi { font-size: 13px; font-weight: 700; color: #fff; }
    .wf-lo { font-size: 11px; color: rgba(255,255,255,0.5); }

    /* ── Main Grid ── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    .left-col { display: flex; flex-direction: column; gap: 24px; }
    .right-col { display: flex; flex-direction: column; gap: 24px; }

    /* ── Section Card ── */
    .section-card {
      background: #fff;
      border-radius: 16px;
      padding: 22px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .sc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .sc-title {
      font-size: 15px;
      font-weight: 700;
      color: #1B3A2D;
    }
    .sc-link {
      font-size: 12.5px;
      font-weight: 600;
      color: #2E7D32;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .sc-link:hover { opacity: 0.7; text-decoration: none; }
    .sc-btn-sm {
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      background: #1B3A2D;
      padding: 5px 12px;
      border-radius: 6px;
      text-decoration: none;
    }
    .sc-btn-sm:hover { background: #2E7D32; text-decoration: none; }

    /* ── Tips ── */
    .tips-list { display: flex; flex-direction: column; gap: 10px; }
    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #f3f4f6;
      transition: border-color 0.2s, background 0.2s;
    }
    .tip-item:hover { border-color: #d1e8d1; background: #f8fcf8; }
    .tip-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tip-icon mat-icon { font-size: 18px; }
    .icon-primary { background: rgba(46,125,50,0.1); color: #2E7D32; }
    .icon-warning { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .icon-danger { background: rgba(239,68,68,0.1); color: #EF4444; }
    .icon-info { background: rgba(59,130,246,0.1); color: #3B82F6; }
    .icon-accent { background: rgba(200,227,106,0.2); color: #6B8A2D; }
    .tip-body { flex: 1; }
    .tip-title { display: block; font-size: 13.5px; font-weight: 600; color: #1B3A2D; margin-bottom: 3px; }
    .tip-desc { font-size: 12.5px; color: #666; line-height: 1.5; }
    .tip-more {
      font-size: 12px;
      font-weight: 600;
      color: #2E7D32;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── Quick Actions ── */
    .qa-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .qa-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border-radius: 12px;
      background: #f8f9f6;
      border: 1px solid #e5e7eb;
      text-decoration: none;
      color: #444;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      transition: all 0.2s;
    }
    .qa-btn:hover {
      background: #f0f7f0;
      border-color: #c8e0c8;
      color: #1B3A2D;
      transform: translateY(-2px);
      text-decoration: none;
    }
    .qa-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qa-icon-wrap mat-icon { font-size: 22px; }
    .qa-label { font-size: 11.5px; font-weight: 600; color: #555; }
    .qa-btn:hover .qa-label { color: #1B3A2D; }

    /* ── Field Alert ── */
    .field-alert {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(245,158,11,0.08);
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #92400e;
    }
    .field-alert mat-icon { font-size: 18px; color: #F59E0B; flex-shrink: 0; margin-top: 1px; }
    .fa-text { line-height: 1.55; }

    /* ── Crop Health ── */
    .crop-health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .crop-health-card {
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      transition: border-color 0.2s;
    }
    .crop-health-card:hover { border-color: #c8e0c8; }
    .chc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .chc-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-primary { background: rgba(46,125,50,0.1); color: #2E7D32; }
    .chc-icon mat-icon { font-size: 18px; }
    .chc-info { flex: 1; }
    .chc-name { display: block; font-size: 13.5px; font-weight: 700; color: #1B3A2D; }
    .chc-area { font-size: 11.5px; color: #888; }
    .chc-score {
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 800;
    }
    .chc-bar-track {
      height: 4px;
      background: #e5e7eb;
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .chc-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s; }
    .chc-status-row { display: flex; align-items: center; justify-content: space-between; }
    .chc-harvest { font-size: 11px; color: #888; }

    /* ── Badges ── */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-info { background: rgba(59,130,246,0.1); color: #1d4ed8; }
    .badge-success { background: rgba(34,197,94,0.1); color: #15803d; }
    .badge-primary { background: rgba(46,125,50,0.1); color: #2E7D32; }
    .badge-neutral { background: #f3f4f6; color: #6b7280; }
    .badge-warning { background: rgba(245,158,11,0.1); color: #d97706; }
    .badge-danger-sm {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }

    /* ── Market Table ── */
    .market-table { display: flex; flex-direction: column; }
    .mt-header {
      display: grid;
      grid-template-columns: 1fr 1fr 80px 80px;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 4px;
    }
    .mt-row {
      display: grid;
      grid-template-columns: 1fr 1fr 80px 80px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .mt-row:hover { background: #f8f9f6; }
    .mt-name { font-size: 13.5px; font-weight: 500; color: #1B3A2D; }
    .mt-price { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .mt-change { font-size: 12.5px; font-weight: 700; }
    .mt-change.up { color: #16a34a; }
    .mt-change.down { color: #dc2626; }
    .mt-trend-bar { display: flex; align-items: center; }
    .mt-bar { height: 5px; border-radius: 99px; min-width: 16px; transition: width 0.4s; }
    .mt-bar.up { background: #16a34a; }
    .mt-bar.down { background: #dc2626; }

    /* ── Planner ── */
    .planner-cal { margin-bottom: 16px; }
    .cal-week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      margin-bottom: 6px;
    }
    .cal-week-header span {
      text-align: center;
      font-size: 10.5px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
    }
    .cal-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .cal-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 12px;
      color: #555;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .cal-day span { line-height: 1; margin-bottom: 2px; }
    .cal-day:hover { background: #f0f7f0; color: #1B3A2D; }
    .cal-day.today { background: #1B3A2D; color: #C8E36A; font-weight: 700; }
    .cal-day.has-task { color: #2E7D32; font-weight: 600; }
    .cal-task-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #2E7D32;
    }
    .cal-day.today .cal-task-dot { background: #C8E36A; }

    /* ── Planner Tasks ── */
    .planner-tasks { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #f3f4f6; padding-top: 14px; }
    .planner-task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }
    .pti-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .pti-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-high { background: #ef4444; }
    .dot-medium { background: #f59e0b; }
    .dot-low { background: #6b7280; }
    .pti-info { min-width: 0; }
    .pti-title { display: block; font-size: 12.5px; font-weight: 600; color: #1B3A2D; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pti-field { font-size: 11px; color: #888; }
    .pti-status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; flex-shrink: 0; margin-left: 8px; }
    .status-done { background: rgba(34,197,94,0.1); color: #15803d; }
    .status-pending { background: rgba(245,158,11,0.1); color: #d97706; }

    /* ── Detections ── */
    .detections-grid { display: flex; flex-direction: column; gap: 10px; }
    .detection-card {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #f3f4f6;
      transition: border-color 0.2s;
    }
    .detection-card:hover { border-color: #c8e0c8; }
    .dc-img {
      width: 56px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .dc-img-placeholder {
      width: 56px;
      height: 48px;
      border-radius: 8px;
      background: rgba(46,125,50,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dc-img-placeholder mat-icon { font-size: 24px; color: var(--primary); }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
    }
    .empty-state mat-icon { font-size: 32px; opacity: 0.5; }
    .empty-state span { font-size: 12px; }
    .empty-state.small { padding: 12px; }
    .ff-red { background: #ef4444; }
    .dc-info { flex: 1; min-width: 0; }
    .dc-disease { display: block; font-size: 12.5px; font-weight: 700; color: #1B3A2D; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px; }
    .dc-crop { font-size: 11.5px; color: #888; display: block; margin-bottom: 4px; }
    .dc-confidence { display: flex; align-items: baseline; gap: 4px; }
    .dc-conf-val { font-size: 14px; font-weight: 800; color: #2E7D32; font-family: 'Poppins', sans-serif; }
    .dc-conf-label { font-size: 11px; color: #888; }

    /* ── Field Forecast ── */
    .forecast-body { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
    .ff-item { display: flex; align-items: center; gap: 12px; }
    .ff-left { min-width: 80px; }
    .ff-crop { display: block; font-size: 12.5px; font-weight: 700; color: #1B3A2D; }
    .ff-status { font-size: 11px; color: #888; }
    .ff-bar-area { flex: 1; display: flex; align-items: center; gap: 8px; }
    .ff-bar-track { flex: 1; height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
    .ff-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s; }
    .ff-green { background: #2E7D32; }
    .ff-blue { background: #3B82F6; }
    .ff-amber { background: #F59E0B; }
    .ff-val { font-size: 12px; font-weight: 700; color: #1B3A2D; min-width: 32px; text-align: right; }
    .forecast-tip {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      background: rgba(46,125,50,0.06);
      border: 1px solid rgba(46,125,50,0.15);
      border-radius: 10px;
      font-size: 12.5px;
      color: #374151;
      line-height: 1.55;
    }
    .forecast-tip mat-icon { font-size: 16px; color: #2E7D32; flex-shrink: 0; margin-top: 1px; }

    /* ── Alerts ── */
    .alerts-list { display: flex; flex-direction: column; gap: 10px; }
    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #f3f4f6;
    }
    .alert-item.unread { border-color: rgba(46,125,50,0.2); background: rgba(46,125,50,0.02); }
    .alert-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .alert-icon mat-icon { font-size: 18px; }
    .a-primary { background: rgba(46,125,50,0.1); color: #2E7D32; }
    .a-warning { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .a-danger { background: rgba(239,68,68,0.1); color: #ef4444; }
    .a-info { background: rgba(59,130,246,0.1); color: #3B82F6; }
    .a-neutral { background: #f3f4f6; color: #6b7280; }
    .alert-body { flex: 1; min-width: 0; }
    .alert-title { display: block; font-size: 13px; font-weight: 600; color: #1B3A2D; margin-bottom: 3px; }
    .alert-msg { font-size: 11.5px; color: #666; line-height: 1.4; }

    /* ── Responsive ── */
    @media (max-width: 1200px) {
      .main-grid { grid-template-columns: 1fr 300px; }
    }
    @media (max-width: 1024px) {
      .main-grid { grid-template-columns: 1fr; }
      .right-col { display: grid; grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .wh-content { padding: 20px; }
      .wh-title { font-size: 20px; }
      .wh-right { display: none; }
      .crop-health-grid { grid-template-columns: 1fr; }
      .qa-grid { grid-template-columns: repeat(3, 1fr); }
      .right-col { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  state = inject(AppStateService);
  Math = Math;

  async ngOnInit() {
    await this.loadDetections();
  }

  // Recent disease detections from Supabase
  recentDetections = signal<{ id: string; disease: string; crop_type: string; confidence: number }[]>([]);

  async loadDetections() {
    const userId = this.state.user()?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('disease_detections')
      .select('id, disease, crop_type, confidence')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      this.recentDetections.set(data);
    }
  }

  // Field forecasts derived from farm crops
  fieldForecasts = computed(() => {
    const farm = this.state.farm();
    if (!farm) return [];
    return farm.crops.map(crop => ({
      crop: crop.name,
      status: this.getCropStatus(crop.status),
      progress: crop.health_score,
      colorClass: this.getProgressColor(crop.health_score)
    }));
  });

  getCropStatus(status: string): string {
    const map: Record<string, string> = {
      planted: 'Just planted',
      growing: 'Growing',
      ready: 'Harvest ready',
      harvested: 'Harvested'
    };
    return map[status] || status;
  }

  getProgressColor(score: number): string {
    if (score >= 85) return 'ff-green';
    if (score >= 70) return 'ff-amber';
    return 'ff-red';
  }

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  firstName() {
    return this.state.profile()?.name?.split(' ')[0] || 'Farmer';
  }

  weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  calendarDays() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const taskDays = new Set([3, 7, 10, 14, 18, 21, 25]);
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < offset; i++) {
      days.push({ num: '', isToday: false, hasTask: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ num: d, isToday: d === today.getDate(), hasTask: taskDays.has(d) });
    }
    return days;
  }

  todaysTips = [
    { icon: 'water_drop', title: 'Apply daily nitrogen fertiliser', desc: 'Your maize crop would benefit from 2.5kg/ha of nitrogen today. Soil pH is at 6.8 — ideal range.', iconClass: 'icon-primary' },
    { icon: 'bug_report', title: 'Check for Fall Armyworm', desc: 'Monitor maize field edges. Risk elevated in your region based on temperature and recent rainfall data.', iconClass: 'icon-danger' },
    { icon: 'local_florist', title: 'Harvest tomatoes before Thursday', desc: 'Heavy rain forecast increases blight risk. Early harvest recommended to protect quality.', iconClass: 'icon-warning' },
  ];

  quickActions = [
    { icon: 'biotech', label: 'Scan Crop', route: '/app/disease-detection', iconClass: 'icon-primary' },
    { icon: 'psychology', label: 'Ask AI', route: '/app/ai-assistant', iconClass: 'icon-info' },
    { icon: 'price_check', label: 'Prices', route: '/app/market-prices', iconClass: 'icon-accent' },
    { icon: 'calendar_month', label: 'Planner', route: '/app/planner', iconClass: 'icon-warning' },
    { icon: 'wb_sunny', label: 'Weather', route: '/app/weather', iconClass: 'icon-info' },
    { icon: 'storefront', label: 'Sell Now', route: '/app/marketplace', iconClass: 'icon-primary' },
  ];

  healthColor(score: number) {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  }

  statusBadge(status: string) {
    const map: Record<string, string> = { planted: 'badge-info', growing: 'badge-primary', ready: 'badge-success', harvested: 'badge-neutral' };
    return map[status] || 'badge-neutral';
  }

  priorityDot(priority: string) {
    const map: Record<string, string> = { high: 'dot-high', medium: 'dot-medium', low: 'dot-low' };
    return map[priority] || 'dot-low';
  }

  alertIconClass(type: string) {
    const map: Record<string, string> = { weather: 'a-info', disease: 'a-danger', market: 'a-primary', planner: 'a-warning', ai: 'a-primary', system: 'a-neutral' };
    return map[type] || 'a-primary';
  }
}
