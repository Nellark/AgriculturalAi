import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your account, preferences and notifications</p>
      </div>

      <div class="settings-layout">
        <!-- Settings Nav -->
        <div class="settings-nav card">
          @for (section of sections; track section.id) {
            <button class="settings-nav-btn" [class.active]="activeSection() === section.id" (click)="activeSection.set(section.id)">
              <mat-icon>{{ section.icon }}</mat-icon>
              <span>{{ section.label }}</span>
            </button>
          }
        </div>

        <!-- Settings Content -->
        <div class="settings-content">

          @if (activeSection() === 'profile') {
            <div class="settings-panel card page-enter">
              <h3 class="panel-title">Profile Information</h3>
              <div class="avatar-section">
                <div class="avatar-large">
                  @if (state.profile()?.avatar) {
                    <img [src]="state.profile()!.avatar" [alt]="state.profile()!.name" />
                  } @else {
                    <span>{{ state.profile()?.name?.charAt(0) }}</span>
                  }
                </div>
                <div>
                  <button class="btn btn-outline btn-sm"><mat-icon>upload</mat-icon> Change Photo</button>
                  <p style="font-size:12px;color:var(--text-muted);margin-top:6px">JPG, PNG. Max 2MB.</p>
                </div>
              </div>
              <div class="form-grid">
                <div class="field-group">
                  <label>Full Name</label>
                  <input class="input-field" [value]="state.profile()?.name" />
                </div>
                <div class="field-group">
                  <label>Email Address</label>
                  <input class="input-field" type="email" [value]="state.user()?.email" />
                </div>
                <div class="field-group">
                  <label>Phone Number</label>
                  <input class="input-field" type="tel" [value]="state.profile()?.phone || ''" />
                </div>
                <div class="field-group">
                  <label>Country</label>
                  <input class="input-field" [value]="state.profile()?.country" />
                </div>
                <div class="field-group">
                  <label>Province / Region</label>
                  <input class="input-field" [value]="state.profile()?.province" />
                </div>
                <div class="field-group">
                  <label>Role</label>
                  <select class="input-field">
                    <option>Farmer</option>
                    <option>Agronomist</option>
                    <option>Agricultural Extension Officer</option>
                  </select>
                </div>
              </div>
              <div style="margin-top:20px">
                <button class="btn btn-primary"><mat-icon>save</mat-icon> Save Changes</button>
              </div>
            </div>
          }

          @if (activeSection() === 'theme') {
            <div class="settings-panel card page-enter">
              <h3 class="panel-title">Appearance</h3>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Dark Mode</span>
                  <span class="setting-desc">Switch between light and dark themes</span>
                </div>
                <div class="toggle" [class.on]="state.isDarkMode()" (click)="state.toggleDarkMode()">
                  <div class="toggle-knob"></div>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Language</span>
                  <span class="setting-desc">Select your preferred display language</span>
                </div>
                <select class="input-field" style="width:160px" [ngModel]="currentLang" (ngModelChange)="currentLang = $event">
                  @for (l of languages; track l.code) {
                    <option [value]="l.code">{{ l.name }}</option>
                  }
                </select>
              </div>
            </div>
          }

          @if (activeSection() === 'notifications') {
            <div class="settings-panel card page-enter">
              <h3 class="panel-title">Notification Preferences</h3>
              @for (notif of notifSettings; track notif.id) {
                <div class="setting-row">
                  <div class="setting-info">
                    <mat-icon [style.color]="notif.color">{{ notif.icon }}</mat-icon>
                    <div>
                      <span class="setting-label">{{ notif.label }}</span>
                      <span class="setting-desc">{{ notif.desc }}</span>
                    </div>
                  </div>
                  <div class="notif-controls">
                    <label class="toggle-sm" [class.on]="notif.push">
                      <input type="checkbox" [(ngModel)]="notif.push" style="display:none" />
                      Push
                    </label>
                    <label class="toggle-sm" [class.on]="notif.sms">
                      <input type="checkbox" [(ngModel)]="notif.sms" style="display:none" />
                      SMS
                    </label>
                  </div>
                </div>
              }
            </div>
          }

          @if (activeSection() === 'offline') {
            <div class="settings-panel card page-enter">
              <h3 class="panel-title">Offline Mode</h3>
              <div class="offline-status">
                <div class="icon-wrap icon-wrap-primary" style="width:48px;height:48px;font-size:24px;border-radius:12px;margin-bottom:12px"><mat-icon>cloud_sync</mat-icon></div>
                <h4>Currently Online</h4>
                <p style="color:var(--text-secondary);font-size:13.5px;margin-bottom:16px">Last synced: Just now</p>
                <button class="btn btn-outline"><mat-icon>sync</mat-icon> Force Sync Now</button>
              </div>
              @for (os of offlineSettings; track os.label) {
                <div class="setting-row" style="margin-top:12px">
                  <div class="setting-info">
                    <span class="setting-label">{{ os.label }}</span>
                    <span class="setting-desc">{{ os.desc }}</span>
                  </div>
                  <div class="toggle" [class.on]="os.enabled" (click)="os.enabled = !os.enabled">
                    <div class="toggle-knob"></div>
                  </div>
                </div>
              }
            </div>
          }

          @if (activeSection() === 'privacy') {
            <div class="settings-panel card page-enter">
              <h3 class="panel-title">Privacy & Security</h3>
              @for (ps of privacySettings; track ps.label) {
                <div class="setting-row">
                  <div class="setting-info">
                    <mat-icon style="color:var(--text-secondary)">{{ ps.icon }}</mat-icon>
                    <div>
                      <span class="setting-label">{{ ps.label }}</span>
                      <span class="setting-desc">{{ ps.desc }}</span>
                    </div>
                  </div>
                  @if (ps.type === 'toggle') {
                    <div class="toggle" [class.on]="ps.enabled" (click)="ps.enabled = !ps.enabled">
                      <div class="toggle-knob"></div>
                    </div>
                  } @else {
                    <button class="btn btn-outline btn-sm">{{ ps.action }}</button>
                  }
                </div>
              }
            </div>
          }

          @if (activeSection() === 'about') {
            <div class="settings-panel card page-enter">
              <div class="about-hero">
                <div class="logo-icon" style="width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                  <mat-icon style="font-size:32px;color:#fff">agriculture</mat-icon>
                </div>
                <h2>AgriGrow Africa</h2>
                <p style="color:var(--primary);font-weight:600">Version 2.1.0 (Build 2026.06.30)</p>
              </div>
              <p style="color:var(--text-secondary);text-align:center;line-height:1.7;margin-bottom:24px">Empowering African Farmers with Artificial Intelligence. Built for smallholder and commercial farmers across the African continent.</p>
              <div class="about-links">
                @for (link of aboutLinks; track link.label) {
                  <a href="#" class="about-link">
                    <mat-icon>{{ link.icon }}</mat-icon>
                    <span>{{ link.label }}</span>
                    <mat-icon style="margin-left:auto;font-size:16px">chevron_right</mat-icon>
                  </a>
                }
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
    .settings-nav { padding: 12px; display: flex; flex-direction: column; gap: 2px; }
    .settings-nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: none; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: var(--text-secondary); cursor: pointer; transition: all var(--transition); font-family: 'Inter',sans-serif; text-align: left; }
    .settings-nav-btn mat-icon { font-size: 19px; }
    .settings-nav-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
    .settings-nav-btn.active { background: rgba(46,125,50,0.1); color: var(--primary); font-weight: 600; }
    .settings-panel { }
    .panel-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; }
    .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .avatar-large { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; }
    .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-group label { display: block; font-size: 12.5px; font-weight: 600; margin-bottom: 5px; }
    .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border-light); gap: 16px; }
    .setting-row:last-child { border-bottom: none; }
    .setting-info { display: flex; align-items: flex-start; gap: 12px; flex: 1; }
    .setting-info mat-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .setting-label { font-size: 14px; font-weight: 600; display: block; margin-bottom: 2px; }
    .setting-desc { font-size: 12px; color: var(--text-muted); }
    .toggle { width: 44px; height: 24px; border-radius: 99px; background: var(--border); cursor: pointer; position: relative; transition: background var(--transition); flex-shrink: 0; }
    .toggle.on { background: var(--primary); }
    .toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: transform var(--transition); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle.on .toggle-knob { transform: translateX(20px); }
    .notif-controls { display: flex; gap: 8px; }
    .toggle-sm { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; background: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border); transition: all var(--transition); }
    .toggle-sm.on { background: rgba(46,125,50,0.1); color: var(--primary); border-color: rgba(46,125,50,0.3); }
    .offline-status { text-align: center; padding: 20px 0; border-bottom: 1px solid var(--border-light); margin-bottom: 8px; }
    .about-hero { text-align: center; margin-bottom: 24px; }
    .about-hero h2 { font-size: 22px; margin-bottom: 6px; }
    .about-links { display: flex; flex-direction: column; gap: 2px; }
    .about-link { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 8px; text-decoration: none; color: var(--text-primary); transition: background var(--transition); font-size: 14px; }
    .about-link:hover { background: var(--bg-subtle); }
    .about-link mat-icon { font-size: 20px; color: var(--text-secondary); }
    @media (max-width: 1024px) { .form-grid { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .settings-layout { grid-template-columns: 1fr; } }
  `],
})
export class SettingsComponent {
  state = inject(AppStateService);
  activeSection = signal('profile');
  currentLang = 'en';

  sections = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'theme', label: 'Appearance', icon: 'palette' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'offline', label: 'Offline Mode', icon: 'cloud_off' },
    { id: 'privacy', label: 'Privacy & Security', icon: 'lock' },
    { id: 'about', label: 'About', icon: 'info' },
  ];

  languages = [
    { code: 'en', name: 'English' }, { code: 'sw', name: 'Swahili' },
    { code: 'fr', name: 'Français' }, { code: 'pt', name: 'Português' },
    { code: 'zu', name: 'isiZulu' }, { code: 'ar', name: 'العربية' },
  ];

  notifSettings = [
    { id: 'weather', icon: 'thunderstorm', color: '#3B82F6', label: 'Weather Alerts', desc: 'Severe weather warnings for your farm location', push: true, sms: true },
    { id: 'disease', icon: 'bug_report', color: '#EF4444', label: 'Disease Alerts', desc: 'Crop disease risk warnings in your region', push: true, sms: false },
    { id: 'market', icon: 'price_check', color: '#2E7D32', label: 'Market Price Alerts', desc: 'Significant price changes for your crops', push: true, sms: false },
    { id: 'planner', icon: 'calendar_today', color: '#F59E0B', label: 'Planner Reminders', desc: 'Reminders for scheduled tasks and activities', push: true, sms: true },
    { id: 'ai', icon: 'psychology', color: '#7C3AED', label: 'AI Insights', desc: 'New recommendations from your AI assistant', push: false, sms: false },
  ];

  offlineSettings = [
    { label: 'Auto-sync when connected', desc: 'Automatically sync data when internet is available', enabled: true },
    { label: 'Cache weather forecasts', desc: 'Store 7-day forecasts for offline access', enabled: true },
    { label: 'Cache market prices', desc: 'Store last known prices for offline viewing', enabled: true },
    { label: 'Download AI recommendations', desc: 'Save AI recommendations for offline reading', enabled: false },
  ];

  privacySettings = [
    { icon: 'location_on', label: 'Location Sharing', desc: 'Share farm location for better market and weather data', type: 'toggle', enabled: true, action: '' },
    { icon: 'analytics', label: 'Usage Analytics', desc: 'Help improve AgriGrow by sharing anonymous usage data', type: 'toggle', enabled: true, action: '' },
    { icon: 'lock', label: 'Two-Factor Authentication', desc: 'Add extra security to your account', type: 'button', enabled: false, action: 'Enable 2FA' },
    { icon: 'key', label: 'Change Password', desc: 'Update your account password', type: 'button', enabled: false, action: 'Change' },
    { icon: 'delete', label: 'Delete Account', desc: 'Permanently delete your account and all data', type: 'button', enabled: false, action: 'Delete' },
  ];

  aboutLinks = [
    { icon: 'description', label: 'Terms of Service' },
    { icon: 'privacy_tip', label: 'Privacy Policy' },
    { icon: 'help', label: 'Help Center' },
    { icon: 'groups', label: 'Community Forum' },
    { icon: 'star_rate', label: 'Rate AgriGrow' },
    { icon: 'share', label: 'Share with Friends' },
  ];
}
