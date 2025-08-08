import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { Feature } from 'ol';
import { Circle, LineString, Point } from 'ol/geom';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { XYZ } from 'ol/source';
import { Draw } from 'ol/interaction';
import { getLength } from 'ol/sphere';
import Overlay from 'ol/Overlay';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: Map | undefined;
  vectorLayer!: VectorLayer;
  private measurementDraw: Draw | null = null;
  private measureTooltipElement: HTMLDivElement | null = null;
  private measureTooltip: Overlay | null = null;

  traveledPath: [number, number][] = [
    fromLonLat([72.808716, 18.999682]) as [number,number],
    fromLonLat([72.809211, 18.997958]) as [number,number],
    fromLonLat([72.809304, 18.997888]) as [number,number],
    fromLonLat([72.809203, 18.997802]) as [number,number],
    fromLonLat([72.809050, 18.997865]) as [number,number],
    fromLonLat([72.808994, 18.997960]) as [number,number],
    fromLonLat([72.809103, 18.998111]) as [number,number],
  ];

  addPathLines(coords: [number, number][], vectorLayer: VectorLayer): void {
    const lineString = new Feature({
      geometry: new LineString(coords),
    });

    const lineStyle = new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 2,
      }),
    });

    lineString.setStyle(lineStyle);
    vectorLayer.getSource()?.addFeature(lineString);

    const lastPoint = coords[coords.length - 1];
    const circleFeatureLastPoint = new Feature({
      geometry: new Point(lastPoint),
    });

    const circleStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'darkgreen', width: 2 })
      }),
    });

    circleFeatureLastPoint.setStyle(circleStyle);
    vectorLayer.getSource()?.addFeature(circleFeatureLastPoint);
  }

  createMap(
    target: HTMLElement,
    latitude: number,
    longitude: number,
    warning: number,
    danger: number,
    mapUrl: string,
    name: string
  ): void {
    this.destroyMap();

    const center = fromLonLat([longitude, latitude]) as [number, number];

    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new XYZ({ url: mapUrl }),
        }),
      ],
      view: new View({
        center: center,
        zoom: mapUrl === '../../../../assets/western/{z}/{x}/{y}.png' ? 10 : 14,
        maxZoom: mapUrl === '../../../../assets/western/{z}/{x}/{y}.png' ? 18 : undefined,
        minZoom: mapUrl === '../../../../assets/western/{z}/{x}/{y}.png' ? 8 : undefined,
      }),
    });

    const marker = new Feature({ geometry: new Point(center) });
    marker.setStyle(new Style({
      image: new Icon({ src: '../../assets/buoyimg/buoy.png', scale: 0.04 }),
      text: new Text({
        font: '15px jost',
        text: name,
        offsetY: -40,
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
      }),
    }));

    const circleFeature = new Feature({ geometry: new Circle(center, warning) });
    circleFeature.setStyle(new Style({
      stroke: new Stroke({ color: 'yellow', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));

    const circleFeature2 = new Feature({ geometry: new Circle(center, danger) });
    circleFeature2.setStyle(new Style({
      stroke: new Stroke({ color: 'red', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));

    const vectorSource = new VectorSource({ features: [marker, circleFeature, circleFeature2] });
    this.vectorLayer = new VectorLayer({ source: vectorSource });
    this.map.addLayer(this.vectorLayer);
  }

  enableMeasurementTool(): void {
    if (!this.map) return;

    if (this.measurementDraw) {
      this.map.removeInteraction(this.measurementDraw);
      this.measurementDraw = null;
    }

    const source = this.vectorLayer?.getSource() || new VectorSource();

    this.measurementDraw = new Draw({
      source: source,
      type: 'LineString',
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 0.9)',
          width: 2,
        }),
      }),
    });

    this.map.addInteraction(this.measurementDraw);
    this.createMeasureTooltip();

    let sketch: any;

    this.measurementDraw.on('drawstart', (evt) => {
      sketch = evt.feature;

      sketch.getGeometry().on('change', (geomEvt: any) => {
        const geom = geomEvt.target;
        const output = this.formatLength(geom);
        const coord = geom.getLastCoordinate();

        if (this.measureTooltipElement) {
          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip!.setPosition(coord);
        }
      });
    });

    this.measurementDraw.on('drawend', () => {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        this.measureTooltip!.setOffset([0, -7]);
      }
      sketch = null;
      this.measureTooltipElement = null;
      this.createMeasureTooltip(); // Ready for next
    });
  }

  private createMeasureTooltip(): void {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement);
    }

    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';

    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    });

    this.map?.addOverlay(this.measureTooltip);
  }

  private formatLength(line: LineString): string {
    const length = getLength(line);
    return length > 1000
      ? (length / 1000).toFixed(2) + ' km'
      : length.toFixed(2) + ' m';
  }

  destroyMap(): void {
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = undefined;
    }
  }
}
