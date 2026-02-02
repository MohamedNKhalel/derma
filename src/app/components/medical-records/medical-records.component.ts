import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddRecordComponent } from '../add-record/add-record.component';
import { RecordFile } from 'src/app/interfaces/record-file';
import { trigger, transition, style, animate } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AddRecordComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class MedicalRecordsComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Location: Location,
    public _MatDialog: MatDialog,
    private _DatePipe: DatePipe
  ) {}

  patient!: any;
  records!: RecordFile[];
  patientId: any = '';
  imageUrl: string = '';
  previewFlag: boolean = false;
  imageIndex: number = 0;
  timeStamp: any[] = [];
  date: Date[] = [];
  clicked: boolean = false;
  loading: boolean = true;
  selectedFilter: string = 'all';
  deletingRecordId: string | null = null;

  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.moveLeft();
    }
    if (event.key === 'ArrowRight') {
      this.moveRight();
    }
    if (event.key === 'Escape') {
      this.previewFlag = false;
    }
  }

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: params => {
        this.patientId = params.get('id');
      }
    });
    this.getPatientById(this.patientId);
  }

  selectImage(i: number): void {
    this.imageIndex = i;
    this.previewFlag = true;
    this.imageUrl = this.records[i].image;
  }

  moveLeft(): void {
    this.imageIndex--;
    if (this.imageIndex < 0) {
      this.imageIndex = this.records.length - 1;
    }
    this.imageUrl = this.records[this.imageIndex].image;
  }

  moveRight(): void {
    this.clicked = true;
    this.imageIndex += 1;
    if (this.imageIndex == this.records.length) {
      this.imageIndex = 0;
    }
    this.imageUrl = this.records[this.imageIndex].image;
  }

  stop(event: Event): void {
    event.stopPropagation();
  }

  goBack(): void {
    this._Location.back();
  }

  getPatientById(patientId: any): void {
    this.loading = true;
    this._DataService.getSpecificPatient().doc(patientId).get().subscribe({
      next: data => {
        this.patient = data.data();
        this.records = this.patient.scans || [];

        this.timeStamp = [];
        for (let i = 0; i < this.records.length; i++) {
          this.timeStamp.push(this.records[i].timestamp);
        }

        this.date = this.convertTimestampsToDates(this.timeStamp);
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching patient:', err);
        this.loading = false;
      }
    });
  }

  convertTimestampsToDates(timestamps: { seconds: number; nanoseconds: number }[]): Date[] {
    return timestamps.map(timestamp => {
      const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      return new Date(milliseconds);
    });
  }

  openAddRecordDialog(): void {
    const dialogRef = this._MatDialog.open(AddRecordComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: this.patientId,
      panelClass: 'custom-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getPatientById(this.patientId);
      }
    });
  }

  // Delete a single medical record
  deleteRecord(recordIndex: number, event: Event): void {
    event.stopPropagation();
    
    const record = this.records[recordIndex];
    
    Swal.fire({
      title: 'Delete Medical Record?',
      html: `Are you sure you want to delete this record?<br><small class="text-muted">${this.formatDate(this.date[recordIndex])}</small>`,
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
        this.performDeleteRecord(recordIndex);
      }
    });
  }

  private performDeleteRecord(recordIndex: number): void {
    // Create a new array without the deleted record
    const updatedRecords = this.records.filter((_, index) => index !== recordIndex);
    
    // Update Firestore with the new records array
    this._DataService.updatePatient().doc(this.patientId).update({
      scans: updatedRecords
    }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Medical record has been deleted successfully.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        customClass: {
          popup: 'swal-modern'
        }
      });
      
      // Refresh the patient data
      this.getPatientById(this.patientId);
      
      // Close preview if it's open and showing deleted record
      if (this.previewFlag && this.imageIndex === recordIndex) {
        this.previewFlag = false;
      } else if (this.previewFlag && this.imageIndex > recordIndex) {
        this.imageIndex--;
      }
    }).catch(error => {
      console.error('Error deleting record:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete medical record. Please try again.',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'swal-modern'
        }
      });
    });
  }

  // Delete all medical records
  deleteAllRecords(): void {
    if (!this.records || this.records.length === 0) {
      return;
    }

    Swal.fire({
      title: 'Delete All Records?',
      html: `Are you sure you want to delete <strong>all ${this.records.length} medical records</strong>?<br><small class="text-danger">This action cannot be undone!</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-modern',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteAllRecords();
      }
    });
  }

  private performDeleteAllRecords(): void {
    // Update Firestore with an empty scans array
    this._DataService.updatePatient().doc(this.patientId).update({
      scans: []
    }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'All Records Deleted!',
        text: 'All medical records have been deleted successfully.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        customClass: {
          popup: 'swal-modern'
        }
      });
      
      // Refresh the patient data
      this.getPatientById(this.patientId);
      
      // Close preview if open
      this.previewFlag = false;
    }).catch(error => {
      console.error('Error deleting all records:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete medical records. Please try again.',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'swal-modern'
        }
      });
    });
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return this._DatePipe.transform(date, 'MMM dd, yyyy - hh:mm a') || 'N/A';
  }

  getRecordType(record: RecordFile): string {
    // Extract type from prediction or default to 'Scan'
    if (record.prediction && record.prediction !== 'Diagnosis Not Available') {
      const words = record.prediction.split(' ');
      return words.slice(0, 2).join(' ');
    }
    return 'Medical Scan';
  }

  downloadRecord(record: RecordFile, index: number): void {
    const link = document.createElement('a');
    link.href = record.image;
    link.download = `medical-record-${index + 1}-${this.formatDate(this.date[index]).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
    link.click();
  }

  closePreview(): void {
    this.previewFlag = false;
  }

  get filteredRecords(): RecordFile[] {
    if (this.selectedFilter === 'all') {
      return this.records;
    }
    return this.records.filter(record => 
      this.getRecordType(record).toLowerCase().includes(this.selectedFilter.toLowerCase())
    );
  }

  calculateTotalSize(): string {
    if (!this.records || this.records.length === 0) {
      return '0 MB';
    }

    const totalBytes = this.records.reduce((sum, record) => sum + (record.size || 0), 0);
    const totalMB = totalBytes / 1024 / 1024;

    if (totalMB < 1) {
      return `${(totalBytes / 1024).toFixed(2)} KB`;
    } else if (totalMB < 1024) {
      return `${totalMB.toFixed(2)} MB`;
    } else {
      return `${(totalMB / 1024).toFixed(2)} GB`;
    }
  }
}