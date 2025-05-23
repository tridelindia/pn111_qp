import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleAxisComponent } from './single-axis.component';

describe('SingleAxisComponent', () => {
  let component: SingleAxisComponent;
  let fixture: ComponentFixture<SingleAxisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleAxisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
