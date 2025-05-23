import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GeneralComponent } from "./general/general.component";
import { AppearanceComponent } from './appearance/appearance.component';
import { StationComponent } from './station/station.component';
import { SensorComponent } from "./sensor/sensor.component";
import { NotificationComponent } from './notification/notification.component';
import { BillingComponent } from './billing/billing.component';

@Component({
    selector: 'app-settings',
    standalone:true,
    imports: [CommonModule, GeneralComponent, AppearanceComponent, StationComponent, SensorComponent, NotificationComponent, BillingComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
  time = new Date;
  currentTime?:string;
activeOption:number = 1;
changeOption(index:number){
  this.activeOption = index
}

ngOnInit(): void {
  setInterval(() => {
    this.time = new Date();
    let year = this.time.getFullYear();
    let month = this.time.getMonth() + 1;
    let day = this.time.getDate();
    let hour = this.time.getHours();
    let minute = this.time.getMinutes();
    let second = this.time.getSeconds();
    this.currentTime = `${year}-${month}-${day} ${hour}:${minute}:${
      second
      }`;
  }, 1000);

}

}
