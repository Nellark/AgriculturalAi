import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppStateService } from '../../core/services/app-state.service';

interface YieldFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  description: string;
}

interface MonthlyData {
  month: string;
  predicted: number;
  historical: number;
}

interface YieldForecastData {
  cropName: string;
  predictedYield: number;
  historicalYield: number;
  unit: string;
  confidence: number;
  factors: YieldFactor[];
  monthlyData: MonthlyData[];
}

@Component({
  selector: 'app-yield-forecast',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Yield Forecast</h1>
          <p class="page-subtitle">AI-powered yield predictions for {{ forecast.cropName }} — {{ state.farm()?.name }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline"><mat-icon>download</mat-icon> Export</button>
          <button class="btn btn-primary"><mat-icon>share</mat-icon> Share Report</button>
        </div>
      </div>

      <!-- Forecast Summary Cards -->
      <div class="forecast-summary">
        <div class="summary-card primary-card card">
          <div class="summary-visual">
            <div class="summary-icon-ring">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="summary-trend trend-up">
              <mat-icon>arrow_upward</mat-icon>
              <span>+{{ pctChange() }}%</span>
            </div>
          </div>
          <div class="summary-content">
            <div class="summary-val">{{ forecast.predictedYield }} <span class="unit">t/ha</span></div>
            <div class="summary-label">Predicted Yield</div>
            <div class="summary-vs">vs {{ forecast.historicalYield }} t/ha last season</div>
          </div>
        </div>

        <div class="summary-card card">
          <div class="summary-visual neutral">
            <div class="summary-icon-ring neutral">
              <mat-icon>history</mat-icon>
            </div>
          </div>
          <div class="summary-content">
            <div class="summary-val secondary">{{ forecast.historicalYield }} <span class="unit">t/ha</span></div>
            <div class="summary-label">Historical Average</div>
            <div class="summary-vs">Previous season baseline</div>
          </div>
        </div>

        <div class="summary-card card">
          <div class="summary-visual">
            <div class="confidence-gauge">
              <svg viewBox="0 0 36 36">
                <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="gauge-fill" [style.stroke-dasharray]="forecast.confidence + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="gauge-val">{{ forecast.confidence }}</span>
            </div>
          </div>
          <div class="summary-content">
            <div class="summary-label">AI Confidence</div>
            <div class="confidence-bar">
              <div class="progress-bar-track" style="height:6px;border-radius:3px">
                <div class="progress-bar-fill" [style.width]="forecast.confidence + '%'" style="background:linear-gradient(90deg, #FF9800, #4CAF50)"></div>
              </div>
              <span class="confidence-note">High accuracy range</span>
            </div>
          </div>
        </div>

        <div class="summary-card card">
          <div class="summary-visual success">
            <div class="summary-icon-ring success">
              <mat-icon>payments</mat-icon>
            </div>
          </div>
          <div class="summary-content">
            <div class="summary-val success">R <span style="font-size:20px">23,870</span></div>
            <div class="summary-label">Revenue Forecast</div>
            <div class="summary-vs">Based on current SAFEX prices</div>
          </div>
        </div>
      </div>

      <div class="forecast-grid">
        <!-- Yield Chart -->
        <div class="card yield-chart-card">
          <div class="card-header">
            <h3><mat-icon>show_chart</mat-icon> Monthly Yield Accumulation</h3>
            <div class="chart-legend">
              <div class="legend-item"><span class="legend-dot predicted"></span>Predicted {{ forecast.predictedYield }}t/ha</div>
              <div class="legend-item"><span class="legend-dot historical"></span>Historical {{ forecast.historicalYield }}t/ha</div>
            </div>
          </div>
          <div class="yield-chart">
            @for (d of forecast.monthlyData; track d.month) {
              <div class="chart-bar-group">
                <div class="chart-bars">
                  <div class="chart-bar predicted" [style.height]="(d.predicted / forecast.predictedYield * 180) + 'px'" [matTooltip]="'Predicted: ' + d.predicted + ' t/ha'">
                    <span class="bar-val">{{ d.predicted }}</span>
                  </div>
                  <div class="chart-bar historical" [style.height]="(d.historical / forecast.predictedYield * 180) + 'px'" [matTooltip]="'Historical: ' + d.historical + ' t/ha'">
                    <span class="bar-val">{{ d.historical }}</span>
                  </div>
                </div>
                <span class="chart-label">{{ d.month }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Risk Factors -->
        <div class="card factors-card">
          <div class="card-header">
            <h3><mat-icon>analytics</mat-icon> Yield Impact Factors</h3>
          </div>
          <div class="factors-list">
            @for (factor of forecast.factors; track factor.name) {
              <div class="factor-item">
                <div class="factor-header">
                  <div class="factor-info">
                    <span class="factor-impact-icon" [class.positive]="factor.impact === 'positive'" [class.negative]="factor.impact === 'negative'">
                      <mat-icon>{{ factor.impact === 'positive' ? 'arrow_upward' : factor.impact === 'negative' ? 'arrow_downward' : 'remove' }}</mat-icon>
                    </span>
                    <span class="factor-name">{{ factor.name }}</span>
                  </div>
                  <span class="factor-score" [style.color]="scoreColor(factor.impact, factor.score)">{{ factor.score }}%</span>
                </div>
                <div class="progress-bar-track" style="margin:8px 0;height:5px;border-radius:3px">
                  <div class="progress-bar-fill" [style.width]="factor.score + '%'" [style.background]="scoreColor(factor.impact, factor.score)"></div>
                </div>
                <p class="factor-desc">{{ factor.description }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- AI Recommendations -->
      <div class="card recommendations-card">
        <div class="rec-header">
          <div class="rec-title">
            <div class="icon-wrap icon-wrap-primary" style="width:40px;height:40px;font-size:20px"><mat-icon>psychology</mat-icon></div>
            <div>
              <h3>AI Yield Improvement Recommendations</h3>
              <span style="font-size:12px;color:var(--text-muted)">Based on current field conditions and weather patterns</span>
            </div>
          </div>
        </div>
        <div class="rec-grid">
          @for (rec of yieldRecs; track rec.title) {
            <div class="rec-card">
              <div class="rec-visual {{ rec.iconClass }}">
                <mat-icon>{{ rec.icon }}</mat-icon>
              </div>
              <h4>{{ rec.title }}</h4>
              <p>{{ rec.description }}</p>
              <div class="rec-meta">
                <span class="badge {{ rec.badgeClass }}">+{{ rec.improvement }}% yield</span>
                <button class="btn btn-sm btn-ghost"><mat-icon>arrow_forward</mat-icon></button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Daily Overview -->
      <div class="card daily-overview-card" style="margin-top:24px">
        <div class="overview-header">
          <h3><mat-icon>calendar_today</mat-icon> Daily Field Overview</h3>
          <span style="font-size:12px;color:var(--text-muted)">July 3, 2026</span>
        </div>
        <div class="overview-grid">
          <div class="overview-item">
            <span class="overview-label">Growing Days</span>
            <span class="overview-val">78 <span class="ov-unit">days</span></span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Growth Stage</span>
            <span class="overview-val">V12 <span class="ov-unit">12-leaf</span></span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Days to Harvest</span>
            <span class="overview-val">82 <span class="ov-unit">days</span></span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Moisture Stress</span>
            <span class="overview-val success">Low</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Nutrient Status</span>
            <span class="overview-val warning">Moderate</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Pest Risk</span>
            <span class="overview-val danger">High</span>
          </div>
        </div>
      </div>

      <!-- Harvest Optimizer -->
      <div class="harvest-optimizer-card" style="margin-top:24px">
        <div class="optimizer-header">
          <h3><mat-icon>autorenew</mat-icon> Harvest Opportunity Optimizer</h3>
          <span class="badge badge-warning">AI Active</span>
        </div>
        <div class="optimizer-content">
          <div class="optimizer-main">
            <div class="opt-stat primary">
              <span class="opt-label">Best Harvest Window</span>
              <span class="opt-val">Oct 15 - Oct 28</span>
              <span class="opt-note">Based on weather forecast</span>
            </div>
            <div class="opt-stat">
              <span class="opt-label">Expected Price</span>
              <span class="opt-val">R3,420/t</span>
              <span class="opt-note">SAFEX Dec contract</span>
            </div>
            <div class="opt-stat">
              <span class="opt-label">Revenue Potential</span>
              <span class="opt-val">R28,650</span>
              <span class="opt-note">At 8.4t/ha yield</span>
            </div>
          </div>
          <div class="optimizer-chart">
            <div class="price-trend">
              <div class="trend-labels">
                <span>R3,200</span>
                <span>R3,400</span>
                <span>R3,600</span>
              </div>
              <div class="trend-bars">
                @for (bar of priceTrendBars; track bar.month) {
                  <div class="trend-bar" [style.height]="(bar.value / 3600 * 100) + '%'" [class.highlight]="bar.month === 'Oct'"></div>
                }
              </div>
              <div class="trend-months">
                @for (bar of priceTrendBars; track bar.month) {
                  <span>{{ bar.month }}</span>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="optimizer-actions">
          <button class="btn btn-outline"><mat-icon>notifications</mat-icon> Set Alert</button>
          <button class="btn btn-primary"><mat-icon>psychology</mat-icon> Full Analysis</button>
        </div>
      </div>

      <!-- Nearby Buyers -->
      <div class="card" style="margin-top:24px">
        <div class="card-header">
          <h3><mat-icon>store</mat-icon> Nearby Buyers ({{ nearbyBuyers.length }})</h3>
          <button class="btn btn-sm btn-ghost"><mat-icon>map</mat-icon> View Map</button>
        </div>
        <div class="buyers-grid">
          @for (buyer of nearbyBuyers; track buyer.name) {
            <div class="buyer-card">
              <div class="buyer-avatar">
                <mat-icon>store</mat-icon>
              </div>
              <div class="buyer-info">
                <span class="buyer-name">{{ buyer.name }}</span>
                <span class="buyer-loc">{{ buyer.location }}</span>
                <span class="buyer-dist">{{ buyer.distance }} km away</span>
              </div>
              <div class="buyer-price">
                <span class="price-val">R{{ buyer.price }}/t</span>
                <button class="btn btn-sm btn-outline">Contact</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 10px; }
    .forecast-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { padding: 20px; display: flex; gap: 16px; align-items: flex-start; }
    .primary-card { border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(46,125,50,0.05), transparent); }
    .summary-visual { flex-shrink: 0; }
    .summary-icon-ring { width: 52px; height: 52px; border-radius: 14px; background: rgba(46,125,50,0.1); display: flex; align-items: center; justify-content: center; position: relative; }
    .summary-icon-ring mat-icon { font-size: 26px; color: var(--primary); }
    .summary-icon-ring.neutral { background: rgba(107,114,128,0.1); }
    .summary-icon-ring.neutral mat-icon { color: var(--text-secondary); }
    .summary-icon-ring.success { background: rgba(76,175,80,0.1); }
    .summary-icon-ring.success mat-icon { color: var(--success); }
    .summary-trend { position: absolute; top: -6px; right: -6px; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 2px; }
    .summary-trend.trend-up { background: var(--success); color: #fff; }
    .summary-trend mat-icon { font-size: 12px; }
    .summary-content { flex: 1; }
    .summary-val { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
    .summary-val span.unit { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .summary-val.secondary { color: var(--text-secondary); }
    .summary-val.success { color: var(--success); }
    .summary-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .summary-vs { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

    .confidence-gauge { position: relative; width: 52px; height: 52px; }
    .confidence-gauge svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .gauge-bg { fill: none; stroke: rgba(245,158,11,0.2); stroke-width: 3; }
    .gauge-fill { fill: none; stroke: url(#gaugeGrad); stroke-width: 3; stroke-linecap: round; }
    .gauge-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 800; color: var(--warning); }
    .confidence-bar { margin-top: 8px; }
    .confidence-note { font-size: 10px; color: var(--text-muted); margin-top: 4px; display: block; }

    .forecast-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }

    .yield-chart-card { }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .card-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
    .card-header h3 mat-icon { font-size: 18px; color: var(--primary); }
    .chart-legend { display: flex; gap: 16px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; }
    .legend-dot.predicted { background: var(--primary); }
    .legend-dot.historical { background: rgba(107,114,128,0.3); }

    .yield-chart { display: flex; align-items: flex-end; gap: 16px; height: 200px; padding: 16px 8px; background: var(--bg-subtle); border-radius: var(--radius-sm); margin-bottom: 12px; }
    .chart-bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
    .chart-bars { display: flex; gap: 4px; align-items: flex-end; width: 100%; justify-content: center; }
    .chart-bar { width: 18px; border-radius: 4px 4px 0 0; transition: height 0.8s cubic-bezier(0.4,0,0.2,1); min-height: 4px; position: relative; }
    .chart-bar.predicted { background: linear-gradient(180deg, var(--primary), rgba(46,125,50,0.7)); }
    .chart-bar.historical { background: rgba(107,114,128,0.3); }
    .bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 600; color: var(--text-muted); opacity: 0; transition: opacity var(--transition); }
    .chart-bar:hover .bar-val { opacity: 1; }
    .chart-label { font-size: 11px; color: var(--text-muted); text-align: center; }

    .factors-card { }
    .factors-list { display: flex; flex-direction: column; gap: 14px; }
    .factor-item { padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .factor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .factor-info { display: flex; align-items: center; gap: 10px; }
    .factor-impact-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(107,114,128,0.1); }
    .factor-impact-icon mat-icon { font-size: 14px; }
    .factor-impact-icon.positive { background: rgba(76,175,80,0.15); color: var(--success); }
    .factor-impact-icon.negative { background: rgba(239,68,68,0.15); color: var(--danger); }
    .factor-name { font-size: 13px; font-weight: 600; }
    .factor-score { font-size: 14px; font-weight: 700; }
    .factor-desc { font-size: 11px; color: var(--text-muted); margin: 0; }

    .recommendations-card { }
    .rec-header { margin-bottom: 20px; }
    .rec-title { display: flex; align-items: center; gap: 12px; }
    .rec-title h3 { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
    .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .rec-card { padding: 20px; border: 1px solid var(--border); border-radius: var(--radius); transition: all var(--transition); }
    .rec-card:hover { border-color: var(--primary); box-shadow: var(--shadow); }
    .rec-visual { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .rec-visual mat-icon { font-size: 22px; }
    .rec-visual.water { background: rgba(33,150,243,0.15); color: #1976D2; }
    .rec-visual.bug { background: rgba(239,68,68,0.0.15); color: var(--danger); }
    .rec-visual.fert { background: rgba(121,85,72,0.15); color: #5D4037; }
    .rec-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .rec-card p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; }
    .rec-meta { display: flex; align-items: center; justify-content: space-between; }

    .daily-overview-card { }
    .overview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .overview-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
    .overview-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
    .overview-item { text-align: center; padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .overview-label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px; }
    .overview-val { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; }
    .overview-val.success { color: var(--success); }
    .overview-val.warning { color: var(--warning); }
    .overview-val.danger { color: var(--danger); }
    .ov-unit { font-size: 11px; font-weight: 500; color: var(--text-muted); }

    .harvest-optimizer-card { background: #1B3A2D; border-radius: var(--radius); padding: 24px; color: #fff; }
    .optimizer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .optimizer-header h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }
    .optimizer-header h3 mat-icon { font-size: 20px; color: #81C784; }
    .optimizer-content { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
    .optimizer-main { display: flex; flex-direction: column; gap: 16px; }
    .opt-stat { }
    .opt-stat.primary { padding: 16px; background: rgba(255,255,255,0.1); border-radius: var(--radius-sm); }
    .opt-label { font-size: 11px; color: rgba(255,255,255,0.7); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .opt-val { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 700; display: block; }
    .opt-note { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px; display: block; }

    .optimizer-chart { background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); padding: 16px; }
    .price-trend { height: 140px; display: flex; flex-direction: column; }
    .trend-labels { display: flex; flex-direction: column; justify-content: space-between; height: 100px; padding-right: 8px; }
    .trend-labels span { font-size: 9px; color: rgba(255,255,255,0.6); text-align: right; width: 40px; }
    .trend-bars { display: flex; align-items: flex-end; gap: 8px; flex: 1; }
    .trend-bar { flex: 1; background: rgba(255,255,255,0.2); border-radius: 3px 3px 0 0; min-height: 4px; transition: all var(--transition); }
    .trend-bar.highlight { background: #81C784; }
    .trend-months { display: flex; gap: 8px; margin-top: 6px; }
    .trend-months span { flex: 1; text-align: center; font-size: 10px; color: rgba(255,255,255,0.6); }
    .optimizer-actions { display: flex; gap: 10px; margin-top: 20px; }
    .optimizer-actions .btn-outline { border-color: rgba(255,255,255,0.3); color: #fff; }
    .optimizer-actions .btn-outline:hover { background: rgba(255,255,255,0.1); }
    .optimizer-actions .btn-primary { background: #81C784; color: #1B3A2D; }
    .optimizer-actions .btn-primary:hover { background: #A5D6A7; }

    .buyers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .buyer-card { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); }
    .buyer-avatar { width: 40px; height: 40px; border-radius: 10px; background: rgba(46,125,50,0.1); display: flex; align-items: center; justify-content: center; }
    .buyer-avatar mat-icon { font-size: 20px; color: var(--primary); }
    .buyer-info { flex: 1; }
    .buyer-name { font-size: 13px; font-weight: 600; display: block; }
    .buyer-loc { font-size: 11px; color: var(--text-muted); }
    .buyer-dist { font-size: 10px; color: var(--text-muted); }
    .buyer-price { text-align: right; }
    .price-val { font-size: 14px; font-weight: 700; color: var(--primary); display: block; margin-bottom: 4px; }

    @media (max-width: 1200px) {
      .forecast-summary { grid-template-columns: repeat(2, 1fr); }
      .overview-grid { grid-template-columns: repeat(3, 1fr); }
      .buyers-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .forecast-grid { grid-template-columns: 1fr; }
      .rec-grid { grid-template-columns: 1fr; }
      .optimizer-content { grid-template-columns: 1fr; }
      .overview-grid { grid-template-columns: repeat(2, 1fr); }
      .buyers-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class YieldForecastComponent {
  state = inject(AppStateService);

  // Default forecast data - in production this would come from AI/API
  forecast: YieldForecastData = {
    cropName: 'Crops',
    predictedYield: 5.5,
    historicalYield: 4.2,
    unit: 'tons/ha',
    confidence: 78,
    factors: [
      { name: 'Rainfall', impact: 'positive', score: 75, description: 'Above-average rainfall expected' },
      { name: 'Temperature', impact: 'neutral', score: 50, description: 'Normal temperatures' },
      { name: 'Soil Health', impact: 'positive', score: 82, description: 'Good soil conditions' },
      { name: 'Pest Pressure', impact: 'negative', score: 40, description: 'Moderate pest risk' },
    ],
    monthlyData: [
      { month: 'Nov', predicted: 0, historical: 0 },
      { month: 'Dec', predicted: 0.8, historical: 0.5 },
      { month: 'Jan', predicted: 2.0, historical: 1.4 },
      { month: 'Feb', predicted: 3.5, historical: 2.8 },
      { month: 'Mar', predicted: 4.8, historical: 3.8 },
      { month: 'Apr', predicted: 5.5, historical: 4.2 },
    ],
  };

  pctChange() {
    return (((this.forecast.predictedYield - this.forecast.historicalYield) / this.forecast.historicalYield) * 100).toFixed(1);
  }

  scoreColor(impact: string, score: number) {
    if (impact === 'positive') return '#4CAF50';
    if (impact === 'negative') return '#EF4444';
    return '#9CA3AF';
  }

  yieldRecs = [
    { icon: 'water_drop', title: 'Optimise Irrigation Timing', description: 'AI analysis shows reducing irrigation frequency but increasing volume per session could improve yield by 8%.', improvement: '8', iconClass: 'water', badgeClass: 'badge-info' },
    { icon: 'bug_report', title: 'Preventive Pest Management', description: 'Apply Chlorpyrifos at VE stage to prevent Fall Armyworm damage that historically reduces yield by 12%.', improvement: '12', iconClass: 'bug', badgeClass: 'badge-warning' },
    { icon: 'compost', title: 'Split Fertiliser Application', description: 'Applying LAN in 3 splits instead of 2 can improve nitrogen uptake efficiency and boost yield.', improvement: '6', iconClass: 'fert', badgeClass: 'badge-success' },
  ];

  priceTrendBars = [
    { month: 'Jul', value: 3280 },
    { month: 'Aug', value: 3310 },
    { month: 'Sep', value: 3350 },
    { month: 'Oct', value: 3420 },
    { month: 'Nov', value: 3380 },
    { month: 'Dec', value: 3440 },
  ];

  nearbyBuyers = [
    { name: 'AGRI-ZIM Grain Buyers', location: 'Harare', distance: 12, price: 3350 },
    { name: 'Mashonaland Grains', location: 'Borrowdale', distance: 18, price: 3320 },
    { name: 'ZimGrain Co', location: 'Mount Pleasant', distance: 25, price: 3380 },
  ];
}
