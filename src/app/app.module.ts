import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { RadialGaugeComponent } from './widgets/radial-guage/radial-guage.component';
import { AgChartsModule, AgGauge } from 'ag-charts-angular';
import { Direction1Component } from './widgets/direction1/direction1.component';
// import { CompassChartComponent } from './compass-chart/compass-chart.component';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ToastrModule.forRoot({}),
    HttpClientModule,
    // AgChartsModule,
    NgxEchartsModule.forRoot({echarts: () => import('echarts')})

    // CompassChartComponent
  ],
  providers: [
    AuthService,
    { provide: NGX_ECHARTS_CONFIG, useValue: { echarts: () => import('echarts') } }
  ],
  bootstrap: [AppComponent],
  exports:[] 
})
export class AppModule {}