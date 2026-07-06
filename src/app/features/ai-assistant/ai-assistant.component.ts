import { Component, signal, inject, viewChild, ElementRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../core/services/app-state.service';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  attachments?: string[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, FormsModule],
  template: `
    <div class="ai-layout page-enter">
      <!-- Left: History -->
      <aside class="history-panel hide-mobile">
        <div class="history-header">
          <h3>Conversations</h3>
          <button class="btn btn-primary btn-sm" (click)="newConversation()">
            <mat-icon>add</mat-icon> New
          </button>
        </div>
        <div class="history-list">
          @for (conv of conversations; track conv.id) {
            <div class="history-item" [class.active]="activeConv() === conv.id" (click)="activeConv.set(conv.id)">
              <mat-icon>chat</mat-icon>
              <div class="history-item-content">
                <span class="history-title">{{ conv.title }}</span>
                <span class="history-time">{{ conv.time }}</span>
              </div>
            </div>
          }
        </div>
        <div class="history-footer">
          <div class="ai-model-badge">
            <mat-icon>auto_awesome</mat-icon>
            <div>
              <strong>AgriGrow v2.1</strong>
              <span>Agriculture-specialized model</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Chat -->
      <div class="chat-area">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="ai-avatar">
              <mat-icon>psychology</mat-icon>
            </div>
            <div>
              <h3>AgriGrow Assistant</h3>
              <span class="online-status"><span class="dot"></span> Online — Ready to help</span>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="icon-btn" title="Voice Input"><mat-icon>mic</mat-icon></button>
            <button class="icon-btn" title="Upload Image"><mat-icon>image</mat-icon></button>
            <button class="icon-btn" title="Clear Chat"><mat-icon>delete_sweep</mat-icon></button>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-area" #messagesArea>
          <!-- Suggested Prompts (when empty) -->
          @if (messages().length === 1) {
            <div class="suggestions">
              <div class="suggestions-title">
                <mat-icon>auto_awesome</mat-icon>
                Suggested questions
              </div>
              <div class="suggestions-grid">
                @for (s of suggestions; track s) {
                  <button class="suggestion-btn" (click)="sendSuggestion(s)">{{ s }}</button>
                }
              </div>
            </div>
          }

          @for (msg of messages(); track msg.id) {
            <div class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
              @if (msg.role === 'assistant') {
                <div class="msg-avatar ai-avatar-sm">
                  <mat-icon>psychology</mat-icon>
                </div>
              }
              <div class="msg-bubble">
                @if (msg.thinking) {
                  <div class="thinking-dots">
                    <span></span><span></span><span></span>
                  </div>
                } @else {
                  <div class="msg-content" [innerHTML]="formatMessage(msg.content)"></div>
                }
                <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
              @if (msg.role === 'user') {
                <div class="msg-avatar user-avatar">T</div>
              }
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <div class="input-attachments" *ngIf="attachments().length > 0">
            @for (att of attachments(); track att) {
              <div class="attachment-chip">
                <mat-icon>image</mat-icon>
                <span>{{ att }}</span>
                <button (click)="removeAttachment(att)"><mat-icon>close</mat-icon></button>
              </div>
            }
          </div>
          <div class="chat-input-wrapper">
            <button class="input-action-btn" (click)="triggerImageUpload()" title="Upload image">
              <mat-icon>image</mat-icon>
            </button>
            <button class="input-action-btn" (click)="toggleVoice()" [class.active]="voiceActive()" title="Voice input">
              <mat-icon>{{ voiceActive() ? 'mic' : 'mic_none' }}</mat-icon>
            </button>
            <textarea
              class="chat-textarea"
              [(ngModel)]="inputText"
              placeholder="Ask anything — crop disease, planting advice, market prices..."
              rows="1"
              (keydown.enter)="onEnter($event)"
              (input)="autoResize($event)">
            </textarea>
            <button class="send-btn" (click)="sendMessage()" [disabled]="!inputText.trim()">
              <mat-icon>send</mat-icon>
            </button>
          </div>
          <p class="input-hint">Press Enter to send · Shift+Enter for new line · Upload a photo of your crop for disease analysis</p>
        </div>
      </div>

      <!-- Right: Tools Panel -->
      <aside class="tools-panel hide-mobile">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">AI Tools</h3>
        @for (tool of aiTools; track tool.label) {
          <a class="tool-card" [routerLink]="tool.route">
            <div class="icon-wrap {{ tool.iconClass }}" style="width:36px;height:36px;font-size:18px;border-radius:8px">
              <mat-icon>{{ tool.icon }}</mat-icon>
            </div>
            <div class="tool-info">
              <span class="tool-label">{{ tool.label }}</span>
              <span class="tool-desc">{{ tool.desc }}</span>
            </div>
            <mat-icon style="font-size:16px;color:var(--text-muted)">chevron_right</mat-icon>
          </a>
        }
        <div class="divider"></div>
        <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">Farm Summary</h3>
        <div class="farm-summary">
          <div class="summary-row"><mat-icon>grass</mat-icon><span>5 active crops</span></div>
          <div class="summary-row"><mat-icon>wb_sunny</mat-icon><span>28°C, Partly cloudy</span></div>
          <div class="summary-row"><mat-icon>water_drop</mat-icon><span>Humidity: 62%</span></div>
          <div class="summary-row"><mat-icon>health_and_safety</mat-icon><span>Health: 87%</span></div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .ai-layout {
      display: grid;
      grid-template-columns: 240px 1fr 220px;
      height: calc(100vh - var(--topbar-height) - 64px);
      gap: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    /* History Panel */
    .history-panel {
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      background: var(--bg-subtle);
    }
    .history-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .history-header h3 { font-size: 15px; font-weight: 700; }
    .history-list { flex: 1; overflow-y: auto; padding: 8px; }
    .history-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px; border-radius: 8px; cursor: pointer;
      transition: background var(--transition);
    }
    .history-item:hover { background: var(--bg-card); }
    .history-item.active { background: rgba(46,125,50,0.1); }
    .history-item mat-icon { font-size: 18px; color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }
    .history-item-content { flex: 1; min-width: 0; }
    .history-title { font-size: 12.5px; font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .history-time { font-size: 11px; color: var(--text-muted); }
    .history-footer { padding: 12px; border-top: 1px solid var(--border); }
    .ai-model-badge { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(46,125,50,0.08); border-radius: 8px; }
    .ai-model-badge mat-icon { font-size: 20px; color: var(--primary); }
    .ai-model-badge strong { font-size: 12px; display: block; }
    .ai-model-badge span { font-size: 10px; color: var(--text-muted); }

    /* Chat */
    .chat-area { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; }
    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg-card);
    }
    .chat-header-info { display: flex; align-items: center; gap: 12px; }
    .ai-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; color: #fff; }
    .ai-avatar mat-icon { font-size: 22px; }
    .chat-header-info h3 { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
    .online-status { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--success); }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); }
    .chat-header-actions { display: flex; gap: 4px; }
    .icon-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; border-radius: 8px; color: var(--text-secondary); transition: all var(--transition); }
    .icon-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }

    /* Messages */
    .messages-area { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 20px; }
    .suggestions { text-align: center; padding: 24px 0; }
    .suggestions-title { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
    .suggestions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 500px; margin: 0 auto; }
    .suggestion-btn { padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12.5px; cursor: pointer; text-align: left; transition: all var(--transition); font-family: 'Inter',sans-serif; }
    .suggestion-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(46,125,50,0.04); }

    .message { display: flex; align-items: flex-end; gap: 10px; }
    .message.user { flex-direction: row-reverse; }
    .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ai-avatar-sm { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; }
    .ai-avatar-sm mat-icon { font-size: 18px; }
    .user-avatar { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; font-size: 14px; font-weight: 700; }
    .msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 16px; position: relative; }
    .message.assistant .msg-bubble { background: var(--bg-subtle); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
    .message.user .msg-bubble { background: var(--primary); color: #fff; border-bottom-right-radius: 4px; }
    .msg-content { font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; }
    .message.user .msg-content { color: #fff; }
    .msg-time { font-size: 10px; color: var(--text-muted); margin-top: 6px; }
    .message.user .msg-time { color: rgba(255,255,255,0.6); text-align: right; }

    .thinking-dots { display: flex; gap: 4px; padding: 4px 0; }
    .thinking-dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.4s infinite; }
    .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }

    /* Input */
    .chat-input-area {
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      background: var(--bg-card);
    }
    .chat-input-wrapper {
      display: flex; align-items: flex-end; gap: 8px;
      background: var(--bg-subtle);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 8px 12px;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .chat-input-wrapper:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(46,125,50,0.1); }
    .input-action-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 6px; transition: all var(--transition); display: flex; align-items: center; }
    .input-action-btn:hover, .input-action-btn.active { color: var(--primary); background: rgba(46,125,50,0.1); }
    .chat-textarea { flex: 1; border: none; background: transparent; font-family: 'Inter',sans-serif; font-size: 13.5px; color: var(--text-primary); outline: none; resize: none; max-height: 120px; line-height: 1.5; padding: 2px 0; }
    .chat-textarea::placeholder { color: var(--text-muted); }
    .send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; transition: all var(--transition); flex-shrink: 0; }
    .send-btn:hover { background: var(--primary-dark); transform: scale(1.05); }
    .send-btn:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; transform: none; }
    .input-hint { font-size: 10.5px; color: var(--text-muted); margin-top: 6px; }
    .attachment-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background: rgba(46,125,50,0.1); color: var(--primary); font-size: 11px; margin-bottom: 8px; }
    .attachment-chip button { background: none; border: none; cursor: pointer; color: var(--primary); display: flex; align-items: center; }
    .attachment-chip mat-icon { font-size: 12px; }

    /* Tools Panel */
    .tools-panel { border-left: 1px solid var(--border); padding: 16px; background: var(--bg-subtle); overflow-y: auto; }
    .tool-card { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; cursor: pointer; transition: background var(--transition); margin-bottom: 6px; text-decoration: none; }
    .tool-card:hover { background: rgba(46,125,50,0.08); }
    .tool-info { flex: 1; }
    .tool-label { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
    .tool-desc { font-size: 11px; color: var(--text-muted); }
    .farm-summary { display: flex; flex-direction: column; gap: 8px; }
    .summary-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-secondary); }
    .summary-row mat-icon { font-size: 16px; color: var(--primary); }

    @media (max-width: 768px) {
      .ai-layout { grid-template-columns: 1fr; height: calc(100vh - 140px); }
    }
  `],
})
export class AiAssistantComponent {
  state = inject(AppStateService);
  messages = signal<AIMessage[]>([]);
  inputText = '';
  activeConv = signal('1');
  voiceActive = signal(false);
  attachments = signal<string[]>([]);
  messagesArea = viewChild<ElementRef<HTMLDivElement>>('messagesArea');

  constructor() {
    const userName = this.state.profile()?.name || 'Farmer';
    this.messages.set([{
      id: '1',
      role: 'assistant',
      content: `Hello ${userName}! I am your AgriGrow assistant. I can help you with crop management, disease detection, weather advice, market insights, and much more. How can I help you today?`,
      timestamp: new Date(Date.now() - 300000),
    }]);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(smooth: boolean = true) {
    const el = this.messagesArea()?.nativeElement;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }

  conversations = [
    { id: '1', title: 'Maize leaf yellowing issue', time: '2 hours ago' },
    { id: '2', title: 'Best time to harvest tomatoes', time: 'Yesterday' },
    { id: '3', title: 'Fall Armyworm treatment', time: '3 days ago' },
    { id: '4', title: 'Irrigation scheduling advice', time: 'Last week' },
    { id: '5', title: 'Cover crop recommendations', time: 'Last week' },
  ];

  suggestions = [
    'What are the signs of Fall Armyworm in maize?',
    'When should I irrigate my tomatoes?',
    'What crops should I plant this season?',
    'How can I improve my soil health?',
    'What is the best fertilizer for beans?',
    'How do I prevent blight in tomatoes?',
  ];

  aiTools = [
    { icon: 'biotech', label: 'Disease Detection', desc: 'Upload crop photo', route: '/app/disease-detection', iconClass: 'icon-wrap-danger' },
    { icon: 'tips_and_updates', label: 'Crop Advisor', desc: 'What to plant', route: '/app/crop-advisor', iconClass: 'icon-wrap-warning' },
    { icon: 'trending_up', label: 'Yield Forecast', desc: 'Predict harvest', route: '/app/yield-forecast', iconClass: 'icon-wrap-primary' },
    { icon: 'wb_sunny', label: 'Weather Advice', desc: 'Farm weather tips', route: '/app/weather', iconClass: 'icon-wrap-info' },
  ];

  sendSuggestion(text: string) {
    this.inputText = text;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.inputText.trim()) return;
    const userMsg: AIMessage = { id: Date.now().toString(), role: 'user', content: this.inputText, timestamp: new Date() };
    this.messages.update(m => [...m, userMsg]);
    this.inputText = '';
    this.attachments.set([]);
    setTimeout(() => this.scrollToBottom(), 0);

    const thinking: AIMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date(), thinking: true };
    this.messages.update(m => [...m, thinking]);
    setTimeout(() => this.scrollToBottom(), 0);

    setTimeout(() => {
      this.messages.update(msgs => {
        const withoutThinking = msgs.filter(m => !m.thinking);
        return [...withoutThinking, {
          id: Date.now().toString(), role: 'assistant',
          content: this.generateResponse(userMsg.content),
          timestamp: new Date(),
        }];
      });
      setTimeout(() => this.scrollToBottom(), 0);
    }, 1800);
  }

  generateResponse(query: string): string {
    return `Thank you for your question about: "${query}"\n\nBased on your farm data in Limpopo and current conditions, here is my analysis:\n\n**Key Recommendations:**\n1. Monitor your crops carefully over the next 48 hours given the weather forecast\n2. Consider applying preventive measures based on current pest pressure in your region\n3. Optimal conditions for your maize planting are currently favorable\n\nWould you like me to generate a detailed action plan or connect you with a local agronomist?`;
  }

  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  onEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  toggleVoice() { this.voiceActive.update(v => !v); }
  triggerImageUpload() { this.attachments.update(a => [...a, 'crop-photo.jpg']); }
  removeAttachment(att: string) { this.attachments.update(a => a.filter(x => x !== att)); }
  newConversation() { this.messages.set([]); }
}
