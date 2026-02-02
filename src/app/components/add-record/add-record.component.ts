import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordFile } from 'src/app/interfaces/record-file';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiseaseService } from 'src/app/disease.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { RecordsService } from 'src/app/services/records.service';
import { DataService } from 'src/app/services/data.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-record',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgxDropzoneModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss']
})
export class AddRecordComponent {
  constructor(
    private _DiseaseService: DiseaseService,
    private _AngularFireStorage: AngularFireStorage,
    private _RecordsService: RecordsService,
    private _DataService: DataService,
    public _MatDialogRef: MatDialogRef<AddRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService
  ) {}

  selectedFiles!: FileList;
  currentSelectedFile!: RecordFile;
  files: File[] = [];
  percentage: number = 0;
  prediction: string = '';
  loadingFlag: boolean = false;
  uploadingFlag: boolean = false;
  previewUrl: string | ArrayBuffer | null = null;
  treatmentNotes: string = '';

  sendImageForm: FormGroup = new FormGroup({
    fileup: new FormControl(null, [Validators.required]),
    treatment: new FormControl('', [Validators.maxLength(500)])
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
  }

  onRemove(event: any): void {
    this.files.splice(this.files.indexOf(event), 1);
    this.previewUrl = null;
    this.sendImageForm.get('fileup')?.setValue(null);
  }

  sendImage(): void {
    if (this.sendImageForm.invalid || !this.selectedFiles || this.selectedFiles.length === 0) {
      this._ToastrService.warning('Please select a file to upload');
      return;
    }

    this.loadingFlag = true;
    this.uploadingFlag = true;
    let formData = new FormData();
    formData.append('fileup', this.selectedFiles[0]);

    // First, analyze the image with disease API
    this._DiseaseService.diseaseApi(formData).subscribe({
      next: data => {
        this.prediction = data.prediction;
        this._DataService.diseaseName.next(this.prediction);
        
        // Then upload to Firebase
        this.uploadToFirebase();
      },
      error: err => {
        console.error('Disease prediction error:', err);
        this.prediction = 'Diagnosis Not Available';
        
        // Still upload the file even if prediction fails
        this.uploadToFirebase();
      }
    });
  }

  private uploadToFirebase(): void {
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
          this.currentSelectedFile.treatment = this.sendImageForm.get('treatment')?.value || '';
          this.currentSelectedFile.timestamp = new Date();

          // Save file metadata
          this._RecordsService.saveFileMetaData(this.currentSelectedFile, this.data);

          // Update disease property
          this._DataService.updateDiseaseProperty().doc(this.data).update({
            disease: this.prediction
          }).then(() => {
            this.loadingFlag = false;
            this.uploadingFlag = false;
            this._ToastrService.success('Medical record added successfully!');
            
            setTimeout(() => {
              this._MatDialogRef.close(true);
            }, 1000);
          }).catch(error => {
            console.error('Error updating disease property:', error);
            this.loadingFlag = false;
            this.uploadingFlag = false;
            this._ToastrService.error('Failed to update patient record');
          });
        });
      })
    ).subscribe({
      next: (data: any) => {
        this.percentage = Math.round((data.bytesTransferred * 100) / data.totalBytes);
      },
      error: err => {
        console.error('Upload error:', err);
        this.loadingFlag = false;
        this.uploadingFlag = false;
        this._ToastrService.error('Failed to upload file');
      }
    });
  }

  closeDialog(): void {
    if (!this.uploadingFlag) {
      this._MatDialogRef.close(false);
    }
  }

  get uploadProgress(): number {
    return this.percentage;
  }

  get isUploading(): boolean {
    return this.uploadingFlag;
  }
}