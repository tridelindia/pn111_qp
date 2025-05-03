import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAxisComponent } from './multi-axis.component';

describe('MultiAxisComponent', () => {
  let component: MultiAxisComponent;
  let fixture: ComponentFixture<MultiAxisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiAxisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
