import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormGroupDirective, NgForm} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { AuthService } from 'src/app/services/auth.service';
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  constructor(private _AuthService:AuthService,public _Router:Router){}

  email:string =''
  password:string =''
  eyeFlag:boolean = false;
  errMsg:string = '';
  loadingFlag:boolean = false;
  ngOnInit(): void {
    this._AuthService.errMsgRegister.subscribe({
      next:data=>{
        this.errMsg = this._AuthService.errMsgRegister.getValue();
        this.loadingFlag = false;
      }
    })
  }

  registerForm:FormGroup = new FormGroup({
    displayName: new FormControl(null,[Validators.required,Validators.minLength(3),Validators.maxLength(20)]),
    email: new FormControl(null,[Validators.required,Validators.email]),
    password: new FormControl(null,[Validators.required,Validators.pattern(/[A-Za-z]/)]),
    // phoneNumber: new FormControl(null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)])
  })
  register(){
    this._AuthService.register(this.registerForm.get('email')?.value , this.registerForm.get('password')?.value,this.registerForm.get('displayName')?.value);
    this.errMsg = this._AuthService.errMsgRegister.getValue();
    this.loadingFlag = true;
    
  }
  signInIwthGoogle(){
    this._AuthService.signInWithGoogle();
  }
  toggleEye(){
    this.eyeFlag = !this.eyeFlag
  }
}
