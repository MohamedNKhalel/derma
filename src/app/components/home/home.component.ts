import { RecordFile } from './../../interfaces/record-file';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiseaseService } from 'src/app/disease.service';
import { DataService } from 'src/app/services/data.service';
import { Patient } from 'src/app/interfaces/patient';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { RecordsService } from 'src/app/services/records.service';
import { GeminiService } from 'src/app/services/gemini.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgxDropzoneModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  constructor(
    private _DatePipe: DatePipe,
    private _RecordsService: RecordsService,
    private _AngularFireStorage: AngularFireStorage,
    private _DiseaseService: DiseaseService,
    private _DataService: DataService,
    private _GeminiService: GeminiService
  ) {}

  loadingFlag: boolean = false;
  allDetails: any;
  files: File[] = [];
  selectedFiles!: FileList;
  currentSelectedFile!: RecordFile;
  percentage: number = 0;
  formattedTimestamp: any = '';
  prediction!: string;
  patients: Patient[] = [];
  skinDiseasePhotoUrl: string = '';
  diseaseName: string = '';
  description: string = '';
  symptoms: string[] = [];
  treatment: string = '';
  isLoading = false;
  detailsClicked: boolean = false;
  saved: boolean = false;
  uploaded: boolean = false;
  status: boolean = true;
  previewUrl: string | ArrayBuffer | null = null;
  currentStep: number = 0; // 0: Upload, 1: Analyzing, 2: Results

  ngOnInit(): void {
    this.getPatients();
  }

  sendImageForm: FormGroup = new FormGroup({
    fileup: new FormControl(null, [Validators.required]),
    id: new FormControl(null, [Validators.required])
  });

  onSelect(event: any): void {
    this.selectedFiles = event.addedFiles;
    this.files = [event.addedFiles[0]];
    this.sendImageForm.get('fileup')?.setValue(this.files);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result || null;
    };
    reader.readAsDataURL(this.selectedFiles[0]);

    // Reset states
    this.prediction = '';
    this.saved = false;
    this.uploaded = false;
    this.detailsClicked = false;
  }

  onRemove(event: any): void {
    this.files.splice(this.files.indexOf(event), 1);
    this.previewUrl = null;
    this.sendImageForm.get('fileup')?.setValue(null);
    this.resetAnalysis();
  }

  getPatients(): void {
    this._DataService.getAllPatients().subscribe({
      next: data => {
        this.patients = data.map((e: any) => {
          const info = e.payload.doc.data();
          info.id = e.payload.doc.id;
          return info;
        });
      },
      error: err => {
        console.error('Error fetching patients:', err);
      }
    });
  }

  saveScan(): void {
    this.uploaded = true;
    this.currentSelectedFile = new RecordFile(this.selectedFiles[0]);
    const timestamp = new Date().getTime();
    const path = `Uploads/${timestamp}_${this.currentSelectedFile.file.name}`;
    const storageRef = this._AngularFireStorage.ref(path);
    const record = storageRef.put(this.selectedFiles[0]);

    record.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadLink => {
          this.currentSelectedFile.image = downloadLink;
          this.currentSelectedFile.name = this.currentSelectedFile.file.name;
          this.currentSelectedFile.size = this.currentSelectedFile.file.size;
          this.currentSelectedFile.prediction = this.prediction;
          this.currentSelectedFile.treatment = this.treatment;

          this._RecordsService.saveFileMetaData(
            this.currentSelectedFile,
            this.sendImageForm.get('id')?.value
          );
        });
      })
    ).subscribe({
      next: (data: any) => {
        this.percentage = Math.round((data.bytesTransferred * 100) / data.totalBytes);
        if (this.percentage === 100) {
          setTimeout(() => {
            this.saved = true;
            this.uploaded = false;
          }, 1000);
        }
      },
      error: err => {
        console.error('Error uploading file:', err);
        this.uploaded = false;
      }
    });
  }

  getDetails(prediction: any): void {
    this._DataService.getTreatments(prediction).subscribe({
      next: data => {
        this.allDetails = data.payload.data();
      },
      error: err => {
        console.error('Error fetching treatment details:', err);
      }
    });
  }

  sendImage(): void {
    if (this.sendImageForm.invalid) {
      this.sendImageForm.markAllAsTouched();
      return;
    }

    this.loadingFlag = true;
    this.currentStep = 1;
    let formData = new FormData();
    formData.append('fileup', this.selectedFiles[0]);

    this._DiseaseService.diseaseApi(formData).subscribe({
      next: data => {
        this.prediction = data.prediction;
        this._DataService.diseaseName.next(this.prediction);
        this.fetchDiseaseData(this.prediction);
        this.getDetails(this.prediction);
        this.loadingFlag = false;
        this.currentStep = 2;

        // Update patient disease property
        this._DataService.updateDiseaseProperty()
          .doc(this.sendImageForm.get('id')?.value)
          .update({
            disease: this.prediction
          })
          .then(() => {
            console.log('Disease property updated successfully');
          })
          .catch(error => {
            console.error('Error updating disease property:', error);
          });
      },
      error: err => {
        console.error('Error analyzing image:', err);
        this.loadingFlag = false;
        this.prediction = 'Diagnosis Not Available';
        this.currentStep = 2;
      }
    });
  }

  showDetails(): void {
    this.detailsClicked = !this.detailsClicked;
    if (this.detailsClicked && !this.isLoading) {
      this.isLoading = true;
      this.fetchDiseaseData(this.prediction);
    }
  }

  fetchDiseaseData(diseaseName: string): void {
    this._DiseaseService.getDiseaseData(diseaseName).subscribe((data) => {
      if (data) {
        this.skinDiseasePhotoUrl = data.image_url;
        this.diseaseName = data.disease_name;
        this.description = data.description;
        this.symptoms = (data.symptoms as string).split(',').map((s) => s.trim());
        this.treatment = data.treatment;
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }

  changeStatus(): void {
    this._DiseaseService.loadmodel = !this._DiseaseService.loadmodel;
    this.status = this._DiseaseService.loadmodel;
  }

  resetAnalysis(): void {
    this.prediction = '';
    this.saved = false;
    this.uploaded = false;
    this.detailsClicked = false;
    this.percentage = 0;
    this.currentStep = 0;
  }

  startNewScan(): void {
    this.files = [];
    this.previewUrl = null;
    this.sendImageForm.reset();
    this.resetAnalysis();
  }

  getSelectedPatient(): Patient | undefined {
    const patientId = this.sendImageForm.get('id')?.value;
    return this.patients.find(p => p.id === patientId);
  }

  getProgressMessage(): string {
    if (this.percentage < 30) return 'Uploading image...';
    if (this.percentage < 60) return 'Processing file...';
    if (this.percentage < 90) return 'Saving to database...';
    return 'Almost done...';
  }
}