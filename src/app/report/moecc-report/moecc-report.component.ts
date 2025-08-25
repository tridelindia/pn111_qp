import {
  Component,
  OnInit,
  viewChild,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  BuoyMeasurement,
  Metrological,
  ReportService,
} from '../report.service';
import { DialogModule } from 'primeng/dialog';
import {
  StationConfigs,
  StationconfigService,
} from '../../home/homeService/stationconfig.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DropdownModule } from 'primeng/dropdown';
import { SensorModel } from '../../models/station.model';
import { forkJoin } from 'rxjs';

interface Column {
  field: string;
  header: string;
  unit?: string;
}

@Component({
  selector: 'app-moecc-report',
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
    DropdownModule,
    DialogModule,
  ],
  templateUrl: './moecc-report.component.html',
  styleUrl: './moecc-report.component.css',
  providers: [ReportService],
})
export class MoeccReportComponent implements OnInit {
  loading: boolean = false;
  is_meteorology: boolean = true;
  fetchedBuoys: StationConfigs[] = [];
  @ViewChild('stationReportWrapper')
  stationReportWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('stationReportContent')
  stationReportContent!: ElementRef<HTMLDivElement>;
  isDownloadingWQ: boolean = false;
  selectedBuoy!: StationConfigs;
  selectedBuoys: StationConfigs[] = [];
  selectedBuoysLabel: string = '';

  sensorData!: BuoyMeasurement[];
  metrological!: [];
  oceanographic!: [];
  waterQuality!: [];
  selectedExportOption: any = null;

  dynaColumns!: Column[];
  selectedColumns!: Column[];
  globalFilterFields!: string[];
  searchQuery: string = '';

  paramUnits: SensorModel[] = [];

  selectedOption: string = 'sensorData';
  options = [
    { label: 'All Sensors', value: 'sensorData', icon: 'fa fas-database' },
    { label: 'Meteorology', value: 'meteorology', icon: 'pi pi-cloud' },
    { label: 'Oceanography', value: 'oceanography', icon: 'pi pi-globe' },
    { label: 'Water Quality', value: 'water_quality', icon: 'pi pi-umbrella' },
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

  // MOECC modal state and data
  moeccVisible: boolean = false;
  moeccRows: any[] = [];
  moeccWindMin: number = 0;
  moeccWindMax: number = 0;
  moeccTempMin: number = 0;
  moeccTempMax: number = 0;
  // Per-station breakdown for multi-station selection
  moeccStations: Array<{
    station_id: string;
    station_name?: string;
    hours: number[];
    rows: any[];
    windMin: number;
    windMax: number;
    tempMin: number;
    tempMax: number;
  }> = [];

  // Hour interval selection
  selectedHourInterval: number = 6;
  hourIntervalOptions = [
    { label: '1 hr', value: 1 },
    { label: '2 hrs', value: 2 },
    { label: '3 hrs', value: 3 },
    { label: '6 hrs', value: 6 },
  ];
  // Computed hours used by MOECC grid
  moeccHours: number[] = [0, 6, 12, 18];
  selectedRowData: any = null;

  // Station WQ Report modal state
  stationReportVisible: boolean = false;
  stationReportLoading: boolean = false;
  stationReportRows: Array<{
    station_id: string;
    station_name?: string;
    date: string; // e.g., 06 July 2023
    oil_in_water_avg: number | null;
    chlorophyll_a_avg: number | null;
  }> = [];

  oilThreshold: number = 0.5;
  chlThreshold: number = 0.5;

  // Guideline rows for Station WQ Report header (rendered in template)
  guidelineRows: any[] = [];

  constructor(
    private reportService: ReportService,
    private stationConfig: StationconfigService,
    private paramUnitsService: StationconfigService
  ) {}
  @ViewChild('dt') dt: any;

  ngOnInit(): void {
    this.paramUnitsService.getSensorConfig().subscribe((paramUnits) => {
      this.paramUnits = paramUnits;
      console.log('Sensor Config units: ', this.paramUnits);

      this.onOptionChange();
      this.findAndSetThresholds();
    });

    this.stationConfig.getStationNames().subscribe((data) => {
      this.fetchedBuoys = data;
      console.log('fetchedBuoys', this.fetchedBuoys);

      if (this.fetchedBuoys.length > 0) {
        this.selectedBuoy = this.fetchedBuoys[0];
        this.selectedBuoys = [this.fetchedBuoys[0]]; // Initialize with first station
        this.nameOfStation = this.selectedBuoy.station_name;
        this.updateSelectedBuoysLabel();
      }
      console.log('selectedBuoy', this.selectedBuoy);

      this.onOptionChange();
      this.setView(this.selectedPeriod);
    });
  }

  private findAndSetThresholds(): void {
    if (!this.paramUnits || !Array.isArray(this.paramUnits)) return;

    // Find chlorophyll_a parameter
    const chlorophyllParam = this.paramUnits.find(
      (param) => param.param_name === 'chlorophyll_a'
    );

    // Find oil_in_water parameter
    const oilParam = this.paramUnits.find(
      (param) => param.param_name === 'oil_in_water'
    );

    // Set chlorophyll threshold based on priority order
    if (chlorophyllParam) {
      this.chlThreshold = this.getThresholdValue(chlorophyllParam);
      console.log('Chlorophyll threshold set to:', this.chlThreshold);
    }

    // Set oil threshold based on priority order
    if (oilParam) {
      this.oilThreshold = this.getThresholdValue(oilParam);
      console.log('Oil threshold set to:', this.oilThreshold);
    }

    // Build guideline rows for template usage
    this.computeGuidelineRows();
  }

  private getThresholdValue(param: any): number {
    // Priority order: qns_max > lusail_max > lor_max
    if (param.qns_max !== null && param.qns_max !== undefined) {
      return Number(param.qns_max);
    } else if (param.lusail_max !== null && param.lusail_max !== undefined) {
      return Number(param.lusail_max);
    } else if (param.lor_max !== null && param.lor_max !== undefined) {
      return Number(param.lor_max);
    }

    return 0.5;
  }

  // Build guideline rows based on paramUnits thresholds
  private computeGuidelineRows(): void {
    const oilCfg: any = (this.paramUnits || []).find(
      (p: any) => p?.param_name === 'oil_in_water'
    );
    const chlCfg: any = (this.paramUnits || []).find(
      (p: any) => p?.param_name === 'chlorophyll_a'
    );

    const fmtThresh = (v: any): string => {
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      if (!Number.isFinite(n)) return '-';
      const s =
        n < 1 ? n.toFixed(2) : Number.isInteger(n) ? `${n}` : n.toFixed(2);
      return `<${s}`;
    };

    this.guidelineRows = [
      [
        'MoECC Permit Conditions',
        '-',
        fmtThresh(oilCfg?.qns_max),
        fmtThresh(chlCfg?.qns_max),
      ],
      [
        'Qatar Seawater Standards',
        '-',
        fmtThresh(oilCfg?.lusail_max),
        fmtThresh(chlCfg?.lusail_max),
      ],
      [
        'Limit of Reporting',
        '-',
        fmtThresh(oilCfg?.lor_max),
        fmtThresh(chlCfg?.lor_max),
      ],
    ];
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

    if (this.dt) {
      this.dt.first = 0;
    }

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
    if (!this.fromDate || !this.toDate || !this.selectedBuoys?.length) {
      console.warn('Missing required filters: date or buoys not selected');
      return;
    }

    // Get all selected station IDs
    const stationIds = this.selectedBuoys.map((buoy) => buoy.station_id);

    // Update selectedBuoy to the first selected for backward compatibility
    if (this.selectedBuoys.length > 0) {
      this.selectedBuoy = this.selectedBuoys[0];
      this.nameOfStation =
        this.selectedBuoys.length === 1
          ? this.selectedBuoys[0].station_name
          : `${this.selectedBuoys.length} Stations Selected`;
      this.updateSelectedBuoysLabel();
    }

    this.reportService
      .getSensorDataByMultipleStationsAndDate(
        stationIds,
        this.fromDate,
        this.toDate
      )
      .subscribe(
        (data: any[]) => {
          console.log('Filtered data by multiple buoys and date:', data);
          this.sensorData = data.map((d) => ({
            ...d,
            timestampFormatted: this.formatDate(d.timestamp),
            datetimeFormatted: this.formatDate(d.datetime),
          }));
        },
        (error: any) => {
          console.error('Error fetching filtered data:', error);
        }
      );
    console.log('Data fetching for table');
    console.log('selectedBuoy', this.selectedBuoy);
    console.log('Dd', this.selectedBuoy.sensors);
    const sensors = this.selectedBuoy.sensors as string[] | string;

    const hasMeteorology = Array.isArray(sensors)
      ? sensors
          .map((s) => (s || '').trim().toLowerCase())
          .includes('meteorology')
      : typeof sensors === 'string' &&
        sensors
          .split(',')
          .map((s) => (s || '').trim().toLowerCase())
          .includes('meteorology');

    console.log('t', hasMeteorology);

    if (!hasMeteorology) {
      this.is_meteorology = false;
      console.log('smaple', this.is_meteorology);
    } else {
      this.is_meteorology = true;
      console.log('smaple', this.is_meteorology);
    }
    this.updateOptions();
    this.onOptionChange();

    console.log('fromDate', this.fromDate);
    console.log('toDate', this.toDate);
    if (this.moeccVisible) {
      this.prepareMoeccRows();
    }

    // Refresh station report if opened
    if (this.stationReportVisible) {
      this.buildStationReport();
    }
  }

  private updateSelectedBuoysLabel(): void {
    this.selectedBuoysLabel = (this.selectedBuoys || [])
      .map((b) => b.station_name)
      .filter(Boolean)
      .join(', ');
  }
  updateOptions() {
    this.options = [
      { label: 'All Sensors', value: 'sensorData', icon: 'fa fas-database' },
      ...(this.is_meteorology
        ? [{ label: 'Meteorology', value: 'meteorology', icon: 'pi pi-cloud' }]
        : []),
      { label: 'Oceanography', value: 'oceanography', icon: 'pi pi-globe' },
      {
        label: 'Water Quality',
        value: 'water_quality',
        icon: 'pi pi-umbrella',
      },
    ];
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

  alpha: any = null;

  getUnitByField(fieldName: string): string {
    const match = this.paramUnits.find(
      (unitObj) => unitObj.param_name === fieldName
    );
    return match ? match.unit : '';
  }

  // Define reusable column sets
  meteorologyColumns = [
    { field: 'wind_speed', header: 'Wind Speed' },
    { field: 'wind_direction_deg', header: 'Wind Direction' },
    { field: 'wind_gust', header: 'Wind Gust' },
    { field: 'temperature_deg', header: 'Air Temperature' },
    { field: 'rh_percent', header: 'Relative Humidity' },
    { field: 'bp_hpa', header: 'Barometric Pressure' },
    { field: 'rain_mm', header: 'Rainfall' },
    { field: 'visibility', header: 'Visibility' },
    { field: 'global_radiation', header: 'Radiation' },
  ];
  oceanographyColumns = [
    { field: 'wave_heading', header: 'Wave Heading' },
    { field: 'wave_height', header: 'Wave Height' },
    { field: 'tzc', header: 'Peak Wave Period' },
    { field: 'tz', header: 'Zero Crossing Period' },
    { field: 'tm02', header: 'Average Wave Period' },
    { field: 'wave_direction', header: 'Wave Direction' },
    { field: 'wave_direction_fw', header: 'Wave Direction FW' },
    { field: 'mean_wave_direction', header: 'Mean Wave Direction' },
    { field: 'hmax', header: 'Max Wave Height' },
    { field: 'fourier_coefficient_a1', header: 'Fourier Coefficient a1' },
    { field: 'fourier_coefficient_b1', header: 'Fourier Coefficient b1' },
    { field: 'fourier_coefficient_a2', header: 'Fourier Coefficient a2' },
    { field: 'fourier_coefficient_b2', header: 'Fourier Coefficient b2' },
    { field: 'dominant_time_period_fw', header: 'Dominant Time Period FW' },
    { field: 'havg', header: 'Average Wave Height' },
  ];

  waterQualityColumns = [
    { field: 'turbidity', header: 'Turbidity' },
    { field: 'water_temperature', header: 'Water Temperature' },
    { field: 'ph', header: 'Potential of Hydrogen' },
    { field: 'conductivity', header: 'Conductivity' },
    { field: 'dissolved_oxygen', header: 'Dissolved Oxygen' },
    { field: 'salinity', header: 'Salinity' },
    { field: 'chlorophyll_a', header: 'Chlorophyll-a' },
    { field: 'phycoerythrin', header: 'Phycoerythrin' },
    { field: 'fluorescein_dye', header: 'Fluorescein Dye' },
    { field: 'pah', header: 'PAH' },
    { field: 'oil_in_water', header: 'Oil in Water' },
    { field: 'bt', header: 'Bottom Temperature' },
  ];

  currentBins = Array.from({ length: 4 }, (_, i) => i + 1).flatMap((i) => [
    { field: `current_speed_bin_${i}`, header: `Current Speed Bin ${i}` },
    {
      field: `current_direction_bin_${i}`,
      header: `Current Direction Bin ${i}`,
    },
  ]);

  // Refactored method
  onOptionChange(): void {
    this.alpha =
      this.selectedOption === 'sensorData'
        ? this.fetchedBuoys
        : this.fetchedBuoys.filter(
            (buoy: any) =>
              typeof buoy.sensors === 'string' &&
              buoy.sensors
                .split(',')
                .map((s: string) => s.trim())
                .includes(this.selectedOption)
          );

    const getColumnSetWithUnits = (columns: any[]) =>
      columns.map((col) => ({
        ...col,
        unit: `(${this.getUnitByField(col.field)})`,
      }));

    let dyna: any[] = [];

    if (this.selectedOption === 'sensorData') {
      // Start with oceanography and water quality
      dyna = [
        ...getColumnSetWithUnits(this.oceanographyColumns),
        ...getColumnSetWithUnits(this.waterQualityColumns),
        ...this.currentBins.map((col) => ({
          ...col,
          unit: `(${this.getUnitByField(
            col.field.includes('speed') ? 'current_speed' : 'current_direction'
          )})`,
        })),
      ];

      // Check if selected station has meteorology
      const sensors = this.selectedBuoy?.sensors as string[] | string;
      const hasMeteorology = Array.isArray(sensors)
        ? sensors
            .map((s) => (s || '').trim().toLowerCase())
            .includes('meteorology')
        : typeof sensors === 'string' &&
          sensors
            .split(',')
            .map((s) => (s || '').trim().toLowerCase())
            .includes('meteorology');

      // If yes, prepend meteorology columns
      if (hasMeteorology) {
        dyna = [...getColumnSetWithUnits(this.meteorologyColumns), ...dyna];
      }
    } else if (this.selectedOption === 'meteorology') {
      dyna = getColumnSetWithUnits(this.meteorologyColumns);
    } else if (this.selectedOption === 'oceanography') {
      dyna = [
        ...getColumnSetWithUnits(this.oceanographyColumns),
        ...getColumnSetWithUnits(this.currentBins),
      ];
    } else if (this.selectedOption === 'water_quality') {
      dyna = getColumnSetWithUnits(this.waterQualityColumns);
    }

    // Assign columns and filters
    this.dynaColumns = dyna;
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

    console.log('Option:', this.selectedOption);
    console.log('Filtered Buoys:', this.alpha);
    console.log('Dynamic Columns:', this.dynaColumns);
  }

  onExportOptionSelect(event: any, dt2: any) {
    const selectedOption = event.value;

    if (!selectedOption) return;
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
    }
    setTimeout(() => {
      this.selectedExportOption = null;
    }, 0);
  }

  exportCSV(dt: any) {
    const filteredData = dt.filteredValue || dt.value;

    if (filteredData && filteredData.length > 0) {
      const csv = this.convertToCSV(filteredData);

      // Add UTF-8 BOM to prevent encoding issues
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

      FileSaver.saveAs(blob, `${this.selectedBuoysLabel}.csv`);
    } else {
      // Handle case where no data is available
      // console.warn('No data available for CSV export');
    }
  }

  // Helper method to convert JSON to CSV format
  convertToCSV(data: any[]): string {
    const fixedHeaders = [
      'S No',
      'Station Id',
      'Timestamp',
      'Date and Time',
      'Battery' +
        (this.getUnitByField('battery')
          ? ` (${this.getUnitByField('battery')})`
          : ''),
      'Latitude' + ' (DD)',
      'Longitude' + ' (DD)',
    ];

    const fixedFields = [
      'station_id',
      'timestampFormatted',
      'datetimeFormatted',
      'battery',
      'lat',
      'lon',
    ];

    const dynamicHeaders = this.selectedColumns.map((col) => {
      const unitText = col.unit ? ` ${col.unit}` : '';
      return `${col.header}${unitText}`;
    });

    const dynamicFields = this.selectedColumns.map((col) => col.field);

    const headers = [...fixedHeaders, ...dynamicHeaders];
    const fields = [...fixedFields, ...dynamicFields];

    const reversedData = [...data].reverse(); // 🔁 Reverse the rows only

    const csvRows = [
      headers.join(','), // Header row
      ...reversedData.map((row, index) =>
        [
          index + 1, // S No: normal order
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
        'Station Id',
        'Timestamp',
        'Date and Time',
        'Battery' +
          (this.getUnitByField('battery')
            ? ` (${this.getUnitByField('battery')})`
            : ''),
        'Latitude' + ' (DD)',
        'Longitude' + ' (DD)',
      ];

      const fixedFields = [
        'station_id',
        'timestampFormatted',
        'datetimeFormatted',
        'battery',
        'lat',
        'lon',
      ];

      // Add units to dynamic headers
      const dynamicHeaders = this.selectedColumns.map((col) => {
        const unit = col.unit ? ` ${col.unit}` : '';
        return `${col.header}${unit}`;
      });

      const dynamicFields = this.selectedColumns.map((col) => col.field);

      const headers = [...fixedHeaders, ...dynamicHeaders];
      const fields = [...fixedFields, ...dynamicFields];

      const reversedData = [...filteredData].reverse();

      const dataToExport = reversedData.map((row: any, index: number) => {
        const selectedRow: any = {};
        selectedRow['S No'] = index + 1;

        fixedHeaders.slice(1).forEach((header, i) => {
          const field = fixedFields[i];
          selectedRow[header] = row[field] || '';
        });

        dynamicHeaders.forEach((header, i) => {
          const field = dynamicFields[i];
          selectedRow[header] = row[field] || '';
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

      const finalName = fileName || this.selectedBuoysLabel;
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
        'Station Id',
        'Timestamp',
        'Date and Time',
        'Battery' +
          (this.getUnitByField('battery')
            ? ` (${this.getUnitByField('battery')})`
            : ''),
        'Latitude' + ' (DD)',
        'Longitude' + ' (DD)',
      ];
      const fixedFields = [
        'station_id',
        'timestampFormatted', // Use formatted field
        'datetimeFormatted', // Use formatted field
        'battery',
        'lat',
        'lon',
      ];

      const dynamicHeaders = this.selectedColumns.map((col) => {
        const unit = col.unit ? ` ${col.unit}` : '';
        return `${col.header}${unit}`;
      });

      const dynamicFields = this.selectedColumns.map((col) => col.field);

      const chunkSize = 10; // Columns per page
      const doc = new jsPDF('landscape');

      // 🔁 Reverse the data rows (but keep S No ascending)
      const reversedData = [...filteredData].reverse();

      for (let i = 0; i < dynamicFields.length; i += chunkSize) {
        const chunkHeaders = dynamicHeaders.slice(i, i + chunkSize);
        const chunkFields = dynamicFields.slice(i, i + chunkSize);

        const headers = [...fixedHeaders, ...chunkHeaders];
        const fields = [...fixedFields, ...chunkFields];

        const data = reversedData.map((row: any, index: number) => {
          const rowData = [index + 1]; // ✅ S No in ascending order
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

        if (i + chunkSize < dynamicFields.length) {
          doc.addPage();
        }
      }

      doc.save(`${this.selectedBuoysLabel}.pdf`);
    } else {
      console.warn('No data available for PDF export');
    }
  }

  // ================== MOECC Modal helpers ==================
  openMoecc(rowData?: any): void {
    console.log('rr', rowData);
    this.selectedRowData = rowData || null;
    this.prepareMoeccRows(rowData);
    console.log('moeccRows', this.moeccRows);
    this.moeccVisible = true;
  }

  onHourIntervalChange(): void {
    this.prepareMoeccRows(this.selectedRowData);
  }

  // Loading flag for PDF generation
  isDownloading = false;

  @ViewChild('moeccContent') moeccContent!: ElementRef<HTMLElement>;
  @ViewChild('moeccWrapper') moeccWrapper!: ElementRef<HTMLElement>;

  async downloadMoecc(): Promise<void> {
    this.isDownloading = true;
    try {
      // Capture the full grid content (not only what's visible)
      // We still prefer wrapper for heading/padding, but to avoid overflow clipping,
      // capture the grid element while we include heading by wrapping both if needed later.
      const contentEl = this.moeccContent?.nativeElement;
      const wrapperEl = this.moeccWrapper?.nativeElement;
      const hostEl = contentEl || wrapperEl;
      if (!hostEl) return;

      const html2canvas = (await import('html2canvas')).default;

      // Prepare to render the ENTIRE content by expanding the element to its scroll size
      const target = hostEl;
      const originalOverflow = target.style.overflow;
      const originalWidth = target.style.width;
      const originalHeight = target.style.height;
      const captureWidth = target.scrollWidth || target.clientWidth;
      const captureHeight = target.scrollHeight || target.clientHeight;

      // Temporarily disable clipping and set explicit size for full capture
      target.style.overflow = 'visible';
      target.style.width = captureWidth + 'px';
      target.style.height = captureHeight + 'px';

      // Render the element to canvas with colors
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 2, // higher scale for sharper output
        useCORS: true,
        logging: false,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore styles
      target.style.overflow = originalOverflow;
      target.style.width = originalWidth;
      target.style.height = originalHeight;

      const pdf = new jsPDF('landscape', 'pt', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24; // left/right/top/bottom margin
      const usableHeight = pageHeight - margin * 2;
      const imgWidth = pageWidth - margin * 2;

      // Compute slice height in canvas pixels corresponding to usableHeight in PDF
      const scale = imgWidth / canvas.width;
      const sliceHeightPx = Math.floor(usableHeight / scale);

      // Offscreen canvas for slicing
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      let yOffset = 0;
      let isFirstPage = true;
      while (yOffset < canvas.height) {
        const remaining = canvas.height - yOffset;
        const currentSliceHeight = Math.min(sliceHeightPx, remaining);

        // Resize pageCanvas height for the last slice if needed
        if (pageCanvas.height !== currentSliceHeight) {
          pageCanvas.height = currentSliceHeight;
        }

        // Clear and draw the slice
        ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          yOffset,
          pageCanvas.width,
          currentSliceHeight,
          0,
          0,
          pageCanvas.width,
          currentSliceHeight
        );

        const sliceImg = pageCanvas.toDataURL('image/png');
        const sliceHeightPt = currentSliceHeight * scale; // height on PDF

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(sliceImg, 'PNG', margin, margin, imgWidth, sliceHeightPt);

        isFirstPage = false;
        yOffset += currentSliceHeight;
      }

      pdf.save('Meteorology_Report.pdf');
    } catch (err) {
      console.error('Failed to export MOECC PDF', err);
    } finally {
      this.isDownloading = false;
    }
  }

  private prepareMoeccRows(rowData?: any): void {
    if (!this.sensorData || this.sensorData.length === 0) {
      this.moeccRows = [];
      this.moeccStations = [];
      return;
    }

    // Generate hours based on selected interval
    const hours: number[] = [];
    for (let h = 0; h < 24; h += this.selectedHourInterval) {
      hours.push(h);
    }
    // store for template rendering
    this.moeccHours = hours;
    const grouped: { [date: string]: any } = {};

    // If rowData is provided, limit to that specific date
    let allowedDateKey: string | null = null;
    if (rowData && (rowData.datetime || rowData.timestamp)) {
      const d = new Date(rowData.datetime || rowData.timestamp);
      if (!isNaN(d.getTime())) {
        allowedDateKey = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      }
    }

    // Fallback: if only formatted date exists (e.g. '18-08-2025 16:20:53')
    if (!allowedDateKey && rowData && rowData.datetimeFormatted) {
      try {
        const datePart = String(rowData.datetimeFormatted).split(' ')[0];
        const [dd, mm, yyyy] = datePart.split('-');
        if (dd && mm && yyyy) {
          allowedDateKey = `${yyyy}-${mm}-${dd}`;
        }
      } catch {}
    }

    for (const item of this.sensorData) {
      const dateObj = new Date(item.datetime || item.timestamp);
      if (isNaN(dateObj.getTime())) continue;
      const dateKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
      const hour = dateObj.getHours();
      if (!hours.includes(hour)) continue;

      if (allowedDateKey && dateKey !== allowedDateKey) continue;

      if (!grouped[dateKey]) {
        const makeHourMap = (): Record<number, number | null> => {
          const obj: Record<number, number | null> = {};
          hours.forEach((h) => (obj[h] = null));
          return obj;
        };
        grouped[dateKey] = {
          dateLabel: this.formatDateLabel(dateObj),
          wind_speed: makeHourMap(),
          wind_direction: makeHourMap(),
          temperature: makeHourMap(),
        };
      }

      grouped[dateKey].wind_speed[hour] = item.wind_speed;
      grouped[dateKey].wind_direction[hour] = item.wind_direction_deg;
      grouped[dateKey].temperature[hour] = item.temperature_deg;
    }

    const rows = Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((k) => ({ date: k, ...grouped[k] }));

    // compute min/max for gradients
    const windValues: number[] = [];
    const tempValues: number[] = [];
    rows.forEach((r) => {
      hours.forEach((h) => {
        const ws = r.wind_speed[h];
        const tp = r.temperature[h];
        if (typeof ws === 'number') windValues.push(ws);
        if (typeof tp === 'number') tempValues.push(tp);
      });
    });
    this.moeccWindMin = windValues.length ? Math.min(...windValues) : 0;
    this.moeccWindMax = windValues.length ? Math.max(...windValues) : 1;
    this.moeccTempMin = tempValues.length ? Math.min(...tempValues) : 0;
    this.moeccTempMax = tempValues.length ? Math.max(...tempValues) : 1;

    this.moeccRows = rows;

    // Build per-station sections when multiple stations are selected
    const selectedIds = (this.selectedBuoys || []).map((b) => b.station_id);
    const stationMap: Record<string, StationConfigs | undefined> = {};
    (this.fetchedBuoys || []).forEach((b) => (stationMap[b.station_id] = b));

    const buildForDataset = (
      data: any[]
    ): {
      rows: any[];
      windMin: number;
      windMax: number;
      tempMin: number;
      tempMax: number;
    } => {
      const groupedLocal: { [date: string]: any } = {};
      // Limit to the same allowed date if applicable
      for (const item of data) {
        const dateObj = new Date(item.datetime || item.timestamp);
        if (isNaN(dateObj.getTime())) continue;
        const dateKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
        const hour = dateObj.getHours();
        if (!hours.includes(hour)) continue;
        if (allowedDateKey && dateKey !== allowedDateKey) continue;

        if (!groupedLocal[dateKey]) {
          const makeHourMap = (): Record<number, number | null> => {
            const obj: Record<number, number | null> = {};
            hours.forEach((h) => (obj[h] = null));
            return obj;
          };
          groupedLocal[dateKey] = {
            dateLabel: this.formatDateLabel(dateObj),
            wind_speed: makeHourMap(),
            wind_direction: makeHourMap(),
            temperature: makeHourMap(),
          };
        }
        groupedLocal[dateKey].wind_speed[hour] = item.wind_speed;
        groupedLocal[dateKey].wind_direction[hour] = item.wind_direction_deg;
        groupedLocal[dateKey].temperature[hour] = item.temperature_deg;
      }

      const localRows = Object.keys(groupedLocal)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((k) => ({ date: k, ...groupedLocal[k] }));

      const windVals: number[] = [];
      const tempVals: number[] = [];
      localRows.forEach((r) => {
        hours.forEach((h) => {
          const ws = r.wind_speed[h];
          const tp = r.temperature[h];
          if (typeof ws === 'number') windVals.push(ws);
          if (typeof tp === 'number') tempVals.push(tp);
        });
      });
      return {
        rows: localRows,
        windMin: windVals.length ? Math.min(...windVals) : 0,
        windMax: windVals.length ? Math.max(...windVals) : 1,
        tempMin: tempVals.length ? Math.min(...tempVals) : 0,
        tempMax: tempVals.length ? Math.max(...tempVals) : 1,
      };
    };

    this.moeccStations = [];
    const hasMet = (sensors: string[] | string | undefined): boolean => {
      if (!sensors) return false;
      return Array.isArray(sensors)
        ? sensors
            .map((s) => (s || '').trim().toLowerCase())
            .includes('meteorology')
        : sensors
            .split(',')
            .map((s) => (s || '').trim().toLowerCase())
            .includes('meteorology');
    };

    if (selectedIds.length > 1) {
      selectedIds.forEach((sid) => {
        const sc = stationMap[sid];
        if (!hasMet(sc?.sensors as any)) return; // skip non-meteorology stations
        const subset = this.sensorData.filter((d: any) => d.station_id === sid);
        const built = buildForDataset(subset);
        this.moeccStations.push({
          station_id: sid,
          station_name: sc?.station_name,
          hours: [...hours],
          rows: built.rows,
          windMin: built.windMin,
          windMax: built.windMax,
          tempMin: built.tempMin,
          tempMax: built.tempMax,
        });
      });
    } else if (selectedIds.length === 1) {
      // Ensure single-station entry as well for consistent template use
      const sid = selectedIds[0];
      const sc = stationMap[sid];
      if (hasMet(sc?.sensors as any)) {
        const subset = this.sensorData.filter((d: any) => d.station_id === sid);
        const built = buildForDataset(subset);
        this.moeccStations.push({
          station_id: sid,
          station_name: sc?.station_name,
          hours: [...hours],
          rows: built.rows,
          windMin: built.windMin,
          windMax: built.windMax,
          tempMin: built.tempMin,
          tempMax: built.tempMax,
        });
      } else {
        // If selected station has no meteorology, keep stations empty so template won't render
        this.moeccStations = [];
      }
    }
  }

  getWindBg(value: number | null): string {
    if (value === null || value === undefined) return '#f5f5f5';
    const ratio =
      (value - this.moeccWindMin) /
      (this.moeccWindMax - this.moeccWindMin || 1);
    const hue = 180 - 60 * Math.min(Math.max(ratio, 0), 1);
    return `hsl(${hue}, 80%, 50%)`;
  }

  // Per-station color helpers
  getWindBgWith(
    st: { windMin: number; windMax: number },
    value: number | null
  ): string {
    if (value === null || value === undefined) return '#f5f5f5';
    const ratio = (value - st.windMin) / (st.windMax - st.windMin || 1);
    const hue = 180 - 60 * Math.min(Math.max(ratio, 0), 1);
    return `hsl(${hue}, 80%, 50%)`;
  }

  getArrowRotation(value: number | null): string {
    if (value === null || value === undefined) {
      return 'rotate(0deg)';
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return 'rotate(0deg)';
    const deg = ((num % 360) + 360) % 360;
    return `rotate(${deg}deg)`;
  }

  getTempBg(value: number | null): string {
    if (value === null || value === undefined) return '#f5f5f5';
    const ratio = Math.min(
      Math.max(
        (value - this.moeccTempMin) /
          (this.moeccTempMax - this.moeccTempMin || 1),
        0
      ),
      1
    );
    const hue = 240 - 240 * ratio;
    return `hsl(${hue}, 80%, 50%)`;
  }

  getTempBgWith(
    st: { tempMin: number; tempMax: number },
    value: number | null
  ): string {
    if (value === null || value === undefined) return '#f5f5f5';
    const ratio = Math.min(
      Math.max((value - st.tempMin) / (st.tempMax - st.tempMin || 1), 0),
      1
    );
    const hue = 240 - 240 * ratio;
    return `hsl(${hue}, 80%, 50%)`;
  }

  // ================== Station WQ Report helpers ==================
  openStationReport(): void {
    this.stationReportVisible = true;
    this.buildStationReport();
  }

  private buildStationReport(): void {
    this.stationReportLoading = true;

    const requests = this.fetchedBuoys.map((b) =>
      this.reportService.getSensorDataByStationAndDate(
        b.station_id,
        this.fromDate,
        this.toDate
      )
    );

    forkJoin(requests).subscribe({
      next: (allResults: any[][]) => {
        const rows: any[] = [];

        this.fetchedBuoys.forEach((station, idx) => {
          const data = allResults[idx] || [];
          // group by date (YYYY-MM-DD)
          const groups: Record<
            string,
            { oilVals: number[]; chlVals: number[] }
          > = {};
          for (const d of data) {
            const ts = new Date(d.datetime || d.timestamp);
            if (isNaN(ts.getTime())) continue;
            const key = `${ts.getFullYear()}-${(ts.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${ts.getDate().toString().padStart(2, '0')}`;
            if (!groups[key]) groups[key] = { oilVals: [], chlVals: [] };

            const oil = this.toNumberOrNull(d.oil_in_water);
            if (oil !== null) groups[key].oilVals.push(oil);
            const chl = this.toNumberOrNull(d.chlorophyll_a);
            if (chl !== null) groups[key].chlVals.push(chl);
          }

          Object.entries(groups).forEach(([dateKey, g]) => {
            const oilAvg = g.oilVals.length
              ? g.oilVals.reduce((a, b) => a + b, 0) / g.oilVals.length
              : null;
            const chlAvg = g.chlVals.length
              ? g.chlVals.reduce((a, b) => a + b, 0) / g.chlVals.length
              : null;
            rows.push({
              station_id: station.station_id,
              station_name: station.station_name,
              date: this.formatSampleDate(new Date(dateKey)),
              oil_in_water_avg: oilAvg,
              chlorophyll_a_avg: chlAvg,
            });
          });
        });

        rows.sort((a, b) => {
          const ad = new Date(a.date as string).getTime();
          const bd = new Date(b.date as string).getTime();
          if (ad !== bd) return ad - bd;
          return (a.station_id || '').localeCompare(b.station_id || '');
        });

        this.stationReportRows = rows;
      },
      error: (err) => {
        console.error('Failed to build station report', err);
        this.stationReportRows = [];
      },
      complete: () => {
        this.stationReportLoading = false;
      },
    });
  }

  async downloadStationReportPDF(): Promise<void> {
    this.isDownloadingWQ = true;
    try {
      // Ensure data exists
      const rows = this.stationReportRows || [];
      if (!rows.length) {
        console.warn('No station report data to export');
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const marginLeft = 14;
      const marginRight = 22; // add extra right-side space

      // Optional title
      pdf.setFontSize(12);
      pdf.text('Water Quality Report', marginLeft, 12);

      // Table header
      const head = [
        [
          'Guideline / LOR / Monitoring station',
          'Date sampled',
          'Oil and grease (mg/L)',
          'Chlorophyll (µg/L)',
        ],
      ];

      // Guideline rows from database thresholds (paramUnits)
      const oilCfg: any = (this.paramUnits || []).find(
        (p: any) => p?.param_name === 'oil_in_water'
      );
      const chlCfg: any = (this.paramUnits || []).find(
        (p: any) => p?.param_name === 'chlorophyll_a'
      );

      const fmtThresh = (v: any): string => {
        if (v === null || v === undefined || v === '') return '-';
        const n = Number(v);
        if (!Number.isFinite(n)) return '-';
        const s =
          n < 1 ? n.toFixed(2) : Number.isInteger(n) ? `${n}` : n.toFixed(2);
        return `<${s}`;
      };

      const guidelineRows: any[] = [
        [
          'MoECC Permit Conditions',
          '-',
          fmtThresh(oilCfg?.qns_max),
          fmtThresh(chlCfg?.qns_max),
        ],
        [
          'Qatar Seawater Standards',
          '-',
          fmtThresh(oilCfg?.lusail_max),
          fmtThresh(chlCfg?.lusail_max),
        ],
        [
          'Limit of Reporting',
          '-',
          fmtThresh(oilCfg?.lor_max),
          fmtThresh(chlCfg?.lor_max),
        ],
      ];

      // Station rows
      const dataRows: any[] = rows.map((r: any) => [
        r.station_name || r.station_id || '',
        r.date || '',
        typeof r.oil_in_water_avg === 'number'
          ? r.oil_in_water_avg.toFixed(2)
          : '',
        typeof r.chlorophyll_a_avg === 'number'
          ? r.chlorophyll_a_avg.toFixed(3)
          : '',
      ]);

      const body = [...guidelineRows, ...dataRows];

      autoTable(pdf, {
        head,
        body,
        startY: 18,
        styles: { fontSize: 10, halign: 'center', cellPadding: 3 },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          halign: 'left',
        },
        // shrink widths a bit so the table keeps some right padding
        columnStyles: {
          0: { cellWidth: 76, halign: 'left' },
          1: { cellWidth: 32 },
          2: { cellWidth: 32 },
          3: { cellWidth: 32 },
        },
        margin: { left: marginLeft, right: marginRight },
        didParseCell: (data) => {
          // Bold first three guideline rows
          if (data.section === 'body' && data.row.index <= 2) {
            data.cell.styles.fontStyle = 'bold';
            // Light background for guideline rows
            data.cell.styles.fillColor = [244, 247, 255];
            data.cell.styles.textColor = [0, 0, 0];
          }
          // Center numeric columns
          if (
            data.section === 'body' &&
            (data.column.index === 2 || data.column.index === 3)
          ) {
            data.cell.styles.halign = 'center';
          }
        },
        didDrawCell: (data) => {
          if (
            data.section === 'body' &&
            data.row.index === 2 &&
            data.column.index === data.table.columns.length - 1
          ) {
            const pdf = data.doc as any;
            const y = data.cell.y + data.cell.height; // bottom of the 3rd row
            const tableAny = data.table as any;
            const startX = tableAny.startX ?? data.cell.x - data.cell.width;
            const endX =
              (tableAny.startX ?? data.cell.x - data.cell.width) +
              (tableAny.width ?? data.cell.width * data.table.columns.length);
            pdf.setDrawColor(180);
            pdf.setLineWidth(0.2);
            pdf.line(startX, y, endX, y);
          }
        },
        didDrawPage: () => {
          const str = `Page ${pdf.getNumberOfPages()}`;
          pdf.setFontSize(8);
          const pageWidth = pdf.internal.pageSize.getWidth();
          pdf.text(
            str,
            pageWidth - marginRight - 10,
            pdf.internal.pageSize.getHeight() - 6
          );
        },
      });

      pdf.save(`Water_Quality_Report.pdf`);
    } catch (err) {
      console.error('Failed to export Station WQ PDF', err);
    } finally {
      this.isDownloadingWQ = false;
    }
  }

  getCellBg(val: number | null, type: 'oil' | 'chl'): string {
    if (val === null || val === undefined || isNaN(val as any))
      return '#f0f0f0';
    const limit = type === 'oil' ? this.oilThreshold : this.chlThreshold;
    return val <= limit ? '#c8e6c9' : '#ffcdd2';
  }

  private toNumberOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  private formatSampleDate(d: Date): string {
    try {
      return d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      } as Intl.DateTimeFormatOptions);
    } catch {
      const dd = String(d.getDate()).padStart(2, '0');
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const mm = months[d.getMonth()] || '';
      return `${dd} ${mm} ${d.getFullYear()}`;
    }
  }

  private formatDateLabel(d: Date): string {
    // Use the same readable format as sample date labels
    return this.formatSampleDate(d);
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

    // Build stationIds from selectedBuoys (fallback to selectedBuoy)
    const stationIds: string[] =
      this.selectedBuoys && this.selectedBuoys.length > 0
        ? this.selectedBuoys.map((b) => b.station_id)
        : this.selectedBuoy?.station_id
        ? [this.selectedBuoy.station_id]
        : [];

    if (stationIds.length === 0) {
      console.warn('No stations selected for export');
      return;
    }
    console.log('Exporting for stations:', stationIds);
    console.log('From Date:', fromDate);
    console.log('To Date:', toDate);
    this.reportService
      .getSensorDataByMultipleStationsAndDate(stationIds, fromDate, toDate)
      .subscribe(
        (data) => {
          if (!data || data.length === 0) {
            console.warn('No data available for export.');
            return;
          }

          // ✅ Add formatted fields before assigning to dt.value
          const formattedData = data.map((d) => ({
            ...d,
            timestampFormatted: this.formatDate(d.timestamp),
            datetimeFormatted: this.formatDate(d.datetime),
          }));

          dt.value = formattedData;

          // Trigger export
          this.exportExcel(dt, `${this.selectedBuoysLabel}_${exportType}`);
        },

        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
}
