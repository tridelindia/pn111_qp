const fs = require('fs');
const path = require('path');

function randomNum(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

function generateCsvForOneMonth(startDateStr = '2025-04-01T00:00:00Z', outputFile = 'realistic_station_data.csv') {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 4); // One month

  const headers = [
    'id', 'station_id', 'timestamp', 'datetime', 'battery', 'cam_img', 'lat', 'lon',
    'wind_speed', 'wind_direction_deg', 'temperature_deg', 'rh_percent', 'bp_hpa', 'global', 'rain_mm', 'visibility_nm',
    'wave_heading', 'wave_height', 'Tzc', 'Tz', 'Tm02', 'wave_direction', 'wave_direction_fw', 'mean_wave_direction', 'hmax',
    'fourier_coefficient_a1', 'fourier_coefficient_b1', 'fourier_coefficient_a2', 'fourier_coefficient_b2', 'havg', 'dominant_time_period_fw',
    'turbidity', 'water_temperature', 'ph', 'conductivity', 'dissolved_oxygen', 'salinity', 'chlorophyll_a', 'wind_gust',
    'phycoerythrin', 'fluorescein_dye', 'pah', 'oil_in_water', 'bt',
    'current_speed_bin_1', 'current_direction_bin_1', 'current_speed_bin_2', 'current_direction_bin_2',
    'current_speed_bin_3', 'current_direction_bin_3', 'current_speed_bin_4', 'current_direction_bin_4',
    'current_speed_bin_5', 'current_direction_bin_5', 'current_speed_bin_6', 'current_direction_bin_6',
    'current_speed_bin_7', 'current_direction_bin_7', 'current_speed_bin_8', 'current_direction_bin_8',
    'current_speed_bin_9', 'current_direction_bin_9', 'current_speed_bin_10', 'current_direction_bin_10'
  ];

  const lines = [];
  lines.push(headers.join(','));

  let id = 1;
  for (let dt = new Date(startDate); dt < endDate; dt.setMinutes(dt.getMinutes() + 10)) {
    const timestampISO = dt.toISOString();
    const datetimeStr = dt.toISOString().replace('T', ' ').slice(0, 19);

    const lat = randomNum(12.345678, 12.349999, 6);
    const lon = randomNum(98.123456, 98.129999, 6);
    const battery = randomNum(11.0, 13.0);
    const cam_img = 'assets/test.png';

    // Meteorological realistic ranges
    const wind_speed = randomNum(0, 15);                  // m/s
    const wind_direction_deg = randomNum(0, 360);        // degrees
    const wind_gust = wind_speed + randomNum(0, 5);       // gust always ≥ windspeed
    const temperature_deg = randomNum(24, 35);           // deg C
    const rh_percent = randomNum(50, 100);               // %
    const bp_hpa = randomNum(990, 1025);                 // hPa
    const global = randomNum(0, 1000);                   // W/m²
    const rain_mm = randomNum(0, 20);                    // mm
    const visibility_nm = randomNum(5, 20);              // nautical miles

    // Wave realistic ranges
    const wave_heading = randomNum(0, 360);
    const wave_height = randomNum(0.2, 3);               // m
    const Tzc = randomNum(3, 10);
    const Tz = randomNum(3, 10);
    const Tm02 = randomNum(3, 10);
    const wave_direction = randomNum(0, 360);
    const wave_direction_fw = randomNum(0, 360);
    const mean_wave_direction = randomNum(0, 360);
    const hmax = wave_height + randomNum(0.5, 2.5);
    const havg = wave_height;
    const dominant_time_period_fw = randomNum(4, 12);

    const fourier_coefficient_a1 = randomNum(-1, 1);
    const fourier_coefficient_b1 = randomNum(-1, 1);
    const fourier_coefficient_a2 = randomNum(-1, 1);
    const fourier_coefficient_b2 = randomNum(-1, 1);

    // Water Quality
    const turbidity = randomNum(0, 100);                 // NTU
    const water_temperature = temperature_deg - randomNum(1, 5);  // deg C
    const ph = randomNum(7.5, 8.5);
    const conductivity = randomNum(30, 50);              // mS/cm
    const dissolved_oxygen = randomNum(5, 10);           // mg/L
    const salinity = randomNum(30, 38);                  // PSU
    const chlorophyll_a = randomNum(0, 10);              // µg/L

    // MicroFLU
    const phycoerythrin = randomNum(0, 5);
    const fluorescein_dye = randomNum(0, 2);
    const pah = randomNum(0, 1);
    const oil_in_water = randomNum(0, 1);
    const bt = randomNum(0, 1);

    // Currents
    function curSpeed() { return randomNum(0.01, 2.5); }
    function curDir() { return randomNum(0, 360); }

    const currentSpeedsDirs = Array.from({ length: 10 }, () => [curSpeed(), curDir()]).flat();

    const row = [
      id++, 'Station01', timestampISO, datetimeStr,
      battery.toFixed(2), cam_img, lat, lon,
      wind_speed, wind_direction_deg, temperature_deg, rh_percent, bp_hpa, global, rain_mm, visibility_nm,
      wave_heading, wave_height, Tzc, Tz, Tm02, wave_direction, wave_direction_fw, mean_wave_direction, hmax,
      fourier_coefficient_a1, fourier_coefficient_b1, fourier_coefficient_a2, fourier_coefficient_b2,
      havg, dominant_time_period_fw,
      turbidity, water_temperature, ph, conductivity, dissolved_oxygen, salinity, chlorophyll_a, wind_gust,
      phycoerythrin, fluorescein_dye, pah, oil_in_water, bt,
      ...currentSpeedsDirs.map(val => val.toFixed(2))
    ];

    lines.push(row.join(','));
  }

  const outputPath = path.resolve(__dirname, outputFile);
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`✅ Realistic CSV generated: ${outputPath}`);
}

// Run the generator
generateCsvForOneMonth();
