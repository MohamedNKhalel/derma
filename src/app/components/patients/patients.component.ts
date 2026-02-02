import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataService } from 'src/app/services/data.service';
import { Patient } from 'src/app/interfaces/patient';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddPatientComponent } from '../add-patient/add-patient.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    AddPatientComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    CommonModule,
    RouterLink,
    FormsModule,
    MatSelectModule,
    SharedModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class PatientsComponent implements OnInit {
  constructor(
    private _AuthService: AuthService,
    private _DataService: DataService,
    public _MatDialog: MatDialog,
    private _MatSnackBar: MatSnackBar,
    private _Router: Router
  ) {}

  patientList: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchName: string = '';
  searchGender: string = '';
  loading: boolean = true;
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.getAllPatients();
  }

  getAllPatients(): void {
    this.loading = true;
    this._DataService.getAllPatients().subscribe({
      next: res => {
        this.patientList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        });
        this.filteredPatients = [...this.patientList];
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching patients:', err);
        this.loading = false;
        this._MatSnackBar.open('Failed to load patients', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  filterPatients(): void {
    this.filteredPatients = this.patientList.filter(patient => {
      const matchesName = !this.searchName || 
        patient.name.toLowerCase().includes(this.searchName.toLowerCase());
      const matchesGender = !this.searchGender || 
        patient.gender.toLowerCase() === this.searchGender.toLowerCase();
      
      return matchesName && matchesGender;
    });
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchGender = '';
    this.filteredPatients = [...this.patientList];
  }

  deleteItem(patient: Patient, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Are you sure?',
      html: `Do you really want to delete <strong>${patient.name}</strong>?<br><small>This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-modern',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeletion(patient);
      }
    });
  }

  performDeletion(patient: Patient): void {
    this._DataService.deletePatient(patient).then(() => {
      Swal.fire({
        title: 'Deleted!',
        text: 'Patient has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        customClass: {
          popup: 'swal-modern'
        }
      });
      this.getAllPatients();
    }).catch(error => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete patient. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'swal-modern'
        }
      });
    });
  }

  updatePatient(patient: Patient, event: Event): void {
    event.stopPropagation();
    this._DataService.state.next(true);
    const dialogRef = this._MatDialog.open(AddPatientComponent, {
      data: patient,
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getAllPatients();
      }
    });
  }

  addPatient(): void {
    this._DataService.state.next(false);
    const dialogRef = this._MatDialog.open(AddPatientComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getAllPatients();
      }
    });
  }

  viewPatient(patient: Patient): void {
    this._Router.navigate(['/details', patient.id]);
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  getGenderIcon(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    const [day, month, year] = dateOfBirth.split('/');
    const birthDate = new Date(+year, +month - 1, +day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getPatientInitials(name: string): string {
    if (!name || name.trim().length === 0) return 'N/A';
    const names = name.trim().split(' ').filter(n => n.length > 0);
    if (names.length >= 2 && names[0][0] && names[1][0]) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    if (names.length >= 1 && names[0][0]) {
      return names[0].substring(0, 1).toUpperCase();
    }
    return 'N/A';
  }
  
}

