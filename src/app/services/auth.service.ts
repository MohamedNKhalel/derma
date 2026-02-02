import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth'
import { Router } from '@angular/router';
import { GoogleAuthProvider} from '@angular/fire/auth'
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private _AngularFireAuth:AngularFireAuth , private _Router:Router,private _ToastrService:ToastrService) { }

  errMsg:BehaviorSubject<string> = new BehaviorSubject('')
  errMsgRegister:BehaviorSubject<string> = new BehaviorSubject('')
  // loadingFlag:boolean=false;

  // login method
  login(email:string , password:string){
    this._AngularFireAuth.signInWithEmailAndPassword(email,password).then(res=>{
      if(res.user?.emailVerified ==true){
        localStorage.setItem('token',JSON.stringify(res.user?.uid));
        this._Router.navigate(['/patients']);
        this._ToastrService.success('logged successfully' ,'Done')
      }else{{
        this._Router.navigate(['/verify-email']);
      }}
    },err=>{
      this.errMsg.next('Incorrect email or password')
      console.log(err.message);
    })
  }

  // register Method
  register(email:string , password:string,displayName:string){
    this._AngularFireAuth.createUserWithEmailAndPassword(email,password).then(res=>{
      this._Router.navigate(['/login'])
      this._ToastrService.success('Email created successfully')
      this.sendEmailForVerification(res.user);
      if(res.user){
        res.user.updateProfile({
          displayName:displayName
        })
      }
    },err=>{
      this.errMsgRegister.next('This email is already used by another account')
      console.log(err.message);
      // this._Router.navigate(['/register'])
    })
  }

 //signUp method
  


  // signout method 
  signOut(){
    this._AngularFireAuth.signOut().then(res=>{
      localStorage.removeItem('token');
      this._Router.navigate(['/landing']);
    },err=>{
      alert(err.message);
    })
  }
  getUserInfo(){
    return this._AngularFireAuth.authState
  }
  //forgetr password
  forgetPassword(email:string){
    this._AngularFireAuth.sendPasswordResetEmail(email).then(res=>{
      
    },err=>{
      alert(err.message)
    })
  }

  // verify Email 
  sendEmailForVerification(user:any){
    user.sendEmailVerification().then((res:any)=>{
      this._Router.navigate(['/verify-email'])
    },(err:any)=>{
      this._ToastrService.error('unable to sent to this email');
    })
  }


  // google Signin 
  signInWithGoogle(){
    this._AngularFireAuth.signInWithPopup(new GoogleAuthProvider).then(res=>{
      localStorage.setItem('token',JSON.stringify(res.user?.uid));
      this._Router.navigate(['/patients']);
      this._ToastrService.success('logged Successfully')
    },err=>{
      this._ToastrService.error(err.message)
    })
  }

}


