import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SharedModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {
  user!: any;
  email: string = '';
  editingName: boolean = false;
  editingEmail: boolean = false;
  newName: string = '';
  newEmail: string = '';
  showInfo: boolean = true;
  files: File[] = [];
  selectedPhoto: any;
  photoUrl: string = '';
  showEditPhoto: boolean = false;
  photoLoadingFlag: boolean = false;
  disableButton: boolean = true;
  uploadProgress: number = 0;

  // Stats for the profile
  profileStats = {
    patientsScanned: 0,
    lastScanDate: new Date(),
    accountAge: 0
  };

  constructor(
    private _AuthService: AuthService,
    private _AngularFireAuth: AngularFireAuth,
    private _AngularFireStorage: AngularFireStorage,
    private _ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.calculateProfileStats();
  }

  calculateProfileStats(): void {
    if (this.user?.metadata?.creationTime) {
      const createdDate = new Date(this.user.metadata.creationTime);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      this.profileStats.accountAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  toggleShowPhoto(): void {
    this.showEditPhoto = !this.showEditPhoto;
    if (!this.showEditPhoto) {
      this.files = [];
      this.selectedPhoto = null;
      this.disableButton = true;
      this.uploadProgress = 0;
    }
  }

  onSelect(event: any): void {
    const file = event.addedFiles[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this._ToastrService.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this._ToastrService.error('Image size should be less than 5MB');
      return;
    }

    this.files = [file];
    this.selectedPhoto = file;
    this.disableButton = false;
  }

  onRemove(event: any): void {
    this.files = [];
    this.selectedPhoto = null;
    this.disableButton = true;
  }

  async uploadPhoto(file: File): Promise<string> {
    this.photoLoadingFlag = true;
    const user = await this._AngularFireAuth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in.');
    }

    const filePath = `users/${user.uid}/profile_${Date.now()}.jpg`;
    const fileRef = this._AngularFireStorage.ref(filePath);
    const task = this._AngularFireStorage.upload(filePath, file);

    // Track upload progress
    task.percentageChanges().subscribe(progress => {
      this.uploadProgress = progress || 0;
    });

    await task;
    return await fileRef.getDownloadURL().toPromise();
  }

  async sendImage(): Promise<void> {
    if (!this.selectedPhoto) {
      this._ToastrService.error("Please select a photo first");
      return;
    }

    try {
      this.photoUrl = await this.uploadPhoto(this.selectedPhoto);
      const user = await this._AngularFireAuth.currentUser;
      
      if (user) {
        await user.updateProfile({
          photoURL: this.photoUrl
        });
        
        this.user.photoURL = this.photoUrl;
        this.disableButton = true;
        this.photoLoadingFlag = false;
        this.showEditPhoto = false;
        this.files = [];
        this.uploadProgress = 0;
        this._ToastrService.success("Profile photo updated successfully");
      }
    } catch (error) {
      console.error(error);
      this.photoLoadingFlag = false;
      this._ToastrService.error("Failed to update profile photo");
    }
  }

  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }

  getUserData(): void {
    this._AuthService.getUserInfo().subscribe({
      next: data => {
        this.user = data;
        this.newName = this.user?.displayName || '';
        this.newEmail = this.user?.email || '';
        this.calculateProfileStats();
      },
      error: err => {
        console.error(err);
        this._ToastrService.error("Failed to load user data");
      }
    });
  }

  startEditName(): void {
    this.editingName = true;
    this.newName = this.user?.displayName || '';
  }

  cancelEditName(): void {
    this.editingName = false;
    this.newName = this.user?.displayName || '';
  }

  async saveEditName(): Promise<void> {
    if (!this.newName.trim()) {
      this._ToastrService.error("Name cannot be empty");
      return;
    }

    try {
      const user = await this._AngularFireAuth.currentUser;
      if (user) {
        await user.updateProfile({
          displayName: this.newName.trim()
        });
        
        this.user.displayName = this.newName.trim();
        this.editingName = false;
        this._ToastrService.success("Name updated successfully");
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error("Failed to update name");
    }
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      const user = await this._AngularFireAuth.currentUser;
      if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        this._ToastrService.success("Verification email sent! Please check your inbox.");
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error("Failed to send verification email");
    }
  }

  stop(event: any): void {
    event.stopPropagation();
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

  formatAccountAge(): string {
    const days = this.profileStats.accountAge;
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  }
}