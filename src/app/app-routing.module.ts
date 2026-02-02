import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {path:"",loadComponent:()=>import ("./layouts/blanklayout/blanklayout.component").then((m)=>m.BlanklayoutComponent),canActivate:[authGuard],children:[
    {path:"",redirectTo:"patients",pathMatch:'full'},
    {path:"scan",loadComponent:()=>import("./components/home/home.component").then((m)=>m.HomeComponent),title:"Scan"},
    {path:'patients',loadComponent:()=>import('./components/patients/patients.component').then((m)=>m.PatientsComponent),title:"Patients"},
    {path:'details/:id',loadComponent:()=>import('./components/patient-details/patient-details.component').then((m)=>m.PatientDetailsComponent),title:"details"},
    {path:'profile',loadComponent:()=>import('./components/profile/profile.component').then((m)=>m.ProfileComponent),title:'Profile'},
    {path:'analytics',loadComponent:()=>import('./components/analytics/analytics.component').then((m)=>m.AnalyticsComponent),title:'Analytics'},
    {path:'community',loadComponent:()=>import('./components/community/community.component').then((m)=>m.CommunityComponent),title:'Community'},
    {path:'records/:id',loadComponent:()=>import('./components/medical-records/medical-records.component').then((m)=>m.MedicalRecordsComponent),title:'Medical Records'}
  ]},
  {path:"",loadComponent:()=>import("./layouts/authlayout/authlayout.component").then((m)=>m.AuthlayoutComponent),children:[
    {path:"",redirectTo:'landing',pathMatch:"full"},
    {path:"login",loadComponent:()=>import("./components/login/login.component").then((m)=>m.LoginComponent),title:"Login"},
    {path:"register",loadComponent:()=>import("./components/register/register.component").then((m)=>m.RegisterComponent),title:"Register"},
    {path:"verify-email",loadComponent:()=>import("./components/verify-email/verify-email.component").then((m)=>m.VerifyEmailComponent),title:"Verification"},
    {path:"landing",loadComponent:()=>import("./components/landing/landing.component").then((m)=>m.LandingComponent),title:"Home"},
  ]},
  {path:"**",loadComponent:()=>import('./components/not-found/not-found.component').then((m)=>m.NotFoundComponent)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
