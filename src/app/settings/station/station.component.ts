import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
interface BuoyDetails{
  buoy_id: number;
  buoy_name: string;
  buoy_warning:string;
  buoy_danger: string;
  buoy_loc_latitude: string;
  buoy_loc_longitude: string;
  buoy_loc_degree_lat: string;
  buoy_loc_minutes_lat: string;
  buoy_loc_seconds_lat: string;
  buoy_loc_degree_lon: string;
  buoy_loc_minutes_lon: string;
  buoy_loc_seconds_lon: string;
  buoy_image: string;
  buoy_status: string;
  buoy_sensors: string[];
  geo_format:string
  // buoy_status_text: string;

}


interface AddBuoyDetails{
  buoy_id: string;
  buoy_name: string;
  buoy_warning:number;
  buoy_danger: number;
  buoy_loc_latitude: number;
  buoy_loc_longitude: number;
  buoy_loc_degree_lat: number;
  buoy_loc_minutes_lat: number;
  buoy_loc_seconds_lat: number;
  buoy_loc_degree_lon: number;
  buoy_loc_minutes_lon: number;
  buoy_loc_seconds_lon: number;
  buoy_sensors: string[];
  geo_format:string
  // buoy_status_text: string;

}
@Component({
  selector: 'app-station',
  imports: [CommonModule, HttpClientModule],
  standalone:true,
  templateUrl: './station.component.html',
  styleUrl: './station.component.css'
})
export class StationComponent implements OnInit{
  section?:number = 2;
  mainToggle:boolean = false;
  imageByte?: Uint8Array;
  imageSrc?: string;
  isEdit:boolean = false;
  isInfo:boolean = true;
  isAdd:boolean = false;
  imageUrl: string = "../../../assets/image/image-placeholder2.jpg"; // Default image
  Stations_list?:BuoyDetails[];
  selectedstation?:BuoyDetails;
  addStationData?:AddBuoyDetails;



    buoy_id:string = '';
    buoy_name:string= '';
    buoy_warning: number =0;
    buoy_danger: number =0;
    buoy_loc_latitude: number =0;
    buoy_loc_longitude: number =0;
    buoy_loc_degree_lat: number =0;
    buoy_loc_minutes_lat: number =0;
    buoy_loc_seconds_lat:number =0;
    buoy_loc_degree_lon:number =0;
    buoy_loc_minutes_lon:number =0;
    buoy_loc_seconds_lon:number =0;
    buoy_sensors:string[]= [];
    geo_format:string ='';
  //  = {
    // buoy_id: '',
    // buoy_name: '',
    // buoy_warning: 0,
    // buoy_danger: 0,
    // buoy_loc_latitude: 0,
    // buoy_loc_longitude: 0,
    // buoy_loc_degree_lat: 0,
    // buoy_loc_minutes_lat: 0,
    // buoy_loc_seconds_lat: 0,
    // buoy_loc_degree_lon: 0,
    // buoy_loc_minutes_lon: 0,
    // buoy_loc_seconds_lon: 0,
    // buoy_sensors: [],
    // geo_format: ''
  // };

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
  test(){
    console.log(this.addStationData?.buoy_loc_longitude)
  }
  dmsToDd(degrees: number, minutes: number, seconds: number): number {
    return degrees + minutes / 60 + seconds / 3600;
  }
  latitude:number = 0;
  longitude:number = 0;
  check_location(){
    this.map.destroyMap();
    if (this.addStationData?.geo_format == "DMS") {
      this.latitude = this.dmsToDd(
       this.addStationData?.buoy_loc_degree_lat,
        this.addStationData?.buoy_loc_minutes_lat,
        this.addStationData?.buoy_loc_seconds_lat

      );
      this.longitude = this.dmsToDd(
        this.addStationData?.buoy_loc_degree_lon,
        this.addStationData?.buoy_loc_minutes_lon,
        this.addStationData?.buoy_loc_seconds_lon
        );
    }else{
      this.latitude = this.addStationData?.buoy_loc_latitude!;
      this.longitude = this.addStationData?.buoy_loc_longitude!;
    }
    console.log(this.latitude, this.longitude);
    if(this.latitude!==0 && this.longitude!==0){
      console.log("good")

      setTimeout(() => {
        const mapContainer = document.getElementById('ol-map');
        this.map.createMap(
          mapContainer!,
          this.latitude!, 
          this.longitude!,
          this.addStationData?.buoy_warning!,
          this.addStationData?.buoy_warning!,
          
          'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        )
      }, 200);
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

  editStation(data:BuoyDetails){
    this.map.destroyMap()
    this.isEdit = true;
    this.isAdd = false;
    this.isInfo = false;
    this.selectedstation = data;
    this.map.destroyMap();
    // this.section = value;
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
  infoStation(data:BuoyDetails){
    this.isInfo = true;
    this.isAdd = false;
    this.isEdit = false;
    this.selectedstation = data;
    this.map.destroyMap()
    // this.section = value;
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
  addStation(){
    this.isInfo = false;
    this.isAdd = true;
    this.isEdit = false;
    // this.selectedstation = data;
    // this.map.destroyMap()
    // this.section = value;
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
    private http: HttpClient,
    private map:MapService
  ){}
  ngOnInit(): void {
    this.Stations_list = this.samplestations;
    this.selectedstation = this.Stations_list[0];
    // this.imageByte = new Uint8Array(this.imageUrl)
    this.map.destroyMap()
    setTimeout(() => {
      
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        parseFloat(this.selectedstation?.buoy_loc_latitude!), 
        parseFloat(this.selectedstation?.buoy_loc_longitude!),
        parseFloat(this.selectedstation?.buoy_warning!),
        parseFloat(this.selectedstation?.buoy_danger!),
        'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
      )
    }, 1000);
    this.loadImageAsUint8Array();
  }
  loadImageAsUint8Array(): void {
    this.http.get(this.imageUrl, { responseType: 'arraybuffer' }).subscribe(
      (response) => {
        this.imageByte = new Uint8Array(response);
        this.imageSrc = this.arrayBufferToBase64(this.imageByte);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }

  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    buffer.forEach(byte => binary += String.fromCharCode(byte));
    return 'data:image/jpeg;base64,' + btoa(binary);
  }





  samplestations = [
    {
      "buoy_id": 1,
      "buoy_name": "Ocean Sentinel",
      "buoy_loc_latitude": "47.6062",
      "buoy_loc_longitude": "-122.3321",
      "buoy_loc_degree_lat": "47",
      "buoy_loc_minutes_lat": "36",
      "buoy_loc_seconds_lat": "22",
      "buoy_loc_degree_lon": "-122",
      "buoy_loc_minutes_lon": "19",
      "buoy_loc_seconds_lon": "55",
      "geo_format": "DD",
      "buoy_warning":"40",
      "buoy_danger":"80",
      "buoy_image": "../../../assets/image/image-placeholder2.jpg",
      "buoy_status": "Active",
      "buoy_sensors": ["Temperature", "Salinity", "Current"]
    },
    {
      "buoy_id": 2,
      "buoy_name": "Deep Blue",
      "buoy_loc_latitude": "34.0522",
      "buoy_loc_longitude": "-118.2437",
      "buoy_loc_degree_lat": "34",
      "buoy_loc_minutes_lat": "3",
      "buoy_loc_seconds_lat": "8",
      "buoy_loc_degree_lon": "-118",
      "buoy_loc_minutes_lon": "14",
      "buoy_loc_seconds_lon": "37",
      "geo_format": "DD",
      "buoy_warning":"40",
      "buoy_danger":"80",
      "buoy_image": "../../../assets/image/image-placeholder2.jpg",
      "buoy_status": "Inactive",
      "buoy_sensors": ["Wave Height", "Wind Speed"]
    },
    {
      "buoy_id": 3,
      "buoy_name": "Tidal Watcher",
      "buoy_loc_latitude": "40.7128",
      "buoy_loc_longitude": "-74.0060",
      "buoy_loc_degree_lat": "40",
      "buoy_loc_minutes_lat": "42",
      "buoy_loc_seconds_lat": "46",
      "buoy_loc_degree_lon": "-74",
      "buoy_loc_minutes_lon": "0",
      "buoy_loc_seconds_lon": "36",
      "geo_format": "DMS",
      "buoy_warning":"40",
      "buoy_danger":"80",
      "buoy_image": "../../../assets/image/image-placeholder2.jpg",
      "buoy_status": "Active",
      "buoy_sensors": ["Tide Level", "Oxygen Level", "pH"]
    }
  ]
  
}
