import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BuoyService } from '../infobuoy/buoy.service';
import {
  StationConfigs,
  StationconfigService,
} from '../homeService/stationconfig.service';
import { BuoyMeasurement } from '../../report/report.service';
import { CommonModule } from '@angular/common';
import { SensorModel } from '../../models/station.model';

@Component({
  selector: 'app-infobuoy',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './infobuoy.component.html',
  styleUrl: './infobuoy.component.css',
})
export class InfobuoyComponent implements OnInit {
  paramUnits: SensorModel[] = [];

  @Input() buoyData!: StationConfigs;
  @Input() buoySensor!: BuoyMeasurement;
  // @Input() buoyName!: string;
  // @Input() latitude!: number;
  // @Input() longitude!: number;
  @Input() markerImg!: string;
  @Input() status!: string;
  @Input() statusImg!: string;
  // @Input() temp!: string;
  @Input() drift!: string;
  // @Input() battery!: number;

  @Input() params: { name: string; value: string }[] = [];

  private buoyClickedSubscription: Subscription = new Subscription();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private paramUnitsService: StationconfigService
  ) {}

  ngOnInit(): void {
    this.paramUnitsService.getSensorConfig().subscribe((paramUnits) => {
      this.paramUnits = paramUnits;
      console.log('Sensor Config units: ', this.paramUnits);
    });
    // this.buoyClickedSubscription = this.buoyService.buoyClicked$.subscribe(
    //   (buoyName) => {
    //     console.log(buoyName, this.buoyName);
    //     if (buoyName === this.buoyName) {
    //     }
    //   }
    // );
    setTimeout(() => {
      this.rotateStation();
    }, 100);
  }

  ngOnDestroy(): void {
    this.buoyClickedSubscription.unsubscribe();
  }

  rotateStation() {
    const stationnameElement =
      this.el.nativeElement.querySelector('.stationname');
    if (stationnameElement.classList.contains('rotated')) {
      this.renderer.removeClass(stationnameElement, 'rotated');
    } else {
      this.renderer.addClass(stationnameElement, 'rotated');
    }
  }

  getUnit(name: string): string {
    const paramConfig = this.paramUnits?.find(
      (param: any) => param.param_name === name
    );
    return paramConfig?.unit ? ` ${paramConfig.unit}` : '';
  }

  getImageForParam(name: string): string {
    switch (name) {
      case 'battery':
        return 'assets/home/battery.png';
      case 'temperature_deg':
        return 'assets/svg/temperature.svg';
      case 'wind_speed':
        return 'assets/svg/windspeed.svg';
      case 'wind_direction_deg':
        return 'assets/home/winddire.png';
      case 'wind_gust':
        return 'assets/svg/windgust.svg';
      case 'rh_percent':
        return 'assets/svg/humidity.svg';
      case 'bp_hpa':
        return 'assets/svg/bp.svg';
      case 'visibility':
        return 'assets/svg/visibility.svg';
      case 'wave_heading':
        return 'assets/home/waveHeading.png';
      case 'wave_height':
        return 'assets/home/hs.png';
      case 'mean_wave_direction':
      case 'wave_direction':
      case 'wave_direction_fw':
        return 'assets/home/waveDirection.png';
      case 'hmax':
        return 'assets/home/max_wave_height.png';
      case 'fourier_coefficient_a1':
      case 'fourier_coefficient_b1':
      case 'fourier_coefficient_a2':
      case 'fourier_coefficient_b2':
        return 'assets/svg/fourier.svg';
      case 'havg':
        return 'assets/svg/maxwaveheight.svg';
      case 'dominant_time_period_fw':
        return 'assets/home/domp.png';
      case 'water_temperature':
        return 'assets/home/wtemp.png';
      case 'turbidity':
        return 'assets/svg/turbidity.svg';
      case 'ph':
        return 'assets/svg/ph.svg';
      case 'conductivity':
        return 'assets/svg/conductivity.svg';
      case 'dissolved_oxygen':
        return 'assets/svg/dissolvedo2.svg';
      case 'salinity':
        return 'assets/svg/salinity.svg';
      case 'chlorophyll_a':
        return 'assets/svg/chloro.svg';
      case 'phycoerythrin':
        return 'assets/svg/phyco.svg';
      case 'fluorescein_dye':
        return 'assets/svg/fluorescein.svg';
      case 'pah':
        return 'assets/svg/pah.svg';
      case 'oil_in_water':
        return 'assets/svg/oilinwater.svg';
      case 'bt':
        return 'assets/svg/bt.svg';
      case 'global_radiation':
        return 'assets/svg/radiation.svg';
      case 'rain_mm':
        return 'assets/svg/rainfall.svg';

      // Current speed bins
      case 'current_speed_bin_1':
      case 'current_speed_bin_2':
      case 'current_speed_bin_3':
      case 'current_speed_bin_4':
      case 'current_speed_bin_5':
      case 'current_speed_bin_6':
      case 'current_speed_bin_7':
      case 'current_speed_bin_8':
      case 'current_speed_bin_9':
      case 'current_speed_bin_10':
        return 'assets/svg/speed.svg';

      // Current direction bins
      case 'current_direction_bin_1':
      case 'current_direction_bin_2':
      case 'current_direction_bin_3':
      case 'current_direction_bin_4':
      case 'current_direction_bin_5':
      case 'current_direction_bin_6':
      case 'current_direction_bin_7':
      case 'current_direction_bin_8':
      case 'current_direction_bin_9':
      case 'current_direction_bin_10':
        return 'assets/svg/direction.svg';

      default:
        return 'assets/home/waveHeading.png';
    }
  }

  getLabelPrefix(name: string): string {
    switch (name) {
      case 'battery':
        return 'Battery';
      case 'cam_img':
        return 'Camera';
      case 'lat':
        return 'Latitude';
      case 'lon':
        return 'Longitude';
      case 'wind_speed':
        return `Wind\nSpeed`;
      case 'wind_direction_deg':
        return 'Wind\nDirection';
      case 'wind_gust':
        return 'Wind\nGust';
      case 'temperature_deg':
        return 'Temperature';
      case 'rh_percent':
        return 'Relative\nHumidity';
      case 'bp_hpa':
        return 'Barometric\nPressure';
      case 'global_radiation':
        return 'Solar\nRadiation';
      case 'rain_mm':
        return 'Rainfall';
      case 'visibility':
        return 'Visibility';
      case 'wave_heading':
        return 'Wave\nHeading';
      case 'wave_height':
        return 'Wave\nHeight';
      case 'tzc':
        return 'TZC';
      case 'tz':
        return 'TimeZone';
      case 'tm02':
        return 'Tm02';
      case 'wave_direction':
        return 'Wave\nDirection';
      case 'wave_direction_fw':
        return 'Wave\nDirection FW';
      case 'mean_wave_direction':
        return 'Mean Wave\nDirection';
      case 'hmax':
        return 'Max Wave\nHeight';
      case 'fourier_coefficient_a1':
        return 'Fourier\nCo_a1';
      case 'fourier_coefficient_b1':
        return 'Fourier\nCo_b1';
      case 'fourier_coefficient_a2':
        return 'Fourier\nCo_a2';
      case 'fourier_coefficient_b2':
        return 'Fourier\nCo_b2';
      case 'havg':
        return 'Average\nWave\nHeight';
      case 'dominant_time_period_fw':
        return 'Dominant\nPeriod FW';
      case 'turbidity':
        return 'Turbidity';
      case 'water_temperature':
        return 'Water\nTemp';
      case 'ph':
        return 'pH';
      case 'conductivity':
        return 'Conductivity';
      case 'dissolved_oxygen':
        return 'Dissolved\nOxygen';
      case 'salinity':
        return 'Salinity';
      case 'chlorophyll_a':
        return 'Chlorophyll-a';
      case 'phycoerythrin':
        return 'Phycoerythrin';
      case 'fluorescein_dye':
        return 'Fluorescein\nDye';
      case 'pah':
        return 'PAH';
      case 'oil_in_water':
        return 'Oil\nin Water';
      case 'bt':
        return 'BT';
      case 'motion':
        return 'Motion';
      case 'nmea':
        return 'NMEA';
      case 'samplenumber':
        return 'Sample';

      // Current speed bins
      case 'current_speed_bin_1':
      case 'current_speed_bin_2':
      case 'current_speed_bin_3':
      case 'current_speed_bin_4':
      case 'current_speed_bin_5':
      case 'current_speed_bin_6':
      case 'current_speed_bin_7':
      case 'current_speed_bin_8':
      case 'current_speed_bin_9':
      case 'current_speed_bin_10':
        return 'Current\nSpeed';

      // Current direction bins
      case 'current_direction_bin_1':
      case 'current_direction_bin_2':
      case 'current_direction_bin_3':
      case 'current_direction_bin_4':
      case 'current_direction_bin_5':
      case 'current_direction_bin_6':
      case 'current_direction_bin_7':
      case 'current_direction_bin_8':
      case 'current_direction_bin_9':
      case 'current_direction_bin_10':
        return 'Current\nDirection';

      default:
        return '';
    }
  }

  getSectionClass(index: number): string {
    const map = ['top-1', 'top-2', 'center-1', 'bottom-1', 'bottom-2'];
    return map[index] || 'default-section';
  }

  getImageClass(index: number): string {
    switch (index) {
      case 0:
        return 'battery'; // top-1
      case 1:
        return 'driftimg'; // top-2
      case 2:
        return 'locationimg'; // center-1
      case 3:
        return 'color1'; // bottom-1
      case 4:
        return 'temp'; // bottom-2
      default:
        return '';
    }
  }
}
