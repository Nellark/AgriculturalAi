import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../core/services/app-state.service';

@Component({
  selector: 'app-market-prices',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="page-enter mp-root">

      <!-- ── LEFT: Market Board ── -->
      <div class="market-board-col">

        <!-- Board Header -->
        <div class="board-header-card">
          <div class="bh-left">
            <div class="bh-icon">
              <mat-icon>bar_chart</mat-icon>
            </div>
            <div>
              <h2 class="bh-title">SAFEX Market Board</h2>
              <span class="bh-sub">JSE Agricultural Derivatives · {{ today() }}</span>
            </div>
          </div>
          <div class="bh-right">
            <div class="live-dot"></div>
            <span class="live-label">Live</span>
            <span class="bh-time">Updated 15 min ago</span>
          </div>
        </div>

        <!-- Commodity Cards -->
        <div class="commodity-list">
          @for (price of safexPrices(); track price.id) {
            <div class="commodity-card" [class.selected]="selected()?.id === price.id" (click)="selected.set(price)">
              <div class="cc-left">
                <div class="cc-icon" [ngClass]="price.iconClass">
                  <mat-icon>{{ price.icon }}</mat-icon>
                </div>
                <div class="cc-info">
                  <span class="cc-name">{{ price.name }}</span>
                  <span class="cc-market">{{ price.market }}</span>
                </div>
              </div>
              <div class="cc-price-area">
                <span class="cc-price">R{{ price.price.toLocaleString('en-ZA', {minimumFractionDigits: 2}) }}</span>
                <span class="cc-unit">/{{ price.unit }}</span>
              </div>
              <div class="cc-trend-area">
                <div class="sparkline-mini">
                  @for (v of price.sparkline; track $index) {
                    <div class="spark-bar" [style.height]="v + 'px'" [ngClass]="price.trend === 'up' ? 'spark-up' : price.trend === 'down' ? 'spark-down' : 'spark-flat'"></div>
                  }
                </div>
              </div>
              <div class="cc-change" [class.up]="price.trend === 'up'" [class.down]="price.trend === 'down'" [class.flat]="price.trend === 'stable'">
                <mat-icon>{{ price.trend === 'up' ? 'arrow_upward' : price.trend === 'down' ? 'arrow_downward' : 'remove' }}</mat-icon>
                {{ price.changePercent > 0 ? '+' : '' }}{{ price.changePercent }}%
              </div>
            </div>
          }
        </div>

        <!-- Other Prices -->
        <div class="other-prices-card">
          <div class="op-header">
            <h3>Fresh Produce Markets</h3>
            <span class="badge-sm-neutral">{{ otherPrices.length }} items</span>
          </div>
          <div class="op-table">
            <div class="op-thead">
              <span>Commodity</span>
              <span>Price</span>
              <span>Market</span>
              <span>Change</span>
            </div>
            @for (p of otherPrices; track p.name) {
              <div class="op-row" [class.selected]="selected()?.name === p.name" (click)="selectOther(p)">
                <span class="op-name">{{ p.name }}</span>
                <span class="op-price">R{{ p.price.toFixed(2) }}/{{ p.unit }}</span>
                <span class="op-market">{{ p.market }}</span>
                <span class="op-change" [class.up]="p.trend === 'up'" [class.down]="p.trend === 'down'">
                  {{ p.changePercent > 0 ? '+' : '' }}{{ p.changePercent }}%
                </span>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- ── RIGHT: Daily Overview + Detail ── -->
      <div class="daily-overview-col">

        <!-- Daily Overview Card -->
        <div class="daily-card">
          <div class="daily-header">
            <h3 class="daily-title">Daily Overview</h3>
            <span class="daily-date">{{ today() }}</span>
          </div>

          <div class="daily-weather-row">
            <div class="dw-temp">
              <mat-icon>wb_sunny</mat-icon>
              <span class="dw-temp-num">28°C</span>
            </div>
            <div class="dw-info">
              <span class="dw-cond">Partly Cloudy</span>
              <span class="dw-loc">Polokwane, Limpopo</span>
            </div>
          </div>

          <div class="daily-divider"></div>

          <!-- Selected Price Detail -->
          @if (selected()) {
            <div class="dp-selected page-enter">
              <div class="dp-commodity-header">
                <span class="dp-commodity-name">{{ selected()!.name }}</span>
                <span class="dp-commodity-tag">{{ selected()!.market }}</span>
              </div>
              <div class="dp-price-big">
                <span class="dp-val">R{{ formatPrice(selected()!.price) }}</span>
                <span class="dp-unit">/{{ selected()!.unit }}</span>
              </div>
              <div class="dp-change-row" [class.up]="selected()!.trend === 'up'" [class.down]="selected()!.trend === 'down'">
                <mat-icon>{{ selected()!.trend === 'up' ? 'trending_up' : selected()!.trend === 'down' ? 'trending_down' : 'trending_flat' }}</mat-icon>
                {{ selected()!.changePercent > 0 ? '+' : '' }}{{ selected()!.changePercent }}% today
              </div>

              <!-- Sparkline -->
              <div class="dp-chart">
                <div class="dp-chart-title">30-Day Trend</div>
                <div class="dp-sparkline">
                  @for (v of trendData(selected()!.price); track $index) {
                    <div class="dp-spark-bar" [style.height]="v + 'px'" [class.dp-last]="$last" [ngClass]="selected()!.trend === 'up' ? 'dp-up' : 'dp-down'"></div>
                  }
                </div>
              </div>

              <!-- AI Insight -->
              <div class="dp-ai-tip">
                <mat-icon>psychology</mat-icon>
                <p>{{ aiInsight(selected()!) }}</p>
              </div>
            </div>
          } @else {
            <div class="dp-empty">
              <mat-icon>touch_app</mat-icon>
              <p>Select a commodity to view market analysis</p>
            </div>
          }
        </div>

        <!-- Harvest Optimizer -->
        <div class="harvest-optimizer-card">
          <div class="ho-header">
            <div class="ho-icon">
              <mat-icon>auto_graph</mat-icon>
            </div>
            <h3>Optimize your harvest value</h3>
          </div>
          <p class="ho-sub">Based on current market conditions and your crop schedule, here's your optimal selling window.</p>

          <div class="ho-items">
            @for (item of harvestItems; track item.crop) {
              <div class="ho-item">
                <div class="ho-item-left">
                  <div class="ho-dot" [style.background]="item.color"></div>
                  <div>
                    <span class="ho-crop">{{ item.crop }}</span>
                    <span class="ho-action">{{ item.action }}</span>
                  </div>
                </div>
                <div class="ho-item-right">
                  <span class="ho-price">{{ item.price }}</span>
                  <span class="ho-timing">{{ item.timing }}</span>
                </div>
              </div>
            }
          </div>

          <div class="ho-actions">
            <button class="ho-btn-primary">
              <mat-icon>storefront</mat-icon> List for Sale
            </button>
            <button class="ho-btn-secondary">
              <mat-icon>schedule</mat-icon> Plan Later
            </button>
          </div>
        </div>

        <!-- Nearby Buyers -->
        <div class="buyers-card">
          <h3 class="buyers-title">Nearby Buyers</h3>
          @for (b of nearbyBuyers; track b.name) {
            <div class="buyer-row">
              <div class="buyer-avatar">{{ b.name.charAt(0) }}</div>
              <div class="buyer-info">
                <span class="buyer-name">{{ b.name }}</span>
                <span class="buyer-loc">
                  <mat-icon>location_on</mat-icon>{{ b.distance }}
                </span>
              </div>
              <div class="buyer-price-col">
                <span class="buyer-price">R{{ b.price.toFixed(2) }}/kg</span>
                <button class="buyer-contact-btn">Contact</button>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .mp-root {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }
    .market-board-col { display: flex; flex-direction: column; gap: 20px; }
    .daily-overview-col { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 16px; }

    /* ── Board Header ── */
    .board-header-card {
      background: #1B3A2D;
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .bh-left { display: flex; align-items: center; gap: 14px; }
    .bh-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(200,227,106,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #C8E36A;
    }
    .bh-icon mat-icon { font-size: 22px; }
    .bh-title {
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .bh-sub { font-size: 12px; color: rgba(255,255,255,0.55); }
    .bh-right { display: flex; align-items: center; gap: 8px; }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .live-label { font-size: 12px; font-weight: 700; color: #22c55e; }
    .bh-time { font-size: 11px; color: rgba(255,255,255,0.45); margin-left: 6px; }

    /* ── Commodity Cards ── */
    .commodity-list {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    .commodity-card {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.15s;
    }
    .commodity-card:last-child { border-bottom: none; }
    .commodity-card:hover { background: #f8faf5; }
    .commodity-card.selected { background: rgba(27,58,45,0.04); border-left: 3px solid #1B3A2D; }
    .cc-left { display: flex; align-items: center; gap: 12px; }
    .cc-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cc-icon mat-icon { font-size: 20px; }
    .cc-icon-green { background: rgba(46,125,50,0.1); color: #2E7D32; }
    .cc-icon-amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .cc-icon-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .cc-icon-orange { background: rgba(234,88,12,0.1); color: #ea580c; }
    .cc-icon-purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
    .cc-name { display: block; font-size: 14px; font-weight: 700; color: #1B3A2D; }
    .cc-market { font-size: 11px; color: #9ca3af; }
    .cc-price-area { text-align: right; }
    .cc-price {
      font-family: 'Poppins', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #1B3A2D;
    }
    .cc-unit { font-size: 11px; color: #9ca3af; margin-left: 2px; }
    .sparkline-mini {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 28px;
      width: 60px;
    }
    .spark-bar { flex: 1; border-radius: 1px; min-height: 2px; }
    .spark-up { background: rgba(34,197,94,0.5); }
    .spark-down { background: rgba(239,68,68,0.5); }
    .spark-flat { background: rgba(156,163,175,0.5); }
    .cc-change {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12.5px;
      font-weight: 700;
      min-width: 56px;
      justify-content: flex-end;
    }
    .cc-change mat-icon { font-size: 14px; }
    .cc-change.up { color: #16a34a; }
    .cc-change.down { color: #dc2626; }
    .cc-change.flat { color: #9ca3af; }

    /* ── Other Prices ── */
    .other-prices-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 20px;
    }
    .op-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .op-header h3 { font-size: 14px; font-weight: 700; color: #1B3A2D; }
    .badge-sm-neutral { font-size: 11px; font-weight: 600; background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 99px; }
    .op-table { display: flex; flex-direction: column; }
    .op-thead {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 80px;
      padding: 6px 8px;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 4px;
    }
    .op-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 80px;
      align-items: center;
      padding: 10px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .op-row:hover { background: #f8faf5; }
    .op-row.selected { background: rgba(27,58,45,0.04); }
    .op-name { font-size: 13.5px; font-weight: 600; color: #1B3A2D; }
    .op-price { font-size: 13px; font-weight: 700; color: #1a1a1a; }
    .op-market { font-size: 11.5px; color: #9ca3af; }
    .op-change { font-size: 12.5px; font-weight: 700; text-align: right; }
    .op-change.up { color: #16a34a; }
    .op-change.down { color: #dc2626; }

    /* ── Daily Overview ── */
    .daily-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 20px;
    }
    .daily-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .daily-title { font-size: 15px; font-weight: 700; color: #1B3A2D; }
    .daily-date { font-size: 11.5px; color: #9ca3af; }
    .daily-weather-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, #1B3A2D, #2E7D32);
      border-radius: 12px;
      margin-bottom: 14px;
    }
    .dw-temp { display: flex; align-items: center; gap: 6px; }
    .dw-temp mat-icon { font-size: 20px; color: #C8E36A; }
    .dw-temp-num { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; color: #fff; }
    .dw-info { flex: 1; }
    .dw-cond { display: block; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }
    .dw-loc { font-size: 11px; color: rgba(255,255,255,0.55); }
    .daily-divider { height: 1px; background: #f3f4f6; margin-bottom: 14px; }

    /* ── Price Detail ── */
    .dp-selected { }
    .dp-commodity-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .dp-commodity-name { font-size: 15px; font-weight: 700; color: #1B3A2D; }
    .dp-commodity-tag {
      font-size: 11px;
      font-weight: 600;
      background: rgba(27,58,45,0.08);
      color: #1B3A2D;
      padding: 2px 8px;
      border-radius: 99px;
    }
    .dp-price-big { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
    .dp-val {
      font-family: 'Poppins', sans-serif;
      font-size: 30px;
      font-weight: 800;
      color: #1B3A2D;
    }
    .dp-unit { font-size: 12px; color: #9ca3af; }
    .dp-change-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .dp-change-row mat-icon { font-size: 16px; }
    .dp-change-row.up { color: #16a34a; }
    .dp-change-row.down { color: #dc2626; }
    .dp-chart { margin-bottom: 12px; }
    .dp-chart-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .dp-sparkline {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 48px;
    }
    .dp-spark-bar { flex: 1; border-radius: 2px 2px 0 0; min-height: 2px; opacity: 0.7; }
    .dp-spark-bar.dp-last { opacity: 1; }
    .dp-up { background: #16a34a; }
    .dp-down { background: #dc2626; }
    .dp-ai-tip {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 10px 12px;
      background: rgba(27,58,45,0.05);
      border-radius: 10px;
      border: 1px solid rgba(27,58,45,0.1);
    }
    .dp-ai-tip mat-icon { font-size: 16px; color: #2E7D32; flex-shrink: 0; margin-top: 2px; }
    .dp-ai-tip p { font-size: 12px; color: #444; line-height: 1.55; margin: 0; }
    .dp-empty {
      text-align: center;
      padding: 24px 16px;
      color: #9ca3af;
    }
    .dp-empty mat-icon { font-size: 32px; margin-bottom: 8px; display: block; }
    .dp-empty p { font-size: 13px; }

    /* ── Harvest Optimizer ── */
    .harvest-optimizer-card {
      background: #1B3A2D;
      border-radius: 16px;
      padding: 20px;
    }
    .ho-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .ho-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(200,227,106,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #C8E36A;
      flex-shrink: 0;
    }
    .ho-icon mat-icon { font-size: 18px; }
    .harvest-optimizer-card h3 { font-size: 14px; font-weight: 700; color: #fff; }
    .ho-sub { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 16px; }
    .ho-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .ho-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: rgba(255,255,255,0.07);
      border-radius: 10px;
    }
    .ho-item-left { display: flex; align-items: center; gap: 10px; }
    .ho-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .ho-crop { display: block; font-size: 13px; font-weight: 700; color: #fff; }
    .ho-action { font-size: 11px; color: rgba(255,255,255,0.55); }
    .ho-item-right { text-align: right; }
    .ho-price { display: block; font-size: 13px; font-weight: 700; color: #C8E36A; }
    .ho-timing { font-size: 11px; color: rgba(255,255,255,0.55); }
    .ho-actions { display: flex; gap: 8px; }
    .ho-btn-primary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      background: #C8E36A;
      color: #1B3A2D;
      border: none;
      border-radius: 9px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: background 0.2s;
    }
    .ho-btn-primary mat-icon { font-size: 16px; }
    .ho-btn-primary:hover { background: #b5d150; }
    .ho-btn-secondary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.85);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 9px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: background 0.2s;
    }
    .ho-btn-secondary mat-icon { font-size: 16px; }
    .ho-btn-secondary:hover { background: rgba(255,255,255,0.15); }

    /* ── Buyers ── */
    .buyers-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      padding: 20px;
    }
    .buyers-title { font-size: 14px; font-weight: 700; color: #1B3A2D; margin-bottom: 14px; }
    .buyer-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .buyer-row:last-child { border-bottom: none; }
    .buyer-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(27,58,45,0.1);
      color: #1B3A2D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .buyer-info { flex: 1; }
    .buyer-name { display: block; font-size: 13px; font-weight: 600; color: #1B3A2D; }
    .buyer-loc { display: flex; align-items: center; gap: 2px; font-size: 11px; color: #9ca3af; }
    .buyer-loc mat-icon { font-size: 11px; }
    .buyer-price-col { text-align: right; }
    .buyer-price { display: block; font-size: 13px; font-weight: 700; color: #2E7D32; margin-bottom: 4px; }
    .buyer-contact-btn {
      padding: 4px 10px;
      background: rgba(27,58,45,0.08);
      color: #1B3A2D;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .buyer-contact-btn:hover { background: rgba(27,58,45,0.15); }

    /* ── Responsive ── */
    @media (max-width: 1200px) { .mp-root { grid-template-columns: 1fr; } .daily-overview-col { position: static; } }
    @media (max-width: 768px) { .commodity-card { grid-template-columns: 1fr auto auto; } .cc-trend-area { display: none; } }
  `],
})
export class MarketPricesComponent {
  state = inject(AppStateService);
  selected = signal<any>(null);

  today() {
    return new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  safexPrices = computed(() => [
    { id: 's1', name: 'White Maize', market: 'SAFEX', price: 3500, unit: 'ton', currency: 'ZAR', change: 120, changePercent: 3.6, trend: 'up', icon: 'grain', iconClass: 'cc-icon-green', sparkline: this.genSpark(8) },
    { id: 's2', name: 'Yellow Maize', market: 'SAFEX', price: 3250, unit: 'ton', currency: 'ZAR', change: -80, changePercent: -2.4, trend: 'down', icon: 'grass', iconClass: 'cc-icon-amber', sparkline: this.genSpark(5) },
    { id: 's3', name: 'Soya Beans', market: 'SAFEX', price: 8850, unit: 'ton', currency: 'ZAR', change: 210, changePercent: 2.4, trend: 'up', icon: 'eco', iconClass: 'cc-icon-green', sparkline: this.genSpark(7) },
    { id: 's4', name: 'Sunflower', market: 'SAFEX', price: 1850, unit: 'ton', currency: 'ZAR', change: -45, changePercent: -2.4, trend: 'down', icon: 'local_florist', iconClass: 'cc-icon-amber', sparkline: this.genSpark(3) },
    { id: 's5', name: 'Wheat (Soft)', market: 'SAFEX', price: 4800, unit: 'ton', currency: 'ZAR', change: 0, changePercent: 0, trend: 'stable', icon: 'agriculture', iconClass: 'cc-icon-blue', sparkline: this.genSpark(6) },
  ]);

  otherPrices = [
    { name: 'Tomatoes (Roma)', price: 8.50, unit: 'kg', market: 'FreshProduce', changePercent: -8.6, trend: 'down' },
    { name: 'Spinach (Hybrid)', price: 12.00, unit: 'kg', market: 'FreshProduce', changePercent: 14.3, trend: 'up' },
    { name: 'Beans (Climbing)', price: 18.20, unit: 'kg', market: 'Local Market', changePercent: 2.2, trend: 'up' },
    { name: 'Groundnuts', price: 14.60, unit: 'kg', market: 'FreshProduce', changePercent: 0, trend: 'stable' },
    { name: 'Cassava', price: 3.20, unit: 'kg', market: 'Local Market', changePercent: 4.9, trend: 'up' },
  ];

  harvestItems = [
    { crop: 'Maize', action: 'Best time: Now', price: 'R3,500/ton', timing: '+3.6% this week', color: '#22c55e' },
    { crop: 'Tomatoes', action: 'Harvest before Thu', price: 'R8.50/kg', timing: 'Price dropping', color: '#f59e0b' },
    { crop: 'Spinach', action: 'Premium window open', price: 'R12.00/kg', timing: '+14.3% surge', color: '#3b82f6' },
  ];

  nearbyBuyers = [
    { name: 'Polokwane Fresh Market', distance: '12 km', price: 7.80 },
    { name: 'Pick n Pay Distribution', distance: '28 km', price: 8.20 },
    { name: 'Shoprite Depot', distance: '35 km', price: 8.00 },
    { name: 'Local Hawkers Market', distance: '5 km', price: 6.50 },
  ];

  selectOther(p: any) { this.selected.set({ ...p, id: p.name, icon: 'grass', iconClass: 'cc-icon-green', sparkline: this.genSpark(6) }); }

  genSpark(seed: number): number[] {
    return Array.from({ length: 12 }, (_, i) => Math.max(2, Math.min(24, 10 + Math.sin(i * seed * 0.4) * 8 + i * 0.5)));
  }

  trendData(base: number): number[] {
    return Array.from({ length: 30 }, (_, i) => Math.max(4, Math.min(44, 20 + Math.sin(i * 0.4) * 12 + (i === 29 ? 5 : 0))));
  }

  formatPrice(p: number): string {
    return p < 100 ? p.toFixed(2) : p.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
  }

  aiInsight(price: any): string {
    if (price.trend === 'up') return `${price.name} prices are trending upward (+${price.changePercent}%). Optimal time to sell. AI forecasts continued growth for 1–2 weeks.`;
    if (price.trend === 'down') return `${price.name} prices under pressure. Hold if possible — AI expects recovery in 3–4 weeks based on seasonal patterns.`;
    return `${price.name} prices are stable. Good time to plan based on your cash flow needs.`;
  }
}
