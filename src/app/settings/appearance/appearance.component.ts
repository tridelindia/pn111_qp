import { Component, ElementRef, ViewChild } from '@angular/core';
import { Gauge2Component } from "../../widgets/gauge2/gauge2.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appearance',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './appearance.component.html',
  styleUrl: './appearance.component.css'
})
export class AppearanceComponent {
  selectedCurrentspeed: string = 'speed1';
  selectedCurrentdir: string = 'direction1';

  selectedtide:string = 'tide1';
  selectedbattery:string = 'battery1'
  selectedColor:string= 'white';
  changeColor(name:string){
    this.selectedColor = name;
  }
  changeCurrentspeed(name: string) {
    this.selectedCurrentspeed = name;
  }
  changeCurrentdir(name: string) {
    this.selectedCurrentdir = name;
  }
  changetide(name:string){
    this.selectedtide = name
  }
  changebattery(name:string){
    this.selectedbattery = name
  }
}
