import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { Circle, LineString, Point } from 'ol/geom';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { XYZ } from 'ol/source';
@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map: Map | undefined;
  vectorLayer!: VectorLayer;
  traveledPath: [number, number][] = [
    // this.livelocationbuoy1,
    fromLonLat([72.808716, 18.999682]) as [number, number],
    fromLonLat([72.809211, 18.997958]) as [number, number],
    fromLonLat([72.809304, 18.997888]) as [number, number],
    fromLonLat([72.809203, 18.997802]) as [number, number],
    fromLonLat([72.809050, 18.997865]) as [number, number],
    fromLonLat([72.808994, 18.997960]) as [number, number],
    fromLonLat([72.809103, 18.998111]) as [number, number],
    // fromLonLat([80.199560, 14.589617]) as [number, number],
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

    const lastPoint = coords[coords.length - 1]; // Get the last point
    const circleFeatureLastPoint = new Feature({
      geometry: new Point(lastPoint),
    });
  
    const circleStyle = new Style({
      image: new CircleStyle({
        radius: 5, // 10px / 2 = 5px for the radius
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'darkgreen', width: 2 })
      }),
    });
  
    circleFeatureLastPoint.setStyle(circleStyle);
    vectorLayer.getSource()?.addFeature(circleFeatureLastPoint);
  }
  
  createMap(target: HTMLElement, latitude: number, longitude: number, warning: number, danger: number, mapUrl:string): void {
    // Destroy existing map instance if it exists
    this.destroyMap();
    //console.log(show);
  
    const center = fromLonLat([longitude, latitude]) as [number, number];
    //console.log("location:", center);
    this.map = new Map({
      target: target,
    
      layers: [
        new TileLayer({
          source: new XYZ({
            url: mapUrl
          }),
        })
      ],
      view: new View({
        center: center,
        zoom: mapUrl === '../../../../assets/western/{z}/{x}/{y}.png'? 10: 17,
        maxZoom: mapUrl ==='../../../../assets/western/{z}/{x}/{y}.png'? 18 : undefined,
        minZoom: mapUrl ==='../../../../assets/western/{z}/{x}/{y}.png'? 8 : undefined,
      })
    });
    const marker = new Feature({ geometry: new Point(center) });
    marker.setStyle(new Style({
      image: new Icon({ src: '../../assets/buoyimg/buoy.png', scale: 0.04 })
    }));
    const circleFeature = new Feature({
      geometry: new Circle(center, warning),
    });
    circleFeature.setStyle(new Style({
      stroke: new Stroke({ color: 'yellow', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
    const circleFeature2 = new Feature({
      geometry: new Circle(center, danger),
    });
    circleFeature2.setStyle(new Style({
      stroke: new Stroke({ color: 'red', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
  
    const vectorSource = new VectorSource({ features: [marker, circleFeature, circleFeature2] });
    this.vectorLayer = new VectorLayer({ source: vectorSource });
  
    
    this.map.addLayer(this.vectorLayer);
  }
  

  destroyMap(): void {
    if (this.map) {
      this.map.setTarget(undefined);  // Detach the map from the DOM
      this.map = undefined;  // Clear the map instance
    }
  }
}
