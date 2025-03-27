import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-wave',
  standalone: true,
  imports: [],
  templateUrl: './wave.component.html',
  styleUrl: './wave.component.css'
})
export class WaveComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initOceanWaves();
  }

  initOceanWaves() {
    const canvas: any = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const waves = [
      { amplitude: 10, length: 0.01, speed: 0.02, color: 'rgba(0, 110, 255, 0.36)' },
      { amplitude: 15, length: 0.015, speed: 0.015, color: 'rgba(0, 140, 255, 0.41)' },
      { amplitude: 20, length: 0.02, speed: 0.01, color: 'rgba(0, 179, 255, 0.43)' },
      // { amplitude: 10, length: 0.03, speed: 0.018, color: 'rgba(0, 213, 255, 0.43)' },
    ];

    let increment = 0;

    function drawWaves(invert = false) {
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let i = 0; i < canvas.width; i++) {
          let y = canvas.height / 2 + Math.sin(i * wave.length + increment * wave.speed) * wave.amplitude;
          
          // Invert waves for reflection
          if (invert) {
            y = canvas.height - (y - canvas.height / 2) - 10; // Offset reflection slightly
          }
          
          ctx.lineTo(i, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        if (invert) {
          ctx.fillStyle = wave.color.replace('0.', '0.2'); // Make reflection fainter
        } else {
          ctx.fillStyle = wave.color;
        }

        ctx.fill();
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawWaves(); // Normal Waves
      drawWaves(true); // Reflected Waves

      increment += 1.5; // Adjust wave movement speed

      requestAnimationFrame(animate);
    }

    animate();
  }
}
