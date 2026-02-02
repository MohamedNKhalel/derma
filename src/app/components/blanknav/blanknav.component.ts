import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-blanknav',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './blanknav.component.html',
  styleUrls: ['./blanknav.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('mobileMenuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class BlanknavComponent implements OnInit {
  user: any;
  options: boolean = false;
  mobileMenuOpen: boolean = false;
  isScrolled: boolean = false;
  
  @ViewChild('navbar') navelement!: ElementRef;

  constructor(
    private _AuthService: AuthService,
    private _Renderer2: Renderer2,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
    
    if (this.isScrolled) {
      this._Renderer2.addClass(this.navelement.nativeElement, 'scrolled');
    } else {
      this._Renderer2.removeClass(this.navelement.nativeElement, 'scrolled');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && this.options) {
      this.options = false;
    }
  }

  toggleOptions(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.options = !this.options;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    // Prevent body scroll when mobile menu is open
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  signOut(): void {
    this._AuthService.signOut();
    this.options = false;
    this.closeMobileMenu();
  }

  getUserData(): void {
    this._AuthService.getUserInfo().subscribe({
      next: data => {
        this.user = data;
      },
      error: err => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  navigateTo(route: string): void {
    this._Router.navigate([route]);
    this.closeMobileMenu();
  }
}