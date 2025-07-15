import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SunShineComponent } from './sun-shine.component';

describe('SunShineComponent', () => {
  let component: SunShineComponent;
  let fixture: ComponentFixture<SunShineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SunShineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SunShineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
