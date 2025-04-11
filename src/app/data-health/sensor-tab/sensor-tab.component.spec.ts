import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTabComponent } from './sensor-tab.component';

describe('SensorTabComponent', () => {
  let component: SensorTabComponent;
  let fixture: ComponentFixture<SensorTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
