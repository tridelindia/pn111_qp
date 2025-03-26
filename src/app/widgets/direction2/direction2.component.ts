import { Component, OnInit } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-direction2',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './direction2.component.html',
  styleUrls: ['./direction2.component.css'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class Direction2Component implements OnInit {
  rotationDegree: number = 180; // Default rotation

    rotateNeedle(degree: number) {
      this.rotationDegree = degree;
    }
ngOnInit(): void {
    setInterval(() => {
        this.rotationDegree = Math.random() * (360 - 0) + 0;;
        console.log(this.rotationDegree);
    }, 2000);
}
}
