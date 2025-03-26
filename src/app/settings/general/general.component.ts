import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RadialGaugeComponent } from "../../widgets/radial-guage/radial-guage.component";
import { Direction1Component } from "../../widgets/direction1/direction1.component";
import { Gauge2Component } from "../../widgets/gauge2/gauge2.component";
import { Gauge3Component } from '../../widgets/gauge3/gauge3.component';
import { CurrentUser } from '../../user-model/user-model.module';
// import { RadialGaugeComponent } from "../../widgets/radial-guage/radial-guage.component";

@Component({
  selector: 'app-general',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './general.component.html',
  styleUrl: './general.component.css'
})
export class GeneralComponent {
  user?: CurrentUser;


  dropdownOpen = false;
  options = [
    { value: '1', text: 'ediit', selected: false },
    { value: '2', text: 'create', selected: false },
    { value: '3', text: 'user manage', selected: false },
    { value: '4', text: 'view', selected: false },
    { value: '5', text: 'view limited', selected: false },
    { value: '6', text: 'configure', selected: false },
    { value: '7', text: 'delete', selected: false },
    { value: '8', text: 'export', selected: false }
  ];

  selectedOptions: any[] = [];


  dropdownOpen2 = false;
  options2 = [
    { value: '1', text: 'ediit', selected: false },
    { value: '2', text: 'create', selected: false },
    { value: '3', text: 'user manage', selected: false },
    { value: '4', text: 'view', selected: false },
    { value: '5', text: 'view limited', selected: false },
    { value: '6', text: 'configure', selected: false },
    { value: '7', text: 'delete', selected: false },
    { value: '8', text: 'export', selected: false }
  ];

  selectedOptions2: any[] = [];




  dropdownOpen3 = false;
  options3 = [
    { value: '1', text: 'ediit', selected: false },
    { value: '2', text: 'create', selected: false },
    { value: '3', text: 'user manage', selected: false },
    { value: '4', text: 'view', selected: false },
    { value: '5', text: 'view limited', selected: false },
    { value: '6', text: 'configure', selected: false },
    { value: '7', text: 'delete', selected: false },
    { value: '8', text: 'export', selected: false }
  ];

  selectedOptions3: any[] = [];



  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleOption(index: number) {
    let option = this.options[index];

    if (option.selected) {
      option.selected = false;
      this.selectedOptions = this.selectedOptions.filter(o => o.value !== option.value);
    } else {
      option.selected = true;
      this.selectedOptions.push(option);
    }
  }

  removeOption(index: number, option: any) {
    this.selectedOptions.splice(index, 1);
    this.options.find(o => o.value === option.value)!.selected = false;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  selectedValues(): string[] {
    return this.selectedOptions.map(option => option.value);
  }





  toggleDropdown2() {
    this.dropdownOpen2 = !this.dropdownOpen2;
  }

  toggleOption2(index: number) {
    let option = this.options2[index];

    if (option.selected) {
      option.selected = false;
      this.selectedOptions2 = this.selectedOptions2.filter(o => o.value !== option.value);
    } else {
      option.selected = true;
      this.selectedOptions2.push(option);
    }
  }

  removeOption2(index: number, option: any) {
    this.selectedOptions2.splice(index, 1);
    this.options2.find(o => o.value === option.value)!.selected = false;
  }

  closeDropdown2() {
    this.dropdownOpen2 = false;
  }

  selectedValues2(): string[] {
    return this.selectedOptions2.map(option => option.value);
  }





  toggleDropdown3() {
    this.dropdownOpen3 = !this.dropdownOpen3;
  }

  toggleOption3(index: number) {
    let option = this.options3[index];

    if (option.selected) {
      option.selected = false;
      this.selectedOptions3 = this.selectedOptions3.filter(o => o.value !== option.value);
    } else {
      option.selected = true;
      this.selectedOptions3.push(option);
    }
  }

  removeOption3(index: number, option: any) {
    this.selectedOptions3.splice(index, 1);
    this.options3.find(o => o.value === option.value)!.selected = false;
  }

  closeDropdown3() {
    this.dropdownOpen3 = false;
  }

  selectedValues3(): string[] {
    return this.selectedOptions3.map(option => option.value);
  }
}
