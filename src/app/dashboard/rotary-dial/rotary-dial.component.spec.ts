import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotaryDialComponent } from './rotary-dial.component';

describe('RotaryDialComponent', () => {
  let component: RotaryDialComponent;
  let fixture: ComponentFixture<RotaryDialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotaryDialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotaryDialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
