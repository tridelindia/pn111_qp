import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataHealthComponent } from './data-health.component';

describe('DataHealthComponent', () => {
  let component: DataHealthComponent;
  let fixture: ComponentFixture<DataHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataHealthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
