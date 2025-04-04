import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-top-bar',
    imports: [],
    standalone:true,
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit{
    screen!:string;
    ngOnInit(): void {
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;
    }
    getScreenSize() {
        return { width: window.innerWidth, height: window.innerHeight };
      }
}
