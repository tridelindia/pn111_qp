import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorStatusComponent } from './sensor-status.component';

describe('SensorStatusComponent', () => {
  let component: SensorStatusComponent;
  let fixture: ComponentFixture<SensorStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
