import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-appearance',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './appearance.component.html',
    styleUrl: './appearance.component.css'
})
export class AppearanceComponent implements OnInit {
  selectedCurrentspeed: string = 'speed1';
  selectedCurrentdir: string = 'direction1';
  selectedtide: string = 'tide1';
  selectedbattery: string = 'battery1';
  selectedColor: string = 'white';

  ngOnInit(): void {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    const savedColor = localStorage.getItem('selectedColor');
    if (savedColor) {
      this.selectedColor = savedColor;
    }

    const savedCurrentspeed = localStorage.getItem('selectedCurrentspeed');
    if (savedCurrentspeed) {
      this.selectedCurrentspeed = savedCurrentspeed;
    }

    const savedCurrentdir = localStorage.getItem('selectedCurrentdir');
    if (savedCurrentdir) {
      this.selectedCurrentdir = savedCurrentdir;
    }

    const savedTide = localStorage.getItem('selectedtide');
    if (savedTide) {
      this.selectedtide = savedTide;
    }

    const savedBattery = localStorage.getItem('selectedbattery');
    if (savedBattery) {
      this.selectedbattery = savedBattery;
    }
  }

  private savePreference(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  changeColor(name: string): void {
    this.selectedColor = name;
    this.savePreference('selectedColor', name);
  }

  changeCurrentspeed(name: string): void {
    this.selectedCurrentspeed = name;
    this.savePreference('selectedCurrentspeed', name);
  }

  changeCurrentdir(name: string): void {
    this.selectedCurrentdir = name;
    this.savePreference('selectedCurrentdir', name);
  }

  changetide(name: string): void {
    this.selectedtide = name;
    this.savePreference('selectedtide', name);
  }

  changebattery(name: string): void {
    this.selectedbattery = name;
    this.savePreference('selectedbattery', name);
  }
}