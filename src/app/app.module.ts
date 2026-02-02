import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http'
import {AngularFireModule} from '@angular/fire/compat'
import { environment } from './Environment/environment';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { PhoneSearchPipe } from './pipes/phone-search.pipe';

@NgModule({
  declarations: [
    AppComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToastrModule.forRoot(),NgxSpinnerModule,
    BrowserAnimationsModule,MatSlideToggleModule,NgxDropzoneModule,HttpClientModule,AngularFireModule.initializeApp(environment.firebase),
    
  ],
  // providers: [{provide:HTTP_INTERCEPTORS,useClass:LoadingInterceptor,multi:true}],  
  bootstrap: [AppComponent]
})
export class AppModule { }
