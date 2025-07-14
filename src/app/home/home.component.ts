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
import { TooltipModule } from 'primeng/tooltip';
import { SensorModel } from '../models/station.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HttpClientModule, CommonModule, InfobuoyComponent, TooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [InfobuoyComponent, StationconfigService, ReportService],
})
export class HomeComponent implements OnInit {
  selectedMap: string = ''; // Add this property
  buoystatus='true';
  mapInitialized = false;
  map!: Map | undefined;

  buoyTapped: boolean = false;
  selectedBuoy!: string;

  fetchedBuoys: StationConfigs[] = [];
  selectedBuoyData!: StationConfigs;

  paramUnits: SensorModel[] = [];

  livefetchedBuoys: BuoyMeasurement[] = [];
  // filteredLiveBuoys: BuoyMeasurement[] = [];

  // fetchedParams: BuoyMeasurement[] = [];

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

  livelocationbuoys: [number, number][] = [];
  stationNames: string[] = [];
  centerBuoys: [number, number][] = [];
  buoyDranges: number[] = [];
  buoyWRanges: number[] = [];
  imageMarkers: string[] = [];
  buoyRanges: string[] = [];

  statusTexts: { name: string; status: string }[] = [];

  buoyDrifts: { name: string; drift: string; type: string }[] = [];

  buoys: any[] = [];

  toastQueue: { message: string; cssClass: string }[] = [];
  currentToast: string | null = null;
  toastClass: string = '';

  private mapTarget = 'ol-map';
  mapUrl = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

  mapChange(name: string) {
    this.selectedMap = name;

    switch (name) {
      case 'OpenCycleMap':
        this.mapUrl = 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        break;
      case 'Transport':
        this.mapUrl =
          // 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
          'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        break;
      case 'Landscape':
        this.mapUrl =
          'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        break;
      case 'Outdoors':
        this.mapUrl =
          'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        break;
      case 'TransportDark':
        this.mapUrl =
          'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg';
        break;
      case 'Spinal Map':
        this.mapUrl =
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
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

    formatDateTime(date: Date): string {
    // Convert to 'yyyy-MM-dd HH:mm:ss' or whatever your backend expects, in IST
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }
 

  ngOnInit(): void {
    this.stationConfig.getHomeConfig().subscribe((homeConfig) => {
      this.fetchedparams2 = homeConfig;
      console.log('Home Circle selected params : ', this.fetchedparams2, homeConfig);
    });

    // this.stationConfig.getSensorConfig().subscribe((sensorConfig) => {
    //   this.paramUnits = sensorConfig;

    // });

    this.stationConfig.getStationNames().subscribe((stationConfig) => {
      this.fetchedBuoys = stationConfig;
      console.log('Station config Details: ', this.fetchedBuoys);

      const configStationIds = this.fetchedBuoys.map((id) =>
        id.station_id.toLowerCase()
      );
      console.log('Station IDs: ', configStationIds);

      this.reportService.getAllSensorData().subscribe((data) => {
        this.livefetchedBuoys = data.filter((buoy) =>
          configStationIds.includes(buoy.station_id.toLowerCase())
        );
        this.livefetchedBuoys = data
          .filter((buoy) =>
            configStationIds.includes(buoy.station_id.toLowerCase())
          )
          .sort(
            (a, b) =>
              configStationIds.indexOf(a.station_id.toLowerCase()) -
              configStationIds.indexOf(b.station_id.toLowerCase())
          );
        console.log('Filtered last Data Live Buoys: ', this.livefetchedBuoys);

        if (this.livefetchedBuoys.length !== 0) {
          for (let index = 0; index < this.livefetchedBuoys.length; index++) {
            const cord = fromLonLat([
              this.livefetchedBuoys[index].lon,
              this.livefetchedBuoys[index].lat,
            ]) as [number, number];
            // (this as any)[`livelocationbuoy${index + 1}`] = cord;
            this.livelocationbuoys[index] = cord;
            // console.log('Live Location: ', this.livelocationbuoys);
            console.log('five staions lat long', cord);
            setTimeout(() => {
              this.mapService.addMarker(
                cord,
                this.fetchedBuoys[index].station_name,
                this.fetchedBuoys[index].station_id,
                this.imageMarkers[index]
              );
            }, 1000);
          }

          console.log('Checking buoy range conditions...');
          this.fetchedBuoys.forEach((configBuoy, index) => {
            const liveMatch = this.livefetchedBuoys.find(
              (live) =>
                live.station_id.toLowerCase() ===
                configBuoy.station_id.toLowerCase()
            );

            if (liveMatch) {
              const result = this.haversineDistanceAndDirection(
                [configBuoy.lon_dd, configBuoy.lat_dd],
                [liveMatch.lon, liveMatch.lat]
              );

              const driftDistance = result.distance;
              const driftDirection = result.direction;
              const wrange = (this as any)[`buoy${index + 1}wrange`];
              const drange = (this as any)[`buoy${index + 1}drange`];

              this.buoyDranges[index] = drange;
              this.buoyWRanges[index] = wrange;

              let driftStatus = '';
              let driftClass = '';
              let driftType = '';

              if (driftDistance <= wrange) {
                driftStatus = `Within the range`;
                driftClass = 'text-success';
                driftType = 'within';
              } else if (driftDistance > wrange && driftDistance <= drange) {
                driftStatus = `Across the\nwarning range`;
                driftClass = 'text-warning';
                driftType = 'warning';
              } else {
                driftStatus = `Across the\ndanger range`;
                driftClass = 'text-danger';
                driftType = 'danger';
              }

              const driftAction =
                driftType === 'within' ? 'Drifting' : 'Drifted';
              const displayDistance =
                driftDistance >= 1000
                  ? `${(driftDistance / 1000).toFixed(1)} km`
                  : `${driftDistance.toFixed(1)} m`;

              const driftText = `${driftAction} ${displayDistance} ${driftDirection}\n(${driftStatus})`;

              this.buoyDrifts.push({
                name: configBuoy.station_name,
                drift: driftText,
                type: driftType,
              });

              this.toastQueue.push({
                message: `${configBuoy.station_name}: ${driftStatus}`,
                cssClass: driftClass,
              });

              console.log(
                `Drift for ${configBuoy.station_name}: ${driftText} , ${driftType}`
              );
            }
          });

          this.showToastSequentially();

          const status = this.coordassign(stationConfig);

          if (this.imageMarker1 != null) {
            if (status && !this.map) {
              this.MapInit();
            }
          }

          // Build final buoy list
          this.buoys = this.fetchedBuoys.map((configBuoy) => {
            const liveMatch = this.livefetchedBuoys.find(
              (live) =>
                live.station_id.toLowerCase() ===
                configBuoy.station_id.toLowerCase()
            );

            const statusText =
              this.statusTexts.find((st) => st.name === configBuoy.station_name)
                ?.status || 'Unknown';
            const driftText =
              this.buoyDrifts.find((d) => d.name === configBuoy.station_name)
                ?.drift || 'N/A';

            return {
              name: configBuoy.station_name,
              lat: liveMatch?.lat || configBuoy.lat_dd, // fallback to config if no live data
              long: liveMatch?.lon || configBuoy.lon_dd,
              status: statusText,
              drift: driftText,
              image: (() => {
                if (statusText !== 'Online') {
                  return '../../assets/home/buoy_offline.png';
                }

                const driftEntry = this.buoyDrifts.find(
                  (d) => d.name === configBuoy.station_name
                );
                if (!driftEntry) {
                  return '../../assets/home/buoy.png'; // default if no drift data
                }

                if (driftEntry.drift.includes('danger range')) {
                  return '../../assets/home/buoy_danger.png';
                } else if (driftEntry.drift.includes('warning range')) {
                  return '../../assets/home/buoy_warning.png';
                } else {
                  return '../../assets/home/buoy.png';
                }
              })(),
            };
          });

          console.log('Extend Buoy Data: ', this.buoys);
          // this.buoystatus=this.buoys.status;
        }
      });

      for (let i = 0; i < stationConfig.length; i++) {
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
    });
  }

  showToastSequentially() {
    if (!this.currentToast && this.toastQueue.length > 0) {
      const next = this.toastQueue.shift();
      if (next) {
        this.currentToast = next.message;
        this.toastClass = next.cssClass;
        setTimeout(() => {
          this.currentToast = null;
          this.toastClass = '';
          this.showToastSequentially(); // Show next
        }, 3000); // 5 seconds
      }
    }
  }
  coordassign(configs: StationConfigs[]): boolean {
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

    const markerImage = (
      status: string,
      driftType: string | undefined
    ): string => {
      if (status !== 'active') {
        return '../../assets/home/buoy_offline.png';
      }

      if (driftType === 'danger') {
        return '../../assets/home/buoy_danger.png';
      } else if (driftType === 'warning') {
        return '../../assets/home/buoy_warning.png';
      } else {
        return '../../assets/home/buoy.png';
      }
    };

    // Store station names, locations and markers dynamically
    this.stationNames = [];
    this.centerBuoys = [];
    this.imageMarkers = [];

        configs.slice(0, configs.length).forEach((config, index) => {
      this.stationNames[index] = config.station_name;
      const assignedLoc = assignLocation(config);
 
      if (
        !assignedLoc ||
        !Array.isArray(assignedLoc) ||
        assignedLoc.length !== 2 ||
        assignedLoc.some((coord) => isNaN(coord))
      ) {
        console.warn(
          `Invalid coordinates for station ${config.station_name}, skipping.`
        );
        return;
      }
 
      this.centerBuoys[index] = assignedLoc;
 
      const driftEntry = this.buoyDrifts.find(
        (d) => d.name === config.station_name
      );
      const driftType = driftEntry?.type;

      this.imageMarkers[index] = markerImage(config.status, driftType);

      console.log(
        'Stationname with Image :',
        this.stationNames[index],
        this.imageMarkers[index]
      );

      console.log(
        `Buoy center location: centerbuoy${index + 1}`,
        toLonLat(this.centerBuoys[index])
      );
    });

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
      console.log('Map not initialized yet. Proceeding with initialization.');

      console.log('Calling initializeMap with:', {
        mapTarget: this.mapTarget,
        center: this.centerbuoy4,
        zoomLevel: 14,
        mapUrl: this.mapUrl,
      });

      this.mapService.initializeMap(
        this.mapTarget,
        this.centerbuoy4,
        14,
        this.mapUrl
      );

      console.log('Adding circles for each buoy...');
      for (let index = 0; index < this.fetchedBuoys.length; index++) {
         const center = this.centerBuoys[index];
        const drange = this.buoyDranges[index]; // Make sure you have arrays for these ranges
        const wrange = this.buoyWRanges[index];
 
        if (!center || !Array.isArray(center) || center.length !== 2) {
          console.warn(
            `Center coordinates for buoy ${
              index + 1
            } are missing or invalid. Skipping.`
          );
          continue;
        }
 

        console.log(`Buoy ${index + 1}: center =`, center);
        console.log(`Adding danger range circle (red):`, drange);
        this.mapService.addCircle(center, drange, 'red');

        console.log(`Adding warning range circle (yellow):`, wrange);
        this.mapService.addCircle(center, wrange, 'yellow');
      }

      this.mapInitialized = true;
      console.log('Map successfully initialized.');
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
            console.log(
              'selectedBuoyData station Config:',
              this.selectedBuoyData
            );

            const now = new Date();
            const fromDate = this.formatDateTime(
              new Date(now.setHours(0, 0, 0, 0))
            ); // start of the day
            const toDate = this.formatDateTime(new Date());
 
            this.reportService
              .getSensorDataByStationAndDate(
                this.selectedBuoyData.station_id,
                fromDate,
                toDate
              )
              .subscribe((report) => {
                // const data = report;
                // console.log('report', data);
                if (report && report.length > 0) {
                  const latest = report[0];

                  this.selectedParamData = latest;
                  console.log(
                    'selected last param data',
                    this.selectedParamData
                    // this.fetchedparams2
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
                    console.log('Cicle final data', dataaa);
                    this.infoBuoyDataSet = dataaa;
                  }
                }
              });
            this.buoyTapped = true;
            // this.infobuoy.rotateStation();
          }
        }, 0);
      });
    }
  }

  // getSelectedMarker(): string {
  //   return this.selectedBuoyData?.status || 'inactive';
  // }
  getSelectedMarkerImg(
    status: string | undefined,
    driftType: string | undefined
  ): string {
    if (status !== 'active') {
      this.buoystatus='false'
      return '../../assets/home/buoy_offline.png';
    }else{
      this.buoystatus='true'

    }

    if (driftType === 'danger') {
      return '../../assets/home/buoy_danger.png';
    } else if (driftType === 'warning') {
      return '../../assets/home/buoy_warning.png';
    } else {
      return '../../assets/home/buoy.png';
    }
  }

  getDriftType(stationName: string | undefined): string | undefined {
    if (!stationName) return undefined;
    const driftEntry = this.buoyDrifts.find((d) => d.name === stationName);
    return driftEntry?.type;
  }

  // getSelectedStatusImg(): string {
  //   const statusObj = this.statusTexts.find(
  //     (item) => item.name === this.selectedBuoy
  //   );
  //   if (!statusObj) return '';
  //   return statusObj.status === 'Online'
  //     ? '../../../../assets/home/active.png'
  //     : '../../../../assets/home/inactive.jpg';
  // }

  // getSelectedDrift(): string {
  //   const found = this.buoyDrifts.find((d) => d.name === this.selectedBuoy);
  //   return found ? found.drift : 'Drift data not available';
  // }

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
