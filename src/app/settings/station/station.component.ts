import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RadarHomeComponent } from '../../radar-home/radar-home.component';
import { HomeV1ChartComponent } from '../../home-v1-chart/home-v1-chart.component';
import { WindGaugeComponent } from '../../wind-gauge/wind-gauge.component';
import { BuoyComponent } from '../../buoy/buoy.component';
import { MapService } from '../../map_service/map.service';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-station',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectModule
  ],
  templateUrl: './station.component.html',
  styleUrl: './station.component.css'
})
export class StationComponent implements OnInit {
  mapUrl:string = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  stationForm!: FormGroup;
  geoFormat: string = 'DD';
  sensors = [  
    { id: 1, name: 'ADCP Sensor' },
    { id: 2, name: 'Met Sensor' },
    { id: 3, name: 'Water Quality Sensor' },
    { id: 4, name: 'Wave Sensor' }
  ];
  selectedSensors = this.sensors.map(option => option.id);
  stationIds = ['Stn01', 'Stn02', 'Stn03', 'Stn04', 'Stn05'];
  placeholderText: string = 'Sensor';


  direction1: number = 110;
  direction2: number = 180;
  direction3: number = 250;

  speed1: number = 4;
  speed2: number = 9;
  speed3: number = 15;

  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef, private map: MapService) {}

  ngOnInit() {
    // Initialize form
    this.stationForm = this.fb.group({
      stationName: ['', Validators.required],
      stationId: ['', Validators.required],
      sensor: ['', Validators.required],
      geoLocation: this.fb.group({
        dd: this.fb.group({
          latitude: [null, Validators.required],
          longitude: [null, Validators.required]
        }),
        dms: this.fb.group({
          lat: this.fb.group({
            degree: [null, Validators.required],
            minute: [null, Validators.required],
            second: [null, Validators.required]
          }),
          lng: this.fb.group({
            degree: [null, Validators.required],
            minute: [null, Validators.required],
            second: [null, Validators.required]
          })
        })
      }),
      geoFencing: this.fb.group({
        warningCircle: [null, Validators.required],
        dangerCircle: [null, Validators.required]
      })
    });

    // Initialize map
    this.map.destroyMap();
    const mapContainer = document.getElementById('ol-map');
    if (mapContainer) {
      this.map.createMap(mapContainer, 18.997888, 72.809304);
      this.map.addPathLines();
    }
  }

  // onSelectChange() {
  //   // Select all options by default
  //   this.selectedSensors = [...this.sensors.map(sensor => sensor.id)];
  // }

    onChange(selected: number[]) {
    console.log('Selected options:', selected);
  }

  setGeoFormat(format: string) {
    this.geoFormat = format;
    console.log('Selected Format:', this.geoFormat);
    this.cdRef.detectChanges(); // Force update
  }

  onSubmit() {
    if (this.stationForm.valid) {
      console.log('Station Data:', this.stationForm.value);
    }
  }
}