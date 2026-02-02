import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({
        width: '280px'
      })),
      state('collapsed', style({
        width: '80px'
      })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms 100ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SideNavComponent implements OnInit {
  @ViewChild('sideNav') sideNav!: ElementRef;
  @Output() mynav = new EventEmitter<boolean>();

  isExpanded: boolean = false;
  currentRoute: string = '';
  user: any;
  isDarkMode: boolean = false;
  patientCount: number = 0;

  navItems: NavItem[] = [
    { icon: 'fa-hospital-user', label: 'Patients', route: '/patients' },
    { icon: 'fa-camera', label: 'Scan', route: '/scan' },
    { icon: 'fa-chart-line', label: 'Analytics', route: '/analytics' },
    { icon: 'fa-user', label: 'Profile', route: '/profile' }
  ];

  quickActions: NavItem[] = [
    { icon: 'fa-gear', label: 'Settings', route: '/settings' },
    { icon: 'fa-circle-question', label: 'Help', route: '/help' }
  ];

  constructor(
    private _AuthService: AuthService,
    private _DataService: DataService,
    private _Renderer2: Renderer2,
    private _Router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.trackCurrentRoute();
    this.loadDarkModePreference();
    this.getPatientCount();
  }

  trackCurrentRoute(): void {
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }
  changeStatus(){
    this.isExpanded = false;
  }
  getPatientCount(): void {
    this._DataService.getAllPatients().subscribe({
      next: (patients) => {
        this.patientCount = patients?.length || 0;
        // Update the patients nav item with the count
        const patientsNavItem = this.navItems.find(item => item.route === '/patients');
        if (patientsNavItem) {
          patientsNavItem.badge = this.patientCount;
        }
      },
      error: (err:any) => {
        console.error('Error fetching patient count:', err);
      }
    });
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.mynav.emit(this.isExpanded);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.saveDarkModePreference();
    this.applyDarkMode();
  }

  loadDarkModePreference(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedPreference = localStorage.getItem('darkMode');
      this.isDarkMode = savedPreference === 'true';
      this.applyDarkMode();
    }
  }

  saveDarkModePreference(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', this.isDarkMode.toString());
    }
  }

  applyDarkMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        this._Renderer2.addClass(document.body, 'dark-mode');
      } else {
        this._Renderer2.removeClass(document.body, 'dark-mode');
      }
    }
  }

  logOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this._AuthService.signOut();
    }
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
}