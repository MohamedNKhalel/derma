
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RecordFile } from '../interfaces/record-file';
import { arrayUnion } from 'firebase/firestore';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private _AngularFireStorage:AngularFireStorage, private _AngularFirestore:AngularFirestore) { }

  userToken:any =localStorage.getItem('token');

  saveFileMetaData(fileObj:RecordFile,patientID:any){
    const fileMeta ={
        id : '',
        name : fileObj.name,
        size : fileObj.size,
        image : fileObj.image,
        prediction : fileObj.prediction,
        treatment : fileObj.treatment,
        timestamp: firebase.firestore.Timestamp.now()
    }
    
    fileMeta.id = this._AngularFirestore.createId();
    this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/patients/`).doc(patientID).update({scans:arrayUnion(fileMeta)})
  }

  getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    // Format: YYYY-MM-DD HH
    return `${year}-${month}-${day} ${hour}:00`;
  }
  getAllFiles(){
    return  this._AngularFirestore.collection(`users/${JSON.parse(this.userToken)}/Upload`);
  }

  // deleteFile(patientId: string){
  //   // this._AngularFireStorage.ref('/Uploads/'+filemeta.name).delete();
  //   return this._AngularFirestore.doc(`users/${JSON.parse(this.userToken)}/patients/${patientId}/scans/0`).delete();
  //   // this._AngularFirestore.doc(`users/${JSON.parse(this.userToken)}/patients/${patientId}`).update({
  //   //   scans: firebase.firestore.FieldValue.arrayRemove({ id: recordId }),
  //   // })
  //   // return this._AngularFireStorage.ref('/Uploads/'+filemeta.name).delete().toPromise();
    
  // }
}
