const WebSocket = require('ws');
const { pool } = require('./db');

let wss = null;
let lastSeenIds = {};
let latestCache = {
  allStations: [],
  byStation: {},
  stationsConfig: [],
  lastUpdated: null
};

/**
 * Dynamically discover all buoy measurement tables and fetch the latest sensor records.
 */
async function fetchLatestSensorData() {
  try {
    // 1. Fetch all configured stations
    let stationsConfig = [];
    try {
      const configRes = await pool.query('SELECT * FROM tb_stations_config ORDER BY id ASC');
      stationsConfig = configRes.rows;
    } catch (e) {
      console.warn('[WebSocket] Error querying tb_stations_config:', e.message);
    }

    // 2. Discover all tables matching pattern 'tb_buoy_%_measurements'
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'tb_buoy_%_measurements'
      ORDER BY table_name ASC
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    const allStations = [];
    const byStation = {};
    let hasChanges = false;

    for (const tableName of tables) {
      try {
        const match = tableName.match(/^tb_buoy_(.*?)_measurements$/i);
        const rawStationId = match ? match[1] : null;
        if (!rawStationId) continue;

        const res = await pool.query(
          `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 1`
        );

        if (res.rows.length > 0) {
          const row = res.rows[0];
          // Ensure station_id is set
          const stationId = row.station_id || rawStationId.toUpperCase();
          row.station_id = stationId;

          // Check if this row is newer than what we last saw
          if (lastSeenIds[tableName] !== row.id) {
            hasChanges = true;
            lastSeenIds[tableName] = row.id;
          }

          allStations.push(row);
          byStation[stationId] = row;
          byStation[stationId.toLowerCase()] = row;
          byStation[stationId.toUpperCase()] = row;
        }
      } catch (tableErr) {
        // Table might be locked or momentarily unavailable
        // continue scanning other tables
      }
    }

    if (hasChanges || latestCache.allStations.length === 0) {
      latestCache = {
        allStations,
        byStation,
        stationsConfig,
        lastUpdated: new Date().toISOString()
      };
      return { changed: true, data: latestCache };
    }

    return { changed: false, data: latestCache };
  } catch (err) {
    console.error('[WebSocket] Error scanning sensor data:', err.message);
    return { changed: false, data: latestCache };
  }
}

/**
 * Broadcast message to all connected clients
 */
function broadcast(payload) {
  if (!wss) return;
  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('[WebSocket] Send error:', err.message);
      }
    }
  });
}

/**
 * Initialize WebSocket Server attached to HTTP server
 */
function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  console.log('[WebSocket] Server initialized on ws://localhost:3000');

  wss.on('connection', async (ws, req) => {
    console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}. Active clients: ${wss.clients.size}`);

    // Immediately send cached latest data upon connection
    if (latestCache.allStations.length > 0) {
      ws.send(JSON.stringify({
        type: 'LIVE_SENSOR_DATA',
        timestamp: latestCache.lastUpdated,
        data: latestCache.allStations,
        byStation: latestCache.byStation,
        stationsConfig: latestCache.stationsConfig
      }));
    } else {
      // If cache is empty, fetch immediately
      const result = await fetchLatestSensorData();
      ws.send(JSON.stringify({
        type: 'LIVE_SENSOR_DATA',
        timestamp: result.data.lastUpdated,
        data: result.data.allStations,
        byStation: result.data.byStation,
        stationsConfig: result.data.stationsConfig
      }));
    }

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.action === 'GET_LATEST') {
          ws.send(JSON.stringify({
            type: 'LIVE_SENSOR_DATA',
            timestamp: latestCache.lastUpdated,
            data: latestCache.allStations,
            byStation: latestCache.byStation,
            stationsConfig: latestCache.stationsConfig
          }));
        }
      } catch (e) {
        // ignore non-json messages
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected. Remaining clients: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Client socket error:', err.message);
    });
  });

  // Fast background loop: checks every 1.5s for database changes and broadcasts immediately
  setInterval(async () => {
    if (!wss || wss.clients.size === 0) return;

    const { changed, data } = await fetchLatestSensorData();
    if (changed) {
      broadcast({
        type: 'LIVE_SENSOR_DATA',
        timestamp: data.lastUpdated,
        data: data.allStations,
        byStation: data.byStation,
        stationsConfig: data.stationsConfig
      });
    }
  }, 1500);

  // Initial fetch to prime cache
  fetchLatestSensorData();
}

/**
 * Trigger immediate scan and broadcast (e.g., when a station is created or edited)
 */
async function triggerImmediateBroadcast() {
  const { data } = await fetchLatestSensorData();
  broadcast({
    type: 'LIVE_SENSOR_DATA',
    timestamp: data.lastUpdated,
    data: data.allStations,
    byStation: data.byStation,
    stationsConfig: data.stationsConfig
  });
}

module.exports = {
  initWebSocket,
  broadcast,
  triggerImmediateBroadcast
};
