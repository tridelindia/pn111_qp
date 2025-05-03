import { Component, HostListener, OnInit } from '@angular/core';
import { Map } from 'ol';
import { fromLonLat, toLonLat } from 'ol/proj';
import { MapService } from './homeService/map.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  HomeConfig,
  StationConfigs,
  StationconfigService,
} from './homeService/stationconfig.service';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol/render/webgl/MixedGeometryBatch';
import { InfobuoyComponent } from '../home/infobuoy/infobuoy.component';
import { BuoyMeasurement, ReportService } from '../report/report.service';
 
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HttpClientModule, CommonModule, InfobuoyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [InfobuoyComponent, StationconfigService, ReportService],
})
export class HomeComponent implements OnInit {
  mapInitialized = false;
  map!: Map | undefined;
 
  buoyTapped: boolean = false;
  selectedBuoy!: string;
 
  fetchedBuoys: StationConfigs[] = [];
  selectedBuoyData!: StationConfigs;
 
  fetchedParams: BuoyMeasurement[] = [];
  selectedParamData!: BuoyMeasurement;
 
  fetchedparams2: HomeConfig[] = [];
  infoBuoyDataSet: { name: string; value: string }[] = [];
 
  stationName1!: string;
  stationName2!: string;
  stationName3!: string;
  stationName4!: string;
  stationName5!: string;
 
  centerbuoy1: [number, number] = [51.562944, 25.423028];
  centerbuoy2!: [number, number];
  centerbuoy3!: [number, number];
  centerbuoy4!: [number, number];
  centerbuoy5!: [number, number];
 
  imageMarker1!: string;
  imageMarker2!: string;
  imageMarker3!: string;
  imageMarker4!: string;
  imageMarker5!: string;
 
  stationNames: string[] = [];
  centerBuoys: [number, number][] = [];
  imageMarkers: string[] = [];
  buoyRanges: string[] = [];
 
  statusTexts: { name: string; status: string }[] = [];
 
  buoyDrifts: { name: string; drift: string }[] = [];
 
  buoys: any[] = [];
 
  private mapTarget = 'ol-map';
  mapUrl = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
 
  mapChange(name: String) {
    switch (name) {
      case 'OpenCycleMap':
        this.mapUrl = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        break;
      case 'Transport':
        this.mapUrl = 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}';
        break;
      case 'Landscape':
        this.mapUrl = 'http://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}';
        break;
      case 'Outdoors':
        this.mapUrl = 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
        break;
      case 'TransportDark':
        this.mapUrl = 'http://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}';
        break;
      case 'Spinal Map':
        this.mapUrl = 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}';
        break;
      default:
        this.mapUrl = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        break;
    }
    this.mapService.updateMapLayer(this.mapUrl);
  }
  constructor(
    private mapService: MapService,
    private stationConfig: StationconfigService,
    private infobuoy: InfobuoyComponent,
    private reportService: ReportService
  ) {}
  ngOnInit(): void {
    this.stationConfig.getHomeConfig().subscribe((homeConfig) => {
      this.fetchedparams2 = homeConfig;
      console.log('Home Config: ', this.fetchedparams2);
    });
 
    this.stationConfig.getStationNames().subscribe((stationConfig) => {
      this.fetchedBuoys = stationConfig;
      console.log('Station Details: ', this.fetchedBuoys);
 
      for (let i = 0; i < stationConfig.length; i++) {
        const loc = fromLonLat([
          stationConfig[i].lon_dd,
          stationConfig[i].lat_dd,
        ]) as [number, number];
        (this as any)[`livelocationbuoy${i + 1}`] = loc;
 
        console.log('Live Location: ', loc);
 
        (this as any)[`buoy${i + 1}wrange`] = parseFloat(
          stationConfig[i].warning
        );
        (this as any)[`buoy${i + 1}drange`] = parseFloat(
          stationConfig[i].danger
        );
 
        (this as any)[`buoy${i + 1}lat`] = stationConfig[i].lat_dd;
        (this as any)[`buoy${i + 1}long`] = stationConfig[i].lon_dd;
      }
 
      this.statusTexts = stationConfig.map((station, index) => ({
        name: this.fetchedBuoys[index].station_name,
        status: station.status === 'active' ? 'Online' : 'Offline',
      }));
 
      for (let i = 0; i < stationConfig.length; i++) {
        const result = this.haversineDistanceAndDirection(
          [stationConfig[i].lon_dd, stationConfig[i].lat_dd],
          [stationConfig[i].lon_dd, stationConfig[i].lat_dd] // Replace with actual live location if needed
        );
        const driftText = `${result.distance.toFixed(1)} m ${result.direction}`;
        this.buoyDrifts.push({
          name: this.fetchedBuoys[i].station_name,
          drift: driftText,
        });
      }
 
      this.buoys = this.fetchedBuoys.map((buoy, index) => {
        const statusText =
          this.statusTexts.find((st) => st.name === buoy.station_name)
            ?.status || 'Unknown';
        return {
          // id: `B_ID${index + 1}`,
          name: buoy.station_name,
          lat: buoy.lat_dd,
          long: buoy.lon_dd,
          status: statusText,
          drift:
            this.buoyDrifts.find((d) => d.name === buoy.station_name)?.drift ||
            'N/A',
          image:
            statusText === 'Online'
              ? '../../assets/home/buoy.png'
              : '../../assets/home/buoy_offline.png',
        };
      });
 
      const status = this.coordassign(stationConfig);
 
      if (this.imageMarker1 != null) {
        if (status && !this.map) {
          console.log('ok');
 
          this.MapInit();
        }
      }
    });
  }
 
  coordassign(configs: StationConfigs[]): boolean {
    // if (configs.length < 5) {
    //   console.error('Insufficient station configs provided.');
    //   return false;
    // }
 
    const convertDMSToDD = (deg: number, min: number, sec: number): number => {
      return deg + min / 60 + sec / 3600;
    };
 
    const assignLocation = (config: StationConfigs): [number, number] => {
      if (config.geo_format === 'DMS') {
        return fromLonLat([
          convertDMSToDD(config.lon_deg, config.lon_min, config.lon_sec),
          convertDMSToDD(config.lat_deg, config.lat_min, config.lat_sec),
        ]) as [number, number];
      } else if (config.geo_format === 'DD') {
        return fromLonLat([config.lon_dd, config.lat_dd]) as [number, number];
      } else {
        console.warn('Unknown geo_format:', config.geo_format);
        return [0, 0];
      }
    };
 
    const markerImage = (status: string): string =>
      status === 'active'
        ? '../../assets/home/buoy.png'
        : '../../assets/home/buoy_offline.png';
 
    // Store station names, locations and markers dynamically
    this.stationNames = [];
    this.centerBuoys = [];
    this.imageMarkers = [];
 
    configs.slice(0, 5).forEach((config, index) => {
      this.stationNames[index] = config.station_name;
      this.centerBuoys[index] = assignLocation(config);
      this.imageMarkers[index] = markerImage(config.status);
 
      console.log(`centerbuoy${index + 1}`, toLonLat(this.centerBuoys[index]));
      console.log(
        `buoy${index + 1}range`,
        (this as any)[`buoy${index + 1}range`]
      );
    });
 
    console.log('All station details', configs);
 
    // Optionally assign the first five station names individually if needed
    [
      this.stationName1,
      this.stationName2,
      this.stationName3,
      this.stationName4,
      this.stationName5,
    ] = this.stationNames;
 
    // Likewise for centerbuoys and imageMarkers if still needed individually
    [
      this.centerbuoy1,
      this.centerbuoy2,
      this.centerbuoy3,
      this.centerbuoy4,
      this.centerbuoy5,
    ] = this.centerBuoys;
 
    [
      this.imageMarker1,
      this.imageMarker2,
      this.imageMarker3,
      this.imageMarker4,
      this.imageMarker5,
    ] = this.imageMarkers;
 
    return true;
  }
 
  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }
 
  vectorSource!: VectorSource;
  MapInit(): void {
    console.log('Initializing map...');
    if (!this.mapInitialized) {
      this.mapService.initializeMap(
        this.mapTarget,
        this.centerbuoy4,
        14,
        this.mapUrl
      );
      for (let index = 0; index < this.fetchedBuoys.length; index++) {
        // const element = array[index];
        const cord = fromLonLat([
          this.fetchedBuoys[index].lon_dd,
          this.fetchedBuoys[index].lat_dd,
        ]) as [number, number];
        const markerKey = `imageMarker${index + 1}`;
        console.log('cord', cord);
        this.mapService.addMarker(
          cord,
          this.fetchedBuoys[index].station_name,
          (this as any)[`imageMarker${index + 1}`]
          // this.imageMarker1
        );
      }
 
      for (let index = 0; index < this.fetchedBuoys.length; index++) {
        this.mapService.addCircle(
          (this as any)[`centerbuoy${index + 1}`],
          (this as any)[`buoy${index + 1}drange`],
          'red'
        );
        this.mapService.addCircle(
          (this as any)[`centerbuoy${index + 1}`],
          (this as any)[`buoy${index + 1}wrange`],
          'yellow'
        );
      }
 
      for (let index = 0; index < this.fetchedBuoys.length; index++) {
        const buoyRange = this.mapService.checkBuoyRange(
          (this as any)[`livelocationbuoy${index + 1}`],
          (this as any)[`centerbuoy${index + 1}`],
          (this as any)[`buoy${index + 1}wrange`],
          (this as any)[`buoy${index + 1}drange`],
          (this as any)[`stationName${index + 1}`]
        );
        (this as any)[`buoy${index + 1}range`] = buoyRange;
 
        this.buoyRanges.push(buoyRange);
      }
 
      this.mapInitialized = true;
      console.log('map initialized');
      this.mapService.registerClickListener((feature: Feature) => {
        this.buoyTapped = false;
        setTimeout(() => {
          const name = feature.get('name');
          if (name) {
            console.log(`Feature clicked: ${name}`);
            this.selectedBuoy = name;
            this.selectedBuoyData = this.fetchedBuoys.filter(
              (item) => item.station_name === this.selectedBuoy
            )[0];
            console.log('selectedBuoyData', this.selectedBuoyData);
            
            this.reportService
              .getAllSensorData(this.selectedBuoyData.station_id)
              .subscribe((report) => {
                console.log("report:===", report)
                if (report && report.length > 0) {
                  const latest = report[report.length - 1];
 
                  this.selectedParamData = latest;
                  console.log(
                    'selected param data',
                    this.selectedParamData,
                    this.fetchedparams2
                  );
                  const filter = this.fetchedparams2.filter(
                    (item) =>
                      item.station_id == this.selectedBuoyData.station_id
                  );
 
                  let list_param: string[] = [];
                  if (filter && filter.length > 0) {
                    const config = filter[0];
                    for (let i = 1; i <= 5; i++) {
                      const key = `param${i}`;
                      if (config[key]) {
                        list_param.push(config[key]);
                      }
                    }
                  } else {
                    console.warn('Filter is empty or undefined');
                  }
                  console.log('filter', filter, list_param);
 
                  let dataaa: { name: string; value: string }[] = [];
                  if (this.selectedParamData) {
                    for (let index = 0; index <= 4; index++) {
                      dataaa.push({
                        name: list_param[index],
                        value: this.selectedParamData[list_param[index]],
                      });
                    }
                    console.log('dataaa', dataaa);
                    this.infoBuoyDataSet = dataaa;
                  }
                }
              });
            this.buoyTapped = true;
            this.infobuoy.rotateStation();
          }
        }, 0);
      });
    }
  }
 
  getSelectedMarker(): string {
    return this.selectedBuoyData?.status || 'inactive';
  }
 
  getSelectedMarkerImg(): string {
    return this.getSelectedMarker() === 'active'
      ? '../../assets/home/buoy.png'
      : '../../assets/home/buoy_offline.png';
  }
 
  getSelectedStatusImg(): string {
    const statusObj = this.statusTexts.find(
      (item) => item.name === this.selectedBuoy
    );
    if (!statusObj) return '';
    return statusObj.status === 'Online'
      ? '../../../../assets/home/active.png'
      : '../../../../assets/home/inactive.jpg';
  }
 
  getSelectedDrift(): string {
    const found = this.buoyDrifts.find((d) => d.name === this.selectedBuoy);
    return found ? found.drift : 'Drift data not available';
  }
 
  expandMap(event: MouseEvent) {
    this.buoyTapped = false;
    event.stopPropagation();
    const mapContainer = document.getElementById('ol-map') as HTMLElement;
    const isExpanded = mapContainer.classList.toggle('expanded');
    // if (isExpanded) {
    //   mapContainer.style.width = '50%';
    // } else {
    //   mapContainer.style.width = '100%';
    // }
  }
 
  haversineDistanceAndDirection(
    loc1: [number, number] = [0, 0],
    loc2: [number, number] = [0, 0]
  ): { distance: number; direction: string } {
    const toRadians = (degree: number) => degree * (Math.PI / 180);
    const toDegrees = (radian: number) => radian * (180 / Math.PI);
 
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = toRadians(loc1[1]);
    const φ2 = toRadians(loc2[1]);
    const Δφ = toRadians(loc2[1] - loc1[1]);
    const Δλ = toRadians(loc2[0] - loc1[0]);
 
    // Haversine formula to calculate distance
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
 
    // Calculate the initial bearing (direction) in radians
    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let bearing = Math.atan2(x, y);
 
    // Convert bearing from radians to degrees
    bearing = toDegrees(bearing);
 
    // Normalize the bearing to be between 0 and 360 degrees
    bearing = (bearing + 360) % 360;
 
    // Map bearing to cardinal direction
    const directions = [
      { min: 0, max: 22.5, direction: 'N' },
      { min: 22.5, max: 67.5, direction: 'NE' },
      { min: 67.5, max: 112.5, direction: 'E' },
      { min: 112.5, max: 157.5, direction: 'SE' },
      { min: 157.5, max: 202.5, direction: 'S' },
      { min: 202.5, max: 247.5, direction: 'SW' },
      { min: 247.5, max: 292.5, direction: 'W' },
      { min: 292.5, max: 337.5, direction: 'NW' },
      { min: 337.5, max: 360, direction: 'N' },
    ];
 
    let direction = 'N'; // Default value
    for (const dir of directions) {
      if (bearing >= dir.min && bearing < dir.max) {
        direction = dir.direction;
        break;
      }
    }
 
    return { distance, direction };
  }
 
  @HostListener('document:click', ['$event'])
  onclickOutside(event: MouseEvent) {
    const infobuoyElement = document.querySelector('app-infobuoy');
    // const expandSpace = document.querySelector('.expand-space');
    const expandButton = document.querySelector('.expand-button');
 
    const target = event.target as Node;
 
    // Prevent closing if clicking inside app-infobuoy
    if (infobuoyElement && infobuoyElement.contains(target)) {
      return;
    }
 
    // Prevent closing if clicking inside expand space or the expand button
    if (expandButton && expandButton.contains(target)) {
      return;
    }
 
    // Close info buoy
    this.buoyTapped = false;
 
    // Collapse map if open
    const mapContainer = document.getElementById('ol-map') as HTMLElement;
    mapContainer?.classList.remove('expanded');
    mapContainer!.style.width = '100%';
  }
}
 
 