import { Pipe, PipeTransform } from '@angular/core';
import { Patient } from '../interfaces/patient';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(patient:Patient[] , searchword:string): Patient[] {
    return patient.filter((m)=>m.name.toLowerCase().includes(searchword.toLowerCase()));
  }

}
