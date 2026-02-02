import { Component, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LandingComponent } from '../landing/landing.component';

@Component({
  selector: 'app-authnav',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive,LandingComponent],
  templateUrl: './authnav.component.html',
  styleUrls: ['./authnav.component.scss']
})

export class AuthnavComponent {
  constructor(private _Renderer2:Renderer2){}
@ViewChild('navbar') navelement!: ElementRef
@HostListener('window:scroll')
onScroll(){
  if(window.scrollY > 600){
    this._Renderer2.addClass(this.navelement.nativeElement,'bg-white');
    this._Renderer2.addClass(this.navelement.nativeElement,'shadow');
  }
  else{
    this._Renderer2.removeClass(this.navelement.nativeElement,'bg-white')
    this._Renderer2.removeClass(this.navelement.nativeElement,'shadow')
  }
}
}
