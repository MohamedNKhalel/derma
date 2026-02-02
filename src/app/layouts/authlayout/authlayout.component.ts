import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BlanknavComponent } from 'src/app/components/blanknav/blanknav.component';
import { AuthnavComponent } from 'src/app/components/authnav/authnav.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-authlayout',
  standalone: true,
  imports: [CommonModule,RouterOutlet,AuthnavComponent,FooterComponent],
  templateUrl: './authlayout.component.html',
  styleUrls: ['./authlayout.component.scss']
})
export class AuthlayoutComponent {

}
