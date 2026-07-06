import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface CommunityPost {
  id: string;
  author: { name: string; avatar?: string; role: string; location: string; };
  title: string;
  content: string;
  category: 'question' | 'success' | 'tip' | 'discussion';
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
  image?: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Community</h1>
          <p class="page-subtitle">Connect with farmers, experts, and agronomists across Africa</p>
        </div>
        <button class="btn btn-primary"><mat-icon>edit</mat-icon> New Post</button>
      </div>

      <div class="community-layout">
        <!-- Main Feed -->
        <div class="feed-section">
          <!-- Category Filters -->
          <div class="category-filters" style="margin-bottom:20px">
            @for (cat of categories; track cat.id) {
              <button class="chip" [class.active]="activeCategory() === cat.id" (click)="activeCategory.set(cat.id)">
                <mat-icon>{{ cat.icon }}</mat-icon> {{ cat.label }}
              </button>
            }
          </div>

          <!-- Posts -->
          @for (post of filteredPosts(); track post.id) {
            <div class="post-card card">
              <div class="post-header">
                <div class="post-author">
                  <div class="author-avatar">
                    @if (post.author.avatar) {
                      <img [src]="post.author.avatar" [alt]="post.author.name" />
                    } @else {
                      {{ post.author.name.charAt(0) }}
                    }
                  </div>
                  <div>
                    <span class="author-name">{{ post.author.name }}</span>
                    <div class="author-meta">
                      <span class="author-role">{{ post.author.role }}</span>
                      <span class="author-loc"><mat-icon>location_on</mat-icon>{{ post.author.location }}</span>
                      <span class="post-time">{{ timeAgo(post.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <span class="badge {{ categoryBadge(post.category) }}">{{ post.category }}</span>
              </div>

              @if (post.image) {
                <img [src]="post.image" [alt]="post.title" class="post-image" />
              }

              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ post.content | slice:0:200 }}{{ post.content.length > 200 ? '...' : '' }}</p>

              <div class="post-tags">
                @for (tag of post.tags; track tag) {
                  <span class="chip" style="font-size:11px">{{ tag }}</span>
                }
              </div>

              <div class="post-footer">
                <button class="post-action"><mat-icon>thumb_up</mat-icon> {{ post.likes }}</button>
                <button class="post-action"><mat-icon>chat_bubble_outline</mat-icon> {{ post.comments }}</button>
                <button class="post-action"><mat-icon>visibility</mat-icon> {{ post.views }}</button>
                <button class="post-action" style="margin-left:auto"><mat-icon>share</mat-icon></button>
                <button class="post-action"><mat-icon>bookmark_border</mat-icon></button>
              </div>
            </div>
          }
        </div>

        <!-- Sidebar -->
        <div class="community-sidebar">
          <!-- Search -->
          <div class="card" style="padding:12px;margin-bottom:16px">
            <div class="search-wrap">
              <mat-icon>search</mat-icon>
              <input class="search-input" [(ngModel)]="searchTerm" placeholder="Search community..." />
            </div>
          </div>

          <!-- Top Experts -->
          <div class="card" style="margin-bottom:16px">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:14px">Featured Experts</h4>
            @for (expert of experts; track expert.name) {
              <div class="expert-item">
                <div class="expert-avatar">{{ expert.name.charAt(0) }}</div>
                <div class="expert-info">
                  <span class="expert-name">{{ expert.name }}</span>
                  <span class="expert-spec">{{ expert.specialty }}</span>
                </div>
                <button class="btn btn-sm btn-outline">Follow</button>
              </div>
            }
          </div>

          <!-- Trending Tags -->
          <div class="card">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:14px">Trending Topics</h4>
            <div class="trending-tags">
              @for (tag of trendingTags; track tag.tag) {
                <div class="trending-tag">
                  <span class="tag-name">{{ tag.tag }}</span>
                  <span class="tag-count">{{ tag.count }} posts</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .community-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
    .category-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .post-card { margin-bottom: 16px; padding: 24px; }
    .post-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .post-author { display: flex; align-items: flex-start; gap: 12px; }
    .author-avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .author-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .author-name { font-size: 14px; font-weight: 700; display: block; }
    .author-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .author-role { font-size: 12px; color: var(--primary); font-weight: 500; }
    .author-loc { display: flex; align-items: center; gap: 2px; font-size: 11.5px; color: var(--text-muted); }
    .author-loc mat-icon { font-size: 12px; }
    .post-time { font-size: 11.5px; color: var(--text-muted); }
    .post-image { width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 14px; }
    .post-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
    .post-content { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 12px; }
    .post-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .post-footer { display: flex; align-items: center; gap: 4px; padding-top: 12px; border-top: 1px solid var(--border-light); }
    .post-action { display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; font-size: 12.5px; color: var(--text-secondary); padding: 6px 10px; border-radius: 8px; transition: all var(--transition); font-family: 'Inter',sans-serif; }
    .post-action:hover { background: var(--bg-subtle); color: var(--primary); }
    .post-action mat-icon { font-size: 16px; }
    .search-wrap { display: flex; align-items: center; gap: 8px; }
    .search-wrap mat-icon { color: var(--text-muted); font-size: 18px; }
    .search-input { border: none; background: transparent; font-size: 13.5px; outline: none; color: var(--text-primary); width: 100%; font-family: 'Inter',sans-serif; }
    .expert-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
    .expert-item:last-child { border-bottom: none; }
    .expert-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .expert-info { flex: 1; }
    .expert-name { font-size: 13px; font-weight: 600; display: block; }
    .expert-spec { font-size: 11.5px; color: var(--text-muted); }
    .trending-tags { display: flex; flex-direction: column; gap: 4px; }
    .trending-tag { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; transition: background var(--transition); cursor: pointer; }
    .trending-tag:hover { background: var(--bg-subtle); }
    .tag-name { font-size: 13px; font-weight: 500; color: var(--primary); }
    .tag-count { font-size: 11px; color: var(--text-muted); }
    @media (max-width: 1024px) { .community-layout { grid-template-columns: 1fr; } }
  `],
})
export class CommunityComponent {
  activeCategory = signal('all');
  searchTerm = '';
  posts = signal<CommunityPost[]>([]);

  categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'question', label: 'Questions', icon: 'help_outline' },
    { id: 'success', label: 'Success Stories', icon: 'emoji_events' },
    { id: 'tip', label: 'Tips', icon: 'tips_and_updates' },
    { id: 'discussion', label: 'Discussion', icon: 'forum' },
  ];

  filteredPosts() {
    const allPosts = this.posts();
    return allPosts.filter((p: CommunityPost) =>
      (this.activeCategory() === 'all' || p.category === this.activeCategory()) &&
      (!this.searchTerm || p.title.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  categoryBadge(cat: string) {
    const map: Record<string, string> = { question: 'badge-info', success: 'badge-success', tip: 'badge-warning', discussion: 'badge-neutral' };
    return map[cat] || 'badge-neutral';
  }

  timeAgo(date: Date): string {
    const d = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
  }

  experts = [
    { name: 'Dr. Amina Diallo', specialty: 'Soil Science · Mali' },
    { name: 'Prof. James Okonkwo', specialty: 'Crop Genetics · Nigeria' },
    { name: 'Eng. Sarah Kamau', specialty: 'Irrigation Systems · Kenya' },
  ];

  trendingTags = [
    { tag: '#FallArmyworm', count: 234 },
    { tag: '#MaizeYield2026', count: 198 },
    { tag: '#DroughtTolerant', count: 156 },
    { tag: '#OrganicFarming', count: 132 },
    { tag: '#IrrigationTips', count: 118 },
    { tag: '#MarketPrices', count: 95 },
  ];
}
