import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormGroupDirective, NgForm} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,SharedModule,MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit{
  
  constructor(private _AuthService:AuthService,public _Router:Router){}
  
  email:string = '';
  password:string = '';
  errMsg:string = ''
  forgetFormFlag:boolean = false;
  eyeFlag:boolean = false;
  loadingFlag:boolean=false;

  ngOnInit(): void {
      
      this._AuthService.errMsg.subscribe({
        next:data=>{
          this.errMsg = this._AuthService.errMsg.getValue()
          this.loadingFlag = false

        }
      })
  }
  loginForm:FormGroup = new FormGroup({
    email: new FormControl(null,[Validators.required,Validators.email]),
    password: new FormControl(null,[Validators.required])
  })

  login(){
    this._AuthService.login(this.loginForm.get('email')?.value,this.loginForm.get('password')?.value)
    this.errMsg=this._AuthService.errMsg.getValue()
    console.log(this.loadingFlag);
    this.loadingFlag = true
  } 

  forgetForm:FormGroup = new FormGroup({
    email:new FormControl(null , [Validators.required,Validators.email])
  })
  forgetPassword(){
    this._AuthService.forgetPassword(this.forgetForm.get('email')?.value)
    console.log(this.forgetForm.get('email')?.value);
    const email = this.forgetForm.get('email')?.value
    Swal.fire({
      title: 'Email Sent!',
      text: `A confirmation message has been sent to ${email} for password reset .`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
    this.forgetForm.get('email')?.setValue('')
    this.forgetFormFlag =false;
  } 
  loginWithGoogle(){
    
    this._AuthService.signInWithGoogle();
  }

  stop(event:any){
    event.stopPropagation();
  }

  toggleEye(){
    this.eyeFlag = !this.eyeFlag
  }
}

