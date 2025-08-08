import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { GlobalDataService } from '../global-data/global-data.component';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../user-model/user-model.module';
import { LayoutComponent } from '../layout/layout.component';
import { set } from 'ol/transform';
import { StationconfigService } from '../home/homeService/stationconfig.service';
import { ReportService } from '../report/report.service';
interface Station{
    station_id: string; station_name: string; sensors:string[], status:string
  }
@Component({
    selector: 'app-top-bar',
    imports: [CommonModule, HttpClientModule],
    standalone:true,
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit{
    screen!:string;
    @Input() page!:number;
    dropdownOpen:boolean =  false;
    selectedStation:string = '';
    listStations:Station[]=[];
    currentUser!: CurrentUser;
    isUtc:boolean = true;
    date:string = ''

    onToggleChange(){
        const now = new Date();

        const utcDate = new Date(now.getTime());
        const formattedUTC = this.formatDate(utcDate);
        
        // IST Time (UTC + 5:30)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const formattedIST = this.formatDate(istDate);
        
        console.log("UTC Time:", formattedUTC);
        console.log("IST Time:", formattedIST);
        this.isUtc = !this.isUtc
        if(this.isUtc){
            this.date = formattedUTC;
        }else{
            this.date = formattedIST
        }
    }
    constructor(private http:HttpClient, private data:GlobalDataService,private authService: AuthService, private layout:LayoutComponent, private report:ReportService){}
    onSelect(name:string){
        this.layout.sensors = [];
        this.layout.isDashboardLoading = true;

        this.selectedStation = name;
        this.dropdownOpen = !this.dropdownOpen;
        this.data.selectedStation = name;
        const idset = this.listStations.filter(item=> item.station_name == name);
        console.log("id",idset);
        const stationId = idset[0].station_id;
        this.layout.selectedStationId = stationId;
        this.data.setStationId(stationId);
        this.data.stationId$.subscribe((stationId: string) => {
            console.log('stationId', stationId);
            if (stationId) {
            //   this.onStationSelected(stationId);
            }
          });
        console.log("id",idset);
        setTimeout(() => {
            this.layout.sensors = idset[0].sensors
            this.layout.selectedStationId = idset[0].station_id
            this.layout.StationName = idset[0].station_name;
            console.log("id_station","one",this.layout.selectedStationId)
            if(this.layout.selectedStationId !== null && this.layout.sensors.length !==0){
                setTimeout(() => {
                    this.layout.isDashboardLoading = false;
                }, 100);
            }
        }, 100);
    }

    ngOnInit(): void {
        this.listStations = [];
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;
        this.getStation();
        this.currentUser = this.authService.getCurrentUser();
        this.onToggleChange();

        
        
    }
    

     formatDate(date: Date) {
      const pad = (n: number) => n.toString().padStart(2, '0');
    
      const year = date.getUTCFullYear();
      const month = pad(date.getUTCMonth() + 1);
      const day = pad(date.getUTCDate());
      const hours = pad(date.getUTCHours());
      const minutes = pad(date.getUTCMinutes());
      const seconds = pad(date.getUTCSeconds());
    
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
   
    // UTC Time
   
    
    getScreenSize() {
        return { width: window.innerWidth, height: window.innerHeight };
      }
    touggleDrop(){
        this.dropdownOpen = !this.dropdownOpen
    }

    getStation(){
        this.http.get('http://localhost:3000/api/getStationConfig').subscribe(
            (response: any) => {
                console.log( "Stations",response);
                let stationsss:Station[]=[]
                for (let index = 0; index < response.length; index++) {
                    stationsss = response
                }
                if(this.layout.selectedIndex === 7){
                    this.listStations = stationsss;
                }else{
                    this.listStations = stationsss.filter(item=> item.status === 'active');
                }

                this.selectedStation = this.listStations[0].station_name;
                    console.log("response topbar",response, this.listStations[0].station_name);
                this.layout.selectedStationId = this.listStations[0].station_id
                this.layout.StationName = this.listStations[0].station_name;
                console.log("id_station","one",this.layout.selectedStationId);
                this.layout.sensors = response[0].sensors
                this.layout.StationName = this.listStations[0].station_name;
                setTimeout(() => {
                    this.layout.isDashboardLoading = false;
                }, 200);
                },
                (error: any) => {
                    console.log(error);
                    }

        )
    }

}
