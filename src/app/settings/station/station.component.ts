import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
interface BuoyDetails{
  buoy_id: string;
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
  geo_format:string;
  created_at:string;
  is_live:boolean

  // buoy_status_text: string;

}


interface AddBuoyDetails{
  buoy_id: string;
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
  buoy_sensors: string;
  geo_format:string
  // buoy_status_text: string;

}
@Component({
    selector: 'app-station',
    standalone:true,
    imports: [CommonModule, HttpClientModule, FormsModule],
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
  selectedstation!:BuoyDetails;
  addStationData!:AddBuoyDetails;
  selectedImageFile!: File;


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
    buoy_sensors:string = '';
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
       this.buoy_loc_degree_lat,
        this.buoy_loc_minutes_lat,
        this.buoy_loc_seconds_lat

      );
      this.longitude = this.dmsToDd(
        this.buoy_loc_degree_lon,
        this.buoy_loc_minutes_lon,
        this.buoy_loc_seconds_lon
        );
    }else{
      this.latitude = this.buoy_loc_latitude!;
      this.longitude = this.buoy_loc_longitude!;
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
          this.buoy_warning!,
          this.buoy_danger!,
          
          'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        )
      }, 200);
    }
  }


  getStation(){
    this.http.get('http://localhost:3000/api/getStationConfig').subscribe(
      (response: any) => {
        console.log(response);
        
        this.Stations_list = response.map((item: { station_id: any; station_name: any; warning: any; danger: any; lat_dd: any; lon_dd: any; lat_deg: any; lat_min: any; lat_sec: any; lon_deg: any; lon_min: any; lon_sec: any; status: any; sensors: string; geo_format: any; created_at: any; image:any; is_live:boolean}) => ({
          buoy_id: item.station_id,
          buoy_name: item.station_name,
          buoy_warning: item.warning,
          buoy_danger: item.danger,
          buoy_loc_latitude: item.lat_dd,
          buoy_loc_longitude: item.lon_dd,
          buoy_loc_degree_lat: item.lat_deg,
          buoy_loc_minutes_lat: item.lat_min,
          buoy_loc_seconds_lat: item.lat_sec,
          buoy_loc_degree_lon: item.lon_deg,
          buoy_loc_minutes_lon: item.lon_min,
          buoy_loc_seconds_lon: item.lon_sec,
          buoy_image: item.image ? `data:image/jpeg;base64,${item.image}`: '',
          buoy_status: item.status,
          buoy_sensors: item.sensors ? item.sensors.split(',') : [],
          geo_format: item.geo_format,
          created_at: item.created_at ?? '',
          is_live: item.is_live ?? false
   
        }));
        console.log("image api",this.Stations_list![0].buoy_image);
    this.selectedstation = this.Stations_list![0];

       console.log("stations",this.Stations_list![0].buoy_image)
      },
      (error: any) => {
        console.log(error);
        }

    )
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // This is the base64 string
        console.log("Base64 Encoded String:", this.imageUrl); // ✅ prints data:image/png;base64,...
  
        // Optional: extract only base64 without data type prefix
        const base64Only = this.imageUrl.split(',')[1];
        console.log("Base64 (Only):", base64Only);
  
        this.loadImageAsUint8Array(); // if needed
      };
  
      reader.readAsDataURL(input.files[0]); // Read file and trigger onload
    }
  }
  
  uploadImage() {
    document.querySelector<HTMLInputElement>('#fileInput')?.click(); // Just open picker
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
    console.log(this.selectedstation)
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
    console.log(this.selectedstation);
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
    this.getStation();
    // this.Stations_list = this.samplestations;
    // this.selectedstation = this.Stations_list[0];
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
    // console.log(this.imageUrl)
    this.http.get(this.imageUrl, { responseType: 'arraybuffer' }).subscribe(
      (response) => {
        this.imageByte = new Uint8Array(response);
        this.imageSrc = this.arrayBufferToBase64(this.imageByte);
        this.selectedstation.buoy_image = this.arrayBufferToBase64(this.imageByte)
        // console.log("image processed", this.imageSrc)
        const img = this.imageSrc.split(',');
        console.log(img[0]);
        this.selectedstation.buoy_image = img[1];
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





  
  
  sensors = [
    { name: 'oceanography', label: 'Oceanography', checked: false },
    { name: 'meteorology', label: 'Meteorology', checked: false },
    { name: 'water_quality', label: 'Water Quality', checked: false },
    { name: 'adcp', label: 'ADCP', checked: false },
    { name: 'microflu', label: 'MicroFLu', checked: false }
  ];

  getSelectedSensors(): string[] {
    return this.sensors
      .filter(sensor => sensor.checked)
      .map(sensor => sensor.name);

  }



 createStation(){

  const selectedSensors = this.getSelectedSensors();
    const selectedAsString = selectedSensors.join(',');
    console.log('Selected Sensors:', selectedSensors);
    console.log('As String:', selectedAsString);
    this.buoy_sensors = selectedAsString;
    if(this.mainToggle){
      this.geo_format = "DMS"
    }else{
      this.geo_format = "DD"
    }
    const newStation = {
      buoy_id: this.buoy_id,
      buoy_name: this.buoy_name,
      buoy_warning:this.buoy_warning.toString(),
      buoy_danger: this.buoy_danger.toString(),
      buoy_loc_latitude: this.buoy_loc_latitude.toString(),
      buoy_loc_longitude: this.buoy_loc_longitude.toString(),
      buoy_loc_degree_lat: this.buoy_loc_degree_lat.toString(),
      buoy_loc_minutes_lat: this.buoy_loc_minutes_lat.toString(),
      buoy_loc_seconds_lat: this.buoy_loc_seconds_lat.toString(),
      buoy_loc_degree_lon: this.buoy_loc_degree_lon.toString(),
      buoy_loc_minutes_lon: this.buoy_loc_minutes_lon.toString(),
      buoy_loc_seconds_lon:this.buoy_loc_seconds_lon.toString(),
      buoy_sensors: this.buoy_sensors,
      geo_format:this.geo_format,
      image: ""
    }

    this.addStationData = newStation
  console.log("ID", this.buoy_id)
  this.http.post('http://localhost:3000/api/addStation', this.addStationData).subscribe(
    (response) => {
      console.log(response);  
      this.getStation()
      },
      (error) => {
        console.error(error);
        }
  )
 }



 updateStation(){
  
console.log("data", this.selectedstation);
const baseImage = this.imageUrl.split(',');
console.log("image",baseImage[1] );
this.selectedstation.buoy_image = baseImage[1];
console.log("sensor", this.selectedstation.buoy_sensors.join(', '));
// this.selectedstation.buoy_sensors = this.selectedstation.buoy_sensors.join(', ');

const updatingStation = {
  buoy_id: this.selectedstation.buoy_id,
  buoy_name: this.selectedstation.buoy_name,
  buoy_warning:this.selectedstation.buoy_warning,
  buoy_danger: this.selectedstation.buoy_danger,
  buoy_loc_latitude: this.selectedstation.buoy_loc_latitude,
  buoy_loc_longitude: this.selectedstation.buoy_loc_longitude,
  buoy_loc_degree_lat: this.selectedstation.buoy_loc_degree_lat,
  buoy_loc_minutes_lat: this.selectedstation.buoy_loc_minutes_lat,
  buoy_loc_seconds_lat: this.selectedstation.buoy_loc_seconds_lat,
  buoy_loc_degree_lon: this.selectedstation.buoy_loc_degree_lon,
  buoy_loc_minutes_lon: this.selectedstation.buoy_loc_minutes_lon,
  buoy_loc_seconds_lon: this.selectedstation.buoy_loc_seconds_lon,
  buoy_image:  baseImage[1],
  buoy_status:this.selectedstation.buoy_status,
  buoy_sensors: this.selectedstation.buoy_sensors.join(', '),
  geo_format:this.selectedstation.buoy_name,
  created_at:this.selectedstation.buoy_name
}


console.log("update data", updatingStation);

this.http.post('http://localhost:3000/api/editStation', updatingStation).subscribe(
  (response) => {
    console.log(response);
    this.getStation()
    },
    (error) => {
      console.error(error);
      }
      )
 }
}
