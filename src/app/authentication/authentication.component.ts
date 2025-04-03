import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { pass } from 'three/webgpu';
import { WaveComponent } from "./wave/wave.component";
import { QpBuoyComponent } from "./qp-buoy/qp-buoy.component";

@Component({
  selector: 'app-authentication',
  standalone:true,
  imports: [HttpClientModule, CommonModule, FormsModule, WaveComponent, QpBuoyComponent],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
  providers:[AuthService]
})
export class AuthenticationComponent {
username!:string;
password!:string;
constructor(
  private router: Router,
  private auth: AuthService,
  private toast:ToastrService
){

}
loging(){
  console.log(this.username, this.password);
}
login(event:Event){
  event.preventDefault();
  const credentials ={
    email: this.username,
    password: this.password
  }
  console.log(credentials);
  try {
    this.auth.login(credentials).subscribe(
      (response) => {
        console.log(response);
        this.toast.success("","Success")
        this.router.navigate(['/base']);
      },
      (error) => {
        console.log(error);
        this.toast.error('Invalid Credentials', "Login Failed")

      }
      
    )
  } catch (error) {
    
  }
}
}
