import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraSocketService {

  private socket: Socket;
  public readonly serverUrl: string = 'http://trideltechnologiesindia.com:5055';
  public latestImageData: any = null;
  public latestImageUrl: string = '';

  constructor(private ngZone: NgZone) {
    this.socket = io(
      this.serverUrl,
      {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000
      }
    );

    this.socket.on('connect', () => {
      console.log('Camera WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Camera WebSocket disconnected');
    });

    this.socket.on('camera:image', (data) => {
      this.latestImageData = data;
      this.latestImageUrl = this.getImageUrl(data);
    });

    // Fetch latest image immediately on startup
    this.fetchLatestImage();
  }

  private fetchLatestImage(): void {
    if (typeof fetch !== 'undefined') {
      fetch(`${this.serverUrl}/api/latest`)
        .then(res => res.json())
        .then(res => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            const latest = res.data[0];
            if (!this.latestImageUrl) {
              this.latestImageData = latest;
              this.latestImageUrl = this.getImageUrl(latest);
            }
          }
        })
        .catch(err => {
          console.warn('[CameraSocketService] Error fetching latest image:', err);
        });
    }
  }

  getImageUrl(data: any): string {
    if (!data) return '';
    if (typeof data === 'string') {
      return this.normalizeUrl(data);
    }
    if (data.imageUrl) {
      return this.normalizeUrl(data.imageUrl);
    }
    if (data.cameraId && data.date && data.folder && data.fileName) {
      return `${this.serverUrl}/images/${data.cameraId}/${data.date}/${data.folder}/${encodeURIComponent(data.fileName)}`;
    }
    return '';
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('data:image')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${this.serverUrl}${url}`;
    }
    // Replace any placeholder host (like camera-api.yourdomain.com) with the real server URL
    return url.replace(/https?:\/\/[^\/]+/, this.serverUrl);
  }

  onNewImage(): Observable<any> {
    return new Observable(observer => {
      // If we already have a cached image, emit it immediately
      if (this.latestImageData) {
        observer.next(this.latestImageData);
      }

      const handler = (data: any) => {
        this.ngZone.run(() => {
          this.latestImageData = data;
          this.latestImageUrl = this.getImageUrl(data);
          observer.next(data);
        });
      };

      this.socket.on('camera:image', handler);

      return () => {
        this.socket.off('camera:image', handler);
      };
    });
  }
}
