import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-battery',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './battery.component.html',
  styleUrl: './battery.component.css'
})
export class BatteryComponent  implements OnInit{
  @Input() percentage: number = 0; // Default value
  strokeDashoffset: number = 0;

  ngOnInit() {
    this.calculateOffset();
  }

  ngOnChanges() {
    this.calculateOffset();
  }

  private calculateOffset() {
    const circleLength = 51; // Total stroke length (adjust as needed)
    this.strokeDashoffset = -51 - ((circleLength / 100) * this.percentage);
  }
}
