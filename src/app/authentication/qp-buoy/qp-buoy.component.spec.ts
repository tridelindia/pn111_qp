import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QpBuoyComponent } from './qp-buoy.component';

describe('QpBuoyComponent', () => {
  let component: QpBuoyComponent;
  let fixture: ComponentFixture<QpBuoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QpBuoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QpBuoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
