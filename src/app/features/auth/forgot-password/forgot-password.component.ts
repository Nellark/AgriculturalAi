import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule, CommonModule],
  template: `
    <div class="auth-simple">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon"><mat-icon>agriculture</mat-icon></div>
        </div>
        @if (!sent()) {
          <h1>Forgot Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <mat-icon class="input-icon">email</mat-icon>
                <input class="input-field with-icon" type="email" [(ngModel)]="email" name="email" placeholder="thabo@example.com" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" [class.loading]="loading()">
              @if (loading()) { <span class="spinner"></span> Sending... }
              @else { <mat-icon>send</mat-icon> Send Reset Link }
            </button>
          </form>
        } @else {
          <div class="success-state">
            <div class="success-icon"><mat-icon>mark_email_read</mat-icon></div>
            <h1>Check your email</h1>
            <p>We've sent a password reset link to <strong>{{ email }}</strong>. Check your inbox and follow the instructions.</p>
            <a routerLink="/auth/login" class="btn btn-primary btn-lg w-full" style="justify-content:center;margin-top:16px">
              <mat-icon>arrow_back</mat-icon> Back to Sign In
            </a>
          </div>
        }
        <p class="auth-footer-text" style="margin-top:24px">
          Remember your password? <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-simple { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
    .auth-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 48px 40px; width: 100%; max-width: 420px; box-shadow: var(--shadow); }
    .auth-logo { text-align: center; margin-bottom: 24px; }
    .logo-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; margin: 0 auto; }
    .logo-icon mat-icon { font-size: 26px; }
    h1 { font-size: 24px; text-align: center; margin-bottom: 8px; }
    p { color: var(--text-secondary); text-align: center; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .field-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--text-muted); pointer-events: none; }
    .input-field.with-icon { padding-left: 40px; }
    .loading { opacity: 0.7; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-state { text-align: center; }
    .success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(76,175,80,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .success-icon mat-icon { font-size: 32px; color: var(--success); }
    .auth-footer-text { text-align: center; font-size: 13.5px; color: var(--text-secondary); }
    .auth-footer-text a { color: var(--primary); font-weight: 600; }
  `],
})
export class ForgotPasswordComponent {
  email = '';
  loading = signal(false);
  sent = signal(false);

  onSubmit() {
    this.loading.set(true);
    setTimeout(() => { this.loading.set(false); this.sent.set(true); }, 1200);
  }
}
