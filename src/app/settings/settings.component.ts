import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralComponent } from "./general/general.component";
import { AppearanceComponent } from './appearance/appearance.component';
import { StationComponent } from './station/station.component';
import { SensorComponent } from './sensor/sensor.component';
import { BillingComponent } from './billing/billing.component';
import { NotificationsComponent } from './notifications/notifications.component';

@Component({
  selector: 'app-settings',
  standalone:true,
  imports: [
    CommonModule,
    GeneralComponent, 
    AppearanceComponent,
    StationComponent,
    SensorComponent,
    BillingComponent,
    NotificationsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
activeOption:number = 0;
changeOption(index:number){
  this.activeOption = index
}
}
