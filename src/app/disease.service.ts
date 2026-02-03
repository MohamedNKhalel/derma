import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {

  constructor(private _HttpClient:HttpClient) { }
  private modelApiUrl = 'http://127.0.0.1:5000';
  private model2ApiUrl = 'http://192.168.1.5:5001'; //flask
  private treatmentApiUrl = 'http://localhost:3000/api/disease'; // API endpoint for disease data
  // private treatmentApiUrl = 'http://localhost:3000/api'; // API endpoint for disease data
  loadmodel:boolean = true;
  // private mongoUrl = 'mongodb+srv://admin:admin1234@together.cvq6ffb.mongodb.net/skin?retryWrites=true&w=majority';

  diseaseApi(data:any):Observable<any>
  {
    if(this.loadmodel == true){
      return this._HttpClient.post(`${this.modelApiUrl}/predict`,data)
    }
    else{
      return this._HttpClient.post(`${this.model2ApiUrl}/predict`,data)
    }
  }
  diseasesApi(data:any):Observable<any>
  {
    return this._HttpClient.post(`${this.modelApiUrl}/predict`,data)
  }
  getDiseaseData(diseaseName: string): Observable<any> {
    return this._HttpClient.get<any>(`${this.treatmentApiUrl}/${diseaseName}`);
  }
}
