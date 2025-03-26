import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-direction3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direction3.component.html',
  styleUrl: './direction3.component.css'
})
export class Direction3Component implements OnInit{
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
