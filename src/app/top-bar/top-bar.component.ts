import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-top-bar',
    imports: [FormsModule],
    standalone:true,
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit {
    @Output() stationSelected = new EventEmitter<string>();
    screen!: string;
    selectedStation: string = 'all';

    ngOnInit(): void {
        const scren = this.getScreenSize();
        this.screen = `${scren.width},${scren.height}`;
    }

    getScreenSize() {
        return { width: window.innerWidth, height: window.innerHeight };
    }

    onStationChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.selectedStation = select.value;
        this.stationSelected.emit(this.selectedStation);
    }
}
