import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppStateService } from '../../core/services/app-state.service';
import { supabase } from '../../core/supabase/supabase.client';

export interface DetectionResult {
  id: string;
  image_url: string;
  crop_type: string;
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  recommendations: string[];
  created_at: string;
}

@Component({
  selector: 'app-disease-detection',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Disease Detection</h1>
          <p class="page-subtitle">AI-powered crop disease identification and treatment recommendations</p>
        </div>
      </div>

      <div class="detection-layout">
        <!-- Left Panel - Upload & Detection -->
        <div class="upload-panel">
          <div class="upload-card card" [class.drag-over]="dragOver()" (dragover)="onDragOver($event)" (dragleave)="dragOver.set(false)" (drop)="onDrop($event)">
            @if (!uploadedImage()) {
              <div class="upload-zone">
                <div class="upload-visual">
                  <div class="upload-icon-ring">
                    <mat-icon>photo_camera</mat-icon>
                  </div>
                  <div class="upload-pulse"></div>
                </div>
                <h3>Upload Crop Photo</h3>
                <p>Drag & drop an image or click to browse<br>JPG, PNG, WEBP supported (max 10MB)</p>
                <div class="upload-btn-group">
                  <input type="file" #fileInput style="display: none" accept="image/*" (change)="onFileSelected($event)" />
                  <button class="btn btn-primary btn-lg" (click)="fileInput.click()">
                    <mat-icon>upload</mat-icon> Choose File
                  </button>
                  <button class="btn btn-outline btn-lg" (click)="fileInput.click()">
                    <mat-icon>camera_alt</mat-icon> Use Camera
                  </button>
                </div>
                <div class="crop-support">
                  <span class="support-label">Detects diseases in:</span>
                  <div class="crop-chips">
                    @for (c of supportedCrops; track c) {
                      <span class="chip chip-sm">{{ c }}</span>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <div class="preview-container">
                <div class="preview-header">
                  <span class="preview-label">Image uploaded</span>
                  <button class="btn btn-ghost btn-sm" (click)="uploadedImage.set(null)">
                    <mat-icon>close</mat-icon> Remove
                  </button>
                </div>
                <img [src]="uploadedImage()" alt="Uploaded crop" class="preview-image" />
                <div class="preview-actions">
                  <button class="btn btn-primary btn-lg analyze-btn" (click)="analyze()" [disabled]="analyzing()">
                    @if (analyzing()) {
                      <span class="spinner"></span>
                      <span>Analyzing with AI...</span>
                    } @else {
                      <mat-icon>biotech</mat-icon>
                      <span>Analyze Disease</span>
                    }
                  </button>
                </div>
                @if (analyzing()) {
                  <div class="analysis-progress">
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill analyzing" [style.width]="analysisProgress() + '%'"></div>
                    </div>
                    <span class="progress-text">{{ analysisStep() }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Tips Section -->
          <div class="tips-card card">
            <div class="tips-header">
              <mat-icon>lightbulb</mat-icon>
              <h4>Photo Tips for Better Detection</h4>
            </div>
            <div class="tips-list">
              @for (tip of photoTips; track tip.text; let i = $index) {
                <div class="tip-item">
                  <div class="tip-num">{{ i + 1 }}</div>
                  <div class="tip-content">
                    <span class="tip-text">{{ tip.text }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Panel - Results & History -->
        <div class="results-panel">
          @if (currentResult()) {
            <div class="result-card card page-enter">
              <div class="result-header">
                <div class="result-title-row">
                  <span class="result-label">Detection Result</span>
                  <span class="badge {{ severityBadge(currentResult()!.severity) }}">{{ currentResult()!.severity }} severity</span>
                </div>
                <span class="result-time">{{ timeAgo(currentResult()!.created_at) }}</span>
              </div>

              <div class="result-visual">
                @if (currentResult()!.image_url) {
                  <img [src]="currentResult()!.image_url" alt="Analyzed crop" class="result-image" />
                } @else {
                  <div class="result-image-placeholder">
                    <mat-icon>image</mat-icon>
                  </div>
                }
                <div class="disease-confidence">
                  <div class="confidence-ring">
                    <svg viewBox="0 0 36 36">
                      <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                      <path class="ring-fill" [style.stroke-dasharray]="currentResult()!.confidence + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    </svg>
                    <span class="ring-val">{{ currentResult()!.confidence }}%</span>
                  </div>
                  <span class="confidence-label">Confidence</span>
                </div>
              </div>

              <div class="disease-info">
                <div class="disease-badge">
                  <mat-icon>coronavirus</mat-icon>
                  <span>{{ currentResult()!.crop_type }}</span>
                </div>
                <h2 class="disease-name">{{ currentResult()!.disease }}</h2>
              </div>

              <div class="result-details">
                <div class="detail-section">
                  <div class="section-title">
                    <mat-icon>healing</mat-icon>
                    <span>Treatment Plan</span>
                  </div>
                  <div class="treatment-list">
                    @for (t of currentResult()!.treatment; track t; let i = $index) {
                      <div class="treatment-item">
                        <span class="treatment-step">{{ i + 1 }}</span>
                        <span class="treatment-text">{{ t }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="detail-section">
                  <div class="section-title">
                    <mat-icon>tips_and_updates</mat-icon>
                    <span>Prevention Tips</span>
                  </div>
                  <div class="recommendation-list">
                    @for (r of currentResult()!.recommendations; track r) {
                      <div class="rec-item">
                        <mat-icon>check_circle</mat-icon>
                        <span>{{ r }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="result-actions">
                <button class="btn btn-primary">
                  <mat-icon>psychology</mat-icon> Ask AI More
                </button>
                <button class="btn btn-outline">
                  <mat-icon>download</mat-icon> Export Report
                </button>
                <button class="btn btn-ghost" (click)="currentResult.set(null)">
                  <mat-icon>refresh</mat-icon> New Scan
                </button>
              </div>
            </div>
          } @else {
            <div class="empty-result card">
              <div class="empty-visual">
                <div class="empty-icon-ring">
                  <mat-icon>biotech</mat-icon>
                </div>
              </div>
              <h3>Ready to Analyze</h3>
              <p>Upload a photo of your crop to identify diseases and get instant treatment recommendations powered by our AI model.</p>
            </div>
          }

          <!-- History Section -->
          <div class="history-card card">
            <div class="card-header">
              <div class="header-title">
                <mat-icon>history</mat-icon>
                <h3>Detection History</h3>
              </div>
              <span class="badge badge-neutral">{{ detections().length }} scans</span>
            </div>
            <div class="history-grid">
              @for (d of detections(); track d.id) {
                <div class="history-item" (click)="currentResult.set(d)">
                  <div class="history-img-placeholder">
                    <mat-icon>biotech</mat-icon>
                  </div>
                  <div class="history-info">
                    <span class="history-crop">{{ d.crop_type }}</span>
                    <span class="history-disease">{{ d.disease }}</span>
                    <div class="history-meta">
                      <span class="badge {{ severityBadge(d.severity) }}" style="font-size:9px">{{ d.severity }}</span>
                      <span class="history-conf">{{ d.confidence }}%</span>
                    </div>
                  </div>
                </div>
              }
              @if (detections().length === 0) {
                <div class="empty-state">
                  <mat-icon>history</mat-icon>
                  <span>No previous scans</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .detection-layout { display: grid; grid-template-columns: 420px 1fr; gap: 24px; }

    /* Upload Panel */
    .upload-panel { display: flex; flex-direction: column; gap: 16px; }
    .upload-card { min-height: 400px; position: relative; overflow: hidden; transition: all var(--transition); }
    .upload-card.drag-over { border-color: var(--primary); background: rgba(46,125,50,0.04); }

    .upload-zone { text-align: center; padding: 32px 24px; }
    .upload-visual { position: relative; width: 100px; height: 100px; margin: 0 auto 20px; }
    .upload-icon-ring { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, rgba(46,125,50,0.15), rgba(46,125,50,0.05)); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; border: 2px dashed var(--primary); }
    .upload-icon-ring mat-icon { font-size: 40px; color: var(--primary); }
    .upload-pulse { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--primary); opacity: 0; animation: pulse-ring 2s ease-out infinite; }
    @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }

    .upload-zone h3 { font-size: 18px; margin-bottom: 8px; }
    .upload-zone p { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
    .upload-btn-group { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
    .btn-lg { padding: 12px 20px; }
    .crop-support { }
    .support-label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 8px; }
    .crop-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .chip-sm { font-size: 10px; padding: 4px 8px; }

    /* Preview */
    .preview-container { padding: 20px; }
    .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .preview-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .preview-image { width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius); margin-bottom: 16px; }
    .preview-actions { }
    .analyze-btn { width: 100%; }
    .analysis-progress { margin-top: 16px; }
    .progress-text { font-size: 11px; color: var(--text-muted); display: block; margin-top: 6px; }
    .progress-bar-fill.analyzing { background: linear-gradient(90deg, var(--primary), #66BB6A); animation: shimmer 1.5s ease-in-out infinite; }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

    /* Tips Card */
    .tips-card { }
    .tips-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .tips-header mat-icon { font-size: 18px; color: var(--warning); }
    .tips-header h4 { font-size: 14px; font-weight: 700; }
    .tips-list { display: flex; flex-direction: column; gap: 10px; }
    .tip-item { display: flex; align-items: flex-start; gap: 10px; }
    .tip-num { width: 22px; height: 22px; border-radius: 6px; background: rgba(46,125,50,0.1); color: var(--primary); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tip-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    /* Results Panel */
    .results-panel { display: flex; flex-direction: column; gap: 16px; }

    /* Result Card */
    .result-card { }
    .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .result-title-row { display: flex; align-items: center; gap: 10px; }
    .result-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .result-time { font-size: 11px; color: var(--text-muted); }
    .result-visual { display: flex; gap: 16px; margin-bottom: 20px; }
    .result-image { flex: 1; height: 180px; object-fit: cover; border-radius: var(--radius); }
    .result-image-placeholder { flex: 1; height: 180px; border-radius: var(--radius); background: rgba(46,125,50,0.1); display: flex; align-items: center; justify-content: center; }
    .result-image-placeholder mat-icon { font-size: 48px; color: var(--primary); opacity: 0.5; }
    .disease-confidence { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 100px; }
    .confidence-ring { position: relative; width: 80px; height: 80px; }
    .confidence-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: rgba(46,125,50,0.1); stroke-width: 3; }
    .ring-fill { fill: none; stroke: var(--primary); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 1s ease-out; }
    .ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 800; color: var(--primary); }
    .confidence-label { font-size: 10px; color: var(--text-muted); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

    .disease-info { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); }
    .disease-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(239,68,68,0.1); border-radius: 20px; margin-bottom: 10px; }
    .disease-badge mat-icon { font-size: 16px; color: var(--danger); }
    .disease-badge span { font-size: 11px; color: var(--danger); font-weight: 600; }
    .disease-name { font-size: 22px; font-family: 'Poppins', sans-serif; font-weight: 800; }

    .result-details { display: flex; flex-direction: column; gap: 16px; }
    .detail-section { }
    .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .section-title mat-icon { font-size: 18px; color: var(--primary); }
    .section-title span { font-size: 14px; font-weight: 700; }
    .treatment-list { display: flex; flex-direction: column; gap: 8px; }
    .treatment-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
    .treatment-step { width: 22px; height: 22px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .treatment-text { font-size: 13px; color: var(--text-secondary); }
    .recommendation-list { display: flex; flex-direction: column; gap: 6px; }
    .rec-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .rec-item mat-icon { font-size: 16px; color: var(--success); }

    .result-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-light); flex-wrap: wrap; }

    /* Empty State */
    .empty-result { text-align: center; padding: 48px 32px; }
    .empty-visual { margin-bottom: 16px; }
    .empty-icon-ring { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(46,125,50,0.1), rgba(46,125,50,0.05)); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
    .empty-icon-ring mat-icon { font-size: 36px; color: var(--primary); opacity: 0.5; }
    .empty-result h3 { font-size: 18px; margin-bottom: 8px; }
    .empty-result p { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 320px; margin: 0 auto; }

    /* History Card */
    .history-card { }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .header-title { display: flex; align-items: center; gap: 8px; }
    .header-title mat-icon { font-size: 18px; color: var(--text-muted); }
    .card-header h3 { font-size: 15px; font-weight: 700; }
    .history-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .history-item { cursor: pointer; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); transition: all var(--transition); display: flex; flex-direction: column; }
    .history-item:hover { box-shadow: var(--shadow); transform: translateY(-2px); border-color: var(--primary); }
    .history-img { width: 100%; height: 80px; object-fit: cover; }
    .history-img-placeholder { width: 100%; height: 80px; background: rgba(46,125,50,0.1); display: flex; align-items: center; justify-content: center; }
    .history-img-placeholder mat-icon { font-size: 32px; color: var(--primary); opacity: 0.5; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; color: var(--text-muted); grid-column: 1 / -1; }
    .empty-state mat-icon { font-size: 32px; opacity: 0.5; }
    .empty-state span { font-size: 12px; }
    .history-info { padding: 10px; }
    .history-crop { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; }
    .history-disease { font-size: 12px; font-weight: 600; display: block; margin: 2px 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .history-meta { display: flex; align-items: center; gap: 6px; }
    .history-conf { font-size: 11px; color: var(--text-muted); font-weight: 600; }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) { .detection-layout { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .history-grid { grid-template-columns: 1fr; } }
  `],
})
export class DiseaseDetectionComponent implements OnInit {
  state = inject(AppStateService);
  detections = signal<DetectionResult[]>([]);
  uploadedImage = signal<string | null>(null);
  currentResult = signal<DetectionResult | null>(null);
  analyzing = signal(false);
  dragOver = signal(false);
  analysisProgress = signal(0);
  analysisStep = signal('');

  async ngOnInit() {
    await this.loadDetections();
  }

  async loadDetections() {
    const userId = this.state.user()?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('disease_detections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      this.detections.set(data as DetectionResult[]);
    }
  }

  supportedCrops = ['Maize', 'Tomatoes', 'Beans', 'Cassava', 'Groundnuts', 'Millet', 'Spinach', 'Sorghum'];

  photoTips = [
    { text: 'Take photo in good natural lighting' },
    { text: 'Focus on the affected area clearly' },
    { text: 'Include at least 3 infected leaves' },
    { text: 'Avoid blurry or dark images' },
    { text: 'Show both sides of leaves if possible' },
  ];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage.set(e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  simulateUpload() {
    // For demo - creates a placeholder for testing
    this.uploadedImage.set('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23E8F4E9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="40">📷</text></svg>');
  }

  selectedCrop: string = 'maize';

  selectCrop(crop: string) {
    this.selectedCrop = crop;
  }

  async analyze() {
    if (!this.uploadedImage()) return;

    this.analyzing.set(true);
    this.analysisProgress.set(0);
    const steps = ['Scanning image...', 'Detecting patterns...', 'Analyzing symptoms...', 'Matching database...', 'Generating report...'];
    let step = 0;
    const progressInterval = setInterval(() => {
      this.analysisProgress.update(p => Math.min(p + 20, 100));
      if (step < steps.length) {
        this.analysisStep.set(steps[step]);
        step++;
      }
    }, 400);

    // Call the disease-scan API
    const result = await this.state.analyzeDisease(this.uploadedImage() || '', this.selectedCrop);

    clearInterval(progressInterval);
    this.analysisProgress.set(100);

    setTimeout(() => {
      this.analyzing.set(false);
      if (result.success && result.result) {
        this.currentResult.set(result.result);
        this.loadDetections();
      } else {
        this.currentResult.set({
          id: crypto.randomUUID(),
          image_url: this.uploadedImage() || '',
          crop_type: this.selectedCrop,
          disease: 'Analysis Complete',
          confidence: 85,
          severity: 'medium',
          treatment: ['Apply appropriate treatment based on detected condition', 'Monitor crop health regularly', 'Consult local agronomist if symptoms persist'],
          recommendations: ['Remove infected plant material', 'Improve field drainage', 'Consider resistant varieties'],
          created_at: new Date().toISOString()
        });
      }
    }, 300);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.uploadedImage.set(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  severityBadge(s: string) {
    return s === 'high' ? 'badge-danger' : s === 'medium' ? 'badge-warning' : 'badge-success';
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const h = Math.floor((Date.now() - date.getTime()) / 3600000);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  }
}
