import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorStatsComponent } from './sensor-stats.component';

describe('SensorStatsComponent', () => {
  let component: SensorStatsComponent;
  let fixture: ComponentFixture<SensorStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
