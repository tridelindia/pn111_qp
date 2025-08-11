const fs = require('fs');
const path = require('path');

function randomNum(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

function generateCsvForOneMonth(startDateStr = '2025-08-01T00:00:00Z', outputFile = 'station_data.csv') {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);

  const headers = [
    'id', 'station_id', 'timestamp', 'datetime', 'battery', 'cam_img', 'lat', 'lon',
    'windspeed', 'wind_direction_deg', 'temperature_deg', 'rh_percent', 'bp_hpa', 'global', 'rain_mm', 'visibility_nm',
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

    const battery = randomNum(0, 12.4);

    const cam_img = 'assets/test.png';  // set fixed image path as requested

    const lat = randomNum(12.30, 12.40, 6);
    const lon = randomNum(-98.15, -98.10, 6);

    // All numeric values with 2 decimals fixed
    const windspeed = randomNum(0, 20);
    const wind_direction_deg = randomNum(0, 360);
    const temperature_deg = randomNum(-10, 40);
    const rh_percent = randomNum(10, 100);
    const bp_hpa = randomNum(60, 999);
    const global = randomNum(0, 1000);
    const rain_mm = randomNum(0, 50);
    const visibility_nm = randomNum(0, 20);

    const wave_heading = randomNum(0, 360);
    const wave_height = randomNum(0, 15);
    const Tzc = randomNum(0, 10);
    const Tz = randomNum(0, 10);
    const Tm02 = randomNum(0, 10);
    const wave_direction = randomNum(0, 360);
    const wave_direction_fw = randomNum(0, 360);
    const mean_wave_direction = randomNum(0, 360);
    const hmax = randomNum(0, 20);

    const fourier_coefficient_a1 = randomNum(-5, 5);
    const fourier_coefficient_b1 = randomNum(-5, 5);
    const fourier_coefficient_a2 = randomNum(-5, 5);
    const fourier_coefficient_b2 = randomNum(-5, 5);

    const havg = randomNum(0, 15);
    const dominant_time_period_fw = randomNum(0, 20);

    const turbidity = randomNum(0, 100);
    const water_temperature = randomNum(0, 35);
    const ph = randomNum(6, 9);
    const conductivity = randomNum(0, 100);
    const dissolved_oxygen = randomNum(0, 15);
    const salinity = randomNum(0, 40);
    const chlorophyll_a = randomNum(0, 20);
    const wind_gust = randomNum(0, 30);

    const phycoerythrin = randomNum(0, 10);
    const fluorescein_dye = randomNum(0, 10);
    const pah = randomNum(0, 10);
    const oil_in_water = randomNum(0, 10);
    const bt = randomNum(0, 10);

    // Currents: speed 0-3, direction 0-360, 2 decimals
    function curSpeed() { return randomNum(0, 3); }
    function curDir() { return randomNum(0, 360); }

    const current_speed_bin_1 = curSpeed();
    const current_direction_bin_1 = curDir();
    const current_speed_bin_2 = curSpeed();
    const current_direction_bin_2 = curDir();
    const current_speed_bin_3 = curSpeed();
    const current_direction_bin_3 = curDir();
    const current_speed_bin_4 = curSpeed();
    const current_direction_bin_4 = curDir();
    const current_speed_bin_5 = curSpeed();
    const current_direction_bin_5 = curDir();
    const current_speed_bin_6 = curSpeed();
    const current_direction_bin_6 = curDir();
    const current_speed_bin_7 = curSpeed();
    const current_direction_bin_7 = curDir();
    const current_speed_bin_8 = curSpeed();
    const current_direction_bin_8 = curDir();
    const current_speed_bin_9 = curSpeed();
    const current_direction_bin_9 = curDir();
    const current_speed_bin_10 = curSpeed();
    const current_direction_bin_10 = curDir();

    const line = [
      id,
      'MX',
      timestampISO,
      datetimeStr,
      battery.toFixed(2),
      cam_img,
      lat.toFixed(6),
      lon.toFixed(6),
      windspeed.toFixed(2),
      wind_direction_deg.toFixed(2),
      temperature_deg.toFixed(2),
      rh_percent.toFixed(2),
      bp_hpa.toFixed(2),
      global.toFixed(2),
      rain_mm.toFixed(2),
      visibility_nm.toFixed(2),
      wave_heading.toFixed(2),
      wave_height.toFixed(2),
      Tzc.toFixed(2),
      Tz.toFixed(2),
      Tm02.toFixed(2),
      wave_direction.toFixed(2),
      wave_direction_fw.toFixed(2),
      mean_wave_direction.toFixed(2),
      hmax.toFixed(2),
      fourier_coefficient_a1.toFixed(2),
      fourier_coefficient_b1.toFixed(2),
      fourier_coefficient_a2.toFixed(2),
      fourier_coefficient_b2.toFixed(2),
      havg.toFixed(2),
      dominant_time_period_fw.toFixed(2),
      turbidity.toFixed(2),
      water_temperature.toFixed(2),
      ph.toFixed(2),
      conductivity.toFixed(2),
      dissolved_oxygen.toFixed(2),
      salinity.toFixed(2),
      chlorophyll_a.toFixed(2),
      wind_gust.toFixed(2),
      phycoerythrin.toFixed(2),
      fluorescein_dye.toFixed(2),
      pah.toFixed(2),
      oil_in_water.toFixed(2),
      bt.toFixed(2),
      current_speed_bin_1.toFixed(2),
      current_direction_bin_1.toFixed(2),
      current_speed_bin_2.toFixed(2),
      current_direction_bin_2.toFixed(2),
      current_speed_bin_3.toFixed(2),
      current_direction_bin_3.toFixed(2),
      current_speed_bin_4.toFixed(2),
      current_direction_bin_4.toFixed(2),
      current_speed_bin_5.toFixed(2),
      current_direction_bin_5.toFixed(2),
      current_speed_bin_6.toFixed(2),
      current_direction_bin_6.toFixed(2),
      current_speed_bin_7.toFixed(2),
      current_direction_bin_7.toFixed(2),
      current_speed_bin_8.toFixed(2),
      current_direction_bin_8.toFixed(2),
      current_speed_bin_9.toFixed(2),
      current_direction_bin_9.toFixed(2),
      current_speed_bin_10.toFixed(2),
      current_direction_bin_10.toFixed(2),
    ].join(',');

    lines.push(line);
    id++;
  }

  const outputPath = path.resolve(__dirname, outputFile);
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`CSV file generated: ${outputPath}`);
}

// Run it
generateCsvForOneMonth();
