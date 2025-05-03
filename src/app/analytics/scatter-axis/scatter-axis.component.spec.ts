import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterAxisComponent } from './scatter-axis.component';

describe('ScatterAxisComponent', () => {
  let component: ScatterAxisComponent;
  let fixture: ComponentFixture<ScatterAxisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterAxisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
