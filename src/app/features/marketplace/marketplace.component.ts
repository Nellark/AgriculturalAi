import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { supabase, type MarketplaceListing } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Marketplace</h1>
          <p class="page-subtitle">Buy inputs, sell produce, and connect with verified vendors across Africa</p>
        </div>
        <button class="btn btn-primary"><mat-icon>add</mat-icon> List Your Product</button>
      </div>

      <!-- Tabs -->
      <div class="tabs" style="margin-bottom:20px">
        @for (tab of tabs; track tab.id) {
          <button class="tab-btn" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
            <mat-icon>{{ tab.icon }}</mat-icon> {{ tab.label }}
          </button>
        }
      </div>

      <!-- Search & Filters -->
      <div class="marketplace-toolbar card" style="padding:16px;margin-bottom:20px">
        <div class="search-wrap">
          <mat-icon>search</mat-icon>
          <input class="search-input" [(ngModel)]="searchTerm" placeholder="Search products, sellers..." />
        </div>
        <div class="category-chips">
          @for (c of categories; track c.id) {
            <button class="chip" [class.active]="activeCategory() === c.id" (click)="activeCategory.set(c.id)">
              <mat-icon>{{ c.icon }}</mat-icon> {{ c.label }}
            </button>
          }
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        @for (item of filteredItems(); track item.id) {
          <div class="product-card card">
            <div class="product-img-wrap">
              <img [src]="item.image" [alt]="item.title" />
              @if (item.verified) {
                <span class="verified-badge"><mat-icon>verified</mat-icon></span>
              }
              <div class="product-category-badge">{{ item.category }}</div>
            </div>
            <div class="product-body">
              <h3 class="product-title">{{ item.title }}</h3>
              <p class="product-desc">{{ item.description | slice:0:80 }}...</p>
              <div class="product-seller">
                <mat-icon>store</mat-icon>
                <span>Seller</span>
                <span class="seller-loc"><mat-icon>location_on</mat-icon>{{ item.location || 'Unknown' | slice:0:20 }}</span>
              </div>
              <div class="product-footer">
                <div class="product-price">
                  <span class="price-val">R {{ item.price < 100 ? item.price.toFixed(2) : item.price.toLocaleString() }}</span>
                  <span class="price-unit">/{{ item.unit }}</span>
                </div>
                <div class="product-rating">
                  <mat-icon>star</mat-icon>
                  <span>{{ item.rating }}</span>
                  <span class="review-count">({{ item.reviews }})</span>
                </div>
              </div>
              <div class="product-actions">
                <button class="btn btn-primary btn-sm w-full" style="justify-content:center">
                  <mat-icon>shopping_cart</mat-icon> {{ item.category === 'produce' ? 'Buy Now' : 'Order' }}
                </button>
                <button class="btn btn-ghost btn-sm"><mat-icon>favorite_border</mat-icon></button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredItems().length === 0) {
        <div class="empty-state card" style="text-align:center;padding:64px">
          <mat-icon style="font-size:48px;color:var(--text-muted);margin-bottom:12px">inventory_2</mat-icon>
          <h3>No products found</h3>
          <p style="color:var(--text-secondary)">Try adjusting your filters or search term</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: none; border: none; cursor: pointer; font-size: 13.5px; font-weight: 500; color: var(--text-secondary); border-bottom: 2px solid transparent; white-space: nowrap; transition: all var(--transition); font-family: 'Inter',sans-serif; }
    .tab-btn mat-icon { font-size: 18px; }
    .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
    .marketplace-toolbar { display: flex; flex-direction: column; gap: 12px; }
    .search-wrap { display: flex; align-items: center; gap: 8px; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }
    .search-wrap mat-icon { color: var(--text-muted); font-size: 18px; flex-shrink: 0; }
    .search-input { border: none; background: transparent; font-size: 13.5px; outline: none; color: var(--text-primary); width: 100%; font-family: 'Inter',sans-serif; }
    .category-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .product-card { padding: 0; overflow: hidden; }
    .product-img-wrap { position: relative; }
    .product-img-wrap img { width: 100%; height: 180px; object-fit: cover; }
    .verified-badge { position: absolute; top: 10px; right: 10px; background: rgba(46,125,50,0.9); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .verified-badge mat-icon { font-size: 16px; }
    .product-category-badge { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .product-body { padding: 16px; }
    .product-title { font-size: 14.5px; font-weight: 700; margin-bottom: 6px; line-height: 1.3; }
    .product-desc { font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; }
    .product-seller { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px; flex-wrap: wrap; }
    .product-seller mat-icon { font-size: 14px; color: var(--primary); }
    .seller-loc { display: flex; align-items: center; gap: 2px; margin-left: auto; }
    .seller-loc mat-icon { font-size: 12px; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .price-val { font-family: 'Poppins',sans-serif; font-size: 20px; font-weight: 700; color: var(--primary); }
    .price-unit { font-size: 12px; color: var(--text-muted); }
    .product-rating { display: flex; align-items: center; gap: 3px; font-size: 13px; font-weight: 600; }
    .product-rating mat-icon { font-size: 15px; color: #F59E0B; }
    .review-count { font-size: 11px; color: var(--text-muted); font-weight: 400; }
    .product-actions { display: flex; gap: 8px; }
    @media (max-width: 1200px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .products-grid { grid-template-columns: 1fr; } }
  `],
})
export class MarketplaceComponent implements OnInit {
  listings = signal<MarketplaceListing[]>([]);
  activeTab = signal('all');
  activeCategory = signal('all');
  searchTerm = '';

  async ngOnInit() {
    await this.loadListings();
  }

  async loadListings() {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('stock', ' gt.0')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      this.listings.set(data);
    }
  }

  tabs = [
    { id: 'all', label: 'All Listings', icon: 'storefront' },
    { id: 'buy', label: 'Buy Inputs', icon: 'shopping_cart' },
    { id: 'sell', label: 'Sell Produce', icon: 'local_shipping' },
  ];

  categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'produce', label: 'Produce', icon: 'local_florist' },
    { id: 'inputs', label: 'Inputs', icon: 'grass' },
    { id: 'equipment', label: 'Equipment', icon: 'agriculture' },
    { id: 'services', label: 'Services', icon: 'miscellaneous_services' },
  ];

  filteredItems() {
    const all = this.listings();
    return all.filter((item: MarketplaceListing) => {
      const matchCat = this.activeCategory() === 'all' || item.category === this.activeCategory();
      const matchSearch = !this.searchTerm || item.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchTab = this.activeTab() === 'all' ||
        (this.activeTab() === 'buy' && ['inputs', 'equipment', 'services'].includes(item.category)) ||
        (this.activeTab() === 'sell' && item.category === 'produce');
      return matchCat && matchSearch && matchTab;
    });
  }
}
