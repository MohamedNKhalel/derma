import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from 'src/app/services/gemini.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SharedModule, DragDropModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  prompt: string = '';
  messages: Message[] = [];
  chat: boolean = false;
  loading: boolean = false;
  userName: string = '';
  userInitials: string = '';
  isMinimized: boolean = false;
  conversationHistory: any[] = [];

  // Suggested prompts for quick start
  suggestedPrompts: string[] = [
    'What are common skin conditions?',
    'Explain melanoma symptoms',
    'How to prevent acne?',
    'Best skincare routine tips'
  ];

  constructor(
    private _GeminiService: GeminiService,
    private _AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.loadChatHistory();
    this.addWelcomeMessage();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  addWelcomeMessage(): void {
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: `Hello! 👋 I'm DERMA Assistant, your AI-powered dermatology helper. How can I assist you today?`,
        timestamp: new Date()
      });
    }
  }

  // generateContent(): void {
  //   if (!this.prompt.trim()) return;

  //   const userMessage: Message = {
  //     role: 'user',
  //     content: this.prompt.trim(),
  //     timestamp: new Date()
  //   };

  //   this.messages.push(userMessage);
  //   this.conversationHistory.push({
  //     role: 'user',
  //     parts: [{ text: this.prompt.trim() }]
  //   });

  //   const userPrompt = this.prompt;
  //   this.prompt = '';
  //   this.loading = true;

  //   // Add typing indicator
  //   const typingMessage: Message = {
  //     role: 'assistant',
  //     content: '',
  //     timestamp: new Date(),
  //     isTyping: true
  //   };
  //   this.messages.push(typingMessage);

  //   this._GeminiService.generateContent(userPrompt).subscribe({
  //     next: (response) => {
  //       this.loading = false;
        
  //       // Remove typing indicator
  //       this.messages = this.messages.filter(m => !m.isTyping);

  //       const text = response.candidates[0].content.parts[0].text;
  //       const styledText = this.styleContent(text);

  //       const assistantMessage: Message = {
  //         role: 'assistant',
  //         content: styledText,
  //         timestamp: new Date()
  //       };

  //       this.messages.push(assistantMessage);
        
  //       this.conversationHistory.push({
  //         role: 'model',
  //         parts: [{ text: text }]
  //       });

  //       this.saveChatHistory();
  //     },
  //     error: (error) => {
  //       this.loading = false;
  //       this.messages = this.messages.filter(m => !m.isTyping);
        
  //       const errorMessage: Message = {
  //         role: 'assistant',
  //         content: '⚠️ Sorry, I encountered an error. Please try again.',
  //         timestamp: new Date()
  //       };
  //       this.messages.push(errorMessage);
        
  //       console.error('Error generating content:', error);
  //     }
  //   });
  // }

  styleContent(content: string): string {
    // Code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold text
    content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Headers
    content = content.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    content = content.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    content = content.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    
    // Unordered lists
    content = content.replace(/^\* (.+)$/gm, '<li>$1</li>');
    content = content.replace(/(<li>.*<\/li>)/gs, (match) => {
      return '<ul>' + match + '</ul>';
    });
    
    // Numbered lists
    content = content.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Line breaks and paragraphs
    content = content.replace(/\n\n/g, '</p><p>');
    content = content.replace(/^(?!<[hul])/gm, '<p>');
    content = content.replace(/(?!<\/[hul]>)$/gm, '</p>');
    
    // Clean up
    content = content.replace(/<p><\/p>/g, '');
    content = content.replace(/<p>(<[hul])/g, '$1');
    content = content.replace(/(<\/[hul]>)<\/p>/g, '$1');
    
    return content;
  }

  useSuggestedPrompt(prompt: string): void {
    this.prompt = prompt;
    this.generateContent();
  }

  toggleChat(): void {
    this.chat = !this.chat;
    if (this.chat && this.messageInput) {
      setTimeout(() => this.messageInput.nativeElement.focus(), 100);
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }
generateContent(): void {
  if (!this.prompt.trim()) return;

  const userMessage: Message = {
    role: 'user',
    content: this.prompt.trim(),
    timestamp: new Date()
  };

  this.messages.push(userMessage);

  const userPrompt = this.prompt;
  this.prompt = '';
  this.loading = true;

  // Add typing indicator
  const typingMessage: Message = {
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    isTyping: true
  };
  this.messages.push(typingMessage);

  this._GeminiService.generateContent(userPrompt).subscribe({
    next: (response) => {
      this.loading = false;
      
      // Remove typing indicator
      this.messages = this.messages.filter(m => !m.isTyping);

      const text = response.candidates[0].content.parts[0].text;
      
      // Add assistant response to service context
      this._GeminiService.addAssistantResponse(text);
      
      const styledText = this.styleContent(text);

      const assistantMessage: Message = {
        role: 'assistant',
        content: styledText,
        timestamp: new Date()
      };

      this.messages.push(assistantMessage);
      this.saveChatHistory();
    },
    error: (error) => {
      this.loading = false;
      this.messages = this.messages.filter(m => !m.isTyping);
      
      console.error('Error generating content:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      this.messages.push(errorMessage);
    }
  });
}

clearChat(): void {
  if (confirm('Are you sure you want to clear this conversation?')) {
    this.messages = [];
    this._GeminiService.clearContext(); // Clear service context too
    this.addWelcomeMessage();
    localStorage.removeItem('derma_chat_history');
  }
}
  // clearChat(): void {
  //   if (confirm('Are you sure you want to clear this conversation?')) {
  //     this.messages = [];
  //     this.conversationHistory = [];
  //     this.addWelcomeMessage();
  //     localStorage.removeItem('derma_chat_history');
  //   }
  // }

  getUserData(): void {
    this._AuthService.getUserInfo().subscribe({
      next: (data) => {
        this.userName = data?.displayName || 'User';
        this.userInitials = this.getInitials(this.userName);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.userName = 'User';
        this.userInitials = 'U';
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private saveChatHistory(): void {
    try {
      localStorage.setItem('derma_chat_history', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  private loadChatHistory(): void {
    try {
      const history = localStorage.getItem('derma_chat_history');
      if (history) {
        this.messages = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  exportChat(): void {
    const chatText = this.messages
      .map(m => `${m.role.toUpperCase()} [${m.timestamp.toLocaleString()}]:\n${m.content}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `derma-chat-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}