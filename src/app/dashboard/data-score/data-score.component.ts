import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { LayoutComponent } from '../../layout/layout.component';

@Component({
    selector: 'app-data-score',
    imports: [CommonModule, HttpClientModule],
    standalone:true,
    templateUrl: './data-score.component.html',
    styleUrl: './data-score.component.css'
})
export class DataScoreComponent {
last7Days: { day: string, date: string, value: number, percentage: number }[] = [];
  overallScore:number = 0;
  // overallScore: number = 0;
  isNoWaterQuality:boolean=false;
  selectedSensor: string = "ocean";
  constructor(private http:HttpClient, private layout:LayoutComponent){}

  ngOnInit() {
    this.isNoWaterQuality = this.layout.sensors.includes('water_quality');
    this.updateData()
    this.fetchSensorData()
  }

  updateData() {
    this.generateLast7Days();
    this.printLast7Days()
    this.calculateOverallScore();
  }


generateLast7Days() {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  this.last7Days = Array.from({ length: 7 }, (_, i) => {
    const dateObj = new Date();
    dateObj.setDate(today.getDate() - i);

    const day = daysOfWeek[dateObj.getDay()];
    const date = dateObj.toISOString().slice(0, 10); // Format as 'YYYY-MM-DD'
    const value = Math.floor(Math.random() * 81); // Simulated value
    const percentage = (value / 80) * 100;

    return { day, date, value, percentage };
  }).reverse(); // So it ends with today
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
  oceanographyParams = [
    'wave_heading', 'wave_height', 'tzc', 'tz', 'tm02', 'wave_direction', 'wave_direction_fw',
    'mean_wave_direction', 'hmax', 'fourier_coefficient_a1', 'fourier_coefficient_b1', 'fourier_coefficient_a2', 'fourier_coefficient_b2',
    'dominant_time_period_fw', 'havg', 'current_speed_bin_1', 'current_direction_bin_1'
  ];

  meteorologyParams = [
    'wind_speed', 'wind_direction_deg', 'wind_gust', 'temperature_deg', 'rh_percent',
    'bp_hpa', 'rain_mm', 'visibility', 'global_radiation'
  ];

  waterQualityParams = [
    'turbidity', 'conductivity', 'chlorophyll_a', 'water_temperature', 'dissolved_oxygen',
    'phycoerythrin', 'ph', 'salinity', 'fluorescein_dye'
  ];

  totalDataPerDay = 24; // per your 10-minute interval
  categoryScores: { [key: string]: number } = {};

data_score:any;
ocean:number = 3312;
met:number = 1296;
water:number = 1296;
getpercentage(val:number, sensor:string):number{
  const fixTotal = sensor ==='ocean'?this.ocean:sensor==='met'?this.met:this.water
  const data = (val/ fixTotal)*100;
  console.log("ocean percent day",data);
  return data;
}

  fetchSensorData() {
  const params = new HttpParams()
    .set('fromDate', '2025-02-01T00:00:42.000Z')
    .set('toDate', '2025-05-31T23:59:00.000Z')
    .set('stationId', 'qp001');
  const apiUrl = 'http://localhost:3000/api/getSensorDataByStationAndDate';

  this.http.get<any[]>(apiUrl, { params }).subscribe(data => {
    console.log("API data received:", data);
    let data_values:any = []
    for (let index = 0; index < this.last7Days.length; index++) {
      const day = data.filter(item=>  item.datetime.includes(this.last7Days[index].date));
    console.log("day 1", this.last7Days[index], day);
   
      const paramCounts: Record<string, number> = {};
      const paramCounts2: Record<string, number> = {};
      const paramCounts3: Record<string, number> = {};
      let totalValid1 = 0;
      let totalValid2 = 0;
      let totalValid3 = 0;


      this.oceanographyParams.forEach(param => {
        const count = day.filter(row => row[param] !== null && row[param] !== undefined && row[param] !== '').length;
        paramCounts[param] = count;
        totalValid1 += count;
      });
      this.meteorologyParams.forEach(param => {
        const count = day.filter(row => row[param] !== null && row[param] !== undefined && row[param] !== '').length;
        paramCounts2[param] = count;
        totalValid2 += count;
      });
       this.waterQualityParams.forEach(param => {
        const count = day.filter(row => row[param] !== null && row[param] !== undefined && row[param] !== '').length;
        paramCounts3[param] = count;
        totalValid3 += count;
      });
      console.log("Individual Valid Counts:", paramCounts, paramCounts2, paramCounts3);
      console.log("Total Valid Count:", totalValid1, totalValid2, totalValid3);
      
     data_values.push({
      day:this.last7Days[index].day,
      ocean:this.getpercentage(totalValid1, 'ocean'),
      met:this.getpercentage(totalValid2, 'met'),
      wat:this.getpercentage(totalValid3, 'wat')
    });
    }
    
    console.log("all is , " ,data_values)
    this.data_score = data_values
    // Now print last7Days:
    this.printLast7Days();

    // Calculate overall score if you want
    this.calculateOverallScore();

  }, error => {
    console.error('Error fetching data:', error);
  });
}


  printLast7Days() {
  console.log("Last 7 Days Data:");
  this.last7Days.forEach(dayData => {
    console.log(`Day: ${dayData.day}, Value: ${dayData.value}, Percentage: ${dayData.percentage.toFixed(2)}%`);
  });
}

}
