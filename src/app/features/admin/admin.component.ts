import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { signal } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <div class="badge badge-danger" style="margin-bottom:8px">Admin Panel</div>
          <h1 class="page-title">Platform Overview</h1>
          <p class="page-subtitle">AgriGrow Africa · Super Admin Dashboard</p>
        </div>
      </div>

      <!-- Admin KPIs -->
      <div class="admin-kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card card">
            <div class="kpi-icon icon-wrap {{ kpi.iconClass }}"><mat-icon>{{ kpi.icon }}</mat-icon></div>
            <div class="kpi-val">{{ kpi.value }}</div>
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-change trend-up"><mat-icon>arrow_upward</mat-icon>{{ kpi.change }}% this month</div>
          </div>
        }
      </div>

      <div class="admin-grid">
        <!-- User Stats -->
        <div class="card">
          <h3 style="margin-bottom:16px">Farmers by Country</h3>
          @for (c of countryStats; track c.country) {
            <div class="country-row">
              <span class="country-flag">{{ c.flag }}</span>
              <span class="country-name">{{ c.country }}</span>
              <div class="country-bar-wrap">
                <div class="country-bar" [style.width]="(c.farmers / 8000 * 100) + '%'"></div>
              </div>
              <span class="country-count">{{ c.farmers.toLocaleString() }}</span>
            </div>
          }
        </div>

        <!-- Disease Reports -->
        <div class="card">
          <h3 style="margin-bottom:16px">Top Disease Reports (30 days)</h3>
          @for (d of diseaseReports; track d.name) {
            <div class="disease-admin-row">
              <div class="icon-wrap icon-wrap-danger" style="width:34px;height:34px;font-size:17px;border-radius:8px;flex-shrink:0"><mat-icon>bug_report</mat-icon></div>
              <div style="flex:1">
                <div style="font-size:13.5px;font-weight:600">{{ d.name }}</div>
                <div class="progress-bar-track" style="margin-top:4px;height:4px">
                  <div class="progress-bar-fill" [style.width]="d.pct + '%'" style="background:var(--danger)"></div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:13.5px;font-weight:700">{{ d.reports }}</div>
                <div style="font-size:11px;color:var(--text-muted)">reports</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Users Table -->
      <div class="card" style="margin-top:0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3>Recent Farmer Registrations</h3>
          <button class="btn btn-outline btn-sm"><mat-icon>download</mat-icon> Export CSV</button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Farm Size</th>
              <th>Crops</th>
              <th>Registered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (u of recentUsers; track u.name) {
              <tr>
                <td><div class="user-cell"><div class="user-avatar-sm">{{ u.name.charAt(0) }}</div>{{ u.name }}</div></td>
                <td>{{ u.country }}</td>
                <td>{{ u.farmSize }}</td>
                <td>{{ u.crops }}</td>
                <td>{{ u.registered }}</td>
                <td><span class="badge badge-success">Active</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .admin-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; text-align: center; }
    .kpi-icon { width: 48px; height: 48px; font-size: 24px; border-radius: 12px; margin: 0 auto 12px; }
    .kpi-val { font-family: 'Poppins',sans-serif; font-size: 28px; font-weight: 800; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .kpi-change { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 11.5px; font-weight: 600; margin-top: 6px; }
    .kpi-change mat-icon { font-size: 12px; }
    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .country-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
    .country-row:last-child { border-bottom: none; }
    .country-flag { font-size: 18px; }
    .country-name { font-size: 13px; font-weight: 500; min-width: 120px; }
    .country-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .country-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent-dark)); border-radius: 99px; transition: width 1s; }
    .country-count { font-size: 13px; font-weight: 700; min-width: 50px; text-align: right; }
    .disease-admin-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
    .disease-admin-row:last-child { border-bottom: none; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 8px 12px; border-bottom: 1px solid var(--border); }
    .admin-table td { padding: 12px; font-size: 13.5px; border-bottom: 1px solid var(--border-light); }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tr:hover td { background: var(--bg-subtle); }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,var(--primary),var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    @media (max-width: 1024px) { .admin-kpi-grid { grid-template-columns: repeat(2,1fr); } .admin-grid { grid-template-columns: 1fr; } }
  `],
})
export class AdminComponent {
  kpis = [
    { icon: 'groups', label: 'Total Farmers', value: '24,318', change: 12.4, iconClass: 'icon-wrap-primary' },
    { icon: 'yard', label: 'Hectares Managed', value: '2.8M', change: 8.7, iconClass: 'icon-wrap-accent' },
    { icon: 'storefront', label: 'Marketplace Sales', value: 'R 1.2B', change: 22.1, iconClass: 'icon-wrap-warning' },
    { icon: 'biotech', label: 'Disease Scans', value: '486K', change: 31.5, iconClass: 'icon-wrap-danger' },
  ];

  countryStats = [
    { country: 'South Africa', flag: '🇿🇦', farmers: 7840 },
    { country: 'Kenya', flag: '🇰🇪', farmers: 5120 },
    { country: 'Nigeria', flag: '🇳🇬', farmers: 4380 },
    { country: 'Ghana', flag: '🇬🇭', farmers: 2910 },
    { country: 'Zimbabwe', flag: '🇿🇼', farmers: 1780 },
    { country: 'Zambia', flag: '🇿🇲', farmers: 1240 },
    { country: 'Uganda', flag: '🇺🇬', farmers: 890 },
    { country: 'Mozambique', flag: '🇲🇿', farmers: 158 },
  ];

  diseaseReports = [
    { name: 'Fall Armyworm (Maize)', reports: 3842, pct: 90 },
    { name: 'Early Blight (Tomatoes)', reports: 2156, pct: 72 },
    { name: 'Northern Corn Leaf Blight', reports: 1893, pct: 62 },
    { name: 'Cassava Mosaic Virus', reports: 1240, pct: 48 },
    { name: 'Powdery Mildew', reports: 980, pct: 38 },
  ];

  recentUsers = [
    { name: 'Amara Osei', country: 'Ghana', farmSize: '8 ha', crops: 'Maize, Cassava', registered: '2026-06-28' },
    { name: 'Faith Ndlovu', country: 'Zimbabwe', farmSize: '4.5 ha', crops: 'Tomatoes, Beans', registered: '2026-06-27' },
    { name: 'Samuel Kiprotich', country: 'Kenya', farmSize: '12 ha', crops: 'Tea, Maize', registered: '2026-06-27' },
    { name: 'Grace Bello', country: 'Nigeria', farmSize: '6 ha', crops: 'Groundnuts, Millet', registered: '2026-06-26' },
    { name: 'Tendai Moyo', country: 'Zambia', farmSize: '3.5 ha', crops: 'Sorghum, Cassava', registered: '2026-06-25' },
  ];
}
