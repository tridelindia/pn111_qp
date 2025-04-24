import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: Map | undefined;
  private vectorLayer: VectorLayer;  // Initialize this variable properly
  traveledPath: [number, number][] = [
    // fromLonLat([72.808716, 18.999682]) as [number, number],
    fromLonLat([72.809211, 18.997958]) as [number, number],
    fromLonLat([72.809304, 18.997888]) as [number, number],
    fromLonLat([72.809203, 18.997802]) as [number, number],
    fromLonLat([72.809050, 18.997865]) as [number, number],
    fromLonLat([72.808994, 18.997960]) as [number, number],
    fromLonLat([72.809103, 18.998111]) as [number, number],
  ];

  constructor() {
    // Initialize vectorLayer here
    this.vectorLayer = new VectorLayer({
      source: new VectorSource()
    });
  }

  addPathLines(): void {
    const lineString = new Feature({
      geometry: new LineString(this.traveledPath),
    });

    const lineStyle = new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
    });

    lineString.setStyle(lineStyle);
    this.vectorLayer.getSource()?.addFeature(lineString);

    // const lastPoint = this.traveledPath[this.traveledPath.length - 1]; // Get the last point
    // const circleFeatureLastPoint = new Feature({
    //   geometry: new Point(lastPoint),
    // });

    const circleStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'darkgreen', width: 2 })
      }),
    });

    // circleFeatureLastPoint.setStyle(circleStyle);
    // this.vectorLayer.getSource()?.addFeature(circleFeatureLastPoint);
  }

  createMap(target: HTMLElement, latitude: number, longitude: number): void {
    // Destroy existing map instance if it exists
    this.destroyMap();

    const center = fromLonLat([longitude, latitude]);
    console.log("location:", center);

    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4'
          }),
        }),
        this.vectorLayer // Add vector layer here
      ],
      view: new View({
        center: center,
        zoom: 17,
      })
    });

   

    // Add marker to the map's vector layer

  }

  destroyMap(): void {
    if (this.map) {
      this.map.setTarget(undefined);  // Detach the map from the DOM
      this.map = undefined;  // Clear the map instance
    }
  }
}
