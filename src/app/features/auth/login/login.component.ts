import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CommonModule],
  template: `
    <div class="auth-page">
      <!-- Left Panel -->
      <div class="auth-panel hide-mobile">
        <img src="https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=900" alt="African farm" class="panel-img" />
        <div class="panel-overlay"></div>
        <div class="panel-content">
          <div class="panel-brand">
            <div class="panel-logo-mark">A</div>
            <span class="panel-brand-name">AgriGrow Africa</span>
          </div>
          <div class="panel-body">
            <div class="panel-badge">AI-Powered Precision Farming</div>
            <h2 class="panel-heading">Cultivate a Smarter Future</h2>
            <p class="panel-sub">Access real-time AI insights, market prices, disease detection, and smart planning — all from one powerful platform.</p>
            <div class="panel-features">
              @for (f of features; track f.text) {
                <div class="panel-feature">
                  <div class="pf-icon"><mat-icon>{{ f.icon }}</mat-icon></div>
                  <span>{{ f.text }}</span>
                </div>
              }
            </div>
          </div>
          <div class="panel-stats">
            <div class="panel-stat">
              <span class="ps-num">50K+</span>
              <span class="ps-label">Farmers</span>
            </div>
            <div class="panel-stat-div"></div>
            <div class="panel-stat">
              <span class="ps-num">94%</span>
              <span class="ps-label">AI Accuracy</span>
            </div>
            <div class="panel-stat-div"></div>
            <div class="panel-stat">
              <span class="ps-num">12+</span>
              <span class="ps-label">Countries</span>
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
            <a routerLink="/" class="back-link"><mat-icon>arrow_back</mat-icon> Back to home</a>
          </div>

          <div class="form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your AgriGrow account to continue</p>
          </div>

          @if (error()) {
            <div class="form-error">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onLogin()">
            <div class="field">
              <label>Email Address</label>
              <div class="input-wrap">
                <mat-icon class="input-icon">mail_outline</mat-icon>
                <input type="email" [(ngModel)]="email" name="email" placeholder="thabo@example.com" required />
              </div>
            </div>

            <div class="field">
              <div class="label-row">
                <label>Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-wrap">
                <mat-icon class="input-icon">lock_outline</mat-icon>
                <input [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
                <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())">
                  <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span> Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="divider-row">
            <div class="divider-line"></div>
            <span>or continue with</span>
            <div class="divider-line"></div>
          </div>

          <div class="social-btns">
            <button class="social-btn" (click)="onDemoLogin()">
              <mat-icon>app_shortcut</mat-icon>
              Try Demo
            </button>
            <button class="social-btn">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              Google
            </button>
          </div>

          <p class="form-footer">
            Don't have an account? <a routerLink="/auth/register">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-page { display: flex; min-height: 100vh; }

    /* Panel */
    .auth-panel { flex: 1; position: relative; overflow: hidden; min-height: 100vh; }
    .panel-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .panel-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(5,20,10,0.5) 0%, rgba(5,20,10,0.75) 100%); }
    .panel-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; padding: 32px; }
    .panel-brand { display: flex; align-items: center; gap: 10px; margin-bottom: auto; }
    .panel-logo-mark { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.9); color: #1B4332; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; }
    .panel-brand-name { font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
    .panel-body { margin-top: auto; }
    .panel-badge { display: inline-block; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 500; margin-bottom: 20px; }
    .panel-heading { font-family: 'Poppins', sans-serif; font-size: 36px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 14px; }
    .panel-sub { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.7; margin-bottom: 24px; }
    .panel-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .panel-feature { display: flex; align-items: center; gap: 12px; }
    .pf-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
    .pf-icon mat-icon { font-size: 16px; color: #81C784; }
    .panel-feature span { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }
    .panel-stats { display: flex; align-items: center; gap: 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.2); }
    .panel-stat { flex: 1; text-align: center; }
    .ps-num { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 800; color: #fff; display: block; }
    .ps-label { font-size: 11px; color: rgba(255,255,255,0.6); }
    .panel-stat-div { width: 1px; height: 32px; background: rgba(255,255,255,0.2); }

    /* Form Panel */
    .form-panel { width: 480px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--bg-card); }
    .form-inner { width: 100%; max-width: 380px; }
    .form-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .form-brand { display: flex; align-items: center; gap: 8px; }
    .form-logo-mark { width: 30px; height: 30px; border-radius: 8px; background: #1B4332; color: #fff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; }
    .form-brand-name { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .form-brand-accent { color: #1B4332; }
    .back-link { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .back-link:hover { color: var(--primary); }
    .back-link mat-icon { font-size: 14px; }
    .form-header { margin-bottom: 28px; }
    .form-header h1 { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
    .form-header p { font-size: 14px; color: var(--text-secondary); }
    .form-error { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; color: #DC2626; font-size: 13px; margin-bottom: 16px; }
    .form-error mat-icon { font-size: 18px; }

    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 7px; }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
    .label-row label { margin-bottom: 0; }
    .forgot-link { font-size: 12px; color: #1B4332; text-decoration: none; font-weight: 500; }
    .forgot-link:hover { text-decoration: underline; }
    .input-wrap { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-muted); pointer-events: none; }
    .input-wrap input {
      width: 100%; padding: 11px 40px; border: 1.5px solid var(--border); border-radius: 10px;
      font-size: 14px; color: var(--text-primary); background: var(--bg-subtle);
      font-family: 'Inter', sans-serif; outline: none; box-sizing: border-box; transition: all 0.2s;
    }
    .input-wrap input:focus { border-color: #1B4332; background: var(--bg-card); box-shadow: 0 0 0 3px rgba(27,67,50,0.1); }
    .input-wrap input::placeholder { color: var(--text-muted); }
    .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; }
    .pwd-toggle mat-icon { font-size: 18px; }

    .submit-btn {
      width: 100%; padding: 13px; border-radius: 10px; border: none;
      background: #1B4332; color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-top: 8px; font-family: 'Inter', sans-serif;
    }
    .submit-btn:hover { background: #0D3321; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(27,67,50,0.3); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .divider-row { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
    .divider-line { flex: 1; height: 1px; background: var(--border); }
    .divider-row span { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

    .social-btns { display: flex; gap: 10px; margin-bottom: 24px; }
    .social-btn {
      flex: 1; padding: 10px; border-radius: 10px; border: 1.5px solid var(--border);
      background: var(--bg-subtle); font-size: 13px; font-weight: 600; color: var(--text-primary);
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .social-btn:hover { border-color: var(--primary); background: var(--bg-card); }
    .social-btn mat-icon { font-size: 16px; color: #1B4332; }

    .form-footer { font-size: 13px; color: var(--text-muted); text-align: center; }
    .form-footer a { color: #1B4332; font-weight: 600; text-decoration: none; }
    .form-footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .form-panel { width: 100%; padding: 24px 20px; }
    }
  `],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPwd = signal(false);
  loading = signal(false);
  error = signal('');

  features = [
    { icon: 'biotech', text: 'AI-powered disease detection & crop advisor' },
    { icon: 'price_check', text: 'Real-time market prices from 50+ markets' },
    { icon: 'wb_sunny', text: 'Hyper-local weather forecasts for your farm' },
    { icon: 'trending_up', text: 'Yield forecasting with 94% accuracy' },
  ];

  async onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const result = await this.authService.signIn(this.email, this.password);

    if (result.success) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.error.set(result.error || 'Login failed');
    }

    this.loading.set(false);
  }

  async onDemoLogin() {
    this.loading.set(true);
    this.error.set('');

    const result = await this.authService.signIn('demo@agrigrow.africa', 'demo123');

    if (result.success) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.error.set('Demo login failed. Please try again.');
    }

    this.loading.set(false);
  }
}
