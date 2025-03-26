import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-data-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-score.component.html',
  styleUrl: './data-score.component.css'
})
export class DataScoreComponent {
  last7Days: { day: string, value: number, percentage: number }[] = [];
  overallScore:number = 0;
  // overallScore: number = 0;
  selectedSensor: string = "ocean";
  ngOnInit() {
    this.updateData()
  }

  updateData() {
    this.generateLast7Days();
    this.calculateOverallScore();
  }
  generateLast7Days() {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    this.last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const day = daysOfWeek[date.getDay()];
      const value = Math.floor(Math.random() * 81); // Value up to 80
      const percentage = (value / 80) * 100; // Calculate percentage

      return { day, value, percentage };
    }).reverse();
  }

  calculateOverallScore() {
    const totalValue = this.last7Days.reduce((sum, day) => sum + day.value, 0);
    this.overallScore = parseFloat((totalValue / 560).toFixed(2)); // Normalize to 0.00 - 1.00
  }
  onSensorChange(name:string) {
    // const target = event.target as HTMLSelectElement;
    this.selectedSensor = name;
    this.updateData(); // Refresh data when sensor changes
  }
}
