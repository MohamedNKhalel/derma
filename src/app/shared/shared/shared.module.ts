import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPipe } from 'src/app/pipes/search.pipe';
import { GenderSearchPipe } from 'src/app/pipes/gender-search.pipe';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { PhoneSearchPipe } from 'src/app/pipes/phone-search.pipe';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {MatDatepickerModule} from '@angular/material/datepicker';


@NgModule({
  declarations: [SearchPipe,GenderSearchPipe,PhoneSearchPipe],
  imports: [CommonModule,FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule,SweetAlert2Module.forRoot(),NgxDropzoneModule,MatDatepickerModule],
  exports:[PhoneSearchPipe,SearchPipe,GenderSearchPipe,FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule,SweetAlert2Module,NgxDropzoneModule,MatDatepickerModule]
})
export class SharedModule { }
