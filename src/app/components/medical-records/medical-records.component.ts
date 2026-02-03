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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddRecordComponent } from '../add-record/add-record.component';
import { RecordFile } from 'src/app/interfaces/record-file';
import { trigger, transition, style, animate } from '@angular/animations';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { RecordsService } from 'src/app/services/records.service';
import { DiseaseService } from 'src/app/disease.service';
import { NgxDropzoneModule } from 'ngx-dropzone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgxDropzoneModule,
    AddRecordComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
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
    private _DatePipe: DatePipe,
    // ── new services for scan logic ──
    private _AngularFireStorage: AngularFireStorage,
    private _RecordsService: RecordsService,
    private _DiseaseService: DiseaseService
  ) {}

  // ─── existing record-list state ───────────────────────────────────────────
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

  // ─── new scan / upload state (ported from HomeComponent) ──────────────────
  scanFiles: File[] = [];
  selectedFiles!: FileList;
  currentSelectedFile!: RecordFile;
  scanPreviewUrl: string | ArrayBuffer | null = null;   // renamed to avoid clash
  loadingFlag: boolean = false;                         // true while API call is in-flight
  prediction: string = '';
  percentage: number = 0;
  saved: boolean = false;
  uploaded: boolean = false;
  detailsClicked: boolean = false;
  isLoading: boolean = false;                           // true while disease-detail fetch is in-flight

  // disease detail fields
  skinDiseasePhotoUrl: string = '';
  diseaseName: string = '';
  description: string = '';
  symptoms: string[] = [];
  treatment: string = '';

  // ─── keyboard nav (existing) ──────────────────────────────────────────────
  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft')  this.moveLeft();
    if (event.key === 'ArrowRight') this.moveRight();
    if (event.key === 'Escape')     this.previewFlag = false;
  }

  // ─── lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: params => {
        this.patientId = params.get('id');
      }
    });
    this.getPatientById(this.patientId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXISTING RECORD-LIST METHODS  (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  selectImage(i: number): void {
    this.imageIndex = i;
    this.previewFlag = true;
    this.imageUrl = this.records[i].image;
  }

  moveLeft(): void {
    this.imageIndex--;
    if (this.imageIndex < 0) this.imageIndex = this.records.length - 1;
    this.imageUrl = this.records[this.imageIndex].image;
  }

  moveRight(): void {
    this.clicked = true;
    this.imageIndex += 1;
    if (this.imageIndex === this.records.length) this.imageIndex = 0;
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
      if (result === true) this.getPatientById(this.patientId);
    });
  }

  deleteRecord(recordIndex: number, event: Event): void {
    event.stopPropagation();

    Swal.fire({
      title: 'Delete Medical Record?',
      html: `Are you sure you want to delete this record?<br><small class="text-muted">${this.formatDate(this.date[recordIndex])}</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'swal-modern', confirmButton: 'swal-confirm-btn', cancelButton: 'swal-cancel-btn' }
    }).then((result) => {
      if (result.isConfirmed) this.performDeleteRecord(recordIndex);
    });
  }

  private performDeleteRecord(recordIndex: number): void {
    const updatedRecords = this.records.filter((_, index) => index !== recordIndex);

    this._DataService.updatePatient().doc(this.patientId).update({
      scans: updatedRecords
    }).then(() => {
      Swal.fire({
        icon: 'success', title: 'Deleted!',
        text: 'Medical record has been deleted successfully.',
        confirmButtonColor: '#2563eb', timer: 2000,
        customClass: { popup: 'swal-modern' }
      });
      this.getPatientById(this.patientId);

      if (this.previewFlag && this.imageIndex === recordIndex) this.previewFlag = false;
      else if (this.previewFlag && this.imageIndex > recordIndex) this.imageIndex--;
    }).catch(error => {
      console.error('Error deleting record:', error);
      Swal.fire({
        icon: 'error', title: 'Error!',
        text: 'Failed to delete medical record. Please try again.',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'swal-modern' }
      });
    });
  }

  deleteAllRecords(): void {
    if (!this.records || this.records.length === 0) return;

    Swal.fire({
      title: 'Delete All Records?',
      html: `Are you sure you want to delete <strong>all ${this.records.length} medical records</strong>?<br><small class="text-danger">This action cannot be undone!</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'swal-modern', confirmButton: 'swal-confirm-btn', cancelButton: 'swal-cancel-btn' }
    }).then((result) => {
      if (result.isConfirmed) this.performDeleteAllRecords();
    });
  }

  private performDeleteAllRecords(): void {
    this._DataService.updatePatient().doc(this.patientId).update({
      scans: []
    }).then(() => {
      Swal.fire({
        icon: 'success', title: 'All Records Deleted!',
        text: 'All medical records have been deleted successfully.',
        confirmButtonColor: '#2563eb', timer: 2000,
        customClass: { popup: 'swal-modern' }
      });
      this.getPatientById(this.patientId);
      this.previewFlag = false;
    }).catch(error => {
      console.error('Error deleting all records:', error);
      Swal.fire({
        icon: 'error', title: 'Error!',
        text: 'Failed to delete medical records. Please try again.',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'swal-modern' }
      });
    });
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return this._DatePipe.transform(date, 'MMM dd, yyyy - hh:mm a') || 'N/A';
  }

  getRecordType(record: RecordFile): string {
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
    if (this.selectedFilter === 'all') return this.records;
    return this.records.filter(record =>
      this.getRecordType(record).toLowerCase().includes(this.selectedFilter.toLowerCase())
    );
  }

  calculateTotalSize(): string {
    if (!this.records || this.records.length === 0) return '0 MB';
    const totalBytes = this.records.reduce((sum, record) => sum + (record.size || 0), 0);
    const totalMB   = totalBytes / 1024 / 1024;
    if (totalMB < 1)      return `${(totalBytes / 1024).toFixed(2)} KB`;
    if (totalMB < 1024)   return `${totalMB.toFixed(2)} MB`;
    return `${(totalMB / 1024).toFixed(2)} GB`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW SCAN / UPLOAD METHODS  (ported from HomeComponent, no FormGroup)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Dropzone: file picked */
  onScanSelect(event: any): void {
    this.selectedFiles = event.addedFiles;
    this.scanFiles = [event.addedFiles[0]];

    // generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.scanPreviewUrl = e.target?.result || null;
    };
    reader.readAsDataURL(this.selectedFiles[0]);

    // reset previous result states
    this.prediction = '';
    this.saved = false;
    this.uploaded = false;
    this.detailsClicked = false;
  }

  /** Dropzone: file removed */
  onScanRemove(event: any): void {
    this.scanFiles.splice(this.scanFiles.indexOf(event), 1);
    this.scanPreviewUrl = null;
    this.resetScan();
  }

  /** Send image to the prediction API */
  sendImage(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) return;

    this.loadingFlag = true;
    const formData = new FormData();
    formData.append('fileup', this.selectedFiles[0]);

    this._DiseaseService.diseasesApi(formData).subscribe({
      next: data => {
        this.prediction = data.predicted_class || 'Diagnosis Not Available';
        this._DataService.diseaseName.next(this.prediction);

        // fetch disease info right away
        this.fetchDiseaseData(this.prediction);
        this.getDetails(this.prediction);

        this.loadingFlag = false;

        // update the disease field on the patient doc
        this._DataService.updateDiseaseProperty()
          .doc(this.patientId)
          .update({ disease: this.prediction })
          .then(() => console.log('Disease property updated successfully'))
          .catch(error => console.error('Error updating disease property:', error));
      },
      error: err => {
        console.error('Error analyzing image:', err);
        this.prediction = 'Diagnosis Not Available';
        this.loadingFlag = false;
      }
    });
  }

  /** Upload image to Firebase Storage & persist metadata */
  saveScan(): void {
    if (!this.prediction) return;
    this.uploaded = true;

    this.currentSelectedFile = new RecordFile(this.selectedFiles[0]);
    const timestamp = new Date().getTime();
    const path      = `Uploads/${timestamp}_${this.currentSelectedFile.file.name}`;
    const storageRef = this._AngularFireStorage.ref(path);
    const upload    = storageRef.put(this.selectedFiles[0]);

    upload.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadLink => {
          this.currentSelectedFile.image      = downloadLink;
          this.currentSelectedFile.name       = this.currentSelectedFile.file.name;
          this.currentSelectedFile.size       = this.currentSelectedFile.file.size;
          this.currentSelectedFile.prediction = this.prediction;
          this.currentSelectedFile.treatment  = this.treatment;

          // persist via RecordsService — patientId comes from the route
          this._RecordsService.saveFileMetaData(this.currentSelectedFile, this.patientId);

          this.fetchDiseaseData(this.prediction);
        });
      })
    ).subscribe({
      next: (snapshot: any) => {
        this.percentage = Math.round((snapshot.bytesTransferred * 100) / snapshot.totalBytes);
        if (this.percentage === 100) {
          setTimeout(() => {
            this.saved     = true;
            this.uploaded  = false;
            // refresh the records list so the new scan appears
            this.getPatientById(this.patientId);
          }, 1000);
        }
      },
      error: err => {
        console.error('Error uploading file:', err);
        this.uploaded = false;
      }
    });
  }

  /** Fetch treatment row from Firestore (legacy helper kept for parity) */
  getDetails(prediction: any): void {
    this._DataService.getTreatments(prediction).subscribe({
      next: data => { /* allDetails available if needed */ },
      error: err => console.error('Error fetching treatment details:', err)
    });
  }

  /** Toggle disease-detail panel */
  showDetails(): void {
    this.detailsClicked = !this.detailsClicked;
    if (this.detailsClicked && !this.isLoading) {
      this.isLoading = true;
      this.fetchDiseaseData(this.prediction);
    }
  }

  /** Pull disease info (image, description, symptoms, treatment) */
  fetchDiseaseData(name: string): void {
    this.isLoading = true;
    this._DiseaseService.getDiseaseData(name).subscribe({
      next: data => {
        if (data) {
          this.skinDiseasePhotoUrl = data.image_url;
          this.diseaseName        = data.disease_name;
          this.description        = data.description;
          this.symptoms           = (data.symptoms as string).split(',').map((s: string) => s.trim());
          this.treatment          = data.treatment;
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching disease details:', err);
        this.isLoading = false;
      }
    });
  }

  /** Progress-bar helper */
  getProgressMessage(): string {
    if (this.percentage < 30) return 'Uploading image...';
    if (this.percentage < 60) return 'Processing file...';
    if (this.percentage < 90) return 'Saving to database...';
    return 'Almost done...';
  }

  /** Reset only the scan-related state (keep record list intact) */
  resetScan(): void {
    this.prediction      = '';
    this.saved           = false;
    this.uploaded        = false;
    this.detailsClicked  = false;
    this.percentage      = 0;
  }

  /** Full "start fresh" — clear files + reset */
  startNewScan(): void {
    this.scanFiles       = [];
    this.scanPreviewUrl  = null;
    this.selectedFiles   = undefined as any;
    this.resetScan();
  }

  /** Whether the Analyze button should be active */
  get scanReady(): boolean {
    return this.scanFiles.length > 0 && !this.loadingFlag;
  }
}