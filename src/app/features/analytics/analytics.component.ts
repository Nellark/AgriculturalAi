import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { signal } from '@angular/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="page-subtitle">Farm performance insights and data visualization</p>
        </div>
        <div class="period-select">
          @for (p of periods; track p) {
            <button class="chip" [class.active]="period() === p" (click)="setPeriod(p)">{{ p }}</button>
          }
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card card">
            <div class="kpi-header">
              <span class="kpi-label">{{ kpi.label }}</span>
              <span class="trend-badge {{ kpi.trend > 0 ? 'trend-up' : kpi.trend < 0 ? 'trend-down' : '' }}">
                <mat-icon>{{ kpi.trend > 0 ? 'arrow_upward' : kpi.trend < 0 ? 'arrow_downward' : 'remove' }}</mat-icon>
                {{ Math.abs(kpi.trend) }}%
              </span>
            </div>
            <div class="kpi-value">{{ kpi.value }}</div>
            <div class="kpi-sparkline">
              @for (v of kpi.sparkline; track $index) {
                <div class="spark" [style.height]="v + 'px'" [class.highlight]="$last"></div>
              }
            </div>
          </div>
        }
      </div>

      <div class="analytics-grid">
        <!-- Revenue vs Expenses -->
        <div class="card chart-card">
          <div class="chart-card-header">
            <h3>Revenue vs Expenses</h3>
            <span class="badge badge-success">Net: R 18,240</span>
          </div>
          <div class="bar-chart">
            @for (m of monthlyFinancial; track m.month) {
              <div class="bar-group">
                <div class="bars">
                  <div class="bar revenue" [style.height]="(m.revenue / maxFinancial * 120) + 'px'" [title]="'Revenue: R' + m.revenue.toLocaleString()"></div>
                  <div class="bar expense" [style.height]="(m.expense / maxFinancial * 120) + 'px'" [title]="'Expenses: R' + m.expense.toLocaleString()"></div>
                </div>
                <span class="bar-label">{{ m.month }}</span>
              </div>
            }
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot" style="background:var(--primary)"></span>Revenue</div>
            <div class="legend-item"><span class="legend-dot" style="background:rgba(239,68,68,0.6)"></span>Expenses</div>
          </div>
        </div>

        <!-- Crop Performance -->
        <div class="card chart-card">
          <div class="chart-card-header">
            <h3>Crop Performance</h3>
          </div>
          <div class="crop-performance">
            @for (crop of cropPerformance; track crop.name) {
              <div class="crop-perf-item">
                <div class="perf-name">{{ crop.name }}</div>
                <div class="perf-bar-wrap">
                  <div class="perf-bar" [style.width]="crop.score + '%'" [style.background]="perfColor(crop.score)"></div>
                </div>
                <div class="perf-score" [style.color]="perfColor(crop.score)">{{ crop.score }}%</div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Water Usage -->
        <div class="card">
          <h3 style="margin-bottom:16px">Water Usage (m³)</h3>
          <div class="line-chart">
            @for (w of waterUsage; track w.month) {
              <div class="line-col">
                <div class="line-bar-outer">
                  <div class="line-bar-inner" [style.height]="(w.used / maxWater * 100) + '%'"></div>
                </div>
                <span class="bar-label">{{ w.month }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Disease Incidence -->
        <div class="card">
          <h3 style="margin-bottom:16px">Disease Incidence (This Season)</h3>
          <div class="disease-list">
            @for (d of diseaseStats; track d.name) {
              <div class="disease-row">
                <div class="disease-indicator" [style.background]="d.color"></div>
                <span class="disease-name">{{ d.name }}</span>
                <div class="disease-bar-wrap">
                  <div class="disease-bar" [style.width]="d.pct + '%'" [style.background]="d.color + '60'"></div>
                </div>
                <span class="disease-pct">{{ d.pct }}%</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div class="icon-wrap icon-wrap-primary" style="width:38px;height:38px;font-size:19px;border-radius:10px"><mat-icon>psychology</mat-icon></div>
          <h3>AI Performance Insights</h3>
        </div>
        <div class="grid-3">
          @for (insight of aiInsights; track insight.title) {
            <div class="insight-card">
              <mat-icon [style.color]="insight.color">{{ insight.icon }}</mat-icon>
              <h4>{{ insight.title }}</h4>
              <p>{{ insight.text }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .period-select { display: flex; gap: 6px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .trend-badge { display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 600; }
    .trend-badge mat-icon { font-size: 12px; }
    .kpi-value { font-family: 'Poppins',sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    .kpi-sparkline { display: flex; align-items: flex-end; gap: 2px; height: 30px; }
    .spark { flex: 1; border-radius: 2px 2px 0 0; background: rgba(46,125,50,0.2); min-height: 2px; }
    .spark.highlight { background: var(--primary); }
    .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .chart-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .chart-card-header h3 { font-size: 15px; font-weight: 700; }
    .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 140px; margin-bottom: 12px; }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bars { display: flex; gap: 3px; align-items: flex-end; width: 100%; justify-content: center; }
    .bar { width: 12px; border-radius: 3px 3px 0 0; min-height: 2px; }
    .bar.revenue { background: var(--primary); }
    .bar.expense { background: rgba(239,68,68,0.6); }
    .bar-label { font-size: 10px; color: var(--text-muted); }
    .chart-legend { display: flex; gap: 16px; justify-content: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .crop-performance { display: flex; flex-direction: column; gap: 12px; }
    .crop-perf-item { display: flex; align-items: center; gap: 12px; }
    .perf-name { font-size: 13px; font-weight: 500; min-width: 90px; }
    .perf-bar-wrap { flex: 1; height: 8px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .perf-bar { height: 100%; border-radius: 99px; transition: width 1s; }
    .perf-score { font-size: 13px; font-weight: 700; min-width: 40px; text-align: right; }
    .line-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
    .line-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .line-bar-outer { width: 100%; height: 100px; background: var(--bg-subtle); border-radius: 6px; overflow: hidden; display: flex; align-items: flex-end; }
    .line-bar-inner { width: 100%; background: linear-gradient(to top, var(--info), rgba(59,130,246,0.3)); border-radius: 6px; transition: height 1s; }
    .disease-list { display: flex; flex-direction: column; gap: 10px; }
    .disease-row { display: flex; align-items: center; gap: 10px; }
    .disease-indicator { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .disease-name { font-size: 13px; min-width: 160px; }
    .disease-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .disease-bar { height: 100%; border-radius: 99px; }
    .disease-pct { font-size: 12px; font-weight: 600; min-width: 36px; text-align: right; }
    .insight-card { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); }
    .insight-card mat-icon { font-size: 24px; margin-bottom: 8px; }
    .insight-card h4 { font-size: 14px; margin-bottom: 6px; }
    .insight-card p { font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; }
    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .analytics-grid { grid-template-columns: 1fr; } }
  `],
})
export class AnalyticsComponent {
  period = signal('This Season');
  periods = ['This Week', 'This Month', 'This Season', 'This Year'];
  Math = Math;

  maxFinancial = 15000;
  maxWater = 500;

  kpis = [
    { label: 'Total Revenue', value: 'R 43,090', trend: 18, sparkline: [10, 14, 9, 16, 12, 18, 15, 20, 22] },
    { label: 'Total Expenses', value: 'R 24,850', trend: -5, sparkline: [12, 11, 15, 13, 11, 10, 9, 11, 10] },
    { label: 'Avg Yield', value: '5.8 t/ha', trend: 21, sparkline: [5, 6, 4, 7, 5, 6, 8, 7, 9] },
    { label: 'Farm Health', value: '87%', trend: 4, sparkline: [78, 80, 76, 82, 83, 85, 84, 86, 87] },
  ];

  monthlyFinancial = [
    { month: 'Nov', revenue: 2000, expense: 4200 },
    { month: 'Dec', revenue: 4500, expense: 3800 },
    { month: 'Jan', revenue: 7200, expense: 5100 },
    { month: 'Feb', revenue: 9800, expense: 4600 },
    { month: 'Mar', revenue: 12400, expense: 4100 },
    { month: 'Apr', revenue: 8100, expense: 3050 },
  ];

  cropPerformance = [
    { name: 'Tomatoes', score: 92 },
    { name: 'Groundnuts', score: 88 },
    { name: 'Maize', score: 83 },
    { name: 'Cassava', score: 80 },
    { name: 'Beans', score: 75 },
    { name: 'Spinach', score: 72 },
  ];

  waterUsage = [
    { month: 'Nov', used: 120 }, { month: 'Dec', used: 180 }, { month: 'Jan', used: 320 },
    { month: 'Feb', used: 460 }, { month: 'Mar', used: 380 }, { month: 'Apr', used: 240 },
  ];

  diseaseStats = [
    { name: 'Northern Corn Leaf Blight', pct: 35, color: '#EF4444' },
    { name: 'Early Blight (Tomatoes)', pct: 25, color: '#F59E0B' },
    { name: 'Powdery Mildew', pct: 20, color: '#8B5CF6' },
    { name: 'Fall Armyworm', pct: 15, color: '#EC4899' },
    { name: 'Other', pct: 5, color: '#9CA3AF' },
  ];

  setPeriod(p: string) {
    this.period.set(p);
    
    // Scale data based on period
    const mult = p === 'This Week' ? 0.05 : p === 'This Month' ? 0.25 : p === 'This Season' ? 1 : 3.5;
    
    this.maxFinancial = 15000 * mult;
    this.maxWater = 500 * mult;

    this.kpis = [
      { label: 'Total Revenue', value: 'R ' + (43090 * mult).toLocaleString(undefined, {maximumFractionDigits:0}), trend: p === 'This Week' ? 2 : p === 'This Year' ? 32 : 18, sparkline: Array.from({length: 9}, () => Math.floor(Math.random() * 15) + 5) },
      { label: 'Total Expenses', value: 'R ' + (24850 * mult).toLocaleString(undefined, {maximumFractionDigits:0}), trend: p === 'This Week' ? 1 : -5, sparkline: Array.from({length: 9}, () => Math.floor(Math.random() * 15) + 5) },
      { label: 'Avg Yield', value: (5.8).toLocaleString() + ' t/ha', trend: p === 'This Week' ? 0 : 21, sparkline: Array.from({length: 9}, () => Math.floor(Math.random() * 10) + 2) },
      { label: 'Farm Health', value: Math.floor(80 + Math.random() * 15) + '%', trend: Math.floor(Math.random() * 10) - 2, sparkline: Array.from({length: 9}, () => Math.floor(Math.random() * 20) + 70) },
    ];

    this.monthlyFinancial = [
      { month: 'Nov', revenue: 2000 * mult, expense: 4200 * mult },
      { month: 'Dec', revenue: 4500 * mult, expense: 3800 * mult },
      { month: 'Jan', revenue: 7200 * mult, expense: 5100 * mult },
      { month: 'Feb', revenue: 9800 * mult, expense: 4600 * mult },
      { month: 'Mar', revenue: 12400 * mult, expense: 4100 * mult },
      { month: 'Apr', revenue: 8100 * mult, expense: 3050 * mult },
    ];

    this.cropPerformance = [
      { name: 'Tomatoes', score: Math.floor(75 + Math.random() * 20) },
      { name: 'Groundnuts', score: Math.floor(70 + Math.random() * 20) },
      { name: 'Maize', score: Math.floor(65 + Math.random() * 20) },
      { name: 'Cassava', score: Math.floor(60 + Math.random() * 20) },
      { name: 'Beans', score: Math.floor(55 + Math.random() * 20) },
      { name: 'Spinach', score: Math.floor(50 + Math.random() * 20) },
    ].sort((a,b) => b.score - a.score);

    this.waterUsage = [
      { month: 'Nov', used: 120 * mult }, { month: 'Dec', used: 180 * mult }, { month: 'Jan', used: 320 * mult },
      { month: 'Feb', used: 460 * mult }, { month: 'Mar', used: 380 * mult }, { month: 'Apr', used: 240 * mult },
    ];

    const diseases = ['Northern Corn Leaf Blight', 'Early Blight (Tomatoes)', 'Powdery Mildew', 'Fall Armyworm', 'Spider Mites', 'Rust', 'Aphids'];
    const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#14B8A6'];
    const shuffled = diseases.sort(() => 0.5 - Math.random()).slice(0, 4);
    let rem = 100;
    this.diseaseStats = shuffled.map((name, i) => {
      const pct = i === 3 ? rem : Math.floor(Math.random() * 20) + 10;
      rem -= pct;
      return { name, pct, color: colors[i] };
    });
    if (rem > 0) {
      this.diseaseStats.push({ name: 'Other', pct: rem, color: '#9CA3AF' });
    }
    this.diseaseStats.sort((a,b) => b.pct - a.pct);
  }

  aiInsights = [
    { icon: 'trending_up', color: '#4CAF50', title: 'Revenue Growth Opportunity', text: 'Shifting 1ha from maize to tomatoes could increase revenue by R 12,000 per season based on current market prices.' },
    { icon: 'water_drop', color: '#3B82F6', title: 'Irrigation Efficiency', text: 'Your water usage is 23% above regional average for similar crops. Switching to drip irrigation could save R 3,200/season.' },
    { icon: 'bug_report', color: '#EF4444', title: 'Disease Pattern Alert', text: 'NCLB incidence is 18% higher than last season. Preventive fungicide application recommended before the rainy season.' },
  ];

  perfColor(score: number) {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  }
}
