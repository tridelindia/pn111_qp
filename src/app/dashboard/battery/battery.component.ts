import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-battery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battery.component.html',
  styleUrl: './battery.component.css'
})
export class BatteryComponent implements OnInit, OnChanges {
  @Input() voltage: number | string = 0;
  percentage: number = 0;
  strokeDashoffset: number = -51;
  batteryColor: string = '#E74C3C';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['voltage']) {
      this.updateValues();
    }
  }

  private updateValues(): void {
    if (this.voltage === undefined || this.voltage === null || this.voltage === '') {
      return;
    }

    const raw = typeof this.voltage === 'string' ? parseFloat(this.voltage) : Number(this.voltage);
    if (isNaN(raw) || raw <= 0) {
      return;
    }

    // 12V marine battery nominal scale (up to 13.0V for charging/float)
    const maxVoltage = 13.0;
    const clamped = Math.max(0, Math.min(raw, maxVoltage));
    this.percentage = Math.round((clamped / maxVoltage) * 100);

    this.calculateOffset();
    this.batteryColor = this.getColor();
    this.cdr.detectChanges();
  }

  private calculateOffset(): void {
    const circleLength = 51;
    this.strokeDashoffset = -51 - ((circleLength / 100) * this.percentage);
  }

  getColor(): string {
    if (this.percentage >= 75) return '#01A437'; // Green
    if (this.percentage >= 50) return '#F1C40F'; // Yellow
    if (this.percentage >= 25) return '#E67E22'; // Orange
    return '#E74C3C'; // Red
  }
}
