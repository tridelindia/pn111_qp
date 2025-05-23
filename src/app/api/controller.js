const bcrypt = require('bcrypt');
const { pool } = require('./db');
const moment = require('moment/moment');
const sendEmail = require('./sendEmail');
const { last } = require('rxjs');
require('dotenv').config();

const getStationConfig = async (req, res) => {
  console.log('Received request to getStationConfig');
 
  try {
    const result = await pool.query('SELECT * FROM tb_stations_config ORDER BY id ASC');
    ;
    console.log('Query successful:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching StationConfig data:', err.message);
    res.status(500).json({ error: err.message });
  }
};
 
const getAllSensorData = async (req, res) => {
  try {
    // Step 1: Get all table names matching the pattern
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'tb_buoy_%_measurements'
    `);
 
    const tables = tablesResult.rows.map(row => row.table_name);
 
    let allData = [];
 
    // Step 2: For each table, fetch the data
    for (const tableName of tables) {
      try {
        const stationIdMatch = tableName.match(/^tb_buoy_(.*?)_measurements$/);
        const stationId = stationIdMatch ? stationIdMatch[1] : null;
 
        if (!stationId) continue;
 
        const result = await pool.query(`SELECT *, '${stationId}' as station_id FROM ${tableName} ORDER BY id DESC LIMIT 1`);
 
        if (result.rows.length > 0) {
          allData.push(result.rows[0]);
        }
      } catch (tableError) {
        console.warn(`Skipping table ${tableName}: ${tableError.message}`);
      }
    }
 
    res.json(allData);
  } catch (err) {
    console.error('Error fetching all sensor data:', err.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
 
 
 
const getAllSensorDatabyStation = async (req, res) => {
  const { stationId } = req.params; // e.g., QP001, QP002, etc.
 
  // const match = stationId.match(/QP0*(\d+)/);
  // if (!match) {
  //   return res.status(400).json({ error: 'Invalid station ID format' });
  // }
 
  // const number = match[1].padStart(2, '0'); // Ensure two-digit format
  const tableName = `tb_buoy_${stationId}_measurements`;
 
  console.log(`Fetching data from ${tableName}`);
 
  try {
    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Error fetching sensor data:', error.message);
    res.status(500).json({ error: error.message });
  }
};
 
 
 
const getSensorDataByDate = async (req, res) => {
  console.log('Received request to getSensorDataByDate');
  const { fromDate, toDate } = req.query;
 
  try {
    const result = await pool.query(
      `SELECT * FROM tb_buoy_qp001_measurements
         WHERE timestamp BETWEEN $1 AND $2 ORDER BY id ASC`,
      [fromDate, toDate]
    );
 
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Error fetching getSensorDataByDate data:', error.message);
    res.status(500).json({ error: error.message });
  }
};
 
// In your Express controller
const getSensorDataByStationAndDate = async (req, res) => {
  const { stationId, fromDate, toDate } = req.query;
 
  if (!stationId || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
 
  const tableName = `tb_buoy_${stationId}_measurements`;
 
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE timestamp BETWEEN $1 AND $2 ORDER BY id ASC`,
      [fromDate, toDate]
    );
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Error fetching combined data:', error.message);
    res.status(500).json({ error: error.message });
  }
};
 
 
const getMetrologicalData = async (req, res) => {
  console.log('Received request to getMetrologicalData');
 
  try {
    const result = await pool.query('SELECT * FROM tb_metrological_params_01');
    console.log('Query successful:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching MetrologicalData data:', error.message);
    res.status(500).json({ error: error.message });
  }
}
 
const getHomeConfig = async (req, res) => {
  console.log('Received request to getHomeConfig');
 
  try {
    const result = await pool.query('SELECT * FROM tb_home_config');
    console.log('Query successful:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching HomeConfig data:', error.message);
  }
}
 
 

const addStation = async (req, res) => {
    const tableSchemas = {
        adcp: `
          id SERIAL PRIMARY KEY,
          current_dir TEXT,
          current_speed TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `,
        meteorology: `
          id SERIAL PRIMARY KEY,
            wind_speed TEXT,
            wind_direction TEXT,
            wind_gust TEXT,
            tempereture TEXT,
            rh TEXT,
            bp TEXT,
            radiation TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `,
        water_quality: `
          id SERIAL PRIMARY KEY,
            timestamp TIMESTAMPTZ,
            Turbidity TEXT,
            tempereture TEXT,
            pH TEXT,
            conductivity TEXT,
            dissolved_oxygen TEXT,
            salinity TEXT,
            chlorophyll TEXT,
            phycoerythrin TEXT,
            fluorescein_dye TEXT
        `,
        adcp: `
          id SERIAL PRIMARY KEY,
          current_speed FLOAT,
          current_direction FLOAT,
          depth FLOAT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `,
        visibility:`
        id SERIAL PRIMARY KEY,
        visibility_nm TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `,
        wave: `
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMPTZ,
            heading TEXT,
            Hs TEXT,
            dominant_time_period TEXT,
            P_max TEXT,
            ADP TEXT,
            wave_direction TEXT,
            wave_direction_FW TEXT,
            mean_wave_direction TEXT,
            H_max TEXT,
            fourier_coefficient_a1 TEXT,
            fourier_coefficient_a2 TEXT,
            fourier_coefficient_b1 TEXT,
            fourier_coefficient_b2 TEXT,
            H_avg TEXT,
            dominant_time_period_FW TEXT
	
        `,
        microflu: `
          id SERIAL PRIMARY KEY,
          chlorophyll FLOAT,
          phycocyanin FLOAT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `,
        main_measurements: `
                id SERIAL PRIMARY KEY,
                station_id TEXT,
                timestamp TIMESTAMPtz,
                datetime TIMESTAMP,
                battery NUMERIC(5,2),
                cam_img TEXT,
                lat NUMERIC(10,6),
                lon NUMERIC(10,6),
                windspeed NUMERIC(5,2),
                wind_direction_deg NUMERIC(5,2),
                temperature_deg NUMERIC(5,2),
                rh_percent NUMERIC(5,2),
                bp_hpa NUMERIC(5,2),
                global NUMERIC(5,2),
                rain_mm NUMERIC(5,2),
                visibility_nm NUMERIC(5,2),
                wave_heading  NUMERIC(5,2),
                wave_height  NUMERIC(5,2),
                Tzc  NUMERIC(5,2),
                Tz  NUMERIC(5,2),
                Tm02  NUMERIC(5,2),
                wave_direction  NUMERIC(5,2),
                wave_direction_fw  NUMERIC(5,2),
                mean_wave_direction  NUMERIC(5,2),
                hmax  NUMERIC(5,2),
                fourier_coefficient_a1  NUMERIC(5,2),
                fourier_coefficient_b1  NUMERIC(5,2),
                fourier_coefficient_a2  NUMERIC(5,2),
                fourier_coefficient_b2  NUMERIC(5,2),
                havg  NUMERIC(5,2),
                dominant_time_period_fw  NUMERIC(5,2),
                turbidity  NUMERIC(5,2),
                water_temperature  NUMERIC(5,2),
                ph  NUMERIC(5,2),
                conductivity  NUMERIC(5,2),
                dissolved_oxygen  NUMERIC(5,2),
                salinity  NUMERIC(5,2),
                chlorophyll_a  NUMERIC(5,2),
                wind_gust  NUMERIC(5,2),
                phycoerythrin  NUMERIC(5,2),
                fluorescein_dye  NUMERIC(5,2),
                pah  NUMERIC(5,2),
                oil_in_water  NUMERIC(5,2),
                bt  NUMERIC(5,2),

                current_speed_bin_1  NUMERIC(5,2),
                current_direction_bin_1  NUMERIC(5,2),
                current_speed_bin_2  NUMERIC(5,2),
                current_direction_bin_2  NUMERIC(5,2),
                current_speed_bin_3  NUMERIC(5,2),
                current_direction_bin_3  NUMERIC(5,2),
                current_speed_bin_4  NUMERIC(5,2),
                current_direction_bin_4  NUMERIC(5,2),
                current_speed_bin_5  NUMERIC(5,2),
                current_direction_bin_5  NUMERIC(5,2),
                current_speed_bin_6  NUMERIC(5,2),
                current_direction_bin_6  NUMERIC(5,2),
                current_speed_bin_7  NUMERIC(5,2),
                current_direction_bin_7  NUMERIC(5,2),
                current_speed_bin_8  NUMERIC(5,2),
                current_direction_bin_8  NUMERIC(5,2),
                current_speed_bin_9  NUMERIC(5,2),
                current_direction_bin_9  NUMERIC(5,2),
                current_speed_bin_10  NUMERIC(5,2),
                current_direction_bin_10  NUMERIC(5,2)
        `
      };
      
    console.log('Received request to addStation', req.body);

    const {
        buoy_id,
        buoy_name,
        buoy_warning,
        buoy_danger,
        buoy_loc_latitude,
        buoy_loc_longitude,
        buoy_loc_degree_lat,
        buoy_loc_minutes_lat,
        buoy_loc_seconds_lat,
        buoy_loc_degree_lon,
        buoy_loc_minutes_lon,
        buoy_loc_seconds_lon,
        buoy_sensors,
        geo_format,
        image
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO tb_stations_config (
                station_id, station_name, warning, danger, geo_format,
                lat_dd, lon_dd, lat_deg, lat_min, lat_sec,
                lon_deg, lon_min, lon_sec, sensors, status, image
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16
            ) RETURNING *
        `;
        const insertValues = [
            buoy_id, buoy_name, buoy_warning, buoy_danger, geo_format,
            buoy_loc_latitude, buoy_loc_longitude, buoy_loc_degree_lat,
            buoy_loc_minutes_lat, buoy_loc_seconds_lat,
            buoy_loc_degree_lon, buoy_loc_minutes_lon, buoy_loc_seconds_lon,
            buoy_sensors, "active", ""
        ];

        const result = await client.query(insertQuery, insertValues);
        console.log('Station added:', result.rows[0]);

        // Create sensor parameter tables
        for (const [sensor, schema] of Object.entries(tableSchemas)) {
            const tableName =
              sensor === 'main_measurements'
                ? `tb_buoy_${buoy_id}_measurements`
                : `tb_${sensor}_params_${buoy_id}`;
            const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`;
            await client.query(createQuery);
          }
      
          await client.query('COMMIT');
          console.log('All tables created and station saved.');
          res.json(result.rows);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding Station:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};





const editStation = async (req, res) => {
    console.log('Received request to editStation', req.body);

    const {
        buoy_id,
        buoy_name,
        buoy_warning,
        buoy_danger,
        buoy_loc_latitude,
        buoy_loc_longitude,
        buoy_loc_degree_lat,
        buoy_loc_minutes_lat,
        buoy_loc_seconds_lat,
        buoy_loc_degree_lon,
        buoy_loc_minutes_lon,
        buoy_loc_seconds_lon,
        buoy_sensors,
        geo_format,
        buoy_image
    } = req.body;

    try {
        const updateQuery = `
            UPDATE tb_stations_config SET
                station_name = $1,
                warning = $2,
                danger = $3,
                geo_format = $4,
                lat_dd = $5,
                lon_dd = $6,
                lat_deg = $7,
                lat_min = $8,
                lat_sec = $9,
                lon_deg = $10,
                lon_min = $11,
                lon_sec = $12,
                sensors = $13,
                image = $14
            WHERE station_id = $15
            RETURNING *
        `;

        const updateValues = [
            buoy_name,
            buoy_warning,
            buoy_danger,
            geo_format,
            buoy_loc_latitude,
            buoy_loc_longitude,
            buoy_loc_degree_lat,
            buoy_loc_minutes_lat,
            buoy_loc_seconds_lat,
            buoy_loc_degree_lon,
            buoy_loc_minutes_lon,
            buoy_loc_seconds_lon,
            buoy_sensors,
            buoy_image,
            buoy_id
        ];

        const result = await pool.query(updateQuery, updateValues);
        console.log('Station updated:', result.rows[0]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error editing Station:', error.message);
        res.status(500).json({ error: error.message });
    }
};


const insertSensorConfigs = async (req, res) => {
    const sensorData = req.body; // Expecting array of sensor configs
  
    try {
      const insertQuery = `
        INSERT INTO tb_sensor_config (name, param_name, unit, warning, danger, notification)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
  
      const insertedRows = [];
  
      for (const config of sensorData) {
        const values = [
          config.sensor,
          config.name,
          config.unit,
          config.warning,
          config.danger,
          config.notification
        ];
  
        const result = await pool.query(insertQuery, values);
        insertedRows.push(result.rows[0]);
      }
  
      res.status(200).json({
        message: "Sensor configurations inserted successfully.",
        data: insertedRows
      });
  
    } catch (error) {
      console.error("Error inserting sensor configurations:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  


  const getSensorConfig = async (req, res) => {
    console.log('Received request to getSensorConfig');

    try {
        const result = await pool.query('SELECT * FROM tb_sensor_config ORDER BY id ASC');
        // console.log('Query successful:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sensorConfig data:', err.message);
        res.status(500).json({ error: err.message });
    }
};



const updateSensorConfig = async (req, res) => {
    const {
        id,
        name,
        param_name,
        unit,
        warning,
        danger,
        notification
    } = req.body;

    try {
        const updateQuery = `
            UPDATE tb_sensor_config SET
                name = $1,
                param_name = $2,
                unit = $3,
                warning = $4,
                danger = $5,
                notification = $6,
                timestamp = NOW()
            WHERE id = $7
            RETURNING *
        `;

        const values = [
            name,
            param_name,
            unit,
            warning,
            danger,
            notification,
            id
        ];

        const result = await pool.query(updateQuery, values);

        res.json({
            message: "Sensor configuration updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating sensor config:', error.message);
        res.status(500).json({ error: error.message });
    }
};




// user management
const fetchRole =async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tb_roles ORDER BY name ASC');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }

const addRole = async (req, res) => {
    const { name, description, permissions } = req.body;
  
    if (!name || !permissions) {
      return res.status(400).json({ message: 'Name and permissions are required.' });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO tb_roles (name, description, permissions)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description || '', permissions]
      );
      res.status(201).json({ message: 'Role added successfully', role: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }

  const deleteRole = async (req, res) => {
    const { name } = req.params;
  
    try {
      const result = await pool.query(
        'DELETE FROM tb_roles WHERE name = $1 RETURNING *',
        [name]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }
  
      res.json({ message: 'Role deleted successfully', role: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }


  const fetchUser = async (req, res) => {
    const result = await pool.query('SELECT * FROM tb_users ORDER BY id ASC');
    res.json(result.rows);
  }

  const checkUsername = async (req, res) => {
    const { username } = req.query;
    try {
      const result = await pool.query(
        'SELECT COUNT(*) AS count FROM tb_users WHERE username = $1',
        [username]
      );
      res.json({ exists: result.rows[0].count > 0 });
    } catch (error) {
      console.error('Error in checkUsername:', error);
      res.status(500).json({ message: 'Error checking username.' });
    }
  };
  
  const checkEmail = async (req, res) => {
    const { email } = req.query;
    try {
      const result = await pool.query(
        'SELECT COUNT(*) AS count FROM tb_users WHERE email = $1',
        [email]
      );
      res.json({ exists: result.rows[0].count > 0 });
    } catch (error) {
      console.error('Error in checkEmail:', error);
      res.status(500).json({ message: 'Error checking email.' });
    }
  };  
  const addUser = async (req, res) => {
    try {
      const { name, username, email, password, role, designation, avatar } = req.body;
  
      // 🔐 Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO tb_users (name, username, email, password, role, designation, avatar)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, username, email, hashedPassword, role, designation, avatar]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }


  const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, username, email, password, role, designation, avatar } = req.body;
 
      // Step 1: Get current user from DB
      const existingUserResult = await pool.query('SELECT * FROM tb_users WHERE id = $1', [id]);
      const existingUser = existingUserResult.rows[0];
 
      if (!existingUser) {
        return res.status(404).send('User not found');
      }
 
      // Step 2: Only update password if it's provided
      let hashedPassword = existingUser.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
 
      // Step 3: Fallback to current DB values for restricted fields if not provided
      const updatedEmail = email ?? existingUser.email;
      const updatedRole = role ?? existingUser.role;
      const updatedDesignation = designation ?? existingUser.designation;
 
      // Step 4: Perform the update
      const result = await pool.query(
        `UPDATE tb_users
         SET name = $1, username = $2, email = $3, password = $4, role = $5, designation = $6, avatar = $7
         WHERE id = $8 RETURNING *`,
        [
          name,
          username,
          updatedEmail,
          hashedPassword,
          updatedRole,
          updatedDesignation,
          avatar,
          id
        ]
      );
 
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

  const deleteUser = async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM tb_users WHERE id = $1', [id]);
    res.status(204).send();
  }


  const fetchDesignation = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tb_designations');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching designations:', error);
      res.status(500).send('Internal server error');
    }
  }
  const addDesignation = async (req, res) => {
    const { title, description } = req.body;
    try {
      await pool.query(
        'INSERT INTO tb_designations (title, description) VALUES ($1, $2)',
        [title, description]
      );
      res.status(201).json({ message: 'Designation added' }); // ✅ Return valid JSON
    } catch (error) {
      console.error('Error adding designation:', error);
      res.status(500).send('Internal server error');
    }
  }
  const deleteDesignation =async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tb_designations WHERE id = $1', [id]);
      res.json({ message: 'Designation deleted' }); // ✅ Proper JSON response
    } catch (error) {
      console.error('Error deleting designation:', error);
      res.status(500).send('Internal server error');
    }
  }


  const loginUser = async (req, res) => {
    const { username, password } = req.body;
   
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password' });
    }
   
    try {
      const userQuery = `SELECT * FROM tb_users WHERE username = $1`;
      const userResult = await pool.query(userQuery, [username]);
      const user = userResult.rows[0];
   
      if (!user) return res.status(404).json({ message: 'User not found' });
   
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
   
      const roleQuery = `SELECT permissions FROM tb_roles_backup WHERE name = $1`;
      const roleResult = await pool.query(roleQuery, [user.role]);
      const permissions = roleResult.rows[0]?.permissions || [];
   
      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        designation: user.designation,
        avatar: user.avatar,
        permissions,
      };
   
      res.json(userWithoutPassword);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
   
   
const getSensorDataForHealth = async (req, res) => {
  console.log('Received request getSensorDataForHealth');
  
  try {
      const { startDate, endDate, station_id } = req.query;
      
      if (!startDate || !endDate) {
          return res.status(400).json({ error: 'Both startDate and endDate parameters are required' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let query;
      let params;

      if (station_id !== 'all') {
          query = `
              SELECT * FROM tb_buoy_01_measurements 
              WHERE timestamp >= $1 AND timestamp <= $2 
              AND station_id = $3 
              ORDER BY timestamp`;
          params = [startDate, endDate, station_id];
      } else {
          query = `
              SELECT * FROM tb_buoy_01_measurements 
              WHERE timestamp >= $1 AND timestamp <= $2 
              ORDER BY timestamp`;
          params = [startDate, endDate];
      }
      const { rows } = await pool.query(query, params);

      console.log(`Found ${rows.length} records`);

      const processedData = await processData(rows, start, end);

      const dateRanges = generateDateRanges(start, end, processedData.data.length);

      const result = {
          success: true,
          data: processedData.data,
          parameters: processedData.parameters,
          sensorTabs: processedData.sensorTabs,
          dateRange: processedData.dateRange,
          chartRanges: dateRanges
      };

      res.json(result);
  } catch (error) {
      console.error('Error fetching sensor health data:', error.message);
      res.status(500).json({
          success: false,
          error: error.message 
      });
  }
};


async function processData(rows, startDate, endDate) {
  const parameterMappings = {
      oceanography: {
          wave: {
              '0': 'heading',
              '1': 'hs',
              '2': 'tzc',
              '3': 'dominanttimeperiod',
              '4': 'tm02',
              '5': 'wave_direction',
              '6': 'wave_directionfw',
              '7': 'mean_wave_direction',
              '8': 'hmax',
              '9': 'fourier_coefficient_a1',
              '10': 'fourier_coefficient_a2',
              '11': 'fourier_coefficient_b1',
              '12': 'fourier_coefficient_b2',
              '13': 'dominanttimeperiodfw',
              '14': 'havq'
          },
          current: {
              '15': 'cell_1_dir',
              '16': 'cell_1_speed'
          }
      },
      meteorology: {
          wind: {
              '17': 'avg_ws',
              '18': 'avgwindr',
              '19': 'windgust'
          },
          atmospheric: {
              '20': 'air_temperature',
              '21': 'relative_humidity',
              '22': 'barometric_pressure',
              '23': 'rainfall',
              '24': 'visibility',
              '25': 'solar_radiation'
          }
      },
      water_quality: {
          chemical: {
              '26': 'pah',
              '27': 'oil_in_water',
              '28': 'bt'
          },
          physical: {
              '29': 'turbidity',
              '30': 'conductivity',
              '31': 'dissolved_oxygen',
              '32': 'ph_level',
              '33': 'salinity'
          },
          biological: {
              '34': 'chlorophyll_a',
              '35': 'water_temp',
              '36': 'phycoerythrin',
              '37': 'fluorescein_dye'
          }
      }
  };

  if (rows.length < 10) {
      const processedData = rows.map(row => {
          const healthData = {
              timestamp: row.timestamp,
              dataPresent: {}
          };

          for (const [category, subCategories] of Object.entries(parameterMappings)) {
              for (const [subCategory, params] of Object.entries(subCategories)) {
                  for (const [paramId, dbField] of Object.entries(params)) {
                      const paramKey = `${category}.${subCategory}.${paramId}`;
                      const value = row[dbField];
                      healthData.dataPresent[paramKey] = (value !== null && value !== undefined && value !== '') ? 1 : 0;
                  }
              }
          }

          return healthData;
      });

      return {
          data: processedData.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),
          parameters: parameterMappings,
          sensorTabs: {
              oceanography: [
                  {
                      value: 'wave',
                      title: 'Wave',
                      subTabs: [
                          { value: '0', title: 'Wave Heading' },
                          { value: '1', title: 'Wave Height' },
                          { value: '2', title: 'Tzc' },
                          { value: '3', title: 'Tz' },
                          { value: '4', title: 'Tm02' },
                          { value: '5', title: 'Wave Direction' },
                          { value: '6', title: 'Wave Direction FW' },
                          { value: '7', title: 'Mean Wave Direction' },
                          { value: '8', title: 'Max Wave Height' },
                          { value: '9', title: 'Fourier Coefficient a1' },
                          { value: '10', title: 'Fourier Coefficient a2' },
                          { value: '11', title: 'Fourier Coefficient b1' },
                          { value: '12', title: 'Fourier Coefficient b2' },
                          { value: '13', title: 'Dominant Time Period FW' },
                          { value: '14', title: 'Havg' }
                      ]
                  },
                  {
                      value: 'current',
                      title: 'Current',
                      subTabs: [
                          { value: '15', title: 'Current Direction' },
                          { value: '16', title: 'Current Speed' }
                      ]
                  }
              ],
              meteorology: [
                  {
                      value: 'wind',
                      title: 'Wind',
                      subTabs: [
                          { value: '17', title: 'Wind Speed' },
                          { value: '18', title: 'Wind Direction' },
                          { value: '19', title: 'Wind Gust' }
                      ]
                  },
                  {
                      value: 'atmospheric',
                      title: 'Atmospheric Conditions',
                      subTabs: [
                          { value: '20', title: 'Temperature (Air)' },
                          { value: '21', title: 'Relative Humidity' },
                          { value: '22', title: 'Barometric Pressure' },
                          { value: '23', title: 'Rainfall' },
                          { value: '24', title: 'Visibility' },
                          { value: '25', title: 'Global Radiation' }
                      ]
                  }
              ],
              water_quality: [
                  {
                      value: 'chemical',
                      title: 'Chemical Pollutants',
                      subTabs: [
                          { value: '26', title: 'PAH' },
                          { value: '27', title: 'Oil in Water' },
                          { value: '28', title: 'BT' }
                      ]
                  },
                  {
                      value: 'physical',
                      title: 'Physical/Chemical Parameters',
                      subTabs: [
                          { value: '29', title: 'Turbidity' },
                          { value: '30', title: 'Conductivity' },
                          { value: '31', title: 'Dissolved Oxygen' },
                          { value: '32', title: 'pH Level' },
                          { value: '33', title: 'Salinity' }
                      ]
                  },
                  {
                      value: 'biological',
                      title: 'Biological/Optical Parameters',
                      subTabs: [
                          { value: '34', title: 'Chlorophyll-a' },
                          { value: '35', title: 'Water Temperature' },
                          { value: '36', title: 'Phycoerythrin' },
                          { value: '37', title: 'Fluorescein Dye' }
                      ]
                  }
              ]
          },
          dateRange: {
              start: startDate.toISOString(),
              end: endDate.toISOString()
          }
      };
  }

  const hourlyData = {};
  const dayData = {};
  
  const useDailyGroups = rows.length > 24;
  
  rows.forEach(row => {
      const timestamp = new Date(row.timestamp);
      let groupKey;
      
      if (useDailyGroups) {
          groupKey = new Date(
              timestamp.getFullYear(),
              timestamp.getMonth(),
              timestamp.getDate()
          ).toISOString();
      } else {
          groupKey = new Date(
              timestamp.getFullYear(),
              timestamp.getMonth(),
              timestamp.getDate(),
              timestamp.getHours()
          ).toISOString();
      }

      if (!hourlyData[groupKey]) {
          hourlyData[groupKey] = {
              timestamp: groupKey,
              dataPresent: {},
              count: 0
          };
      }
      
      hourlyData[groupKey].count++;

      for (const [category, subCategories] of Object.entries(parameterMappings)) {
          for (const [subCategory, params] of Object.entries(subCategories)) {
              for (const [paramId, dbField] of Object.entries(params)) {
                  const paramKey = `${category}.${subCategory}.${paramId}`;
                  
                  const value = row[dbField];
                  const isPresent = (value !== null && value !== undefined && value !== '') ? 1 : 0;
                  
                  if (hourlyData[groupKey].dataPresent[paramKey] === undefined) {
                      hourlyData[groupKey].dataPresent[paramKey] = 0;
                  }
                  
                  hourlyData[groupKey].dataPresent[paramKey] += isPresent;
              }
          }
      }
  });

  const processedGroups = Object.values(hourlyData).map(group => {
      const healthData = {
          timestamp: group.timestamp,
          dataPresent: {}
      };

      for (const [paramKey, presentCount] of Object.entries(group.dataPresent)) {
          healthData.dataPresent[paramKey] = presentCount / group.count;
      }
      return healthData;
  });

  return {
      data: processedGroups.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
      parameters: parameterMappings,
      sensorTabs: {
          oceanography: [
              {
                  value: 'wave',
                  title: 'Wave',
                  subTabs: [
                      { value: '0', title: 'Wave Heading' },
                      { value: '1', title: 'Wave Height' },
                      { value: '2', title: 'Tzc' },
                      { value: '3', title: 'Tz' },
                      { value: '4', title: 'Tm02' },
                      { value: '5', title: 'Wave Direction' },
                      { value: '6', title: 'Wave Direction FW' },
                      { value: '7', title: 'Mean Wave Direction' },
                      { value: '8', title: 'Max Wave Height' },
                      { value: '9', title: 'Fourier Coefficient a1' },
                      { value: '10', title: 'Fourier Coefficient a2' },
                      { value: '11', title: 'Fourier Coefficient b1' },
                      { value: '12', title: 'Fourier Coefficient b2' },
                      { value: '13', title: 'Dominant Time Period FW' },
                      { value: '14', title: 'Havg' }
                  ]
              },
              {
                  value: 'current',
                  title: 'Current',
                  subTabs: [
                      { value: '15', title: 'Current Direction' },
                      { value: '16', title: 'Current Speed' }
                  ]
              }
          ],
          meteorology: [
              {
                  value: 'wind',
                  title: 'Wind',
                  subTabs: [
                      { value: '17', title: 'Wind Speed' },
                      { value: '18', title: 'Wind Direction' },
                      { value: '19', title: 'Wind Gust' }
                  ]
              },
              {
                  value: 'atmospheric',
                  title: 'Atmospheric Conditions',
                  subTabs: [
                      { value: '20', title: 'Temperature (Air)' },
                      { value: '21', title: 'Relative Humidity' },
                      { value: '22', title: 'Barometric Pressure' },
                      { value: '23', title: 'Rainfall' },
                      { value: '24', title: 'Visibility' },
                      { value: '25', title: 'Global Radiation' }
                  ]
              }
          ],
          water_quality: [
              {
                  value: 'chemical',
                  title: 'Chemical Pollutants',
                  subTabs: [
                      { value: '26', title: 'PAH' },
                      { value: '27', title: 'Oil in Water' },
                      { value: '28', title: 'BT' }
                  ]
              },
              {
                  value: 'physical',
                  title: 'Physical/Chemical Parameters',
                  subTabs: [
                      { value: '29', title: 'Turbidity' },
                      { value: '30', title: 'Conductivity' },
                      { value: '31', title: 'Dissolved Oxygen' },
                      { value: '32', title: 'pH Level' },
                      { value: '33', title: 'Salinity' }
                  ]
              },
              {
                  value: 'biological',
                  title: 'Biological/Optical Parameters',
                  subTabs: [
                      { value: '34', title: 'Chlorophyll-a' },
                      { value: '35', title: 'Water Temperature' },
                      { value: '36', title: 'Phycoerythrin' },
                      { value: '37', title: 'Fluorescein Dye' }
                  ]
              }
          ]
      },
      dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
      }
  };
}

function generateDateRanges(start, end, dataPoints) {
  const ranges = [];
  const timeDiff = end - start;
  const interval = timeDiff / (dataPoints || 1);
  
  for (let i = 0; i < dataPoints; i++) {
      const rangeStart = new Date(start.getTime() + i * interval);
      const rangeEnd = new Date(start.getTime() + (i + 1) * interval);
      
      ranges.push({
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString(),
          label: formatRangeLabel(rangeStart, rangeEnd, dataPoints)
      });
  }
  
  return ranges;
}

function formatRangeLabel(start, end, totalPoints) {
  if (totalPoints <= 24) {
      return start.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
      });
  } else if (totalPoints <= 31) {
      return start.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric'
      });
  } else {
      return start.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
      });
  }
}

const getLastSensorData = async (req, res) => {
  console.log('Received request for lastest sensor data');
  
  try {
      const query = `
          SELECT * FROM tb_buoy_01_measurements 
          ORDER BY timestamp DESC
          LIMIT 1`;
          
      const { rows } = await pool.query(query);
      
      if (rows.length === 0) {
          return res.status(404).json({
              success: false,
              error: 'No data available'
          });
      }

      const lastRow = rows[0];
      console.log('Last record timestamp:', lastRow.timestamp);

      const processedData = processSingleRow(lastRow);

      res.json({
          success: true,
          data: processedData,
          timestamp: lastRow.timestamp
      });
  } catch (error) {
      console.error('Error fetching last sensor data:', error.message);
      res.status(500).json({
          success: false,
          error: error.message 
      });
  }
};

function processSingleRow(row) {
  const parameterMappings = {
      oceanography: {
          wave: {
              '0': 'heading',
              '1': 'hs',
              '2': 'tzc',
              '3': 'dominanttimeperiod',
              '4': 'tm02',
              '5': 'wave_direction',
              '6': 'wave_directionfw',
              '7': 'mean_wave_direction',
              '8': 'hmax',
              '9': 'fourier_coefficient_a1',
              '10': 'fourier_coefficient_a2',
              '11': 'fourier_coefficient_b1',
              '12': 'fourier_coefficient_b2',
              '13': 'dominanttimeperiodfw',
              '14': 'havq'
          },
          current: {
              '15': 'cell_1_dir',
              '16': 'cell_1_speed'
          }
      },
      meteorology: {
          wind: {
              '17': 'avg_ws',
              '18': 'avgwindr',
              '19': 'windgust'
          },
          atmospheric: {
              '20': 'air_temperature',
              '21': 'relative_humidity',
              '22': 'barometric_pressure',
              '23': 'rainfall',
              '24': 'visibility',
              '25': 'solar_radiation'
          }
      },
      water_quality: {
          chemical: {
              '26': 'pah',
              '27': 'oil_in_water',
              '28': 'bt'
          },
          physical: {
              '29': 'turbidity',
              '30': 'conductivity',
              '31': 'dissolved_oxygen',
              '32': 'ph_level',
              '33': 'salinity'
          },
          biological: {
              '34': 'chlorophyll_a',
              '35': 'water_temp',
              '36': 'phycoerythrin',
              '37': 'fluorescein_dye'
          }
      }
  };

  const result = {
      timestamp: row.timestamp,
      dataPresent: {}
  };

  for (const [category, subCategories] of Object.entries(parameterMappings)) {
      for (const [subCategory, params] of Object.entries(subCategories)) {
          for (const [paramId, dbField] of Object.entries(params)) {
              const paramKey = `${category}.${subCategory}.${paramId}`;
              const value = row[dbField];
              result.dataPresent[paramKey] = (value !== null && value !== undefined && value !== '') ? 1 : 0;
          }
      }
  }
  return result;
}

const addNotification = async (req, res) => {
  try{
      const { station_id, user_name, user_email, user_phone_number, country_code, enabled, station_name } = req.body;
      
      if (user_phone_number && user_phone_number.length > 15) {
          return res.status(400).json({
              success: false,
              error: 'Phone number must be 15 digits or less'
          });
      }

      const query = `
          INSERT INTO tb_event_notifications (station_id, user_name, user_email, user_phone_number, issue, enabled, station_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const { rows } = await pool.query(query, [station_id, user_name, user_email, country_code + user_phone_number, null, enabled, station_name]);

      res.status(201).json({
          success: true,
          data: rows[0],
          message: 'Notification added successfully'
      });
  } catch (error) {
      console.error('Error adding notification:', error.message);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
}

const updateNotificationStatus = async (req, res) => {
  try {
      const { id } = req.params;
      const { enabled } = req.body;
      
      const query = `
          UPDATE tb_event_notifications 
          SET enabled = $1 
          WHERE id = $2
          RETURNING *
      `;
      
      const { rows } = await pool.query(query, [
          enabled,
          id
      ]);

      if (rows.length === 0) {
          return res.status(404).json({
              success: false,
              error: 'Notification not found'
          });
      }

      res.status(200).json({
          success: true,
          data: rows[0],
          message: 'Notification updated successfully'
      });
  } catch (error) {
      console.error('Error updating notification:', error.message);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
}

const updateNotification = async (req, res) => {
  try {
      const { id } = req.params;
      const { station_id, user_name, user_email, user_phone_number, station_name } = req.body;
      
      if (user_phone_number && user_phone_number.length > 15) {
          return res.status(400).json({
              success: false,
              error: 'Phone number must be 15 digits or less'
          });
      }

      const query = `
          UPDATE tb_event_notifications 
          SET station_id = $1,
              user_name = $2,
              user_email = $3,
              user_phone_number = $4,
              issue = $5,
              station_name = $6
          WHERE id = $7
          RETURNING *
      `;
      
      const { rows } = await pool.query(query, [
          station_id,
          user_name,
          user_email,
          user_phone_number,
          null,
          station_name,
          id
      ]);

      if (rows.length === 0) {
          return res.status(404).json({
              success: false,
              error: 'Notification not found'
          });
      }

      res.status(200).json({
          success: true,
          data: rows[0],
          message: 'Notification updated successfully'
      });
  } catch (error) {
      console.error('Error updating notification:', error.message);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
}

const deleteNotification = async (req, res) => {
  try{
      const { id } = req.params;
      const query = `
          DELETE FROM tb_event_notifications WHERE id = $1
      `;
      await pool.query(query, [id]);

      res.status(200).json({
          success: true,
          message: 'Notification deleted successfully'
      });
  } catch (error) {
      console.error('Error deleting notification:', error.message);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
}

const getAllNotifications = async (req, res) => {
  try {
      const query = `
          SELECT * FROM tb_event_notifications
          ORDER BY id ASC
      `;
      const { rows } = await pool.query(query);

      res.json({
          success: true,
          data: rows
      });
  } catch (error) {
      console.error('Error fetching all notifications:', error.message);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
}

const checkAndTriggerNotifications = async (req, res) => {
try {
  const { station_id } = req.params || req.body || req.query;
  
  if (!station_id) {
    return res.status(400).json({
      success: false,
      error: 'station_id is required'
    });
  }

  const sensorConfigs = await pool.query(
    `SELECT * FROM tb_sensor_config 
     WHERE notification = 'enable'`,
    []
  );

  if (sensorConfigs.rows.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No sensor configurations with enabled notifications'
    });
  }

  const measurements = await pool.query(
    `SELECT * FROM tb_buoy_01_measurements
     WHERE station_id = $1
     ORDER BY timestamp DESC
     LIMIT 1`,
    [station_id]
  );

  if (measurements.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: `No measurement data available for station ${station_id}`
    });
  }

  const notifications = await pool.query(
    `SELECT * FROM tb_event_notifications
     WHERE station_id = $1 AND enabled = true`,
    [station_id]
  );

  if (notifications.rows.length === 0) {
    return res.status(200).json({
      success: true,
      message: `No enabled notifications for station ${station_id}`
    });
  }

  const latestData = measurements.rows[0];
  const notificationsSent = [];

  for (const config of sensorConfigs.rows) {
    const paramName = config.param_name;
    if (!paramName || !latestData[paramName]) continue;

    const currentValue = latestData[paramName];
    const userEmail = notifications.rows[0]?.user_email;

    let alert = null;
    if (currentValue >= config.danger) {
      alert = { level: 'danger', threshold: config.danger };
    } else if (currentValue >= config.warning) {
      alert = { level: 'warning', threshold: config.warning };
    }

    if (alert && userEmail) {
      try {
        const subject = `${alert.level.toUpperCase()} ALERT: ${paramName} at ${station_id}`;
        const message = `Parameter ${paramName} value ${currentValue} exceeded ${alert.level} threshold (${alert.threshold})`;
      // send mail
        await sendEmail(userEmail, subject, message);
        
      // send WhatsApp message
      //   const phoneNumber = notifications.rows[0]?.user_phone_number;
      //   if (phoneNumber) {
      //     const currentDate = new Date().toLocaleDateString('en-GB');
      //     const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          
      //     const whatsappMessage = {
      //       phone: phoneNumber,
      //       template: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      //       vars: {
      //         "1": currentDate,
      //         "2": currentTime
      //       }
      //     };

      //     const whatsappResult = await whatsappSender.sendMessage(
      //       whatsappMessage.phone,
      //       whatsappMessage.template,
      //       whatsappMessage.vars
      //     );

      //     console.log(whatsappResult.success ? 'WhatsApp Success' : 'WhatsApp Failed', phoneNumber);
      //   }

      //   send SMS
      // sendSMS(notifications.rows[0]?.user_phone_number, 'Station 01 has very low temperature.')
      // .then(sid => console.log('Message SID:', sid))
      // .catch(error => console.error('Failed to send message:', error));
        
        notificationsSent.push({
          station_id,
          parameter: paramName,
          value: currentValue,
          threshold: alert.threshold,
          level: alert.level,
          email: userEmail,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        notificationsSent.push({
          station_id,
          parameter: paramName,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    station_id,
    notifications_sent: notificationsSent.length,
    details: notificationsSent,
    message: notificationsSent.length > 0 
      ? 'Alerts processed successfully' 
      : 'No thresholds exceeded'
  });

} catch (error) {
  console.error('Notification processing error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
}
};

const saveLogs = async (req, res) => {
  try {
      const fs = require('fs');
      const path = require('path');
      const logFilePath = path.join(__dirname, 'activity_logs.txt');

      if (!fs.existsSync(logFilePath)) {
          return res.status(200).json({ success: true, message: 'No logs file found' });
      }

      const logs = fs.readFileSync(logFilePath, 'utf8')
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));

      if (logs.length === 0) {
          return res.status(200).json({ success: true, message: 'No logs to process' });
      }

      const insertQuery = `
          INSERT INTO public.tb_activity_logs (log, timestamp, "performedBy", code, filepath)
          VALUES ($1, $2, $3, $4, $5)
      `;

      for (let i = 0; i < logs.length; i++) {
          const log = logs[i];
          console.log(log);
          await pool.query(insertQuery, [
              log.activity,
              log.timestamp,
              log.userId,
              log.statusCode || null,
              log.filePath || null
          ]);
      }

      fs.writeFileSync(logFilePath, '');

      res.status(200).json({ 
          success: true, 
          message: `${logs.length} logs inserted successfully` 
      });
  } catch (error) {
      console.error('Error saving logs:', error);
      res.status(500).json({
          success: false, 
          message: 'Failed to save logs',
          error: error.message 
      });
  }
};

module.exports = {
  getStationConfig,
  getAllSensorData,
  getAllSensorDatabyStation,
  getSensorDataByDate,
  getSensorDataByStationAndDate,
  getMetrologicalData,
  getHomeConfig,
    addStation,
    editStation,
    insertSensorConfigs,
    getSensorConfig,
    updateSensorConfig,
    fetchUser,
    addUser,
    updateUser,
    deleteUser,
    addRole,
    fetchRole,
    deleteRole,
    fetchDesignation,
    addDesignation,
    deleteDesignation,
    loginUser,
    checkEmail,
    checkUsername,
    getSensorDataForHealth,
    getLastSensorData,
    getAllNotifications,
    addNotification,
    deleteNotification,
    updateNotification,
    updateNotificationStatus,
    saveLogs

}