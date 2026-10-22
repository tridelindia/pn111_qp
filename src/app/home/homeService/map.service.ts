import { Injectable } from '@angular/core';
import { Feature, Map, View } from 'ol';
import { Circle, Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { getDistance } from 'ol/sphere';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import Overlay from 'ol/Overlay';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public map!: Map;
  private vectorLayer!: VectorLayer;
  private tooltipOverlay!: Overlay;

  initializeMap(
    targetId: string,
    center: [number, number],
    zoom: number,
    mapUrl: string
  ): void {
    if (this.map) {
      return;
    }

    const vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({ source: vectorSource });

    this.map = new Map({
      view: new View({
        center,
        zoom:
          mapUrl === '../../../../assets/western/{z}/{x}/{y}.png' ? 10 : zoom,
        maxZoom:
          mapUrl === '../../../../assets/western/{z}/{x}/{y}.png'
            ? 14
            : undefined,
        minZoom:
          mapUrl === '../../../../assets/western/{z}/{x}/{y}.png'
            ? 8
            : undefined,
      }),

      layers: [
        new TileLayer({
          source: new XYZ({ url: mapUrl }),
        }),
        this.vectorLayer,
      ],
      target: targetId,
    });

    // Tooltip element from DOM
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.backgroundColor = 'white';
    tooltipElement.style.padding = '4px 8px';
    tooltipElement.style.border = '1px solid black';
    tooltipElement.style.borderRadius = '4px';
    tooltipElement.style.whiteSpace = 'nowrap';
    tooltipElement.style.pointerEvents = 'none';
    tooltipElement.style.display = 'none'; // hide initially

    this.tooltipOverlay = new Overlay({
      element: tooltipElement,
      offset: [10, 0],
      positioning: 'bottom-left',
    });

    this.map.addOverlay(this.tooltipOverlay);

    // Hover event
    this.map.getViewport().addEventListener('pointermove', (event) => {
      const pixel = this.map.getEventPixel(event);
      const feature = this.map.forEachFeatureAtPixel(pixel, (feat) => feat);

      if (feature && feature.get('stationId')) {
        tooltipElement.style.display = 'block';
        tooltipElement.innerHTML = `${feature.get('stationId')}`;

        const coordinate = this.map.getEventCoordinate(event);
        this.tooltipOverlay.setPosition(coordinate);
        this.map.getTargetElement().style.cursor = 'pointer';
      } else {
        tooltipElement.style.display = 'none';
        this.tooltipOverlay.setPosition(undefined);
        this.map.getTargetElement().style.cursor = '';
      }
    });
  }

  destroyMap(): void {
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = undefined as unknown as Map;
    }
  }

  updateMapLayer(url: string): void {
    if (!this.map) {
      return;
    }
    const tileLayer = this.map
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof TileLayer) as TileLayer;
    if (tileLayer) {
      tileLayer.setSource(new XYZ({ url }));
    }
  }

  addMarker(
    coordinate: [number, number],
    name: string,
    stationId: string,
    img: string
  ): void {
    if (!this.vectorLayer) return;
    const vectorSource = this.vectorLayer.getSource() as VectorSource;
    if (!vectorSource) return;

    const markerStyle = new Style({
      image: new Icon({
        src: img,
        scale: 0.06,
      }),
      text: new Text({
        font: '15px Calibri,sans-serif',
        text: name,
        offsetY: -30,
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
      }),
    });

    const marker = new Feature({
      name,
      stationId,
      geometry: new Point(coordinate),
    });
    marker.setStyle(markerStyle);
    vectorSource.addFeature(marker);
  }

  updateMarker(
    coordinate: [number, number],
    name: string,
    stationId: string,
    img: string
  ): void {
    if (!this.vectorLayer) return;
    const vectorSource = this.vectorLayer.getSource() as VectorSource;
    if (!vectorSource) return;

    const features = vectorSource.getFeatures();
    const existingFeature = features.find(
      (f: any) =>
        f.get('stationId') === stationId ||
        f.get('name') === name ||
        (f.get('stationId') && f.get('stationId').toLowerCase() === stationId.toLowerCase())
    );

    if (existingFeature) {
      const geom = existingFeature.getGeometry() as Point;
      if (geom && typeof geom.setCoordinates === 'function') {
        geom.setCoordinates(coordinate);
      }
      if (img) {
        const markerStyle = new Style({
          image: new Icon({
            src: img,
            scale: 0.06,
          }),
          text: new Text({
            font: '15px Calibri,sans-serif',
            text: name,
            offsetY: -30,
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
          }),
        });
        existingFeature.setStyle(markerStyle);
      }
    } else {
      this.addMarker(coordinate, name, stationId, img);
    }
  }

  addCircle(center: [number, number], radius: number, color: string): void {
    if (!center || !radius || isNaN(radius) || radius <= 0) return;
    if (!this.vectorLayer) return;
    const vectorSource = this.vectorLayer.getSource() as VectorSource;
    if (!vectorSource) return;

    const circleFeature = new Feature({
      geometry: new Circle(center, radius),
    });

    const circleStyle = new Style({
      stroke: new Stroke({ color, width: 2 }),
      fill: new Fill({ color: color === 'red' ? 'rgba(231, 76, 60, 0.08)' : 'rgba(241, 196, 15, 0.08)' }),
    });
    circleFeature.setStyle(circleStyle);
    vectorSource.addFeature(circleFeature);
  }

  checkBuoyRange(
    markerCoords: [number, number],
    center: [number, number],
    wrange: number,
    drange: number,
    buoyName: string
  ): string {
    // const formatDis = this.formatDistance(drange);
    const getDis = getDistance(center, markerCoords);
    if (getDis <= wrange) {
      return 'Inrange';
    } else if (getDis > wrange && getDis <= drange) {
      return 'Warning Range';
    } else if (getDis > drange) {
      return 'Danger Range';
    } else {
      return 'No Range';
    }
    console.log('sadsdadasdasd', getDis);
  }
  // formatDistance(distance: number) {
  //   return distance.toFixed(14);
  // }

  registerClickListener(callback: (feature: Feature) => void): void {
    if (!this.map) {
      return;
    }
    this.map.on('click', (event) => {
      let clicked = false;
      this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
        if (feature instanceof Feature) {
          callback(feature);
          clicked = true;
        }
      });
      if (!clicked) {
        console.log('No feature clicked at this location.');
      }
    });
  }
}
