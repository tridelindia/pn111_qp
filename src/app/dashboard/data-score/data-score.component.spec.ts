import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataScoreComponent } from './data-score.component';

describe('DataScoreComponent', () => {
  let component: DataScoreComponent;
  let fixture: ComponentFixture<DataScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
