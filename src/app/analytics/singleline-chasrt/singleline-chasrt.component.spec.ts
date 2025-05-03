import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglelineChasrtComponent } from './singleline-chasrt.component';

describe('SinglelineChasrtComponent', () => {
  let component: SinglelineChasrtComponent;
  let fixture: ComponentFixture<SinglelineChasrtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglelineChasrtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglelineChasrtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
