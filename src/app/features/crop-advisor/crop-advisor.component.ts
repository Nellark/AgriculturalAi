import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crop-advisor',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">AI Crop Advisor</h1>
          <p class="page-subtitle">Get personalised crop recommendations based on your farm conditions</p>
        </div>
      </div>

      <div class="advisor-layout">
        <!-- Input Panel -->
        <div class="inputs-panel card">
          <h3 style="margin-bottom:20px;font-size:16px">Farm Conditions</h3>
          <div class="form-grid">
            <div class="field-group">
              <label>Province / Region</label>
              <select class="input-field" [(ngModel)]="inputs.province">
                @for (p of provinces; track p) { <option [value]="p">{{ p }}</option> }
              </select>
            </div>
            <div class="field-group">
              <label>Country</label>
              <select class="input-field" [(ngModel)]="inputs.country">
                @for (c of countries; track c) { <option [value]="c">{{ c }}</option> }
              </select>
            </div>
            <div class="field-group">
              <label>Farm Size (ha)</label>
              <input class="input-field" type="number" [(ngModel)]="inputs.farmSize" placeholder="e.g. 5" />
            </div>
            <div class="field-group">
              <label>Planting Season</label>
              <select class="input-field" [(ngModel)]="inputs.season">
                @for (s of seasons; track s) { <option [value]="s">{{ s }}</option> }
              </select>
            </div>
            <div class="field-group">
              <label>Soil Type</label>
              <select class="input-field" [(ngModel)]="inputs.soilType">
                @for (s of soilTypes; track s) { <option [value]="s">{{ s }}</option> }
              </select>
            </div>
            <div class="field-group">
              <label>Water Availability</label>
              <select class="input-field" [(ngModel)]="inputs.waterAvail">
                @for (w of waterOptions; track w) { <option [value]="w">{{ w }}</option> }
              </select>
            </div>
            <div class="field-group">
              <label>Budget (ZAR/ha)</label>
              <input class="input-field" type="number" [(ngModel)]="inputs.budget" placeholder="e.g. 5000" />
            </div>
            <div class="field-group">
              <label>Experience Level</label>
              <select class="input-field" [(ngModel)]="inputs.experience">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary w-full btn-lg" style="margin-top:20px;justify-content:center" (click)="getRecommendations()" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Analysing farm data... }
            @else { <mat-icon>psychology</mat-icon> Get AI Recommendations }
          </button>
        </div>

        <!-- Results Panel -->
        <div class="results-panel">
          @if (recommendations().length > 0) {
            <div class="ai-explanation card page-enter" style="margin-bottom:16px">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div class="icon-wrap icon-wrap-primary" style="width:40px;height:40px;font-size:20px;border-radius:10px;flex-shrink:0"><mat-icon>psychology</mat-icon></div>
                <div>
                  <h4 style="font-size:14px;margin-bottom:4px">AI Analysis</h4>
                  <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.6">Based on your conditions in {{ inputs.province }} with {{ inputs.soilType }} soil and {{ inputs.waterAvail.toLowerCase() }} water availability, here are the top crops for maximum profitability this {{ inputs.season.toLowerCase() }} season.</p>
                </div>
              </div>
            </div>

            @for (rec of recommendations(); track rec.crop) {
              <div class="rec-card card page-enter">
                <div class="rec-card-header">
                  <div class="rec-icon icon-wrap icon-wrap-primary" style="width:48px;height:48px;font-size:24px;border-radius:12px">
                    <mat-icon>{{ rec.icon }}</mat-icon>
                  </div>
                  <div class="rec-info">
                    <h3>{{ rec.crop }}</h3>
                    <div class="rec-badges">
                      <span class="badge badge-success">{{ rec.profitability }} profit</span>
                      <span class="badge {{ difficultyBadge(rec.difficulty) }}">{{ rec.difficulty }}</span>
                    </div>
                  </div>
                  <div class="rec-score">
                    <div class="score-circle" [style.background]="scoreGradient(rec.aiScore)">
                      <span>{{ rec.aiScore }}</span>
                    </div>
                    <span style="font-size:10px;color:var(--text-muted);text-align:center">AI Score</span>
                  </div>
                </div>

                <div class="rec-metrics">
                  <div class="metric">
                    <mat-icon>trending_up</mat-icon>
                    <div>
                      <span class="metric-value">{{ rec.expectedYield }}</span>
                      <span class="metric-label">Expected Yield</span>
                    </div>
                  </div>
                  <div class="metric">
                    <mat-icon>payments</mat-icon>
                    <div>
                      <span class="metric-value">{{ rec.revenueEstimate }}</span>
                      <span class="metric-label">Revenue Estimate</span>
                    </div>
                  </div>
                  <div class="metric">
                    <mat-icon>water_drop</mat-icon>
                    <div>
                      <span class="metric-value">{{ rec.waterReq }}</span>
                      <span class="metric-label">Water Requirement</span>
                    </div>
                  </div>
                  <div class="metric">
                    <mat-icon>event</mat-icon>
                    <div>
                      <span class="metric-value">{{ rec.duration }}</span>
                      <span class="metric-label">Growing Season</span>
                    </div>
                  </div>
                </div>

                <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">{{ rec.aiReason }}</p>

                <button class="btn btn-outline btn-sm"><mat-icon>info</mat-icon> Full Planting Guide</button>
              </div>
            }
          } @else {
            <div class="empty-advisor card">
              <div class="empty-icon"><mat-icon>tips_and_updates</mat-icon></div>
              <h3>Ready for AI recommendations</h3>
              <p>Fill in your farm conditions on the left and click "Get AI Recommendations" to see the best crops for your farm.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .advisor-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-group label { display: block; font-size: 12.5px; font-weight: 600; margin-bottom: 5px; color: var(--text-primary); }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ai-explanation { border-left: 3px solid var(--primary); }
    .rec-card { margin-bottom: 16px; }
    .rec-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
    .rec-info { flex: 1; }
    .rec-info h3 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
    .rec-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .score-circle { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Poppins',sans-serif; font-size: 16px; font-weight: 700; flex-shrink: 0; }
    .rec-score { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .rec-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
    .metric { display: flex; align-items: flex-start; gap: 8px; }
    .metric mat-icon { font-size: 18px; color: var(--primary); flex-shrink: 0; margin-top: 2px; }
    .metric-value { font-size: 14px; font-weight: 700; display: block; }
    .metric-label { font-size: 11px; color: var(--text-muted); display: block; }
    .empty-advisor { text-align: center; padding: 60px 32px; }
    .empty-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(46,125,50,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .empty-icon mat-icon { font-size: 36px; color: var(--primary); }
    .empty-advisor h3 { font-size: 18px; margin-bottom: 8px; }
    .empty-advisor p { font-size: 14px; color: var(--text-secondary); }
    @media (max-width: 1024px) { .advisor-layout { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } .rec-metrics { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class CropAdvisorComponent {
  loading = signal(false);
  recommendations = signal<any[]>([]);

  inputs = {
    province: 'Limpopo',
    country: 'South Africa',
    farmSize: 5,
    season: 'Summer (Oct–Mar)',
    soilType: 'Sandy Loam',
    waterAvail: 'Borehole (Moderate)',
    budget: 5000,
    experience: 'intermediate',
  };

  provinces = ['Limpopo', 'Mpumalanga', 'KwaZulu-Natal', 'Gauteng', 'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 'North West'];
  countries = ['South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Zimbabwe', 'Zambia', 'Uganda', 'Mozambique'];
  seasons = ['Summer (Oct–Mar)', 'Winter (Apr–Sep)', 'Year-round'];
  soilTypes = ['Sandy Loam', 'Clay', 'Loam', 'Sandy', 'Silty Loam', 'Clay Loam'];
  waterOptions = ['Rainfed Only', 'Borehole (Moderate)', 'River / Dam (Good)', 'Irrigation Scheme (Excellent)', 'Municipal Water'];

  getRecommendations() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.recommendations.set([
        { crop: 'Tomatoes (Roma)', icon: 'local_florist', aiScore: 92, profitability: 'High', difficulty: 'Intermediate', expectedYield: '45–65 t/ha', revenueEstimate: 'R 45,000–65,000', waterReq: 'Moderate', duration: '3–4 months', aiReason: 'Excellent market demand in Limpopo with premium pricing. Your borehole supports drip irrigation, maximising yield. Current market price trend shows +14% increase over 60 days.' },
        { crop: 'Maize (PAN 6Q-508)', icon: 'grass', aiScore: 88, profitability: 'Good', difficulty: 'Easy', expectedYield: '6–8 t/ha', revenueEstimate: 'R 23,000–30,800', waterReq: 'Low–Moderate', duration: '4–5 months', aiReason: 'Well-suited to Sandy Loam in Limpopo. Low input cost with good returns. Drought-tolerant variety recommended for your rainfall pattern.' },
        { crop: 'Butternut Squash', icon: 'eco', aiScore: 82, profitability: 'Good', difficulty: 'Easy', expectedYield: '20–35 t/ha', revenueEstimate: 'R 20,000–35,000', waterReq: 'Low', duration: '3 months', aiReason: 'Low water requirement makes it ideal for your borehole setup. Strong demand in informal markets and growing export potential.' },
      ]);
    }, 2200);
  }

  difficultyBadge(d: string) { return d === 'Easy' ? 'badge-success' : d === 'Intermediate' ? 'badge-warning' : 'badge-danger'; }
  scoreGradient(score: number) {
    if (score >= 85) return 'linear-gradient(135deg, #2E7D32, #4CAF50)';
    if (score >= 70) return 'linear-gradient(135deg, #D97706, #F59E0B)';
    return 'linear-gradient(135deg, #DC2626, #EF4444)';
  }
}
