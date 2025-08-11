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
import { CurrentUser } from '../user-model/user-model.module';
import { UserService } from '../users/service/users/user.service';
 
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
  email!: string;
 
  // Popup State Variables
  showForgetPopup = false;
  showPassword:boolean = false;
  step = 1;
 
  // Step 2
  otpSent = false;
  enteredOtp = '';
 
  // Step 3
  newPassword = '';
  confirmPassword = '';
 
 
  constructor(
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    private toast:ToastrService
  ){
 
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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
          localStorage.setItem("selectedCurrentspeed", "speed1");
          localStorage.setItem("selectedCurrentdir", "direction1");
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

  resetForm(): void {
    this.username = '';
    this.password = '';
    this.email = '';
    this.showForgetPopup = false;
    this.step = 1;
    this.otpSent = false;
    this.enteredOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
 
  openPopup() {
    this.showForgetPopup = true;
    this.step = 1;
    this.otpSent = false;
    this.resetPopupFields();
  }
 
  closePopup() {
    this.showForgetPopup = false;
    this.username = '';
    this.email = '';
    this.enteredOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
 
  resetPopupFields() {
    this.username = '';
    this.email = '';
    this.enteredOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
 
  // STEP 1: Verify User (simulate API)
verifyUser() {
  if (!this.username || !this.email) {
    console.log(this.username, this.email);
    this.toast.error('Please enter both username and email');
    return;
  }
 
  this.userService.checkUsername(this.username).subscribe({
    next: (usernameRes) => {
      if (!usernameRes.exists) {
        this.toast.error('Username does not exist');
        return;
      }
 
      this.userService.checkEmail(this.email).subscribe({
        next: (emailRes) => {
          if (!emailRes.exists) {
            this.toast.error('Email does not exist');
          } else {
            this.toast.success('User Verified');
            this.step = 3;
          }
        },
        error: () => {
          this.toast.error('Error checking email');
        }
      });
    },
    error: () => {
      this.toast.error('Error checking username');
    }
  });
}
 
 
  // STEP 2: Send OTP
  // sendOTP() {
  //   // Simulate sending OTP
  //   this.otpSent = true;
  //   this.toast.info('OTP Sent to email');
  // }
 
  // verifyOTP() {
  //   if (this.enteredOtp === '123456') {
  //     this.toast.success('OTP Verified');
  //     this.step = 3;
  //   } else {
  //     this.toast.error('Invalid OTP');
  //   }
  // }
 
  // STEP 3: Change Password
submitNewPassword() {
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,15}$/;
 
  if (!passwordPattern.test(this.newPassword)) {
    this.toast.error('Password must be 8-15 characters, include 1 uppercase letter, 1 number, and 1 special character.');
    return;
  }
 
  if (this.newPassword !== this.confirmPassword) {
    this.toast.error('Passwords do not match');
    return;
  }
 
  this.auth.resetPassword(this.username, this.email, this.newPassword).subscribe({
    next: () => {
      this.toast.success('Password Updated Successfully');
      this.closePopup();
    },
    error: (err) => {
      this.toast.error('Failed to update password');
      console.error(err);
    }
  });
}
 
 
  }
 
 