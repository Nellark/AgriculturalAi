import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CommonModule],
  template: `
    <div class="onboarding-layout">
      <div class="onboarding-header">
        <div class="logo">
          <img src="Agriculture-and-Food-security.png" alt="AgriGrow Africa" class="logo-img" style="width:32px;height:32px;border-radius:8px;object-fit:cover" />
          <span class="logo-name">AgriGrow <span style="color:var(--primary)">Africa</span></span>
        </div>
        <a routerLink="/app/dashboard" class="skip-link">Skip setup <mat-icon>arrow_forward</mat-icon></a>
      </div>

      <div class="onboarding-main">
        <!-- Sidebar Steps -->
        <div class="steps-panel hide-mobile">
          <h3>Set up your farm</h3>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:24px">Help us personalise your experience</p>
          <div class="steps-list">
            @for (step of steps; track step.step; let i = $index) {
              <div class="step-item" [class.active]="currentStep() === i" [class.done]="currentStep() > i">
                <div class="step-dot">
                  @if (currentStep() > i) { <mat-icon>check</mat-icon> }
                  @else { {{ i + 1 }} }
                </div>
                <div class="step-info">
                  <span class="step-name">{{ step.title }}</span>
                  <span class="step-desc">{{ step.description }}</span>
                </div>
              </div>
            }
          </div>
          <div class="step-progress" style="margin-top:24px">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" [style.width]="progressPct() + '%'"></div>
            </div>
            <span style="font-size:12px;color:var(--text-muted);margin-top:6px;display:block">{{ progressPct() }}% complete</span>
          </div>
        </div>

        <!-- Form Area -->
        <div class="form-area">
          <div class="step-header">
            <div class="step-badge">Step {{ currentStep() + 1 }} of {{ steps.length }}</div>
            <h2>{{ steps[currentStep()].title }}</h2>
            <p>{{ steps[currentStep()].description }}</p>
          </div>

          <!-- Step 0: Farm Basics -->
          @if (currentStep() === 0) {
            <div class="step-content page-enter">
              <div class="field-group">
                <label>Farm Name *</label>
                <input class="input-field" type="text" [(ngModel)]="farm.name" placeholder="e.g. Nkosi Family Farm" />
              </div>
              <div class="field-row-2">
                <div class="field-group">
                  <label>Farm Size *</label>
                  <input class="input-field" type="number" [(ngModel)]="farm.size" placeholder="e.g. 12.5" />
                </div>
                <div class="field-group">
                  <label>Unit</label>
                  <select class="input-field" [(ngModel)]="farm.sizeUnit">
                    <option value="ha">Hectares (ha)</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>
              <div class="field-group">
                <label>Province / Region *</label>
                <input class="input-field" type="text" [(ngModel)]="farm.province" placeholder="e.g. Limpopo" />
              </div>
            </div>
          }

          <!-- Step 1: Crops -->
          @if (currentStep() === 1) {
            <div class="step-content page-enter">
              <p class="step-hint">Select all the crops you currently grow or plan to grow:</p>
              <div class="crops-grid">
                @for (crop of cropOptions; track crop.name) {
                  <button type="button" class="crop-btn" [class.selected]="isCropSelected(crop.name)" (click)="toggleCrop(crop.name)">
                    <mat-icon>{{ crop.icon }}</mat-icon>
                    <span>{{ crop.name }}</span>
                    @if (isCropSelected(crop.name)) {
                      <mat-icon class="check-icon">check_circle</mat-icon>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 2: Livestock -->
          @if (currentStep() === 2) {
            <div class="step-content page-enter">
              <p class="step-hint">Select the livestock you keep (if any):</p>
              <div class="livestock-grid">
                @for (animal of livestockOptions; track animal.name) {
                  <button type="button" class="crop-btn" [class.selected]="isLivestockSelected(animal.name)" (click)="toggleLivestock(animal.name)">
                    <mat-icon>{{ animal.icon }}</mat-icon>
                    <span>{{ animal.name }}</span>
                    @if (isLivestockSelected(animal.name)) {
                      <mat-icon class="check-icon">check_circle</mat-icon>
                    }
                  </button>
                }
              </div>
              <button type="button" class="btn btn-ghost" style="margin-top:16px" (click)="nextStep()">
                <mat-icon>skip_next</mat-icon> I don't keep livestock
              </button>
            </div>
          }

          <!-- Step 3: Water & Soil -->
          @if (currentStep() === 3) {
            <div class="step-content page-enter">
              <div class="field-group">
                <label>Primary Water Source *</label>
                <div class="water-options">
                  @for (w of waterSources; track w.value) {
                    <button type="button" class="option-btn" [class.selected]="farm.waterSource === w.value" (click)="farm.waterSource = w.value">
                      <mat-icon>{{ w.icon }}</mat-icon>
                      <span>{{ w.label }}</span>
                    </button>
                  }
                </div>
              </div>
              <div class="field-group" style="margin-top:16px">
                <label>Soil Type</label>
                <select class="input-field" [(ngModel)]="farm.soilType">
                  @for (s of soilTypes; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
              </div>
            </div>
          }

          <!-- Step 4: Preferences -->
          @if (currentStep() === 4) {
            <div class="step-content page-enter">
              <div class="field-group">
                <label>Preferred Language</label>
                <div class="lang-options">
                  @for (l of languages; track l.code) {
                    <button type="button" class="option-btn" [class.selected]="farm.language === l.code" (click)="farm.language = l.code">
                      <span class="lang-flag">{{ l.flag }}</span>
                      <span>{{ l.name }}</span>
                    </button>
                  }
                </div>
              </div>
              <div class="field-group" style="margin-top:20px">
                <label>Farming Experience</label>
                <div class="exp-options">
                  @for (e of experiences; track e.value) {
                    <button type="button" class="option-btn" [class.selected]="farm.experience === e.value" (click)="farm.experience = e.value" style="flex-direction:column;gap:4px;align-items:flex-start;padding:14px 16px">
                      <strong style="font-size:14px">{{ e.label }}</strong>
                      <span style="font-size:12px;color:var(--text-muted)">{{ e.desc }}</span>
                    </button>
                  }
                </div>
              </div>
              <div class="field-group" style="margin-top:16px">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                  <input type="checkbox" [(ngModel)]="farm.hasInternet" style="width:16px;height:16px" />
                  <span>I have reliable internet connectivity in my area</span>
                </label>
              </div>
            </div>
          }

          <!-- Navigation -->
          <div class="step-nav">
            <button class="btn btn-outline" (click)="prevStep()" [disabled]="currentStep() === 0">
              <mat-icon>arrow_back</mat-icon> Back
            </button>
            <div style="flex:1"></div>
            @if (currentStep() < steps.length - 1) {
              <button class="btn btn-primary btn-lg" (click)="nextStep()">
                Continue <mat-icon>arrow_forward</mat-icon>
              </button>
            } @else {
              <a routerLink="/app/dashboard" class="btn btn-primary btn-lg">
                <mat-icon>rocket_launch</mat-icon> Start Using AgriGrow
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-layout { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }
    .onboarding-header { padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-bottom: 1px solid var(--border); }
    .logo { display: flex; align-items: center; gap: 10px; font-family: 'Poppins',sans-serif; font-size: 18px; font-weight: 700; }
    .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,var(--primary),var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; }
    .skip-link { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-secondary); text-decoration: none; transition: color var(--transition); }
    .skip-link:hover { color: var(--primary); }
    .onboarding-main { flex: 1; display: grid; grid-template-columns: 300px 1fr; max-width: 900px; margin: 0 auto; width: 100%; padding: 40px 24px; gap: 48px; align-items: start; }
    .steps-panel { position: sticky; top: 40px; }
    .steps-panel h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .steps-list { display: flex; flex-direction: column; gap: 4px; }
    .step-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: var(--radius-sm); transition: background var(--transition); }
    .step-item.active { background: rgba(46,125,50,0.06); }
    .step-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all var(--transition); }
    .step-item.active .step-dot { background: var(--primary); color: #fff; }
    .step-item.done .step-dot { background: var(--success); color: #fff; }
    .step-item.done .step-dot mat-icon { font-size: 16px; }
    .step-name { font-size: 13.5px; font-weight: 600; color: var(--text-primary); display: block; }
    .step-desc { font-size: 11.5px; color: var(--text-muted); }
    .form-area { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 36px; box-shadow: var(--shadow-sm); }
    .step-header { margin-bottom: 28px; }
    .step-badge { display: inline-block; background: rgba(46,125,50,0.1); color: var(--primary); padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .step-header h2 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .step-header p { color: var(--text-secondary); font-size: 14px; }
    .step-hint { color: var(--text-secondary); font-size: 14px; margin-bottom: 16px; }
    .step-content { min-height: 280px; }
    .field-group { margin-bottom: 16px; }
    .field-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
    .field-row-2 { display: grid; grid-template-columns: 1fr auto; gap: 12px; }
    .crops-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .livestock-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .crop-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg-card); cursor: pointer; transition: all var(--transition); position: relative; font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .crop-btn mat-icon { font-size: 28px; color: var(--text-muted); transition: color var(--transition); }
    .crop-btn:hover { border-color: var(--primary); color: var(--primary); }
    .crop-btn:hover mat-icon { color: var(--primary); }
    .crop-btn.selected { border-color: var(--primary); background: rgba(46,125,50,0.05); color: var(--primary); }
    .crop-btn.selected mat-icon { color: var(--primary); }
    .check-icon { position: absolute; top: 6px; right: 6px; font-size: 16px !important; color: var(--primary) !important; }
    .water-options, .exp-options { display: flex; flex-direction: column; gap: 8px; }
    .lang-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .option-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg-card); cursor: pointer; font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 500; color: var(--text-secondary); transition: all var(--transition); }
    .option-btn mat-icon { color: var(--text-muted); }
    .option-btn:hover { border-color: var(--primary); color: var(--primary); }
    .option-btn.selected { border-color: var(--primary); background: rgba(46,125,50,0.05); color: var(--primary); }
    .option-btn.selected mat-icon { color: var(--primary); }
    .lang-flag { font-size: 20px; }
    .step-nav { display: flex; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); gap: 12px; }
    @media (max-width: 768px) { .onboarding-main { grid-template-columns: 1fr; } .crops-grid, .livestock-grid { grid-template-columns: repeat(2, 1fr); } .lang-options { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class OnboardingComponent {
  currentStep = signal(0);

  farm = {
    name: '', size: 0, sizeUnit: 'ha', province: '', country: 'South Africa',
    crops: [] as string[], livestock: [] as string[], waterSource: 'borehole',
    soilType: 'Sandy Loam', language: 'en', experience: 'beginner', hasInternet: true,
  };

  steps = [
    { step: 1, title: 'Farm Basics', description: 'Tell us about your farm location and size' },
    { step: 2, title: 'Crops', description: 'What do you grow on your farm?' },
    { step: 3, title: 'Livestock', description: 'Do you keep any animals?' },
    { step: 4, title: 'Water & Soil', description: 'Your farm environment details' },
    { step: 5, title: 'Preferences', description: 'Language and experience level' },
  ];

  progressPct = computed(() => Math.round((this.currentStep() / (this.steps.length - 1)) * 100));

  cropOptions = [
    { name: 'Maize', icon: 'grass' }, { name: 'Tomatoes', icon: 'local_florist' },
    { name: 'Beans', icon: 'eco' }, { name: 'Cassava', icon: 'agriculture' },
    { name: 'Groundnuts', icon: 'spa' }, { name: 'Millet', icon: 'grain' },
    { name: 'Sorghum', icon: 'forest' }, { name: 'Rice', icon: 'grass' },
    { name: 'Spinach', icon: 'yard' }, { name: 'Cabbage', icon: 'local_florist' },
    { name: 'Sweet Potato', icon: 'energy_savings_leaf' }, { name: 'Sunflower', icon: 'wb_sunny' },
  ];

  livestockOptions = [
    { name: 'Cattle', icon: 'set_meal' }, { name: 'Goats', icon: 'pets' },
    { name: 'Sheep', icon: 'cruelty_free' }, { name: 'Chickens', icon: 'egg_alt' },
    { name: 'Pigs', icon: 'restaurant' }, { name: 'Ducks', icon: 'water_bird' },
  ];

  waterSources = [
    { value: 'borehole', label: 'Borehole', icon: 'water_pump' },
    { value: 'river', label: 'River / Dam', icon: 'water' },
    { value: 'rainwater', label: 'Rainwater Harvesting', icon: 'water_drop' },
    { value: 'scheme', label: 'Irrigation Scheme', icon: 'sprinkler' },
    { value: 'tap', label: 'Municipal Water', icon: 'local_drink' },
  ];

  soilTypes = ['Sandy Loam', 'Clay', 'Loam', 'Sandy', 'Silty Loam', 'Clay Loam', 'Unknown'];

  languages = [
    { code: 'en', name: 'English', flag: '🇿🇦' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇲🇿' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  ];

  experiences = [
    { value: 'beginner', label: 'Beginner', desc: 'Less than 3 years farming experience' },
    { value: 'intermediate', label: 'Intermediate', desc: '3–10 years of farming experience' },
    { value: 'experienced', label: 'Experienced', desc: 'More than 10 years farming' },
  ];

  isCropSelected(name: string) { return this.farm.crops.includes(name); }
  isLivestockSelected(name: string) { return this.farm.livestock.includes(name); }

  toggleCrop(name: string) {
    if (this.isCropSelected(name)) {
      this.farm.crops = this.farm.crops.filter(c => c !== name);
    } else {
      this.farm.crops = [...this.farm.crops, name];
    }
  }

  toggleLivestock(name: string) {
    if (this.isLivestockSelected(name)) {
      this.farm.livestock = this.farm.livestock.filter(l => l !== name);
    } else {
      this.farm.livestock = [...this.farm.livestock, name];
    }
  }

  nextStep() { if (this.currentStep() < this.steps.length - 1) this.currentStep.update(v => v + 1); }
  prevStep() { if (this.currentStep() > 0) this.currentStep.update(v => v - 1); }
}
