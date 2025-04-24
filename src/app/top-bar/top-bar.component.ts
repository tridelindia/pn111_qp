import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../users/models/user.model';

@Component({
    selector: 'app-top-bar',
    imports: [CommonModule],
    standalone:true,
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit{
    screen!:string;
    dropdownOpen:boolean =  false;
    selectedStation:string = 'Station 1';

    currentUser!: CurrentUser;

    constructor(private authService: AuthService) {}
    
    ngOnInit(): void {
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;

        this.currentUser = this.authService.getCurrentUser();
    }
    getScreenSize() {
        return { width: window.innerWidth, height: window.innerHeight };
      }
    touggleDrop(){
        this.dropdownOpen = !this.dropdownOpen
    }
}
