import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Direction3Component } from './direction3.component';

describe('Direction3Component', () => {
  let component: Direction3Component;
  let fixture: ComponentFixture<Direction3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Direction3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Direction3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
