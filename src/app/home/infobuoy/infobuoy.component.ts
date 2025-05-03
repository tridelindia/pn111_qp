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
import { StationConfigs } from '../homeService/stationconfig.service';
import { BuoyMeasurement } from '../../report/report.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infobuoy',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './infobuoy.component.html',
  styleUrl: './infobuoy.component.css',
})
export class InfobuoyComponent implements OnInit {
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

  ngOnInit(): void {
    // this.buoyClickedSubscription = this.buoyService.buoyClicked$.subscribe(
    //   (buoyName) => {
    //     console.log(buoyName, this.buoyName);
    //     if (buoyName === this.buoyName) {
    //     }
    //   }
    // );
    setTimeout(() => {
      this.rotateStation();
    }, 1000);
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

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private buoyService: BuoyService
  ) {}

  getImageForParam(name: string): string {
    switch (name) {
      case 'battv_min':
        return 'assets/home/battery.png';
      case 'ptemp_c_max':
        return 'assets/svg/temperature.svg';
      case 'avg_ws':
        // return 'assets/home/windspeed.jpg';
        return 'assets/svg/windspeed.svg';
      case 'avgwindr':
        // return 'assets/home/winddire.png';
        return 'assets/svg/windspeed.svg';
      case 'windgust':
        // return 'assets/home/gust.png';
        return 'assets/svg/windgust.svg';
      case 'avgtemp':
        // return 'assets/home/avgtemp.png';
        return 'assets/svg/temperature.svg';
      case 'avgrh':
        return 'assets/svg/humidity.svg';
      case 'avgbp':
        return 'assets/svg/bp.svg';
      case 'visnm':
        return 'assets/svg/visibility.svg';
      case 'avgvisnm':
        return 'assets/svg/visibility.svg';
      case 'watertempc_avg':
        return 'assets/home/wtemp.png';
      case 'motion':
        return 'assets/home/2767-battery-levels-vertical-a-unscreen.gif';
      case 'nmea':
        return 'assets/home/2767-battery-levels-vertical-a-unscreen.gif';
      case 'heading':
        return 'assets/home/waveHeading.png';
      case 'hs':
        return 'assets/home/hs.png';
      case 'dominanttimeperiod':
        return 'assets/home/domp.png';
      case 'dominanttimeperiodfw':
        return 'assets/home/domp.png';
      case 'wave_direction':
        return 'assets/home/waveDirection.png';
      case 'wave_directionfw':
        return 'assets/home/waveDirection.png';
      case 'mean_wave_direction':
        return 'assets/home/waveDirection.png';
      case 'hmax':
        return 'assets/home/max_wave_height.png';
      case 'fourier_coefficient_a1':
        return 'assets/svg/fourier.svg';
      case 'fourier_coefficient_b1':
        return 'assets/svg/fourier.svg';
      case 'fourier_coefficient_a2':
        return 'assets/svg/fourier.svg';
      case 'fourier_coefficient_b2':
        return 'assets/svg/fourier.svg';
      case 'samplenumber':
        return 'assets/home/2767-battery-levels-vertical-a-unscreen.gif';
      case 'cell_1_speed':
      case 'cell_2_speed':
      case 'cell_3_speed':
      case 'cell_4_speed':
      case 'cell_5_speed':
      case 'cell_6_speed':
      case 'cell_7_speed':
      case 'cell_8_speed':
      case 'cell_9_speed':
      case 'cell_10_speed':
      case 'cell_11_speed':
      case 'cell_12_speed':
      case 'cell_13_speed':
      case 'cell_14_speed':
      case 'cell_15_speed':
      case 'cell_16_speed':
      case 'cell_17_speed':
      case 'cell_18_speed':
      case 'cell_19_speed':
      case 'cell_20_speed':
        return 'assets/svg/speed.svg';

      case 'cell_1_dir':
      case 'cell_2_dir':
      case 'cell_3_dir':
      case 'cell_4_dir':
      case 'cell_5_dir':
      case 'cell_6_dir':
      case 'cell_7_dir':
      case 'cell_8_dir':
      case 'cell_9_dir':
      case 'cell_10_dir':
      case 'cell_11_dir':
      case 'cell_12_dir':
      case 'cell_13_dir':
      case 'cell_14_dir':
      case 'cell_15_dir':
      case 'cell_16_dir':
      case 'cell_17_dir':
      case 'cell_18_dir':
      case 'cell_19_dir':
      case 'cell_20_dir':
        return 'assets/svg/direction.svg';
      default:
        return 'assets/home/waveHeading.png';
    }
  }

  getLabelPrefix(name: string): string {
    switch (name) {
      case 'windgust':
        return 'Wind\nGust';
      case 'avgwindr':
        return 'Wind\nDirection';
      case 'battv_min':
        return 'Battery';
      case 'avgtemp':
        return 'Temperature';
      case 'hs':
        return 'Wave\nHeight';
      case 'ptemp_c_max':
        return 'Temperature\nMax';
      case 'avg_ws':
        return 'Wind\nSpeed ';
      case 'avgrh':
        return 'Relative\nHumidity';
      case 'avgbp':
        return 'Barometric\nPressure ';
      case 'visnm':
      case 'avgvisnm':
        return 'Visibility';
      case 'watertempc_avg':
        return 'Water\nTemp';
      case 'motion':
        return 'Motion';
      case 'nmea':
        return 'NMEA';
      case 'heading':
        return 'Wave\nHeading';
      case 'dominanttimeperiod':
        return 'Dominant\nperiod';
      case 'dominanttimeperiodfw':
        return 'Dominant\nperiod FW';
      case 'wave_direction':
        return 'Wave\nDirection ';
      case 'wave_directionfw':
        return 'Wave\nDirection FW ';
      case 'mean_wave_direction':
        return 'Mean Wave\nDirection';
      case 'hmax':
        return 'Max Wave\nHeight';
      case 'fourier_coefficient_a1':
        return 'Fourier\nco_a1';
      case 'fourier_coefficient_b1':
        return 'Fourier\nCo_b1';
      case 'fourier_coefficient_a2':
        return 'Fourier\nCo_a2';
      case 'fourier_coefficient_b2':
        return 'Fourier\nCo_b2 ';
      // case 'timeanddate':
      //   return 'DateTime ';
      case 'samplenumber':
        return 'Sample ';
      case 'cell_1_speed':
      case 'cell_2_speed':
      case 'cell_3_speed':
      case 'cell_4_speed':
      case 'cell_5_speed':
      case 'cell_6_speed':
      case 'cell_7_speed':
      case 'cell_8_speed':
      case 'cell_9_speed':
      case 'cell_10_speed':
      case 'cell_11_speed':
      case 'cell_12_speed':
      case 'cell_13_speed':
      case 'cell_14_speed':
      case 'cell_15_speed':
      case 'cell_16_speed':
      case 'cell_17_speed':
      case 'cell_18_speed':
      case 'cell_19_speed':
      case 'cell_20_speed':
        return 'Cell\nSpeed ';
      case 'cell_1_dir':
      case 'cell_2_dir':
      case 'cell_3_dir':
      case 'cell_4_dir':
      case 'cell_5_dir':
      case 'cell_6_dir':
      case 'cell_7_dir':
      case 'cell_8_dir':
      case 'cell_9_dir':
      case 'cell_10_dir':
      case 'cell_11_dir':
      case 'cell_12_dir':
      case 'cell_13_dir':
      case 'cell_14_dir':
      case 'cell_15_dir':
      case 'cell_16_dir':
      case 'cell_17_dir':
      case 'cell_18_dir':
      case 'cell_19_dir':
      case 'cell_20_dir':
        return 'Cell\nDirection ';
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
