export interface DateRange {
    from: Date | null;
    to: Date | null;
  }
  
  export interface ChartData {
    oceanography: number[];
    meteorology: number[];
    waterQuality: number[];
    dates: string[];
  }
  
  export interface ScoreData {
    overallScore: number;
  }