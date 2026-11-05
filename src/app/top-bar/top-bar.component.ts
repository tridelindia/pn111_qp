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
    lastReceivedTimestamp: string = '';
    lastRawTimestamp: string = '';
    isStale: boolean = true;

    timerId: any;

    updateTime() {
        const now = new Date();
        this.checkStaleness(now);
        if (this.isUtc) {
            this.date = this.formatDate(now);
        } else {
            // Qatar Local Time (Asia/Qatar - UTC+3)
            const qatarFormatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Qatar',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            this.date = qatarFormatter.format(now).replace(/\//g, '-').replace(',', '');
        }
    }

    onToggleChange(){
        this.isUtc = !this.isUtc;
        this.updateTime();
    }

    checkStaleness(now: Date) {
        if (!this.lastRawTimestamp) {
            this.isStale = true;
            return;
        }
        const lastTime = new Date(this.lastRawTimestamp).getTime();
        const diffMinutes = (now.getTime() - lastTime) / (1000 * 60);
        this.isStale = diffMinutes > 11;
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
        this.updateTime();
        this.timerId = setInterval(() => {
            this.updateTime();
        }, 1000);

        // Subscribe to last received timestamp from data service
        this.data.lastReceivedTimestamp$.subscribe((timestamp: string) => {
            if (timestamp) {
                this.lastRawTimestamp = timestamp;
                const ts = new Date(timestamp);
                if (!isNaN(ts.getTime())) {
                    this.lastReceivedTimestamp = this.formatDate(ts);
                } else {
                    this.lastReceivedTimestamp = timestamp;
                }
                this.checkStaleness(new Date());
            }
        });
    }

    ngOnDestroy(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
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
