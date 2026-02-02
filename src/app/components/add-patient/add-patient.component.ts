import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatRadioModule} from '@angular/material/radio';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import * as moment from 'moment';
interface Gender {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [MatRadioModule,CommonModule,RouterLink, ReactiveFormsModule,SharedModule,MatSelectModule,MatSnackBarModule],
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss'],
  providers:[DatePipe]
})

export class AddPatientComponent implements OnInit{
  constructor(private _MatSnackBar:MatSnackBar,private _DataService:DataService,public _MatDialogRef: MatDialogRef<AddPatientComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private _ToastrService:ToastrService,private _DatePipe:DatePipe){}
  disease:any;
  state:any ;
  userToken:any ='';
  rates:object= {
    Temperature:"0",
    blood:"0",
    glucose:"0",
  };
  date!:any;



  ngOnInit(): void {
    this.userToken = localStorage.getItem('token')
    // console.log(this.data);
    // this._DataService.diseaseName.subscribe({
    //   next:data=>{
    //     console.log(this._DataService.diseaseName.getValue())
    //     this.createPatientForm.get('disease')?.setValue(this._DataService.diseaseName.getValue());
    //   },
    //   error:err=>{
    //     console.log(err);
    //   }
    // })   
    console.log(this.date);
    
    this.date= this.data?.date_of_birth.split('/').reverse().join('');
    this._DataService.state.subscribe({
      next:data=>{
        this.state =  data;
      }
    }) 
  }
  genders: Gender[] = [
    {value: 'Male', viewValue: 'Male'},
    {value: 'Female', viewValue: 'Female'},
  ];
  createPatientForm:FormGroup= new FormGroup({
    id:new FormControl(''),
    name:new FormControl( this.data?.name ||'',[Validators.required,Validators.minLength(3),Validators.maxLength(20)]),
    gender:new FormControl( this.data?.gender ||'',[Validators.required]),
    date_of_birth:new FormControl( this.data?.date_of_birth.split('/').reverse().join("-")||'',[Validators.required]),
    email:new FormControl( this.data?.email ||'',[Validators.email]),
    phone:new FormControl( this.data?.phone ||'',[Validators.required,Validators.pattern(/^(01)[0125][0-9]{8}$/)]),
    doctor_uid:new FormControl(localStorage.getItem('token')),
    scans:new FormControl(),
    rates:new FormControl(this.rates)
  })


  addPatient(){
    let newDate = moment(this.createPatientForm.get('date_of_birth')?.value).format("DD/MM/yyyy");

    this.createPatientForm.get('date_of_birth')?.setValue(newDate);
    console.log(this.createPatientForm.value);
    this._DataService.addPatient(this.createPatientForm.value);
    this._MatDialogRef.close(true);
    this._ToastrService.success('patient added Successfully','Done');
    
  }
  close(){
    this._MatDialogRef.close(true)
  }
 
  updatePatient(){
    console.log(this.data?.date_of_birth.split("/").reverse().join("-"));
    console.log(this.data?.date_of_birth);
    
    this._DataService.updatePatient().doc(this.data?.id).update({
      name:this.createPatientForm.get('name')?.value,
      gender:this.createPatientForm.get('gender')?.value,
      date_of_birth:moment(this.createPatientForm.get('date_of_birth')?.value).format("DD/MM/yyyy"),
      email:this.createPatientForm.get('email')?.value,
      phone:this.createPatientForm.get('phone')?.value,
    })
    this._MatDialogRef.close(true);
    this._ToastrService.success('patient Updated Successfully','Done');
  }
}
