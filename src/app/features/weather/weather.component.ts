import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Hyper-Local Weather</h1>
          <p class="page-subtitle">{{ state.weather()?.location }} · Updated 5 minutes ago</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost"><mat-icon>my_location</mat-icon> My Location</button>
          <button class="btn btn-outline"><mat-icon>refresh</mat-icon> Refresh</button>
        </div>
      </div>

      <!-- Current Weather Hero Card -->
      <div class="weather-hero-card">
        <div class="hero-bg-pattern"></div>
        <div class="hero-content">
          <div class="hero-main">
            <div class="current-weather">
              <div class="weather-icon-large">
                <mat-icon>{{ state.weather()?.icon }}</mat-icon>
              </div>
              <div class="temp-info">
                <div class="temp-display">
                  <span class="temp-val">{{ state.weather()?.temperature }}</span>
                  <span class="temp-unit">°C</span>
                </div>
                <div class="condition-info">
                  <h2>{{ state.weather()?.condition }}</h2>
                  <span class="feels-like">Feels like {{ state.weather()?.feelsLike }}°C</span>
                </div>
              </div>
            </div>
            <div class="location-info">
              <div class="location-badge">
                <mat-icon>location_on</mat-icon>
                <span>Hyper-local forecast for {{ state.weather()?.location }}</span>
              </div>
              <div class="last-rain">
                <mat-icon>history</mat-icon>
                <span>Last rain: 2 days ago</span>
              </div>
            </div>
          </div>
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-icon humid"><mat-icon>water_drop</mat-icon></div>
              <div class="stat-content">
                <span class="stat-val">{{ state.weather()?.humidity }}%</span>
                <span class="stat-label">Humidity</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon wind"><mat-icon>air</mat-icon></div>
              <div class="stat-content">
                <span class="stat-val">{{ state.weather()?.windSpeed }} km/h</span>
                <span class="stat-label">Wind Speed</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon uv"><mat-icon>wb_sunny</mat-icon></div>
              <div class="stat-content">
                <span class="stat-val">{{ state.weather()?.uvIndex }}</span>
                <span class="stat-label">UV Index</span>
                <span class="stat-note uv-note">Very High</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon rain"><mat-icon>water</mat-icon></div>
              <div class="stat-content">
                <span class="stat-val">{{ state.weather()?.rainfall }}mm</span>
                <span class="stat-label">Rain Today</span>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-trend">
          <div class="trend-info">
            <mat-icon>trending_up</mat-icon>
            <span>Rising temps expected through the weekend</span>
          </div>
        </div>
      </div>

      <!-- 7-Day Forecast -->
      <div class="forecast-section card">
        <div class="section-header">
          <h3><mat-icon>calendar_today</mat-icon> 7-Day Forecast</h3>
          <span class="badge badge-neutral">Daily breakdown</span>
        </div>
        <div class="forecast-grid">
          @for (day of state.weather()?.forecast; track day.day; let i = $index) {
            <div class="forecast-day" [class.today]="i === 0" [class.alert-day]="day.rain > 60">
              <div class="forecast-header">
                <span class="day-name">{{ day.day }}</span>
                @if (i === 0) {
                  <span class="today-badge">Today</span>
                }
              </div>
              <div class="forecast-icon-wrap">
                <mat-icon class="forecast-icon">{{ day.icon }}</mat-icon>
              </div>
              <span class="forecast-condition">{{ day.condition }}</span>
              <div class="forecast-temps">
                <span class="temp-high">{{ day.high }}°</span>
                <span class="temp-low">{{ day.low }}°</span>
              </div>
              <div class="rain-indicator" [class.high-rain]="day.rain > 60">
                <mat-icon>water_drop</mat-icon>
                <span>{{ day.rain }}%</span>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="weather-bottom">
        <!-- Rainfall Chart -->
        <div class="card rainfall-card">
          <div class="section-header">
            <h3><mat-icon>show_chart</mat-icon> Rainfall Probability</h3>
            <span style="font-size:12px;color:var(--text-muted)">Next 7 days</span>
          </div>
          <div class="rainfall-chart">
            <div class="chart-y-axis">
              @for (val of [100, 75, 50, 25, 0]; track val) {
                <span>{{ val }}%</span>
              }
            </div>
            <div class="chart-bars">
              @for (day of state.weather()?.forecast; track day.day) {
                <div class="chart-bar-col">
                  <div class="bar-wrap">
                    <div class="bar-fill" [style.height]="day.rain + '%'" [class.high]="day.rain > 60" [matTooltip]="day.rain + '% chance of rain'"></div>
                  </div>
                  <span class="bar-label">{{ day.day }}</span>
                </div>
              }
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot normal"></span>Low chance</div>
            <div class="legend-item"><span class="legend-dot high"></span>High chance (>60%)</div>
          </div>
        </div>

        <!-- AI Farm Recommendations -->
        <div class="card recommendations-card">
          <div class="section-header">
            <h3><mat-icon>psychology</mat-icon> AI Farm Recommendations</h3>
            <span class="badge badge-primary">Weather-based</span>
          </div>
          <div class="rec-list">
            @for (rec of aiRecs; track rec.title) {
              <div class="rec-item {{ rec.priorityClass }}">
                <div class="rec-icon {{ rec.iconClass }}"><mat-icon>{{ rec.icon }}</mat-icon></div>
                <div class="rec-content">
                  <div class="rec-header">
                    <span class="rec-title">{{ rec.title }}</span>
                    <span class="badge {{ rec.badgeClass }}" style="font-size:10px">{{ rec.priority }}</span>
                  </div>
                  <span class="rec-day">{{ rec.day }}</span>
                  <p class="rec-desc">{{ rec.description }}</p>
                </div>
                <button class="btn btn-sm btn-ghost"><mat-icon>arrow_forward</mat-icon></button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Weather Alerts -->
      <div class="card alerts-card">
        <div class="section-header">
          <h3><mat-icon>warning</mat-icon> Weather Alerts</h3>
          <span class="badge badge-danger">{{ weatherAlerts.length }} active</span>
        </div>
        <div class="alerts-grid">
          @for (alert of weatherAlerts; track alert.title) {
            <div class="alert-card {{ alert.severity }}">
              <div class="alert-icon"><mat-icon>{{ alert.icon }}</mat-icon></div>
              <div class="alert-content">
                <div class="alert-header">
                  <h4>{{ alert.title }}</h4>
                  <span class="badge {{ alert.badgeClass }}">{{ alert.severityLabel }}</span>
                </div>
                <p class="alert-desc">{{ alert.description }}</p>
                <span class="alert-time"><mat-icon>schedule</mat-icon> {{ alert.time }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Soil Moisture & Conditions -->
      <div class="conditions-grid">
        <div class="card condition-card">
          <div class="section-header">
            <h3><mat-icon>grass</mat-icon> Soil Conditions</h3>
          </div>
          <div class="soil-metrics">
            <div class="soil-metric">
              <div class="metric-ring">
                <svg viewBox="0 0 36 36">
                  <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="ring-fill success" style="stroke-dasharray: 72, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span class="ring-val">72%</span>
              </div>
              <span class="metric-label">Soil Moisture</span>
              <span class="metric-status success">Optimal</span>
            </div>
            <div class="soil-metric">
              <div class="metric-ring">
                <svg viewBox="0 0 36 36">
                  <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="ring-fill warning" style="stroke-dasharray: 45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span class="ring-val">45%</span>
              </div>
              <span class="metric-label">Evaporation Rate</span>
              <span class="metric-status warning">Moderate</span>
            </div>
          </div>
        </div>

        <div class="card condition-card">
          <div class="section-header">
            <h3><mat-icon>device_thermostat</mat-icon> Growing Conditions</h3>
          </div>
          <div class="growing-conditions">
            <div class="condition-row">
              <span class="condition-label">Temperature</span>
              <div class="condition-bar">
                <div class="bar-track">
                  <div class="bar-fill optimal" style="width:75%"></div>
                  <div class="bar-marker" style="left:75%"></div>
                </div>
                <span class="condition-status">Optimal</span>
              </div>
            </div>
            <div class="condition-row">
              <span class="condition-label">Humidity</span>
              <div class="condition-bar">
                <div class="bar-track">
                  <div class="bar-fill good" style="width:65%"></div>
                </div>
                <span class="condition-status">Good</span>
              </div>
            </div>
            <div class="condition-row">
              <span class="condition-label">Sunlight</span>
              <div class="condition-bar">
                <div class="bar-track">
                  <div class="bar-fill excellent" style="width:88%"></div>
                </div>
                <span class="condition-status">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 10px; }

    /* Weather Hero Card */
    .weather-hero-card { background: linear-gradient(135deg, #0A4D2D, #1565C0, #1976D2); border-radius: var(--radius); padding: 28px; color: #fff; position: relative; overflow: hidden; margin-bottom: 24px; }
    .hero-bg-pattern { position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%); }
    .hero-content { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 32px; }
    .hero-main { }
    .current-weather { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
    .weather-icon-large { width: 80px; height: 80px; border-radius: 20px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
    .weather-icon-large mat-icon { font-size: 44px; color: #FFD54F; }
    .temp-info { }
    .temp-display { display: flex; align-items: flex-start; line-height: 1; }
    .temp-val { font-family: 'Poppins', sans-serif; font-size: 72px; font-weight: 800; line-height: 0.9; }
    .temp-unit { font-size: 24px; font-weight: 400; opacity: 0.8; margin-left: 4px; margin-top: 8px; }
    .condition-info { margin-top: 8px; }
    .condition-info h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
    .feels-like { font-size: 13px; opacity: 0.75; }
    .location-info { display: flex; gap: 16px; }
    .location-badge, .last-rain { display: flex; align-items: center; gap: 6px; font-size: 12px; background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 20px; }
    .location-badge mat-icon, .last-rain mat-icon { font-size: 14px; }
    .hero-stats { display: flex; flex-direction: column; gap: 12px; }
    .stat-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.1); border-radius: var(--radius-sm); backdrop-filter: blur(10px); }
    .stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.humid { background: rgba(33,150,243,0.3); color: #64B5F6; }
    .stat-icon.wind { background: rgba(156,39,176,0.3); color: #CE93D8; }
    .stat-icon.uv { background: rgba(255,152,0,0.3); color: #FFB74D; }
    .stat-icon.rain { background: rgba(76,175,80,0.3); color: #81C784; }
    .stat-icon mat-icon { font-size: 18px; }
    .stat-content { }
    .stat-val { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; display: block; }
    .stat-label { font-size: 11px; opacity: 0.75; display: block; }
    .stat-note { font-size: 10px; margin-top: 2px; display: block; }
    .uv-note { color: #FFB74D; }
    .hero-trend { position: relative; z-index: 1; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); }
    .trend-info { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.9; }
    .trend-info mat-icon { font-size: 18px; color: #81C784; }

    /* Forecast Section */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
    .section-header h3 mat-icon { font-size: 18px; color: var(--primary); }

    .forecast-section { margin-bottom: 24px; }
    .forecast-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .forecast-day { text-align: center; padding: 14px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); transition: all var(--transition); background: var(--bg-subtle); }
    .forecast-day:hover { border-color: var(--primary); }
    .forecast-day.today { border-color: var(--primary); background: rgba(46,125,50,0.06); }
    .forecast-day.alert-day { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }
    .forecast-header { margin-bottom: 8px; }
    .day-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .today-badge { font-size: 9px; background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 10px; margin-left: 4px; }
    .forecast-icon-wrap { margin: 8px 0; }
    .forecast-icon { font-size: 26px; color: #F59E0B; }
    .forecast-condition { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .forecast-temps { display: flex; justify-content: center; gap: 8px; margin-bottom: 6px; }
    .temp-high { font-size: 15px; font-weight: 700; }
    .temp-low { font-size: 13px; color: var(--text-muted); }
    .rain-indicator { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 10px; color: #3B82F6; }
    .rain-indicator mat-icon { font-size: 12px; }
    .rain-indicator.high-rain { color: var(--warning); }

    .weather-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }

    /* Rainfall Chart */
    .rainfall-card { }
    .rainfall-chart { display: flex; gap: 12px; height: 120px; margin-bottom: 12px; }
    .chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; padding-right: 8px; }
    .chart-y-axis span { font-size: 10px; color: var(--text-muted); }
    .chart-bars { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; }
    .chart-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar-wrap { width: 100%; height: 80px; display: flex; align-items: flex-end; justify-content: center; }
    .bar-fill { width: 20px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, rgba(33,150,243,0.6), rgba(33,150,243,0.3)); transition: height 0.8s ease-out; min-height: 2px; }
    .bar-fill.high { background: linear-gradient(180deg, rgba(245,158,11,0.8), rgba(245,158,11,0.4)); }
    .bar-label { font-size: 10px; color: var(--text-muted); }
    .chart-legend { display: flex; gap: 16px; justify-content: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    .legend-dot.normal { background: rgba(33,150,243,0.6); }
    .legend-dot.high { background: rgba(245,158,11,0.8); }

    /* Recommendations */
    .recommendations-card { }
    .rec-list { display: flex; flex-direction: column; gap: 10px; }
    .rec-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); transition: all var(--transition); }
    .rec-item:hover { border-color: var(--border); }
    .rec-item.urgent { border-left: 3px solid var(--danger); background: rgba(239,68,68,0.03); }
    .rec-item.advised { border-left: 3px solid var(--info); background: rgba(33,150,243,0.03); }
    .rec-item.opportunity { border-left: 3px solid var(--success); background: rgba(76,175,80,0.03); }
    .rec-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rec-icon mat-icon { font-size: 18px; }
    .rec-icon.danger { background: rgba(239,68,68,0.15); color: var(--danger); }
    .rec-icon.info { background: rgba(33,150,243,0.15); color: var(--info); }
    .rec-icon.primary { background: rgba(46,125,50,0.15); color: var(--primary); }
    .rec-content { flex: 1; }
    .rec-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .rec-title { font-size: 13px; font-weight: 600; }
    .rec-day { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
    .rec-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin: 0; }

    /* Alerts */
    .alerts-card { margin-bottom: 24px; }
    .alerts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .alert-card { display: flex; gap: 12px; padding: 16px; border-radius: var(--radius-sm); border-left: 4px solid; }
    .alert-card.high { background: rgba(239,68,68,0.05); border-color: var(--danger); }
    .alert-card.medium { background: rgba(245,158,11,0.05); border-color: var(--warning); }
    .alert-card.low { background: rgba(33,150,243,0.05); border-color: var(--info); }
    .alert-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .alert-card.high .alert-icon { background: rgba(239,68,68,0.15); color: var(--danger); }
    .alert-card.medium .alert-icon { background: rgba(245,158,11,0.15); color: var(--warning); }
    .alert-card.low .alert-icon { background: rgba(33,150,243,0.15); color: var(--info); }
    .alert-icon mat-icon { font-size: 20px; }
    .alert-content { flex: 1; }
    .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .alert-header h4 { font-size: 13px; font-weight: 600; flex: 1; }
    .alert-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
    .alert-time { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted); }
    .alert-time mat-icon { font-size: 12px; }

    /* Conditions Grid */
    .conditions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .condition-card { }
    .soil-metrics { display: flex; gap: 32px; }
    .soil-metric { text-align: center; }
    .metric-ring { position: relative; width: 72px; height: 72px; margin: 0 auto 8px; }
    .metric-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: rgba(46,125,50,0.1); stroke-width: 3; }
    .ring-fill { fill: none; stroke-width: 3; stroke-linecap: round; }
    .ring-fill.success { stroke: var(--success); }
    .ring-fill.warning { stroke: var(--warning); }
    .ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; }
    .metric-label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
    .metric-status { font-size: 11px; font-weight: 600; }
    .metric-status.success { color: var(--success); }
    .metric-status.warning { color: var(--warning); }

    .growing-conditions { display: flex; flex-direction: column; gap: 16px; }
    .condition-row { }
    .condition-label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 8px; }
    .condition-bar { display: flex; align-items: center; gap: 12px; }
    .bar-track { flex: 1; height: 8px; background: rgba(46,125,50,0.1); border-radius: 4px; position: relative; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease-out; }
    .bar-fill.optimal { background: linear-gradient(90deg, #EF4444, #FFC107, #4CAF50); background-size: 200% 100%; background-position: 100% 0; }
    .bar-fill.good { background: var(--success); }
    .bar-fill.excellent { background: linear-gradient(90deg, #4CAF50, #81C784); }
    .bar-marker { position: absolute; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; background: #fff; border: 2px solid var(--primary); border-radius: 50%; }
    .condition-status { font-size: 11px; font-weight: 600; color: var(--success); min-width: 70px; text-align: right; }

    @media (max-width: 1200px) {
      .forecast-grid { grid-template-columns: repeat(4, 1fr); }
      .alerts-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 1024px) {
      .weather-bottom { grid-template-columns: 1fr; }
      .conditions-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero-content { grid-template-columns: 1fr; }
      .temp-val { font-size: 52px; }
      .forecast-grid { grid-template-columns: repeat(4, 1fr); }
      .soil-metrics { flex-direction: column; gap: 20px; }
    }
  `],
})
export class WeatherComponent {
  state = inject(AppStateService);

  aiRecs = [
    { icon: 'local_florist', title: 'Harvest tomatoes by Wednesday', description: 'Heavy rain on Thursday risks blight and quality loss. Early harvest recommended.', day: 'Today', priority: 'Urgent', iconClass: 'danger', badgeClass: 'badge-danger', priorityClass: 'urgent' },
    { icon: 'water_drop', title: 'Skip irrigation Wednesday', description: 'High rainfall probability – skip irrigation to avoid waterlogging.', day: 'Wed–Thu', priority: 'Advised', iconClass: 'info', badgeClass: 'badge-info', priorityClass: 'advised' },
    { icon: 'grass', title: 'Ideal planting conditions', description: 'Saturday and Sunday forecast is perfect for transplanting seedlings.', day: 'Sat–Sun', priority: 'Opportunity', iconClass: 'primary', badgeClass: 'badge-success', priorityClass: 'opportunity' },
  ];

  weatherAlerts = [
    { icon: 'thunderstorm', title: 'Heavy Rain Warning', description: 'Up to 45mm expected Thursday–Friday. Risk of flash flooding.', time: 'Thu 01:00 – Fri 18:00', severity: 'high', severityLabel: 'High', badgeClass: 'badge-danger' },
    { icon: 'wb_sunny', title: 'High UV Alert', description: 'UV Index of 8–9 forecast for the weekend. Protect outdoor workers.', time: 'Sat–Sun', severity: 'medium', severityLabel: 'Medium', badgeClass: 'badge-warning' },
    { icon: 'air', title: 'Wind Advisory', description: 'Winds of 35–45 km/h expected from the north on Monday.', time: 'Monday morning', severity: 'low', severityLabel: 'Low', badgeClass: 'badge-info' },
  ];
}
