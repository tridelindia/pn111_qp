import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLossChartComponent } from './data-loss-chart.component';

describe('DataLossChartComponent', () => {
  let component: DataLossChartComponent;
  let fixture: ComponentFixture<DataLossChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataLossChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataLossChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
