import { Component, OnInit, Renderer2 } from '@angular/core';
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



  constructor(private renderer: Renderer2){}

  ngOnInit(): void {
    localStorage.setItem("selectedCurrentspeed", "speed1");
    localStorage.setItem("selectedCurrentdir", "direction1");

    this.loadPreferences();

  const theme = localStorage.getItem('theme');
// chartFont = theme!;
//   this.theme = theme!;
  this.onChangeTheme(theme!);
} 

 onChangeTheme(theme:string){
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    localStorage.setItem('theme', theme);
   const data = window.dispatchEvent(new Event('storage'));
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
    this.renderer.setAttribute(document.documentElement, 'data-theme', name);
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