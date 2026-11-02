const fs = require('fs');
const path = require('path');

// Resolve pg dependency from api/node_modules or standard node_modules
let pg;
try {
  pg = require('../api/node_modules/pg');
} catch (e1) {
  try {
    pg = require('pg');
  } catch (e2) {
    console.error('[Error] The "pg" package could not be loaded. Please run "npm install" in the api directory.');
    process.exit(1);
  }
}

const { Pool } = pg;

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'db_terra_qatar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Tridel@qp@2025'
};

const INTERVAL_SECONDS = parseInt(process.env.INTERVAL_SECONDS || '10', 10);

const DEFAULT_STATIONS = [
  ['M22', '25.38772222', '51.54263889'],
  ['M10', '25.40786111', '51.54919444'],
  ['M29', '25.44044444', '51.54527778'],
  ['M40', '25.42191667', '51.52358333'],
  ['MX', '25.44875000', '51.56758333']
];

function randomNum(min, max, decimals = 2) {
  return +(Math.random() * (max - min) + min).toFixed(decimals);
}

function generateSensorPayload(stationId, baseLat, baseLon) {
  const now = new Date();
  const lat = baseLat ? parseFloat(baseLat) : 25.38;
  const lon = baseLon ? parseFloat(baseLon) : 51.54;

  const windSpeed = randomNum(1.0, 15.0);
  const temp = randomNum(24.0, 35.0);
  const waveHeight = randomNum(0.3, 2.5);
  const globalRad = randomNum(0.0, 950.0);
  const vis = randomNum(5.0, 20.0);

  const payload = {
    station_id: stationId,
    timestamp: now.toISOString(),
    datetime: now.toISOString().replace('T', ' ').slice(0, 19),
    battery: randomNum(11.8, 12.9),
    cam_img: 'assets/test.png',
    lat: +(lat + randomNum(-0.0001, 0.0001, 6)).toFixed(6),
    lon: +(lon + randomNum(-0.0001, 0.0001, 6)).toFixed(6),

    // Meteorological
    wind_speed: windSpeed,
    windspeed: windSpeed,
    wind_direction_deg: randomNum(0.0, 359.0),
    wind_gust: +(windSpeed + randomNum(0.5, 4.0)).toFixed(2),
    temperature_deg: temp,
    rh_percent: randomNum(50.0, 95.0),
    bp_hpa: randomNum(995.0, 1025.0),
    global_radiation: globalRad,
    global: globalRad,
    rain_mm: randomNum(0.0, 2.0),
    visibility: vis,
    visibility_nm: vis,

    // Waves
    wave_heading: randomNum(0.0, 359.0),
    wave_height: waveHeight,
    tzc: randomNum(3.0, 8.0),
    tz: randomNum(3.0, 8.0),
    tm02: randomNum(3.0, 8.0),
    wave_direction: randomNum(0.0, 359.0),
    wave_direction_fw: randomNum(0.0, 359.0),
    mean_wave_direction: randomNum(0.0, 359.0),
    hmax: +(waveHeight + randomNum(0.4, 2.0)).toFixed(2),
    havg: waveHeight,
    dominant_time_period_fw: randomNum(4.0, 12.0),
    fourier_coefficient_a1: randomNum(-1.0, 1.0),
    fourier_coefficient_b1: randomNum(-1.0, 1.0),
    fourier_coefficient_a2: randomNum(-1.0, 1.0),
    fourier_coefficient_b2: randomNum(-1.0, 1.0),

    // Water Quality
    turbidity: randomNum(5.0, 45.0),
    water_temperature: +(temp - randomNum(1.0, 4.0)).toFixed(2),
    ph: randomNum(7.8, 8.4),
    conductivity: randomNum(35.0, 48.0),
    dissolved_oxygen: randomNum(6.0, 9.0),
    salinity: randomNum(32.0, 37.0),
    chlorophyll_a: randomNum(0.5, 7.5),

    // MicroFLU
    phycoerythrin: randomNum(0.1, 3.5),
    fluorescein_dye: randomNum(0.0, 1.5),
    pah: randomNum(0.0, 0.8),
    oil_in_water: randomNum(0.0, 0.5),
    bt: randomNum(0.0, 0.5)
  };

  // ADCP Bins (1 to 10)
  for (let b = 1; b <= 10; b++) {
    payload[`current_speed_bin_${b}`] = randomNum(0.05, 2.0);
    payload[`current_direction_bin_${b}`] = randomNum(0.0, 359.0);
  }

  return payload;
}

async function loadStations(pool) {
  try {
    const res = await pool.query('SELECT station_id, lat_dd, lon_dd FROM tb_stations_config ORDER BY id ASC');
    if (res.rows && res.rows.length > 0) {
      console.log(`[Init] Loaded ${res.rows.length} stations from tb_stations_config:`, res.rows.map(r => r.station_id));
      return res.rows.map(r => [r.station_id, r.lat_dd, r.lon_dd]);
    }
  } catch (err) {
    console.warn(`[Warning] Could not load tb_stations_config: ${err.message}. Using default 5 stations.`);
  }
  return DEFAULT_STATIONS;
}

async function getTableColumns(pool, tableName) {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name != 'id'
    `, [tableName]);
    return new Set(res.rows.map(r => r.column_name));
  } catch (e) {
    return new Set();
  }
}

async function createPoolWithFallback() {
  let pool = new Pool(DB_CONFIG);
  try {
    const client = await pool.connect();
    client.release();
    return pool;
  } catch (err) {
    if (DB_CONFIG.port === 5433 && err.message.includes('ECONNREFUSED')) {
      console.log('[Info] Port 5433 refused, trying fallback port 5432...');
      const fallbackConfig = { ...DB_CONFIG, port: 5432 };
      pool = new Pool(fallbackConfig);
      const client = await pool.connect();
      client.release();
      console.log('[Connected] Successfully connected on fallback port 5432.');
      return pool;
    }
    throw err;
  }
}

async function startLiveInserter() {
  console.log('='.repeat(60));
  console.log(' Qatar Real-Time Station Data Inserter (Node.js)');
  console.log(` Target Database: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(` Interval: Every ${INTERVAL_SECONDS} seconds`);
  console.log('='.repeat(60));

  let pool;
  try {
    pool = await createPoolWithFallback();
    console.log('[Connected] Database connection established.');
  } catch (e) {
    console.error(`[Error] Initial connection failed: ${e.message}`);
    console.log('[Wait] Will retry in 5 seconds...');
  }

  let running = true;
  process.on('SIGINT', () => {
    console.log('\n[Shutdown] Stopping data inserter gracefully...');
    running = false;
    if (pool) pool.end();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    console.log('\n[Shutdown] Stopping data inserter...');
    running = false;
    if (pool) pool.end();
    process.exit(0);
  });

  const tableColumnsCache = {};

  while (running) {
    try {
      if (!pool) {
        pool = await createPoolWithFallback();
      }

      const stations = await loadStations(pool);
      const insertedSummary = [];
      const cycleTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

      for (const [stationId, latStr, lonStr] of stations) {
        const tableName = `tb_buoy_${stationId.toLowerCase()}_measurements`;

        if (!tableColumnsCache[tableName]) {
          const cols = await getTableColumns(pool, tableName);
          if (!cols || cols.size === 0) {
            continue;
          }
          tableColumnsCache[tableName] = cols;
        }

        const validCols = tableColumnsCache[tableName];
        const payload = generateSensorPayload(stationId, latStr, lonStr);

        const colNames = Object.keys(payload).filter(k => validCols.has(k));
        const colValues = colNames.map(k => payload[k]);

        if (colNames.length === 0) continue;

        const placeholders = colNames.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO "${tableName}" ("${colNames.join('", "')}") VALUES (${placeholders}) RETURNING id`;

        const insertRes = await pool.query(query, colValues);
        const newId = insertRes.rows[0]?.id;
        insertedSummary.push(`${stationId} (id=${newId})`);
      }

      console.log(`[${cycleTime}] ✅ Inserted data for ${insertedSummary.length} stations: ${insertedSummary.join(', ')}`);
    } catch (err) {
      console.error(`[Error] Insertion error: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, INTERVAL_SECONDS * 1000));
  }
}

// Support CSV generation if --csv flag is passed
function generateCsvForOneMonth(outputFile = 'station_data.csv') {
  console.log(`Generating CSV file to ${outputFile}...`);
  const headers = [
    'id', 'station_id', 'timestamp', 'datetime', 'battery', 'cam_img', 'lat', 'lon',
    'wind_speed', 'wind_direction_deg', 'temperature_deg', 'rh_percent', 'bp_hpa', 'global_radiation', 'rain_mm', 'visibility',
    'wave_heading', 'wave_height', 'tzc', 'tz', 'tm02', 'wave_direction', 'wave_direction_fw', 'mean_wave_direction', 'hmax',
    'fourier_coefficient_a1', 'fourier_coefficient_b1', 'fourier_coefficient_a2', 'fourier_coefficient_b2', 'havg', 'dominant_time_period_fw',
    'turbidity', 'water_temperature', 'ph', 'conductivity', 'dissolved_oxygen', 'salinity', 'chlorophyll_a', 'wind_gust',
    'phycoerythrin', 'fluorescein_dye', 'pah', 'oil_in_water', 'bt',
    'current_speed_bin_1', 'current_direction_bin_1', 'current_speed_bin_2', 'current_direction_bin_2',
    'current_speed_bin_3', 'current_direction_bin_3', 'current_speed_bin_4', 'current_direction_bin_4',
    'current_speed_bin_5', 'current_direction_bin_5', 'current_speed_bin_6', 'current_direction_bin_6',
    'current_speed_bin_7', 'current_direction_bin_7', 'current_speed_bin_8', 'current_direction_bin_8',
    'current_speed_bin_9', 'current_direction_bin_9', 'current_speed_bin_10', 'current_direction_bin_10'
  ];

  const lines = [headers.join(',')];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const now = new Date();

  let id = 1;
  for (let dt = new Date(startDate); dt <= now; dt.setMinutes(dt.getMinutes() + 10)) {
    const payload = generateSensorPayload('M22', 25.3877, 51.5426);
    payload.timestamp = dt.toISOString();
    payload.datetime = dt.toISOString().replace('T', ' ').slice(0, 19);

    const row = headers.map(h => (h === 'id' ? id : payload[h] ?? ''));
    lines.push(row.join(','));
    id++;
  }

  const outputPath = path.resolve(__dirname, outputFile);
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`✅ CSV file generated successfully: ${outputPath}`);
}

if (process.argv.includes('--csv')) {
  generateCsvForOneMonth();
} else {
  startLiveInserter();
}
