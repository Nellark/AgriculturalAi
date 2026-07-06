import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CommonModule],
  template: `
    <div class="auth-page">
      <!-- Left Panel -->
      <div class="auth-panel hide-mobile">
        <img src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=900" alt="African farmer" class="panel-img" />
        <div class="panel-overlay"></div>
        <div class="panel-content">
          <div class="panel-brand">
            <div class="panel-logo-mark">A</div>
            <span class="panel-brand-name">AgriGrow Africa</span>
          </div>
          <div class="panel-body">
            <div class="panel-badge">Join 50,000+ Farmers</div>
            <h2 class="panel-heading">Grow Smarter, Harvest More</h2>
            <p class="panel-sub">Join thousands of African farmers using AI to maximize their yields and secure their livelihoods.</p>
            <div class="panel-benefits">
              @for (b of benefits; track b) {
                <div class="panel-benefit">
                  <div class="pb-check">✓</div>
                  <span>{{ b }}</span>
                </div>
              }
            </div>
          </div>
          <div class="panel-testimonial">
            <div class="pt-quote">"AgriGrow increased my maize yield by 40% in the first season. The AI disease detection saved my entire crop."</div>
            <div class="pt-author">
              <img src="https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=60" alt="Farmer" class="pt-avatar" />
              <div>
                <div class="pt-name">Abeke O.</div>
                <div class="pt-loc">Tabra, Ethiopia · 40% yield increase</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="form-panel">
        <div class="form-inner">
          <div class="form-top">
            <div class="form-brand">
              <div class="form-logo-mark">A</div>
              <span class="form-brand-name">AgriGrow <span class="form-brand-accent">Africa</span></span>
            </div>
            <a routerLink="/auth/login" class="back-link"><mat-icon>arrow_back</mat-icon> Sign in</a>
          </div>

          <div class="form-header">
            <h1>Create your account</h1>
            <p>Start growing smarter with AgriGrow Africa</p>
          </div>

          @if (error()) {
            <div class="form-error">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onRegister()">
            <div class="field-row">
              <div class="field">
                <label>First Name</label>
                <div class="input-wrap">
                  <mat-icon class="input-icon">person_outline</mat-icon>
                  <input type="text" [(ngModel)]="firstName" name="firstName" placeholder="Thabo" required />
                </div>
              </div>
              <div class="field">
                <label>Last Name</label>
                <div class="input-wrap">
                  <mat-icon class="input-icon">person_outline</mat-icon>
                  <input type="text" [(ngModel)]="lastName" name="lastName" placeholder="Mokoena" required />
                </div>
              </div>
            </div>

            <div class="field">
              <label>Email Address</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">mail_outline</mat-icon>
                <input type="email" [(ngModel)]="email" name="email" placeholder="thabo@example.com" required />
              </div>
            </div>

            <div class="field">
              <label>Phone Number</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">phone</mat-icon>
                <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+27 71 234 5678" />
              </div>
            </div>

            <div class="field">
              <label>Password</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">lock_outline</mat-icon>
                <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Minimum 8 characters" required />
                <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())">
                  <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <div class="strength-bar">
                <div class="strength-fill" [style.width]="strengthWidth()" [class.weak]="strength() < 2" [class.medium]="strength() === 2" [class.strong]="strength() >= 3"></div>
              </div>
              <div class="strength-label">{{ strengthLabel() }}</div>
            </div>

            <div class="terms-row">
              <input type="checkbox" id="terms" [(ngModel)]="acceptTerms" name="acceptTerms" />
              <label for="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading() || !acceptTerms">
              @if (loading()) {
                <span class="spinner"></span> Creating account...
              } @else {
                Create Free Account
              }
            </button>
          </form>

          <p class="form-footer">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-page { display: flex; min-height: 100vh; }

    .auth-panel { flex: 1; position: relative; overflow: hidden; min-height: 100vh; }
    .panel-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .panel-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(5,20,10,0.4) 0%, rgba(5,20,10,0.8) 100%); }
    .panel-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; padding: 32px; }
    .panel-brand { display: flex; align-items: center; gap: 10px; margin-bottom: auto; }
    .panel-logo-mark { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.9); color: #1B4332; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; }
    .panel-brand-name { font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
    .panel-body { margin-top: auto; }
    .panel-badge { display: inline-block; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 500; margin-bottom: 16px; }
    .panel-heading { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 12px; }
    .panel-sub { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.7; margin-bottom: 20px; }
    .panel-benefits { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .panel-benefit { display: flex; align-items: center; gap: 10px; }
    .pb-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(129,199,132,0.3); border: 1px solid rgba(129,199,132,0.6); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #81C784; font-weight: 700; flex-shrink: 0; }
    .panel-benefit span { font-size: 13px; color: rgba(255,255,255,0.85); }
    .panel-testimonial { padding: 16px; background: rgba(255,255,255,0.1); border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); }
    .pt-quote { font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.6; font-style: italic; margin-bottom: 12px; }
    .pt-author { display: flex; align-items: center; gap: 10px; }
    .pt-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); }
    .pt-name { font-size: 13px; font-weight: 700; color: #fff; }
    .pt-loc { font-size: 11px; color: rgba(255,255,255,0.6); }

    .form-panel { width: 480px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--bg-card); overflow-y: auto; }
    .form-inner { width: 100%; max-width: 380px; }
    .form-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .form-brand { display: flex; align-items: center; gap: 8px; }
    .form-logo-mark { width: 30px; height: 30px; border-radius: 8px; background: #1B4332; color: #fff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; }
    .form-brand-name { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .form-brand-accent { color: #1B4332; }
    .back-link { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .back-link:hover { color: var(--primary); }
    .back-link mat-icon { font-size: 14px; }
    .form-header { margin-bottom: 24px; }
    .form-header h1 { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
    .form-header p { font-size: 14px; color: var(--text-secondary); }

    .form-error { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; color: #DC2626; font-size: 13px; margin-bottom: 16px; }
    .form-error mat-icon { font-size: 18px; }

    .field { margin-bottom: 14px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
    .input-wrap { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-muted); pointer-events: none; }
    .input-wrap input {
      width: 100%; padding: 10px 40px; border: 1.5px solid var(--border); border-radius: 10px;
      font-size: 13.5px; color: var(--text-primary); background: var(--bg-subtle);
      font-family: 'Inter', sans-serif; outline: none; box-sizing: border-box; transition: all 0.2s;
    }
    .input-wrap input:focus { border-color: #1B4332; background: var(--bg-card); box-shadow: 0 0 0 3px rgba(27,67,50,0.1); }
    .input-wrap input::placeholder { color: var(--text-muted); }
    .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; }
    .pwd-toggle mat-icon { font-size: 18px; }

    .strength-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
    .strength-fill.weak { background: #EF4444; }
    .strength-fill.medium { background: #F59E0B; }
    .strength-fill.strong { background: #2E7D32; }
    .strength-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

    .terms-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
    .terms-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #1B4332; flex-shrink: 0; margin-top: 2px; cursor: pointer; }
    .terms-row label { font-size: 12.5px; color: var(--text-secondary); cursor: pointer; line-height: 1.5; }
    .terms-row label a { color: #1B4332; text-decoration: none; font-weight: 600; }

    .submit-btn {
      width: 100%; padding: 13px; border-radius: 10px; border: none;
      background: #1B4332; color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'Inter', sans-serif;
    }
    .submit-btn:hover { background: #0D3321; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(27,67,50,0.3); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .form-footer { font-size: 13px; color: var(--text-muted); text-align: center; margin-top: 20px; }
    .form-footer a { color: #1B4332; font-weight: 600; text-decoration: none; }
    .form-footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .form-panel { width: 100%; padding: 24px 20px; }
      .field-row { grid-template-columns: 1fr; }
    }
  `],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  acceptTerms = false;
  showPwd = signal(false);
  loading = signal(false);
  error = signal('');

  benefits = [
    'Free AI crop disease scanner — no experience needed',
    'Real-time market prices from 50+ local markets',
    'Personalized planting & fertilization schedules',
    'Hyper-local weather forecasts for your exact location',
  ];

  strength = computed(() => {
    if (!this.password) return 0;
    let s = 0;
    if (this.password.length >= 8) s++;
    if (/[A-Z]/.test(this.password)) s++;
    if (/[0-9!@#$%^&*]/.test(this.password)) s++;
    return s;
  });

  strengthWidth = computed(() => {
    const s = this.strength();
    if (s === 0) return '0%';
    if (s === 1) return '33%';
    if (s === 2) return '66%';
    return '100%';
  });

  strengthLabel = computed(() => {
    const s = this.strength();
    if (!this.password) return '';
    if (s < 2) return 'Weak password';
    if (s === 2) return 'Medium strength';
    return 'Strong password';
  });

  async onRegister() {
    if (!this.firstName || !this.email || !this.password || !this.acceptTerms) return;
    this.loading.set(true);
    this.error.set('');

    const name = `${this.firstName} ${this.lastName}`.trim();
    const result = await this.authService.signUp(this.email, this.password, name);

    if (result.success) {
      this.router.navigate(['/onboarding']);
    } else {
      this.error.set(result.error || 'Registration failed');
    }

    this.loading.set(false);
  }
}
