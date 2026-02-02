import { Pipe, PipeTransform } from '@angular/core';
import { Patient } from '../interfaces/patient';

@Pipe({
  name: 'phoneSearch'
})
export class PhoneSearchPipe implements PipeTransform {

  transform(patient:Patient[],phone:string): Patient [] {
    return patient.filter(m=>m.phone.toLowerCase().includes(phone.toLowerCase()));
  }

}
