import { Component, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, Input } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5radar from '@amcharts/amcharts5/radar';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-direction1',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './direction1.component.html',
    styleUrl: './direction1.component.css'
})
export class Direction1Component implements AfterViewInit, OnChanges, OnDestroy {
  private root!: am5.Root;
  @Input() direction!: number;
  @Input() ID!: string;

  private axisDataItemN: any;
  private axisDataItemS: any;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    const chartDiv = this.elRef.nativeElement.querySelector(`#${this.ID}`);
    if (!chartDiv) return;

    if (this.root) {
      this.root.dispose();
    }

    this.root = am5.Root.new(chartDiv);
    this.root.setThemes([am5themes_Animated.new(this.root)]);
    this.root._logo?.dispose();

    const chart = this.root.container.children.push(
      am5radar.RadarChart.new(this.root, { panX: false, panY: false, startAngle: -90, endAngle: 270 })
    );

    const axisRenderer = am5radar.AxisRendererCircular.new(this.root, {
      strokeOpacity: 1,
      strokeWidth: 5,
      minGridDistance: 10
    });

    axisRenderer.ticks.template.setAll({ forceHidden: true, visible: false });
    axisRenderer.grid.template.setAll({ forceHidden: true, visible: true });
    axisRenderer.labels.template.setAll({ forceHidden: true, visible: true });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, { min: 0, max: 360, strictMinMax: true, renderer: axisRenderer })
    );

    const createClockHand = (value: number, rotation: number, color?: number) => {
      const axisDataItem = xAxis.makeDataItem({ value });
      const clockHand = am5radar.ClockHand.new(this.root, { pinRadius: 0, radius: am5.percent(90), bottomWidth: 10 });

      if (color) clockHand.hand.set('fill', am5.color(color));

      axisDataItem.set('bullet', am5xy.AxisBullet.new(this.root, { sprite: clockHand }));
      xAxis.createAxisRange(axisDataItem);
      return axisDataItem;
    };

    this.axisDataItemN = createClockHand(0, -90, 0xff0000);
    this.axisDataItemS = createClockHand(180, 90);

    const createLabel = (text: string, value: number, tickOpacity: number) => {
      const axisDataItem = xAxis.makeDataItem({ value });
      xAxis.createAxisRange(axisDataItem);

      const label = axisDataItem.get('label');
      if (label) {
        label.setAll({ text, fill: am5.color(0x000), forceHidden: false, inside: true, fontSize: 8 });
      }

      axisRenderer.setAll({
        stroke: am5.color(0x000),
        strokeOpacity: 1,
        strokeWidth: 2,
        minGridDistance: 5,
      });

      const axis = axisDataItem.get('tick');
      if (axis) {
        axis.setAll({
          forceHidden: false,
          fill: am5.color(0xff000),
          strokeOpacity: tickOpacity,
          length: 12 * tickOpacity,
          visible: true,
          inside: true
        });
      }
    };

    // Add Direction Labels
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach((dir, i) => createLabel(dir, i * 45, 1));
    for (let i = 0; i < 360; i += 5) createLabel('', i, 0.5);

    this.animateToDirection(Number(this.direction) || 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['direction'] && this.axisDataItemN && this.axisDataItemS) {
      this.animateToDirection(Number(this.direction) || 0);
    }
  }

  private animateToDirection(deg: number): void {
    if (this.axisDataItemN) {
      this.axisDataItemN.animate({
        key: 'value',
        to: deg,
        duration: 800,
        easing: am5.ease.out(am5.ease.cubic)
      });
    }

    if (this.axisDataItemS) {
      this.axisDataItemS.animate({
        key: 'value',
        to: (deg + 180) % 360,
        duration: 800,
        easing: am5.ease.out(am5.ease.cubic)
      });
    }
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
