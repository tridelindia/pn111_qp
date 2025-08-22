import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoeccReportComponent } from './moecc-report.component';

describe('MoeccReportComponent', () => {
  let component: MoeccReportComponent;
  let fixture: ComponentFixture<MoeccReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoeccReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoeccReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
