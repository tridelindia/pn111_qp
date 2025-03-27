import { Component } from '@angular/core';
import { RadialGaugeComponent } from '../../widgets/radial-guage/radial-guage.component';

@Component({
  selector: 'app-sensor',
  standalone: true,
  imports: [RadialGaugeComponent],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.css'
})
export class SensorComponent {

}
