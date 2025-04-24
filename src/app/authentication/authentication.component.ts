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
import { CurrentUser } from '../users/models/user.model';

@Component({
    selector: 'app-authentication',
    standalone:true,
    imports: [HttpClientModule, CommonModule, FormsModule, WaveComponent, QpBuoyComponent],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.css',
    providers: [AuthService]
})
export class AuthenticationComponent {
  username!:string;
  password!:string;
  currentUser!: CurrentUser;
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
      username: this.username,
      password: this.password
    }
    console.log(credentials);
    try {
      this.auth.login(credentials).subscribe(
        (response) => {
          console.log(response);
          this.currentUser = response;
          this.auth.CurrentUser = this.currentUser;
          localStorage.setItem('loginTime', Date.now().toString());
          localStorage.setItem('username', this.currentUser.name);
          this.router.navigate(['/base']);
          this.toast.success('Logged in Succesfully', 'Access Granted ');
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