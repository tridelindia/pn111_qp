import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { GlobalDataService } from '../global-data/global-data.component';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../user-model/user-model.module';
import { LayoutComponent } from '../layout/layout.component';
import { set } from 'ol/transform';
interface Station{
    station_id: string; station_name: string;
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
    selectedStation:string = 'Station 1';
    listStations:Station[]=[];
    currentUser!: CurrentUser;
 
    constructor(private http:HttpClient, private data:GlobalDataService,private authService: AuthService, private layout:LayoutComponent){}
    onSelect(name:string){
        this.layout.isDashboardLoading = true;

        this.selectedStation = name;
        this.dropdownOpen = !this.dropdownOpen;
        this.data.selectedStation = name;
        const idset = this.listStations.filter(item=> item.station_name == name);
        console.log("id",idset);
        const stationId = idset[0].station_id;
        this.layout.selectedStationId = stationId;
        this.data.setStationId(stationId);
        console.log("id_station","one",this.layout.selectedStationId)
        if(this.layout.selectedStationId !== null){
            setTimeout(() => {
                this.layout.isDashboardLoading = false;
            }, 100);
        }
    }

    ngOnInit(): void {
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;
        this.getStation();
        this.currentUser = this.authService.getCurrentUser();
        
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
                this.layout.selectedStationId = this.listStations[0].station_id;
                this.data.initializeStationId(this.listStations[0].station_id);
                console.log("id_station","one",this.layout.selectedStationId)
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
