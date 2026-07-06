import { Component, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <!-- ── NAV ── -->
    <nav class="nav" [class.nav-scrolled]="scrolled()">
      <div class="nav-inner">
        <a routerLink="/" class="brand">
          <span class="brand-mark">A</span>
          <span class="brand-name">AgriGrow <span class="brand-sub">Africa</span></span>
        </a>
        <div class="nav-links hide-mobile">
          <a href="#" class="nav-link">Models</a>
          <a href="#impact" class="nav-link">Impact</a>
          <a href="#services" class="nav-link">Services</a>
          <a href="#about" class="nav-link">About</a>
        </div>
        <div class="nav-ctas hide-mobile">
          <a routerLink="/app/dashboard" class="btn-try-demo">Try Demo</a>
          <a routerLink="/auth/login" class="btn-signin">Sign In</a>
          <a routerLink="/auth/register" class="btn-signup">Sign Up</a>
        </div>
        <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
      @if (mobileOpen()) {
        <div class="mobile-menu">
          <a href="#" (click)="mobileOpen.set(false)" class="mob-link">Models</a>
          <a href="#impact" (click)="mobileOpen.set(false)" class="mob-link">Impact</a>
          <a href="#services" (click)="mobileOpen.set(false)" class="mob-link">Services</a>
          <a href="#about" (click)="mobileOpen.set(false)" class="mob-link">About</a>
          <div class="mob-divider"></div>
          <a routerLink="/auth/login" (click)="mobileOpen.set(false)" class="mob-link">Sign In</a>
          <a routerLink="/auth/register" (click)="mobileOpen.set(false)" class="btn-signup mob-cta">Sign Up</a>
        </div>
      }
    </nav>

    <!-- ── HERO ── -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-image-card">
            <img src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=800" alt="African farmer" class="hero-img" />
            <div class="mission-card">
              <div class="mission-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div class="mission-title">Our Mission</div>
                <div class="mission-text">AgriGrow Africa is on a farming mission. Our farmers deserve more. We're designed to meet the potential and deliver.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <h1 class="hero-heading">Cultivating Food Security Through Innovation</h1>
          <p class="hero-sub">AgriGrow Africa was born from a simple realization: the gap between potential and actual crop yields in Africa is largely a gap in information.</p>
          <div class="hero-features">
            <div class="hero-feature">
              <div class="feature-check"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>
              <div>
                <div class="feature-title">Localized AI Models</div>
                <div class="feature-desc">Models trained on local soil data and climate patterns specific to African regions.</div>
              </div>
            </div>
            <div class="hero-feature">
              <div class="feature-check"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>
              <div>
                <div class="feature-title">Empowerment First</div>
                <div class="feature-desc">Designed for accessibility, working even with low connectivity and local languages.</div>
              </div>
            </div>
          </div>
          <div class="hero-ctas">
            <a routerLink="/auth/register" class="hero-btn-primary">Get Started Free →</a>
            <a routerLink="/app/dashboard" class="hero-btn-secondary">Explore Demo</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── IMPACT BANNER ── -->
    <section class="impact-banner" id="impact">
      <div class="impact-bg">
        <img src="https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Farm field" class="impact-bg-img" />
        <div class="impact-overlay"></div>
      </div>
      <div class="impact-content">
        <div class="impact-badge">AI-Powered Precision Farming</div>
        <h2 class="impact-heading">Empowering Africa's<br>Smallholder Farmers</h2>
        <p class="impact-sub">Bridging traditional wisdom with AI-driven insights to maximize yields, optimize resources, and ensure continental food security.</p>
        <div class="impact-actions">
          <a routerLink="/auth/register" class="impact-btn-primary">Get Started Free →</a>
          <a routerLink="/app/dashboard" class="impact-btn-secondary">Watch the Impact</a>
        </div>
      </div>
    </section>

    <!-- ── STATS ── -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-num">50K+</div>
            <div class="stat-label">Farmers Served</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">12+</div>
            <div class="stat-label">African Countries</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">94%</div>
            <div class="stat-label">AI Accuracy Rate</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">40%</div>
            <div class="stat-label">Avg Yield Increase</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── INTELLIGENT FARMING SERVICES ── -->
    <section class="services-section" id="services">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title">Intelligent Farming Services</h2>
          <p class="section-sub">Scalable solutions tailored for the unique challenges of African agriculture.</p>
        </div>
        <div class="services-grid">
          <!-- Top-left: Vision AI -->
          <div class="service-card gray">
            <div class="service-icon gray-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3>Vision AI Crop Scanner</h3>
            <p>Instant pest and disease identification using just your smartphone camera. Get treatment advice in seconds, even offline.</p>
            <a href="#" class="service-link">Learn More →</a>
          </div>

          <!-- Top-right: Market Insights -->
          <div class="service-card dark-green">
            <div class="service-icon dark-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Market Insights</h3>
            <p>Real-time pricing from local markets to help you sell at the right time and the best price.</p>
            <div class="market-tag">Have Started <span class="tag-pct">+18%</span></div>
          </div>

          <!-- Center: Phone mockup -->
          <div class="service-center-img">
            <img src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=600" alt="App in action" />
          </div>

          <!-- Bottom-left: Smart Advisory -->
          <div class="service-card gray">
            <div class="service-icon gray-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Smart Advisory</h3>
            <p>Step-by-step guidance on planting, fertilization, and harvesting based on your micro-climate.</p>
            <a href="#" class="service-link">Get Personalised Plan</a>
          </div>

          <!-- Bottom-right: Hyper-Local Weather -->
          <div class="service-card salmon">
            <div class="service-icon salmon-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/></svg>
            </div>
            <h3>Hyper-Local Weather</h3>
            <p>Precision rainfall and temperature forecasts delivered via SMS or App notification.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── VOICES FROM THE FIELD ── -->
    <section class="testimonials-section" id="about">
      <div class="container">
        <div class="testimonials-header">
          <div>
            <h2 class="section-title">Voices from the Field</h2>
            <p class="section-sub">Measuring our success by the growth of our farmers.</p>
          </div>
          <div class="carousel-controls">
            <button class="carousel-btn" (click)="prevTestimonial()">‹</button>
            <button class="carousel-btn" (click)="nextTestimonial()">›</button>
          </div>
        </div>
        <div class="testimonials-grid">
          @for (t of visibleTestimonials(); track t.name) {
            <div class="testimonial-card">
              <div class="test-author">
                <img [src]="t.avatar" [alt]="t.name" class="test-avatar" />
                <div>
                  <div class="test-name">{{ t.name }}</div>
                  <div class="test-location">{{ t.location }}</div>
                </div>
              </div>
              <p class="test-text">"{{ t.text }}"</p>
              <div class="test-metric">
                <span class="metric-pct">{{ t.metric }}</span>
                <span class="metric-label">{{ t.metricLabel }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-inner">
          <h2 class="cta-heading">Ready to grow with precision?</h2>
          <p class="cta-sub">Join over 50,000 farmers who are already transforming their yields with AgriGrow Africa. Start your free trial today.</p>
          <div class="cta-actions">
            <a routerLink="/auth/register" class="cta-btn-primary">Download for Android</a>
            <a routerLink="/auth/login" class="cta-btn-secondary">Speak to an Agent</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="brand-mark small">A</span>
              <span class="footer-brand-name">AgriGrow Africa</span>
            </div>
            <p class="footer-tagline">Empowering Africa's smallholder farmers with AI-driven precision agriculture tools.</p>
            <div class="footer-socials">
              <a href="#" class="social-btn">f</a>
              <a href="#" class="social-btn">t</a>
              <a href="#" class="social-btn">in</a>
              <a href="#" class="social-btn">yt</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#impact">Impact</a>
            <a href="#">Case Studies</a>
          </div>
          <div class="footer-col">
            <h4>Utility Pages</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">FAQ</a>
            <a href="#">Support</a>
            <a href="#">Blog</a>
          </div>
          <div class="footer-col">
            <h4>Contact Us</h4>
            <a href="mailto:hello@agrigrow.africa">hello&#64;agrigrow.africa</a>
            <a href="tel:+27001234567">+27 00 123 4567</a>
            <a href="#">WhatsApp Support</a>
            <a href="#">Find an Agent</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 AgriGrow Africa. All rights reserved.</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ── RESET / BASE ── */
    :host { display: block; font-family: 'Inter', sans-serif; }

    /* ── NAV ── */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      background: #fff;
      border-bottom: 1px solid #E8EDE8;
      transition: box-shadow 0.3s;
    }
    .nav-scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      height: 68px;
      display: flex;
      align-items: center;
      gap: 40px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #1B4332;
      color: #fff;
      font-weight: 800;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
    }
    .brand-mark.small { width: 28px; height: 28px; font-size: 13px; border-radius: 8px; }
    .brand-name {
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #111;
    }
    .brand-sub { color: #2E7D32; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      padding: 8px 14px;
      font-size: 14px;
      color: #555;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;
    }
    .nav-link:hover, .nav-link.active { color: #1B4332; background: #F0F7F0; }
    .nav-ctas {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-try-demo {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      background: #E8F4E9;
      color: #1B4332;
      text-decoration: none;
      transition: all 0.2s;
      border: 1px solid #C8DFC9;
    }
    .btn-try-demo:hover { background: #C8DFC9; }
    .btn-signin {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      color: #333;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-signin:hover { color: #1B4332; }
    .btn-signup {
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      background: #1B4332;
      color: #fff;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-signup:hover { background: #0D3321; }

    /* Mobile nav */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    .hamburger span { display: block; width: 22px; height: 2px; background: #333; border-radius: 2px; }
    .mobile-menu {
      border-top: 1px solid #E8EDE8;
      padding: 12px 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mob-link {
      padding: 12px 0;
      font-size: 15px;
      color: #444;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid #F0F4F0;
    }
    .mob-divider { height: 1px; background: #E8EDE8; margin: 8px 0; }
    .mob-cta {
      display: inline-flex;
      align-self: flex-start;
      margin-top: 8px;
      border-radius: 8px;
      padding: 12px 24px;
    }

    /* ── HERO SECTION ── */
    .hero-section {
      margin-top: 68px;
      padding: 80px 0;
      background: #fff;
    }
    .hero-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    .hero-left { }
    .hero-image-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
    }
    .hero-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: 20px;
    }
    .mission-card {
      position: absolute;
      bottom: 24px;
      left: 24px;
      right: 24px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }
    .mission-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #E8F4E9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .mission-icon svg { width: 18px; height: 18px; color: #1B4332; stroke: #1B4332; }
    .mission-title { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .mission-text { font-size: 11.5px; color: #666; line-height: 1.5; }

    .hero-right { }
    .hero-heading {
      font-family: 'Poppins', sans-serif;
      font-size: 44px;
      font-weight: 800;
      color: #111;
      line-height: 1.15;
      margin-bottom: 20px;
    }
    .hero-sub {
      font-size: 16px;
      color: #666;
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .hero-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 40px;
    }
    .hero-feature {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .feature-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #1B4332;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .feature-check svg { width: 12px; height: 12px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .feature-title { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .feature-desc { font-size: 13px; color: #777; line-height: 1.5; }
    .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero-btn-primary {
      padding: 14px 28px;
      border-radius: 10px;
      background: #1B4332;
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .hero-btn-primary:hover { background: #0D3321; transform: translateY(-1px); }
    .hero-btn-secondary {
      padding: 14px 28px;
      border-radius: 10px;
      border: 2px solid #E0E0E0;
      color: #444;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .hero-btn-secondary:hover { border-color: #1B4332; color: #1B4332; }

    /* ── IMPACT BANNER ── */
    .impact-banner {
      position: relative;
      overflow: hidden;
      min-height: 520px;
      display: flex;
      align-items: flex-end;
    }
    .impact-bg { position: absolute; inset: 0; }
    .impact-bg-img { width: 100%; height: 100%; object-fit: cover; }
    .impact-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,25,13,0.92) 0%, rgba(5,25,13,0.7) 50%, rgba(5,25,13,0.4) 100%); }
    .impact-content {
      position: relative;
      z-index: 1;
      max-width: 1280px;
      margin: 0 auto;
      padding: 80px 32px;
      width: 100%;
    }
    .impact-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.3);
      font-size: 12px;
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      margin-bottom: 24px;
      backdrop-filter: blur(8px);
    }
    .impact-heading {
      font-family: 'Poppins', sans-serif;
      font-size: 52px;
      font-weight: 800;
      color: #fff;
      line-height: 1.15;
      margin-bottom: 20px;
    }
    .impact-sub {
      font-size: 17px;
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      max-width: 580px;
      margin-bottom: 36px;
    }
    .impact-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .impact-btn-primary {
      padding: 14px 28px;
      border-radius: 10px;
      background: #fff;
      color: #1B4332;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .impact-btn-primary:hover { background: #F0F7F0; transform: translateY(-1px); }
    .impact-btn-secondary {
      padding: 14px 28px;
      border-radius: 10px;
      border: 2px solid rgba(255,255,255,0.4);
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .impact-btn-secondary:hover { border-color: rgba(255,255,255,0.8); }

    /* ── STATS ── */
    .stats-section { padding: 56px 0; background: #F8FBF8; border-top: 1px solid #E8EDE8; border-bottom: 1px solid #E8EDE8; }
    .stats-grid {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
    }
    .stat-item { text-align: center; padding: 0 56px; }
    .stat-num {
      font-family: 'Poppins', sans-serif;
      font-size: 40px;
      font-weight: 800;
      color: #1B4332;
      line-height: 1;
      margin-bottom: 6px;
    }
    .stat-label { font-size: 13px; color: #888; font-weight: 500; }
    .stat-divider { width: 1px; height: 56px; background: #D8E4D8; flex-shrink: 0; }

    /* ── SERVICES ── */
    .services-section { padding: 96px 0; background: #fff; }
    .section-head { text-align: center; margin-bottom: 64px; }
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #111;
      margin-bottom: 12px;
    }
    .section-sub { font-size: 16px; color: #777; }
    .services-grid {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 80px 1fr;
      grid-template-rows: auto auto;
      gap: 20px;
      align-items: start;
    }
    .service-card {
      padding: 28px;
      border-radius: 18px;
      border: 1px solid #E8EDE8;
    }
    .service-card.gray { background: #F8FBF8; }
    .service-card.dark-green { background: #1B4332; border-color: #1B4332; }
    .service-card.dark-green h3 { color: #fff; }
    .service-card.dark-green p { color: rgba(255,255,255,0.75); }
    .service-card.salmon { background: #FFF1ED; border-color: #FFD8CC; }
    .service-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .service-icon svg { width: 22px; height: 22px; }
    .gray-icon { background: #E8EDE8; color: #444; }
    .gray-icon svg { stroke: #444; }
    .dark-icon { background: rgba(255,255,255,0.15); color: #fff; }
    .dark-icon svg { stroke: #fff; }
    .salmon-icon { background: #FFD8CC; color: #C44B1E; }
    .salmon-icon svg { stroke: #C44B1E; }
    .service-card h3 { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; }
    .service-card p { font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 14px; }
    .service-link { font-size: 13px; font-weight: 600; color: #1B4332; text-decoration: none; }
    .service-link:hover { text-decoration: underline; }
    .market-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.75);
      background: rgba(255,255,255,0.1);
      padding: 6px 12px;
      border-radius: 20px;
    }
    .tag-pct { color: #81C784; font-weight: 700; }

    .service-center-img {
      grid-column: 2;
      grid-row: 1 / span 2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
    }
    .service-center-img img {
      width: 100%;
      aspect-ratio: 2/5;
      object-fit: cover;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    /* ── TESTIMONIALS ── */
    .testimonials-section { padding: 96px 0; background: #F8FBF8; }
    .testimonials-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 48px;
    }
    .carousel-controls { display: flex; gap: 10px; }
    .carousel-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1px solid #D8E4D8;
      background: #fff;
      font-size: 20px;
      cursor: pointer;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: 300;
    }
    .carousel-btn:hover { background: #1B4332; color: #fff; border-color: #1B4332; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .testimonial-card {
      background: #fff;
      border-radius: 18px;
      padding: 28px;
      border: 1px solid #E8EDE8;
      transition: all 0.2s;
    }
    .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
    .test-author { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .test-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .test-name { font-size: 14px; font-weight: 700; color: #111; }
    .test-location { font-size: 12px; color: #999; }
    .test-text { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 20px; font-style: italic; }
    .test-metric { display: flex; align-items: center; gap: 8px; }
    .metric-pct { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 800; color: #1B4332; }
    .metric-label { font-size: 12px; color: #999; }

    /* ── CTA ── */
    .cta-section { padding: 96px 0; background: #0D1F11; }
    .cta-inner { text-align: center; }
    .cta-heading {
      font-family: 'Poppins', sans-serif;
      font-size: 40px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 16px;
    }
    .cta-sub { font-size: 16px; color: rgba(255,255,255,0.65); margin-bottom: 40px; max-width: 520px; margin-left: auto; margin-right: auto; }
    .cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .cta-btn-primary {
      padding: 14px 32px;
      border-radius: 10px;
      background: #fff;
      color: #1B4332;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .cta-btn-primary:hover { background: #F0F7F0; transform: translateY(-1px); }
    .cta-btn-secondary {
      padding: 14px 32px;
      border-radius: 10px;
      border: 2px solid rgba(255,255,255,0.25);
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .cta-btn-secondary:hover { border-color: rgba(255,255,255,0.6); }

    /* ── FOOTER ── */
    .footer { background: #0A1A0E; padding: 64px 0 0; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
    .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .footer-brand-name { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: #fff; }
    .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7; margin-bottom: 20px; }
    .footer-socials { display: flex; gap: 8px; }
    .social-btn {
      width: 34px; height: 34px;
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .social-btn:hover { background: #1B4332; color: #fff; }
    .footer-col h4 { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer-col a { display: block; font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
    .footer-col a:hover { color: #81C784; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 0; font-size: 12px; color: rgba(255,255,255,0.35); text-align: center; }

    /* ── HIDE MOBILE ── */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .hamburger { display: flex; }
      .nav-inner { gap: 0; }
      .hero-inner { grid-template-columns: 1fr; gap: 40px; padding: 0 20px; }
      .hero-heading { font-size: 32px; }
      .impact-heading { font-size: 32px; }
      .services-grid { grid-template-columns: 1fr; }
      .service-center-img { grid-column: 1; grid-row: auto; }
      .service-center-img img { aspect-ratio: 4/3; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .stats-grid { flex-wrap: wrap; gap: 32px; justify-content: center; }
      .stat-divider { display: none; }
      .stat-item { padding: 0 32px; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
      .section-title { font-size: 28px; }
      .cta-heading { font-size: 28px; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
      .hero-section { padding: 48px 0; }
      .hero-img { height: 300px; }
    }
  `],
})
export class LandingComponent {
  mobileOpen = signal(false);
  scrolled = signal(false);
  testimonialIndex = signal(0);

  testimonials = [
    {
      name: 'Abeke O.',
      location: 'Tabra, Ethiopia',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: "AgriGrow's scanner saved my entire tomato harvest this year. I identified the blight two weeks earlier than usual and followed the AI's treatment plan. My yield increased by 40%.",
      metric: '40%',
      metricLabel: 'Yield Increase'
    },
    {
      name: 'Kwame N.',
      location: 'Kumasi, Ghana',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: "The market insights tool changed how I negotiate. I used to sell to the first middleman who arrived. Now, I know the harvest price and I've doubled my income by timing my sales correctly.",
      metric: '2.5x',
      metricLabel: 'Income Growth'
    },
    {
      name: 'Aoifi A.',
      location: 'Tamale, Ghana',
      avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: "Ya a cocoa farmer, weather is everything. The early warning system helped me protect my seedlings before the unusual heavy rains last month. My neighbours lost half their crop. I lost nothing.",
      metric: '100%',
      metricLabel: 'Crop Protection'
    },
    {
      name: 'Fatima S.',
      location: 'Kano, Nigeria',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: "Before AgriGrow I was guessing when to water my crops. The hyper-local weather + soil recommendations saved me water costs and my maize yield went up dramatically.",
      metric: '35%',
      metricLabel: 'Water Saved'
    },
    {
      name: 'John M.',
      location: 'Nakuru, Kenya',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: "The AI advisor walks me through every step — planting, fertilizing, harvesting. I went from a smallholder to supplying a chain of supermarkets within one season.",
      metric: '3x',
      metricLabel: 'Revenue Growth'
    }
  ];

  visibleTestimonials() {
    const i = this.testimonialIndex();
    const count = window.innerWidth < 768 ? 1 : 3;
    const result = [];
    for (let j = 0; j < count; j++) {
      result.push(this.testimonials[(i + j) % this.testimonials.length]);
    }
    return result;
  }

  nextTestimonial() {
    this.testimonialIndex.update(i => (i + 1) % this.testimonials.length);
  }

  prevTestimonial() {
    this.testimonialIndex.update(i => (i - 1 + this.testimonials.length) % this.testimonials.length);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }
}
