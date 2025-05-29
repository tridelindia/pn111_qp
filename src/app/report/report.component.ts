import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BuoyMeasurement, Metrological, ReportService } from './report.service';
import {
  StationConfigs,
  StationconfigService,
} from '../home/homeService/stationconfig.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Column {
  field: string;
  header: string;
  unit?: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    DrawerModule,
    TableModule,
    MultiSelectModule,
    SelectModule,
    DatePickerModule,
    SelectButtonModule,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  providers: [ReportService],
})
export class ReportComponent implements OnInit {
  loading: boolean = false;

  fetchedBuoys: StationConfigs[] = [];
  selectedBuoy!: StationConfigs;

  sensorData!: BuoyMeasurement[];
  metrological!: [];
  oceanographic!: [];
  waterQuality!: [];

  dynaColumns!: Column[];
  selectedColumns!: Column[];
  globalFilterFields!: string[];
  searchQuery: string = '';

  selectedOption: string = 'sensorData';
  options = [
    { label: 'All Sensors', value: 'sensorData', icon: 'fa fas-database' },
    { label: 'Meteorology', value: 'metrological', icon: 'pi pi-cloud' },
    { label: 'Oceanographic', value: 'oceanographic', icon: 'pi pi-globe' },
    { label: 'WaterQuality', value: 'waterQuality', icon: 'pi pi-umbrella' },
  ];

  periodOptions = [
    { label: 'Date Range', value: 'date' },
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
    { label: 'Yearly', value: 'year' },
  ];

  selectedPeriod: string = 'date';
  selectedDate: Date = new Date(); // for week/month/year
  // fromDateModel: Date = new Date(); // for date range
  // toDateModel: Date = new Date(); // for date range
  rangeDates: Date[] = [new Date(), new Date()]; // optional initial values

  fromDate!: string;
  toDate!: string;

  exportOptions = [
    { label: 'Export to CSV', value: 'csv' },
    { label: 'Export to Excel', value: 'excel' },
    { label: 'Export to PDF', value: 'pdf' },
  ];
  nameOfStation!: string;

  constructor(
    private reportService: ReportService,
    private stationConfig: StationconfigService
  ) {}

  ngOnInit(): void {
    this.stationConfig.getStationNames().subscribe((data) => {
      this.fetchedBuoys = data;
      console.log('fetchedBuoys', this.fetchedBuoys);

      if (this.fetchedBuoys.length > 0) {
        this.selectedBuoy = this.fetchedBuoys[0];
        this.nameOfStation = this.selectedBuoy.station_name;
      }
      console.log('selectedBuoy', this.selectedBuoy);

      this.onOptionChange();
      this.setView(this.selectedPeriod);
    });
  }

  // formatDateTime(date: Date): string {
  //   return date.toISOString().slice(0, 19); // 'YYYY-MM-DDTHH:mm:ss'
  // }

  formatDateTime(date: Date): string {
    // Convert to 'yyyy-MM-dd HH:mm:ss' or whatever your backend expects, in IST
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  setView(view: string) {
    this.selectedPeriod = view;

    if (view === 'date') {
      if (this.rangeDates && this.rangeDates.length === 2) {
        const start = this.rangeDates[0];
        const end = this.rangeDates[1];

        this.fromDate = this.formatDateTime(new Date(start.setHours(0, 0, 0)));
        this.toDate = this.formatDateTime(new Date(end.setHours(23, 59, 59)));

        this.fetchDataByDate2();
      }
    } else if (view === 'week') {
      if (this.selectedDate) {
        const startOfWeek = new Date(this.selectedDate);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekEndDate = this.getWeekEndDate(startOfWeek);

        this.fromDate = this.formatDateTime(startOfWeek);
        this.toDate = this.formatDateTime(weekEndDate);

        this.fetchDataByDate2();
      } else {
        console.warn('No week selected');
      }
    } else if (view === 'month') {
      const d = new Date(this.selectedDate);
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      this.fromDate = this.formatDateTime(new Date(firstDay.setHours(0, 0, 0)));
      this.toDate = this.formatDateTime(new Date(lastDay.setHours(23, 59, 59)));
    } else if (view === 'year') {
      const d = new Date(this.selectedDate);
      const firstDay = new Date(d.getFullYear(), 0, 1);
      const lastDay = new Date(d.getFullYear(), 11, 31);

      this.fromDate = this.formatDateTime(new Date(firstDay.setHours(0, 0, 0)));
      this.toDate = this.formatDateTime(new Date(lastDay.setHours(23, 59, 59)));
    }

    this.fetchDataByDate2();
  }

  fetchDataByDate2() {
    if (!this.fromDate || !this.toDate || !this.selectedBuoy?.station_id) {
      console.warn('Missing required filters: date or buoy not selected');
      return;
    }

    this.reportService
      .getSensorDataByStationAndDate(
        this.selectedBuoy.station_id,
        this.fromDate,
        this.toDate
      )
      .subscribe(
        (data: any[]) => {
          console.log('Filtered data by buoy and date:', data);
          this.sensorData = data.map((d) => ({
            ...d,
            timestampFormatted: this.formatDate(d.timestamp),
            datetimeFormatted: this.formatDate(d.datetime),
          }));
        },
        (error) => {
          console.error('Error fetching filtered data:', error);
        }
      );
    console.log('Data fetching for table');
    console.log('selectedBuoy', this.selectedBuoy);
    console.log('fromDate', this.fromDate);
    console.log('toDate', this.toDate);
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  getWeekEndDate(startDate: Date): Date {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the week end
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  onSearch(query: string, dt: any): void {
    this.searchQuery = query;
    dt.filterGlobal(query, 'contains');
  }

  highlightSearchText(value: any): string {
    if (!this.searchQuery) return value;

    // Ensure the value is treated as a string
    const stringValue =
      value !== null && value !== undefined ? String(value) : '';
    const escapedSearchQuery = this.searchQuery.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    const regex = new RegExp(`(${escapedSearchQuery})`, 'gi');
    return stringValue.replace(regex, '<span class="highlight">$1</span>');
  }

  rowMatchesSearch(rowData: any, columns: any[]): boolean {
    if (!this.searchQuery) return false;

    const search = this.searchQuery.toLowerCase();

    return columns.some((col) => {
      const value = rowData[col.field];
      return (
        value !== null &&
        value !== undefined &&
        String(value).toLowerCase().includes(search)
      );
    });
  }

  onOptionChange(): void {
    if (this.selectedOption === 'sensorData') {
      this.dynaColumns = [
        { field: 'wind_speed', header: 'Wind Speed', unit: 'm/s' },
        { field: 'wind_direction_deg', header: 'Wind Direction', unit: '°' },
        { field: 'wind_gust', header: 'Wind Gust', unit: 'm/s' },
        { field: 'temperature_deg', header: 'Air Temperature', unit: '°C' },
        { field: 'rh_percent', header: 'Relative Humidity', unit: '%' },
        { field: 'bp_hpa', header: 'Barometric Pressure', unit: 'hPa' },
        { field: 'rain_mm', header: 'Rainfall', unit: 'mm' },
        { field: 'visibility', header: 'Visibility', unit: 'km' },
        { field: 'global_radiation', header: 'Radiation', unit: 'W/m²' },
 
        { field: 'wave_heading', header: 'Wave Heading', unit: '°' },
        { field: 'wave_height', header: 'Wave Height', unit: 'm' },
        { field: 'tzc', header: 'Peak Wave Period', unit: 's' },
        { field: 'tz', header: 'Zero Crossing Period', unit: 's' },
        { field: 'tm02', header: 'Average Wave Period', unit: 's' },
        { field: 'wave_direction', header: 'Wave Direction', unit: '°' },
        {
          field: 'wave_direction_fw',
          header: 'Wave Direction FW',
          unit: '°',
        },
        {
          field: 'mean_wave_direction',
          header: 'Mean Wave Direction',
          unit: '°',
        },
        { field: 'hmax', header: 'Max Wave Height', unit: 'm' },
        {
          field: 'fourier_coefficient_a1',
          header: 'Fourier Coefficient a1',
          unit: '',
        },
        {
          field: 'fourier_coefficient_b1',
          header: 'Fourier Coefficient b1',
          unit: '',
        },
        {
          field: 'fourier_coefficient_a2',
          header: 'Fourier Coefficient a2',
          unit: '',
        },
        {
          field: 'fourier_coefficient_b2',
          header: 'Fourier Coefficient b2',
          unit: '',
        },
        {
          field: 'dominant_time_period_fw',
          header: 'Dominant Time Period FW',
          unit: 's',
        },
        { field: 'havg', header: 'Average Wave Height', unit: 'm' },
 
        { field: 'turbidity', header: 'Turbidity', unit: 'NTU' },
        { field: 'water_temperature', header: 'Water Temperature', unit: '°C' },
        { field: 'ph', header: 'Potential of Hydrogen', unit: 'pH' },
        { field: 'conductivity', header: 'Conductivity', unit: 'µS/cm' },
        { field: 'dissolved_oxygen', header: 'Dissolved Oxygen', unit: 'mg/L' },
        { field: 'salinity', header: 'Salinity', unit: 'ppt' },
        {
          field: 'chlorophyll_a',
          header: 'Chlorophyll-a',
          unit: 'µg/L',
        },
        { field: 'phycoerythrin', header: 'Phycoerythrin', unit: 'µg/L' },
        { field: 'fluorescein_dye', header: 'Fluorescein Dye', unit: 'ppb' },
        { field: 'pah', header: 'PAH', unit: 'ppb' },
        { field: 'oil_in_water', header: 'Oil in Water', unit: 'ppb' },
        { field: 'bt', header: 'Bottom Temperature', unit: '°C' },
      ];
 

      // Add current bins (1–10)
      for (let i = 1; i <= 4; i++) {
        this.dynaColumns.push(
          {
            field: `current_speed_bin_${i}`,
            header: `Current Speed Bin ${i}`,
            unit: 'm/s',
          },
          {
            field: `current_direction_bin_${i}`,
            header: `Current Direction Bin ${i}`,
            unit: '°',
          }
        );
      }

      this.selectedColumns = this.dynaColumns;
      this.globalFilterFields = [
        'id',
        'station_id',
        'timestampFormatted',
        'datetimeFormatted',
        'battery',
        'lat',
        'lon',
        ...this.dynaColumns.map((col) => col.field),
      ];
      console.log('Allsensordyna', this.globalFilterFields);
    } else if (this.selectedOption === 'metrological') {
      // this.dataSource = this.metrological;
      this.dynaColumns = [
        { field: 'wind_speed', header: 'Wind Speed', unit: 'm/s' },
        { field: 'wind_direction_deg', header: 'Wind Direction', unit: '°' },
        { field: 'wind_gust', header: 'Wind Gust', unit: 'm/s' },
        { field: 'temperature_deg', header: 'Temperature', unit: '°C' },
        { field: 'rh_percent', header: 'Relative Humidity', unit: '%' },
        { field: 'bp_hpa', header: 'Barometric Pressure', unit: 'hPa' },
        { field: 'global_radiation', header: 'Radiation', unit: '' },
        { field: 'rain_mm', header: 'Rainfall', unit: 'mm' },
        { field: 'visibility', header: 'Visibility', unit: 'nm' },
      ];
      this.selectedColumns = this.dynaColumns;
      this.globalFilterFields = this.dynaColumns.map((col) => col.field);
      console.log('metrological dyna', this.globalFilterFields);
    } else if (this.selectedOption === 'oceanographic') {
      // this.dataSource = this.oceanographic;
      this.dynaColumns = [
        // { field: 'motion', header: 'Motion', unit: '' },
        { field: 'wave_heading', header: 'Wave_Heading', unit: '°' },
        { field: 'wave_height', header: 'Wave Height', unit: 'm' },
        {
          field: 'tzc',
          header: 'Tzc',
          unit: 's',
        },
        { field: 'tz', header: 'Tz', unit: 's' },
        { field: 'tm02', header: 'Tm02', unit: 's' },
        { field: 'wave_direction', header: 'Wave Direction', unit: '°' },
        {
          field: 'wave_direction_fw',
          header: 'Wave Direction FW',
          unit: '°',
        },
        {
          field: 'mean_wave_direction',
          header: 'Mean Wave Direction',
          unit: '°',
        },
        { field: 'hmax', header: 'Max Wave Height', unit: 'm' },
        { field: 'fourier_coefficient_a1', header: 'Fourier Coefficient a1' },
        { field: 'fourier_coefficient_b1', header: 'Fourier Coefficient b1' },
        { field: 'fourier_coefficient_a2', header: 'Fourier Coefficient a2' },
        { field: 'fourier_coefficient_b2', header: 'Fourier Coefficient b2' },
        {
          field: 'dominant_time_period_fw',
          header: 'Dominant Time Period FW',
          unit: 's',
        },
        { field: 'havg', header: 'Havg', unit: 'm' },
      ];
      for (let i = 1; i <= 10; i++) {
        this.dynaColumns.push(
          {
            field: `current_speed_bin_${i}`,
            header: `Current Speed Bin ${i}`,
            unit: 'm/s',
          },
          {
            field: `current_direction_bin_${i}`,
            header: `Current Direction Bin ${i}`,
            unit: '°',
          }
        );
      }
      this.selectedColumns = this.dynaColumns;
      this.globalFilterFields = this.dynaColumns.map((col) => col.field);
      console.log('oceanographic dyna', this.globalFilterFields);
    } else if (this.selectedOption === 'waterQuality') {
      // this.dataSource = this.waterQuality;
      this.dynaColumns = [
        // Manta 40+ sensors
        { field: 'turbidity', header: 'Turbidity', unit: 'NTU' },
        { field: 'water_temperature', header: 'Water Temperature', unit: '°C' },
        { field: 'ph', header: 'pH', unit: '' },
        { field: 'conductivity', header: 'Conductivity', unit: 'µS/cm' },
        {
          field: 'dissolved_oxygen',
          header: 'Dissolved Oxygen',
          unit: 'mg/L',
        },
        { field: 'salinity', header: 'Salinity', unit: 'ppt' },
        {
          field: 'chlorophyll_a',
          header: 'Chlorophyll-a',
          unit: 'µg/L',
        },
        {
          field: 'phycoerythrin',
          header: 'Phycoerythrin',
          unit: 'µg/L',
        },
        {
          field: 'fluorescein_dye',
          header: 'Fluorescein Dye',
          unit: 'ppb',
        },

        // MicroFlu V2 HC sensors
        { field: 'pah', header: 'PAH', unit: 'ppb' },
        { field: 'oil_in_water', header: 'Oil in Water', unit: 'ppb' },
        { field: 'bt', header: 'BT', unit: 'ppb' },
      ];

      this.selectedColumns = this.dynaColumns;
      this.globalFilterFields = this.dynaColumns.map((col) => col.field);
      console.log('waterQuality dyna', this.globalFilterFields);
    }
  }

  onExportOptionSelect(event: any, dt2: any) {
    const selectedOption = event.value;
    switch (selectedOption) {
      case 'csv':
        this.exportCSV(dt2);
        break;
      case 'excel':
        this.exportExcel(dt2);
        break;
      case 'pdf':
        this.exportPDF(dt2);
        break;
      default:
        break;
    }
  }

  exportCSV(dt: any) {
    const filteredData = dt.filteredValue || dt.value;

    if (filteredData && filteredData.length > 0) {
      const csv = this.convertToCSV(filteredData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(blob, `${this.nameOfStation}.csv`);
    } else {
      // Handle case where no data is available
      //console.warn('No data available for CSV export');
    }
  }

  // Helper method to convert JSON to CSV format
  convertToCSV(data: any[]): string {
    const fixedHeaders = [
      'S No',
      'station_id',
      'timestamp',
      'datetime',
      'battery',
      'lat',
      'lon',
    ];
    const fixedFields = [
      'station_id',
      'timestamp',
      'datetime',
      'battery',
      'lat',
      'lon',
    ];

    const dynamicHeaders = this.selectedColumns.map((col) => col.header);
    const dynamicFields = this.selectedColumns.map((col) => col.field);

    const headers = [...fixedHeaders, ...dynamicHeaders];
    const fields = [...fixedFields, ...dynamicFields];

    const csvRows = [
      headers.join(','), // Header row
      ...data.map((row, index) =>
        [
          index + 1, // Serial number
          ...fields.map((field) => {
            if (field === 'Date') {
              const isoDate = row[field];
              return isoDate ? isoDate.split('T')[0] : '';
            }
            if (field === 'Time') {
              const isoTime = row[field];
              return isoTime ? isoTime.split('T')[1]?.split('.')[0] : '';
            }
            return row[field] || '';
          }),
        ]
          .map((cell) => `"${cell}"`)
          .join(',')
      ),
    ];

    return csvRows.join('\r\n');
  }

  exportExcel(dt: any, fileName?: string) {
    const filteredData = dt.value;

    if (filteredData && filteredData.length > 0) {
      const fixedHeaders = [
        'S No',
        'station_id',
        'timestamp',
        'datetime',
        'battery',
        'lat',
        'lon',
      ];
      const fixedFields = [
        'station_id',
        'timestamp',
        'datetime',
        'battery',
        'lat',
        'lon',
      ];

      const dynamicHeaders = this.selectedColumns.map((col) => col.header);
      const dynamicFields = this.selectedColumns.map((col) => col.field);

      const headers = [...fixedHeaders, ...dynamicHeaders];
      const fields = [...fixedFields, ...dynamicFields];

      const dataToExport = filteredData.map((row: any, index: number) => {
        const selectedRow: any = {};

        selectedRow['S No'] = index + 1; // 👈 Set serial number here

        fixedFields.forEach((field) => {
          if (field === 'Date') {
            const isoDate = row['Date'];
            selectedRow[field] = isoDate ? isoDate.split('T')[0] : '';
          } else if (field === 'Time') {
            const isoTime = row['Time'];
            selectedRow[field] = isoTime
              ? isoTime.split('T')[1]?.split('.')[0]
              : '';
          } else {
            selectedRow[field] = row[field];
          }
        });

        dynamicFields.forEach((field) => {
          selectedRow[field] = row[field];
        });

        return selectedRow;
      });

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
        dataToExport,
        {}
      );

      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const finalName = fileName || this.nameOfStation;
      this.saveAsExcelFile(excelBuffer, finalName);
    }
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}.xlsx`);
  }

  exportPDF(dt: any) {
    const filteredData: any[] = dt.value;

    if (filteredData && filteredData.length > 0) {
      const fixedHeaders = [
        'S No',
        'station_id',
        'timestamp',
        'datetime',
        'battery',
        'lat',
        'lon',
      ];
      const fixedFields = [
        'station_id',
        'timestamp',
        'datetime',
        'battery',
        'lat',
        'lon',
      ];

      const dynamicHeaders = this.selectedColumns.map((col) => col.header);
      const dynamicFields = this.selectedColumns.map((col) => col.field);

      const chunkSize = 10; // Adjust based on how many columns fit per page

      const doc = new jsPDF('landscape');

      for (let i = 0; i < dynamicFields.length; i += chunkSize) {
        const chunkHeaders = dynamicHeaders.slice(i, i + chunkSize);
        const chunkFields = dynamicFields.slice(i, i + chunkSize);

        const headers = [...fixedHeaders, ...chunkHeaders];
        const fields = [...fixedFields, ...chunkFields];

        const data = filteredData.map((row: any, index: number) => {
          const rowData = [index + 1]; // S No
          fields.forEach((field) => {
            if (field === 'Date') {
              const isoDate = row[field];
              rowData.push(isoDate ? isoDate.split('T')[0] : '');
            } else if (field === 'Time') {
              const isoTime = row[field];
              rowData.push(isoTime ? isoTime.split('T')[1]?.split('.')[0] : '');
            } else {
              rowData.push(row[field] ?? '');
            }
          });
          return rowData;
        });

        autoTable(doc, {
          head: [headers],
          body: data,
          startY: (doc as any).lastAutoTable
            ? (doc as any).lastAutoTable.finalY + 10
            : 10,

          styles: {
            fontSize: 7,
            cellPadding: 1,
            overflow: 'linebreak',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            halign: 'center',
            fontSize: 8,
          },
          bodyStyles: {
            halign: 'center',
          },
          columnStyles: {
            0: { cellWidth: 10 }, // S No
          },
          pageBreak: 'auto',
          showHead: 'everyPage',
        });

        // Add new page if more chunks remain
        if (i + chunkSize < dynamicFields.length) {
          doc.addPage();
        }
      }

      doc.save(`${this.nameOfStation}.pdf`);
    } else {
      console.warn('No data available for PDF export');
    }
  }

  quickExportByRange(dt: any, exportType: 'Daily' | 'Monthly' | 'Yearly') {
    const now = new Date();
    let fromDate: string = '';
    let toDate: string = '';

    if (exportType === 'Daily') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      fromDate = this.formatDateTime(start);
      toDate = this.formatDateTime(end);
    } else if (exportType === 'Monthly') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      fromDate = this.formatDateTime(new Date(firstDay.setHours(0, 0, 0)));
      toDate = this.formatDateTime(new Date(lastDay.setHours(23, 59, 59)));
    } else if (exportType === 'Yearly') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      fromDate = this.formatDateTime(new Date(firstDay.setHours(0, 0, 0)));
      toDate = this.formatDateTime(new Date(lastDay.setHours(23, 59, 59)));
    }

    if (!this.selectedBuoy?.station_id) {
      console.warn('Buoy not selected');
      return;
    }
    console.log('Exporting for station:', this.selectedBuoy.station_id);
    console.log('From Date:', fromDate);
    console.log('To Date:', toDate);
    this.reportService
      .getSensorDataByStationAndDate(
        this.selectedBuoy.station_id,
        fromDate,
        toDate
      )
      .subscribe(
        (data) => {
          if (!data || data.length === 0) {
            console.warn('No data available for export.');
            return;
          }

          // Set filtered data to the table's value
          dt.value = data;

          // Trigger export
          this.exportExcel(dt, `${this.nameOfStation}_${exportType}`);
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
}
