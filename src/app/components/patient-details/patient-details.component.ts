import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MedicalRecordsComponent } from '../medical-records/medical-records.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { Patient } from 'src/app/interfaces/patient';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { AddPatientComponent } from '../add-patient/add-patient.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MedicalRecordsComponent,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class PatientDetailsComponent implements OnInit {
  constructor(
    private _DatePipe: DatePipe,
    private _DataService: DataService,
    public _MatDialog: MatDialog,
    private _ActivatedRoute: ActivatedRoute,
    private _AngularFirestore: AngularFirestore
  ) {}

  patient: any;
  patientId: any;
  showEdit: boolean = false;
  editRatesDisabled: boolean = true;
  bloodPressure: string = '';
  SugarPressure: string = '';
  temprature: string = '';
  rates: any = {};
  age: any;
  birthDate: any;
  loading: boolean = true;
  selectedTab: number = 0;

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: params => {
        let patientId = params.get('id');
        this.getPatientById(patientId);
        this.patientId = patientId;
        this.updatePtientId(this.patientId);
      }
    });
  }

  toggleEditButton(): void {
    this.showEdit = !this.showEdit;
    this.editRatesDisabled = !this.editRatesDisabled;
  }

  updatePatientRates(): void {
    this.showEdit = !this.showEdit;
    this.editRatesDisabled = !this.editRatesDisabled;

    this._DataService.updatePatient().doc(this.patientId).update({
      rates: {
        blood: this.bloodPressure,
        glucose: this.SugarPressure,
        Temperature: this.temprature
      }
    });

    this.getPatientById(this.patientId);
  }

  updatePtientId(patientId: any): void {
    this._DataService.updatePatientId().doc(patientId).update({
      id: this.patientId
    });
  }

  getPatientById(patientId: any): void {
    this.loading = true;
    this._DataService.getSpecificPatient().doc(patientId).get().subscribe({
      next: res => {
        this.patient = res.data();
        this.birthDate = this.patient.date_of_birth.split('/').reverse().join('-');
        this.rates = this.patient.rates;
        this.bloodPressure = this.rates?.blood || '';
        this.SugarPressure = this.rates?.glucose || '';
        this.temprature = this.rates?.Temperature || '';
        this.calculateAge(this.birthDate);
        this.loading = false;
      },
      error: err => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  calculateAge(birthDate: any): void {
    const birthdate = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();

    const monthDifference = today.getMonth() - birthdate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }

    this.age = age;
  }

  getVitalStatus(type: 'blood' | 'glucose' | 'temperature'): 'normal' | 'warning' | 'critical' {
    const value = parseFloat(type === 'blood' ? this.bloodPressure : type === 'glucose' ? this.SugarPressure : this.temprature);

    if (isNaN(value)) return 'normal';

    switch (type) {
      case 'blood':
        if (value < 90 || value > 140) return 'critical';
        if (value < 100 || value > 130) return 'warning';
        return 'normal';
      case 'glucose':
        if (value < 70 || value > 180) return 'critical';
        if (value < 80 || value > 140) return 'warning';
        return 'normal';
      case 'temperature':
        if (value < 35 || value > 39) return 'critical';
        if (value < 36 || value > 37.5) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  }

  getGenderIcon(): string {
    return this.patient?.gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const [day, month, year] = date.split('/');
    const dateObj = new Date(+year, +month - 1, +day);
    return this._DatePipe.transform(dateObj, 'MMM dd, yyyy') || date;
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
          this.getPatientById(this.patientId);
        }
      });
    }
}