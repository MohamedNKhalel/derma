import { Pipe, PipeTransform } from '@angular/core';
import { Patient } from '../interfaces/patient';

@Pipe({
  name: 'genderSearch'
})
export class GenderSearchPipe implements PipeTransform {

  transform(pateint:Patient[],searchWord:string): Patient[] {
    return pateint.filter(m=>m.gender.toLowerCase().includes(searchWord.toLowerCase()));
  }

}
