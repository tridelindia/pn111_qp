import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { CommonModule } from '@angular/common';
interface BuoyDetails{
  buoy_id: number;
  buoy_name: string;
  buoy_loc_latitude: string;
  buoy_loc_longitude: string;
  buoy_loc_degree_lat: string;
  buoy_loc_minutes_lat: string;
  buoy_loc_seconds_lat: string;
  buoy_loc_degree_lon: string;
  buoy_loc_minutes_lon: string;
  buoy_loc_seconds_lon: string;
  buoy_image: string;
  buoy_status_color: string;
  buoy_status_icon: string;
  buoy_status_text: string;

}
@Component({
  selector: 'app-station',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './station.component.html',
  styleUrl: './station.component.css'
})
export class StationComponent implements OnInit{
  section?:number = 2;
  mainToggle:boolean = false;
  imageUrl: string = "../../../assets/image/live_buoy1.png"; // Default image
  
  uploadImage(event: Event) {
    document.querySelector<HTMLInputElement>('#fileInput')?.click(); // Open file picker
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // Update the image preview
      };
      reader.readAsDataURL(input.files[0]); // Read file
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // Update the image preview
      };
      reader.readAsDataURL(input.files[0]); // Read file
    }
  }
  toggle(){
    this.mainToggle = !this.mainToggle;
  }

  editStation(value:number){
    this.map.destroyMap()
    this.section = value;
    setTimeout(() => {
    
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        28.076240, 
        34.895858,
        20,
        40,
        'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
      )
    }, 1000);
  }
  infoStation(value:number){
    this.map.destroyMap()
    this.section = value;
    setTimeout(() => {
    
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        28.076240, 
        34.895858,
        20,
        40,
        'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
      )
    }, 1000);
  }

  constructor(
    private map:MapService
  ){}
  ngOnInit(): void {
    this.map.destroyMap()
    setTimeout(() => {
      
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        28.076240, 
        34.895858,
        20,
        40,
        'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
      )
    }, 1000);
  }
}
