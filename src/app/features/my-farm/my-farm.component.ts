import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-my-farm',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Farm</h1>
          <p class="page-subtitle">{{ state.farm()?.name }} · {{ state.farm()?.size }} {{ state.farm()?.size_unit }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost"><mat-icon>share</mat-icon> Share</button>
          <button class="btn btn-primary"><mat-icon>edit</mat-icon> Edit Farm</button>
        </div>
      </div>

      <!-- Farm Hero -->
      <div class="farm-hero-card">
        @if (state.farm()?.image) {
          <img [src]="state.farm()?.image" alt="Farm" class="hero-img" />
        } @else {
          <div class="hero-img-placeholder">
            <mat-icon>landscape</mat-icon>
          </div>
        }
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="farm-info">
              <div class="farm-name-row">
                <h2>{{ state.farm()?.name }}</h2>
                <span class="badge badge-success verified"><mat-icon>verified</mat-icon> Verified</span>
              </div>
              <p class="farm-location"><mat-icon>location_on</mat-icon> {{ state.farm()?.province }}, {{ state.farm()?.country }}</p>
            </div>
            <div class="farm-stats">
              <div class="farm-stat">
                <span class="stat-icon"><mat-icon>landscape</mat-icon></span>
                <div class="stat-content">
                  <span class="stat-val">{{ state.farm()?.size }} <span class="unit">{{ state.farm()?.size_unit }}</span></span>
                  <span class="stat-label">Total Area</span>
                </div>
              </div>
              <div class="farm-stat">
                <span class="stat-icon water"><mat-icon>water_drop</mat-icon></span>
                <div class="stat-content">
                  <span class="stat-val">{{ state.farm()?.water_source || 'Not set' }}</span>
                  <span class="stat-label">Water Source</span>
                </div>
              </div>
              <div class="farm-stat">
                <span class="stat-icon soil"><mat-icon>grass</mat-icon></span>
                <div class="stat-content">
                  <span class="stat-val">{{ state.farm()?.soil_type || 'Not set' }}</span>
                  <span class="stat-label">Soil Type</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Bar -->
      <div class="stats-bar">
        <div class="quick-stat">
          <div class="qs-icon crops"><mat-icon>agriculture</mat-icon></div>
          <div class="qs-info">
            <span class="qs-val">{{ state.farm()?.crops?.length ?? 0 }}</span>
            <span class="qs-label">Active Crops</span>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon livestock"><mat-icon>pets</mat-icon></div>
          <div class="qs-info">
            <span class="qs-val">{{ totalLivestock() }}</span>
            <span class="qs-label">Livestock</span>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon health"><mat-icon>favorite</mat-icon></div>
          <div class="qs-info">
            <span class="qs-val success">{{ avgHealth() }}%</span>
            <span class="qs-label">Avg Health</span>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon harvest"><mat-icon>calendar_month</mat-icon></div>
          <div class="qs-info">
            <span class="qs-val warning">{{ daysToHarvest() }}</span>
            <span class="qs-label">Days to Harvest</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        @for (tab of tabs; track tab.id) {
          <button class="tab-pill" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
            <mat-icon>{{ tab.icon }}</mat-icon>
            <span>{{ tab.label }}</span>
          </button>
        }
      </div>

      <!-- Crops Tab -->
      @if (activeTab() === 'crops') {
        <div class="page-enter">
          <div class="section-header">
            <h3><mat-icon>grass</mat-icon> Crop Management</h3>
            <button class="btn btn-primary btn-sm"><mat-icon>add</mat-icon> Add Crop</button>
          </div>
          <div class="crops-grid">
            @for (crop of state.farm()?.crops; track crop.id) {
              <div class="crop-card card">
                <div class="crop-top">
                  <div class="crop-icon-wrap" [style.background]="cropIconBg(crop.status)">
                    <mat-icon>{{ crop.icon }}</mat-icon>
                  </div>
                  <div class="crop-header-info">
                    <h4 class="crop-name">{{ crop.name }}</h4>
                    <span class="crop-variety">{{ crop.variety || 'Standard variety' }}</span>
                  </div>
                  <span class="status-badge {{ statusClass(crop.status) }}">{{ crop.status }}</span>
                </div>

                <div class="crop-metrics">
                  <div class="metric-row">
                    <span class="metric-label"><mat-icon>crop_square</mat-icon> Area</span>
                    <span class="metric-val">{{ crop.area }} {{ crop.area_unit }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label"><mat-icon>calendar_today</mat-icon> Planted</span>
                    <span class="metric-val">{{ crop.planted_date | date:'MMM d, y' }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label"><mat-icon>event_available</mat-icon> Harvest</span>
                    <span class="metric-val">{{ crop.expected_harvest_date | date:'MMM d, y' }}</span>
                  </div>
                </div>

                <div class="growth-section">
                  <div class="growth-header">
                    <span class="growth-label">Growth Progress</span>
                    <span class="growth-pct">{{ growthProgress(crop) }}%</span>
                  </div>
                  <div class="progress-bar-track" style="height:6px;border-radius:3px">
                    <div class="progress-bar-fill" [style.width]="growthProgress(crop) + '%'" [style.background]="progressGradient(crop)"></div>
                  </div>
                  <div class="growth-stages">
                    <div class="stage" [class.passed]="growthProgress(crop) >= 0"><span class="dot"></span>Planted</div>
                    <div class="stage" [class.passed]="growthProgress(crop) >= 33"><span class="dot"></span>Growing</div>
                    <div class="stage" [class.passed]="growthProgress(crop) >= 66"><span class="dot"></span>Ready</div>
                    <div class="stage" [class.passed]="growthProgress(crop) >= 100"><span class="dot"></span>Harvest</div>
                  </div>
                </div>

                <div class="health-section">
                  <div class="health-header">
                    <span class="health-label">Health Score</span>
                    <span class="health-val" [style.color]="healthColor(crop.health_score)">{{ crop.health_score }}%</span>
                  </div>
                  <div class="health-indicator">
                    <div class="health-bar">
                      <div class="health-fill" [style.width]="crop.health_score + '%'" [style.background]="healthColor(crop.health_score)"></div>
                    </div>
                    <span class="health-status" [style.color]="healthColor(crop.health_score)">{{ healthStatus(crop.health_score) }}</span>
                  </div>
                </div>

                <div class="crop-actions">
                  <a routerLink="/app/disease-detection" class="action-btn scan" matTooltip="Scan for diseases">
                    <mat-icon>biotech</mat-icon>
                  </a>
                  <a routerLink="/app/ai-assistant" class="action-btn advise" matTooltip="Get AI advice">
                    <mat-icon>psychology</mat-icon>
                  </a>
                  <button class="action-btn more" matTooltip="More options">
                    <mat-icon>more_horiz</mat-icon>
                  </button>
                </div>
              </div>
            }
            <!-- Add Crop Card -->
            <div class="add-crop-card card">
              <div class="add-icon">
                <mat-icon>add</mat-icon>
              </div>
              <span class="add-text">Add New Crop</span>
              <span class="add-hint">Track your crops, get AI insights</span>
            </div>
          </div>
        </div>
      }

      <!-- Livestock Tab -->
      @if (activeTab() === 'livestock') {
        <div class="page-enter">
          <div class="section-header">
            <h3><mat-icon>pets</mat-icon> Livestock Management</h3>
            <button class="btn btn-primary btn-sm"><mat-icon>add</mat-icon> Add Livestock</button>
          </div>
          <div class="livestock-grid">
            @for (animal of state.farm()?.livestock; track animal.id) {
              <div class="livestock-card card">
                <div class="livestock-visual">
                  <div class="animal-icon {{ healthClass(animal.health_status) }}">
                    <mat-icon>pets</mat-icon>
                  </div>
                  <span class="health-badge {{ healthClass(animal.health_status) }}">{{ animal.health_status }}</span>
                </div>
                <div class="livestock-info">
                  <h4>{{ animal.type }}</h4>
                  <span class="breed">{{ animal.breed || 'Unknown breed' }}</span>
                </div>
                <div class="livestock-count-section">
                  <span class="count-val">{{ animal.count }}</span>
                  <span class="count-label">Head</span>
                </div>
                <div class="livestock-actions">
                  <button class="btn btn-sm btn-ghost"><mat-icon>monitor_heart</mat-icon> Health</button>
                  <button class="btn btn-sm btn-ghost"><mat-icon>edit</mat-icon> Edit</button>
                </div>
              </div>
            }
            <!-- Add Livestock -->
            <div class="add-livestock-card card">
              <mat-icon>add_circle_outline</mat-icon>
              <span>Add Livestock</span>
            </div>
          </div>
        </div>
      }

      <!-- Soil Tab -->
      @if (activeTab() === 'soil') {
        <div class="page-enter">
          <div class="section-header">
            <h3><mat-icon>landscape</mat-icon> Soil & Water Analysis</h3>
            <button class="btn btn-outline btn-sm"><mat-icon>download</mat-icon> Export Report</button>
          </div>
          <div class="soil-grid">
            <div class="card soil-card">
              <div class="card-header">
                <h4><mat-icon>science</mat-icon> Soil Composition</h4>
                <span class="badge badge-info">Lab Tested</span>
              </div>
              <div class="soil-composition">
                <div class="composition-visual">
                  <div class="soil-pie">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#E8F5E9" stroke-width="4"/>
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#4CAF50" stroke-width="4" stroke-dasharray="40 60" stroke-dashoffset="25"/>
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#8D6E63" stroke-width="4" stroke-dasharray="35 65" stroke-dashoffset="-15"/>
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FFD54F" stroke-width="4" stroke-dasharray="25 75" stroke-dashoffset="-50"/>
                    </svg>
                  </div>
                </div>
                <div class="composition-legend">
                  <div class="legend-item"><span class="dot sand"></span><span>Sand: 40%</span></div>
                  <div class="legend-item"><span class="dot silt"></span><span>Silt: 35%</span></div>
                  <div class="legend-item"><span class="dot clay"></span><span>Clay: 25%</span></div>
                </div>
              </div>
              <div class="soil-stats">
                <div class="soil-stat-row">
                  <span class="soil-label">Soil Type</span>
                  <span class="soil-value">{{ state.farm()?.soil_type || 'Not set' }}</span>
                </div>
                <div class="soil-stat-row">
                  <span class="soil-label">pH Level</span>
                  <div class="ph-indicator">
                    <div class="ph-bar">
                      <div class="ph-marker" style="left:62%"></div>
                    </div>
                    <span class="soil-value">6.2 (Optimal)</span>
                  </div>
                </div>
                <div class="soil-stat-row">
                  <span class="soil-label">Organic Matter</span>
                  <span class="soil-value">2.8%</span>
                </div>
              </div>
            </div>

            <div class="card nutrients-card">
              <div class="card-header">
                <h4><mat-icon>compost</mat-icon> Nutrient Levels</h4>
              </div>
              <div class="nutrient-bars">
                @for (nutrient of nutrients; track nutrient.name) {
                  <div class="nutrient-row">
                    <span class="nutrient-name">{{ nutrient.name }}</span>
                    <div class="nutrient-bar-wrap">
                      <div class="nutrient-bar">
                        <div class="nutrient-fill" [style.width]="nutrient.level + '%'" [style.background]="nutrient.level >= 70 ? '#4CAF50' : nutrient.level >= 40 ? '#FF9800' : '#EF4444'"></div>
                      </div>
                      <span class="nutrient-val" [style.color]="nutrient.level >= 70 ? '#4CAF50' : nutrient.level >= 40 ? '#FF9800' : '#EF4444'">{{ nutrient.level }}%</span>
                    </div>
                    <span class="nutrient-status">{{ nutrient.status }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="card water-card">
              <div class="card-header">
                <h4><mat-icon>water_drop</mat-icon> Water Sources</h4>
              </div>
              <div class="water-sources">
                @for (ws of waterSourceInfo; track ws.label) {
                  <div class="water-source-item">
                    <div class="ws-icon {{ ws.iconClass }}"><mat-icon>{{ ws.icon }}</mat-icon></div>
                    <div class="ws-info">
                      <span class="ws-name">{{ ws.label }}</span>
                      <span class="ws-status">{{ ws.status }}</span>
                    </div>
                    <span class="badge {{ ws.badgeClass }}">{{ ws.badgeText }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Expenses Tab -->
      @if (activeTab() === 'expenses') {
        <div class="page-enter">
          <div class="section-header">
            <h3><mat-icon>account_balance_wallet</mat-icon> Season Expenses</h3>
            <button class="btn btn-primary btn-sm"><mat-icon>add</mat-icon> Add Expense</button>
          </div>
          <div class="expenses-grid">
            <div class="card total-expenses-card">
              <div class="total-header">
                <span class="total-label">Total Season Cost</span>
                <span class="total-val">R 24,850</span>
              </div>
              <div class="expense-breakdown">
                <div class="breakdown-chart">
                  @for (e of expenses; track e.category; let i = $index) {
                    <div class="breakdown-segment" [style.background]="chartColors[i]" [style.width]="e.pct + '%'"></div>
                  }
                </div>
                <div class="breakdown-legend">
                  @for (e of expenses; track e.category; let i = $index) {
                    <div class="legend-item">
                      <span class="legend-dot" [style.background]="chartColors[i]"></span>
                      <span class="legend-text">{{ e.category }}</span>
                      <span class="legend-pct">{{ e.pct }}%</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="card expenses-list-card">
              <h4 style="font-size:14px;margin-bottom:16px">Expense Categories</h4>
              <div class="expenses-list">
                @for (e of expenses; track e.category; let i = $index) {
                  <div class="expense-row">
                    <div class="expense-icon" [style.background]="chartColors[i] + '20'" [style.color]="chartColors[i]">
                      <mat-icon>{{ e.icon }}</mat-icon>
                    </div>
                    <div class="expense-info">
                      <span class="expense-name">{{ e.category }}</span>
                      <div class="expense-bar">
                        <div class="expense-bar-fill" [style.width]="e.pct + '%'" [style.background]="chartColors[i]"></div>
                      </div>
                    </div>
                    <div class="expense-amount">
                      <span class="amount-val">R {{ e.amount.toLocaleString() }}</span>
                      <span class="amount-pct">{{ e.pct }}%</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 10px; }

    /* Farm Hero */
    .farm-hero-card { position: relative; border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; }
    .hero-img { width: 100%; height: 200px; object-fit: cover; }
    .hero-img-placeholder { width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary), var(--primary-mid)); display: flex; align-items: center; justify-content: center; }
    .hero-img-placeholder mat-icon { font-size: 64px; color: rgba(255,255,255,0.3); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%); }
    .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .farm-info { }
    .farm-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .farm-name-row h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0; }
    .badge.verified { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); }
    .farm-location { color: rgba(255,255,255,0.85); font-size: 13px; display: flex; align-items: center; gap: 4px; margin: 0; }
    .farm-location mat-icon { font-size: 14px; }
    .farm-stats { display: flex; gap: 24px; }
    .farm-stat { display: flex; align-items: center; gap: 10px; }
    .stat-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 18px; color: #fff; }
    .stat-icon.water { background: rgba(33,150,243,0.3); }
    .stat-icon.soil { background: rgba(139,195,74,0.3); }
    .stat-content { }
    .stat-val { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: #fff; display: block; }
    .stat-val .unit { font-size: 12px; font-weight: 500; opacity: 0.8; }
    .stat-label { font-size: 10px; color: rgba(255,255,255,0.7); display: block; }

    /* Stats Bar */
    .stats-bar { display: flex; gap: 12px; margin-bottom: 24px; }
    .quick-stat { flex: 1; display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light); }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .qs-icon mat-icon { font-size: 20px; }
    .qs-icon.crops { background: rgba(46,125,50,0.1); color: var(--primary); }
    .qs-icon.livestock { background: rgba(245,158,11,0.1); color: var(--warning); }
    .qs-icon.health { background: rgba(239,68,68,0.1); color: var(--danger); }
    .qs-icon.harvest { background: rgba(33,150,243,0.1); color: var(--info); }
    .qs-info { }
    .qs-val { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; display: block; }
    .qs-val.success { color: var(--success); }
    .qs-val.warning { color: var(--warning); }
    .qs-label { font-size: 11px; color: var(--text-muted); }

    /* Tabs */
    .tabs-container { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab-pill { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 20px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-secondary); transition: all var(--transition); }
    .tab-pill mat-icon { font-size: 18px; }
    .tab-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    .tab-pill:hover:not(.active) { background: var(--bg-subtle); }

    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }
    .section-header h3 mat-icon { font-size: 20px; color: var(--primary); }

    /* Crops Grid */
    .crops-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .crop-card { padding: 20px; }
    .crop-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .crop-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .crop-icon-wrap mat-icon { font-size: 22px; color: #fff; }
    .crop-header-info { flex: 1; }
    .crop-name { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
    .crop-variety { font-size: 11px; color: var(--text-muted); }
    .status-badge { font-size: 10px; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
    .status-badge.planted { background: rgba(33,150,243,0.15); color: #1976D2; }
    .status-badge.growing { background: rgba(46,125,50,0.15); color: var(--primary); }
    .status-badge.ready { background: rgba(245,158,11,0.15); color: var(--warning); }
    .status-badge.harvested { background: rgba(107,114,128,0.15); color: var(--text-muted); }

    .crop-metrics { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); margin-bottom: 16px; }
    .metric-row { display: flex; justify-content: space-between; align-items: center; }
    .metric-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
    .metric-label mat-icon { font-size: 14px; }
    .metric-val { font-size: 12px; font-weight: 600; }

    .growth-section { margin-bottom: 16px; }
    .growth-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .growth-label { font-size: 12px; color: var(--text-secondary); }
    .growth-pct { font-size: 13px; font-weight: 700; color: var(--primary); }
    .growth-stages { display: flex; justify-content: space-between; margin-top: 8px; }
    .stage { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted); }
    .stage .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); }
    .stage.passed .dot { background: var(--primary); }
    .stage.passed { color: var(--primary); }

    .health-section { }
    .health-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .health-label { font-size: 12px; color: var(--text-secondary); }
    .health-val { font-size: 14px; font-weight: 700; }
    .health-indicator { display: flex; align-items: center; gap: 10px; }
    .health-bar { flex: 1; height: 8px; background: rgba(46,125,50,0.1); border-radius: 4px; }
    .health-fill { height: 100%; border-radius: 4px; transition: width 0.8s; }
    .health-status { font-size: 11px; font-weight: 600; }

    .crop-actions { display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light); }
    .action-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition); }
    .action-btn mat-icon { font-size: 18px; }
    .action-btn.scan { color: var(--primary); }
    .action-btn.scan:hover { background: rgba(46,125,50,0.1); border-color: var(--primary); }
    .action-btn.advise { color: var(--info); }
    .action-btn.advise:hover { background: rgba(33,150,243,0.1); border-color: var(--info); }
    .action-btn.more { color: var(--text-muted); }
    .action-btn.more:hover { background: var(--bg-subtle); }

    .add-crop-card { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; border: 2px dashed var(--border); cursor: pointer; transition: all var(--transition); }
    .add-crop-card:hover { border-color: var(--primary); background: rgba(46,125,50,0.04); }
    .add-icon { width: 56px; height: 56px; border-radius: 16px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .add-icon mat-icon { font-size: 28px; color: var(--text-muted); }
    .add-text { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
    .add-hint { font-size: 12px; color: var(--text-muted); }

    /* Livestock */
    .livestock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .livestock-card { padding: 20px; text-align: center; }
    .livestock-visual { position: relative; margin-bottom: 12px; }
    .animal-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .animal-icon mat-icon { font-size: 28px; color: #fff; }
    .animal-icon.good { background: linear-gradient(135deg, #4CAF50, #81C784); }
    .animal-icon.fair { background: linear-gradient(135deg, #FF9800, #FFB74D); }
    .animal-icon.poor { background: linear-gradient(135deg, #EF4444, #EF9A9A); }
    .health-badge { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); font-size: 9px; padding: 2px 8px; border-radius: 10px; }
    .health-badge.good { background: rgba(76,175,80,0.2); color: #2E7D32; }
    .health-badge.fair { background: rgba(255,152,0,0.2); color: #E65100; }
    .health-badge.poor { background: rgba(239,68,68,0.2); color: #C62828; }
    .livestock-info h4 { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
    .breed { font-size: 11px; color: var(--text-muted); }
    .livestock-count-section { padding: 12px 0; margin: 12px 0; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); }
    .count-val { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; display: block; color: var(--text-primary); }
    .count-label { font-size: 11px; color: var(--text-muted); }
    .livestock-actions { display: flex; gap: 8px; justify-content: center; }
    .add-livestock-card { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px; gap: 8px; cursor: pointer; border: 2px dashed var(--border); }
    .add-livestock-card mat-icon { font-size: 32px; color: var(--text-muted); }
    .add-livestock-card span { font-size: 13px; color: var(--text-muted); font-weight: 500; }

    /* Soil Grid */
    .soil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .soil-card, .nutrients-card, .water-card { }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card-header h4 { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; }
    .card-header h4 mat-icon { font-size: 18px; color: var(--primary); }

    .soil-composition { display: flex; gap: 24px; align-items: center; margin-bottom: 16px; }
    .soil-pie { width: 80px; height: 80px; }
    .composition-legend { display: flex; flex-direction: column; gap: 6px; }
    .composition-legend .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .composition-legend .dot { width: 10px; height: 10px; border-radius: 2px; }
    .dot.sand { background: #4CAF50; }
    .dot.silt { background: #8D6E63; }
    .dot.clay { background: #FFD54F; }

    .soil-stats { display: flex; flex-direction: column; gap: 10px; }
    .soil-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
    .soil-stat-row:last-child { border-bottom: none; }
    .soil-label { font-size: 12px; color: var(--text-muted); }
    .soil-value { font-size: 13px; font-weight: 600; }
    .ph-indicator { flex: 1; display: flex; align-items: center; gap: 12px; }
    .ph-bar { flex: 1; height: 6px; background: linear-gradient(90deg, #EF4444, #FFC107, #4CAF50, #2196F3); border-radius: 3px; position: relative; }
    .ph-marker { position: absolute; top: -3px; width: 12px; height: 12px; background: #fff; border: 2px solid var(--text-primary); border-radius: 50%; transform: translateX(-50%); }

    .nutrient-bars { display: flex; flex-direction: column; gap: 12px; }
    .nutrient-row { display: flex; align-items: center; gap: 12px; }
    .nutrient-name { font-size: 12px; color: var(--text-secondary); min-width: 80px; }
    .nutrient-bar-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }
    .nutrient-bar { flex: 1; height: 6px; background: rgba(46,125,50,0.1); border-radius: 3px; }
    .nutrient-fill { height: 100%; border-radius: 3px; transition: width 0.8s; }
    .nutrient-val { font-size: 12px; font-weight: 700; min-width: 40px; }
    .nutrient-status { font-size: 10px; color: var(--text-muted); min-width: 60px; }

    .water-sources { display: flex; flex-direction: column; gap: 12px; }
    .water-source-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .ws-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .ws-icon mat-icon { font-size: 20px; }
    .ws-icon.primary { background: rgba(46,125,50,0.15); color: var(--primary); }
    .ws-icon.info { background: rgba(33,150,243,0.15); color: var(--info); }
    .ws-icon.success { background: rgba(76,175,80,0.15); color: var(--success); }
    .ws-info { flex: 1; }
    .ws-name { font-size: 13px; font-weight: 600; display: block; }
    .ws-status { font-size: 11px; color: var(--text-muted); }

    /* Expenses */
    .expenses-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
    .total-expenses-card { }
    .total-header { text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(46,125,50,0.08), transparent); border-radius: var(--radius-sm); margin-bottom: 16px; }
    .total-label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px; }
    .total-val { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; color: var(--text-primary); }
    .breakdown-chart { display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
    .breakdown-segment { height: 100%; transition: width 0.8s; }
    .breakdown-legend { display: flex; flex-direction: column; gap: 6px; }
    .breakdown-legend .legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    .legend-text { flex: 1; color: var(--text-secondary); }
    .legend-pct { color: var(--text-muted); }

    .expenses-list-card { }
    .expenses-list { display: flex; flex-direction: column; gap: 12px; }
    .expense-row { display: flex; align-items: center; gap: 12px; }
    .expense-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .expense-icon mat-icon { font-size: 18px; }
    .expense-info { flex: 1; }
    .expense-name { font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px; }
    .expense-bar { height: 4px; background: rgba(46,125,50,0.1); border-radius: 2px; }
    .expense-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s; }
    .expense-amount { text-align: right; }
    .amount-val { font-size: 13px; font-weight: 700; display: block; }
    .amount-pct { font-size: 10px; color: var(--text-muted); }

    @media (max-width: 1200px) {
      .crops-grid { grid-template-columns: repeat(2, 1fr); }
      .livestock-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 1024px) {
      .soil-grid { grid-template-columns: 1fr; }
      .expenses-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .crops-grid { grid-template-columns: 1fr; }
      .livestock-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-bar { flex-wrap: wrap; }
      .quick-stat { min-width: calc(50% - 6px); }
      .farm-stats { display: none; }
    }
  `],
})
export class MyFarmComponent {
  state = inject(AppStateService);
  activeTab = signal('crops');

  tabs = [
    { id: 'crops', label: 'Crops', icon: 'grass' },
    { id: 'livestock', label: 'Livestock', icon: 'pets' },
    { id: 'soil', label: 'Soil & Water', icon: 'water_drop' },
    { id: 'expenses', label: 'Expenses', icon: 'account_balance_wallet' },
  ];

  chartColors = ['#4CAF50', '#FF9800', '#EF4444', '#2196F3', '#9C27B0', '#607D8B'];

  totalLivestock = computed(() => this.state.farm()?.livestock.reduce((sum, l) => sum + l.count, 0) || 0);

  avgHealth = computed(() => {
    const crops = this.state.farm()?.crops || [];
    if (crops.length === 0) return 0;
    return Math.round(crops.reduce((sum, c) => sum + c.health_score, 0) / crops.length);
  });

  daysToHarvest = computed(() => {
    const crops = this.state.farm()?.crops || [];
    const ready = crops.find(c => c.status === 'growing');
    if (!ready) return 0;
    return 82; // Mock days
  });

  cropIconBg(status: string) {
    const map: Record<string, string> = {
      planted: 'linear-gradient(135deg, #1976D2, #42A5F5)',
      growing: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
      ready: 'linear-gradient(135deg, #E65100, #FFB74D)',
      harvested: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    };
    return map[status] || map['planted'];
  }

  statusClass(status: string) {
    if (status === 'planted') return 'planted';
    if (status === 'growing') return 'growing';
    if (status === 'ready') return 'ready';
    return 'harvested';
  }

  growthProgress(crop: any) {
    if (crop.status === 'harvested') return 100;
    if (crop.status === 'ready') return 85;
    if (crop.status === 'growing') return 55;
    return 15;
  }

  progressGradient(crop: any) {
    const pct = this.growthProgress(crop);
    if (pct >= 80) return 'linear-gradient(90deg, #4CAF50, #81C784)';
    if (pct >= 50) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
    return 'linear-gradient(90deg, #1976D2, #42A5F5)';
  }

  healthColor(score: number) {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#EF4444';
  }

  healthStatus(score: number) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  healthClass(status: string) {
    if (status === 'good') return 'good';
    if (status === 'fair') return 'fair';
    return 'poor';
  }

  nutrients = [
    { name: 'Nitrogen (N)', level: 72, status: 'Optimal' },
    { name: 'Phosphorus (P)', level: 45, status: 'Moderate' },
    { name: 'Potassium (K)', level: 85, status: 'High' },
    { name: 'Calcium (Ca)', level: 58, status: 'Adequate' },
    { name: 'Magnesium (Mg)', level: 38, status: 'Low' },
  ];

  waterSourceInfo = [
    { icon: 'water_pump', label: 'Borehole', status: 'Active · 4500L/hr', iconClass: 'primary', badgeClass: 'badge-success', badgeText: 'Active' },
    { icon: 'water_drop', label: 'Rainwater Tank', status: '5000L capacity · 62% full', iconClass: 'info', badgeClass: 'badge-info', badgeText: '62%' },
    { icon: 'sprinkler', label: 'Drip Irrigation', status: 'Coverage: 4.2 ha', iconClass: 'success', badgeClass: 'badge-success', badgeText: 'Installed' },
  ];

  expenses = [
    { category: 'Seeds & Seedlings', amount: 6200, pct: 25, icon: 'grass' },
    { category: 'Fertilizers', amount: 5400, pct: 22, icon: 'compost' },
    { category: 'Pesticides', amount: 3800, pct: 15, icon: 'bug_report' },
    { category: 'Labour', amount: 4800, pct: 19, icon: 'person' },
    { category: 'Fuel & Machinery', amount: 2900, pct: 12, icon: 'agriculture' },
    { category: 'Other', amount: 1750, pct: 7, icon: 'more_horiz' },
  ];
}
