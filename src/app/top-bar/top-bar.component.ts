import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { GlobalDataService } from '../global-data/global-data.component';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../user-model/user-model.module';
import { LayoutComponent } from '../layout/layout.component';
import { set } from 'ol/transform';
import { StationconfigService } from '../home/homeService/stationconfig.service';
import { ReportService } from '../report/report.service';
interface Station{
    station_id: string; station_name: string; sensors:string[]
  }
@Component({
    selector: 'app-top-bar',
    imports: [CommonModule, HttpClientModule],
    standalone:true,
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit, OnDestroy{
    screen!:string;
    @Input() page!:number;
    dropdownOpen:boolean =  false;
    selectedStation:string = 'Station 1';
    listStations:Station[]=[];
    currentUser!: CurrentUser;
    isUtc:boolean = false;
    date:string = '';
    private timerId: any = null;

    onToggleChange(){
        this.isUtc = !this.isUtc;
        this.updateTime();
    }

    updateTime(){
        const now = new Date();
        this.date = this.isUtc 
            ? this.formatTime(now, 'UTC') 
            : this.formatTime(now, 'Asia/Qatar');
    }

    formatTime(date: Date, timeZone: string): string {
        try {
            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const parts = formatter.formatToParts(date);
            const p: { [key: string]: string } = {};
            for (const part of parts) {
                p[part.type] = part.value;
            }
            return `${p['day']}-${p['month']}-${p['year']} ${p['hour']}:${p['minute']}:${p['second']}`;
        } catch (e) {
            return date.toISOString().replace('T', ' ').slice(0, 19);
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
            console.log("id_station","one",this.layout.selectedStationId)
            if(this.layout.selectedStationId !== null && this.layout.sensors.length !==0){
                setTimeout(() => {
                    this.layout.isDashboardLoading = false;
                }, 100);
            }
        }, 100);
    }

    ngOnInit(): void {
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;
        this.getStation();
        this.currentUser = this.authService.getCurrentUser();
        this.updateTime();
        this.timerId = setInterval(() => this.updateTime(), 1000);
    }

    ngOnDestroy(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
   
    
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
                for (let index = 0; index < response.length; index++) {
                    this.listStations = response
                }
                this.selectedStation = response[0].station_name;
                    console.log("response topbar",response, this.listStations[0].station_name);
                this.layout.selectedStationId = this.listStations[0].station_id
                console.log("id_station","one",this.layout.selectedStationId);
                this.layout.sensors = response[0].sensors;
                this.data.setStationId(this.listStations[0].station_id);
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
