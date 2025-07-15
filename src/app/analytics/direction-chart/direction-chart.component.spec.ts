import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionChartComponent } from './direction-chart.component';

describe('DirectionChartComponent', () => {
  let component: DirectionChartComponent;
  let fixture: ComponentFixture<DirectionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
