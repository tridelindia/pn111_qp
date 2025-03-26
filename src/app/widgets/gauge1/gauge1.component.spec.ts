import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gauge1Component } from './gauge1.component';

describe('Gauge1Component', () => {
  let component: Gauge1Component;
  let fixture: ComponentFixture<Gauge1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gauge1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gauge1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
