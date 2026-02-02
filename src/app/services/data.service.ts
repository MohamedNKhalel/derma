import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore'
import { Patient } from '../interfaces/patient';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private _HttpClient:HttpClient,private _AngularFirestore:AngularFirestore,private _AuthService:AuthService) { }

  state:BehaviorSubject<boolean> = new BehaviorSubject(false);
  diseaseName:BehaviorSubject<any> = new BehaviorSubject(null);
  userToken:any =localStorage.getItem('token');

  addPatient(patient:Patient){
    this._AngularFirestore.createId();
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`).add(patient);
  }
  
  getAllPatients(){
    this.userToken =localStorage.getItem('token');
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`).snapshotChanges();
  }


  getSpecificPatient()
  {
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`)
  }

  updateDiseaseProperty(){
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`)
  }
  updatePatientId(){
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`)

  }
  deletePatient(patient:Patient){
    return this._AngularFirestore.doc(`users/${JSON.parse(this.userToken)}/patients/${patient.id}`).delete();
    
  }

  updatePatient(){
    return this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients`)
  }

  getTreatments(prediction:any){
    return this._AngularFirestore.collection(`treatments`).doc(`${prediction}`).snapshotChanges();
  }
  // getTimestamp(): Observable<any> {
  //   return this._AngularFirestore.collection('yourCollection').doc('yourDocumentId').get()
  //     .pipe(map(snapshot => {
  //         const data = snapshot.data();
  //         if (data) {
  //           return {
  //             ...data,
  //             timestamp: data.timestamp.toDate() // Convert Firestore Timestamp to Date
  //           };
  //         }
  //         return null;
  //       })
  //     );
  // }
}
