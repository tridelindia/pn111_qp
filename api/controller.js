const { pool } = require('./db');
const moment = require('moment/moment');
const bcrypt = require('bcrypt');

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

    const roleQuery = `SELECT permissions FROM tb_roles WHERE name = $1`;
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
      permissions, // ⬅️ Include permissions
    };

    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStationConfig = async (req, res) => {
    console.log('Received request to getStationConfig');

    try {
        const result = await pool.query('SELECT * FROM tb_stations_config ORDER BY station_id ASC');
        ;
        console.log('Query successful:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching StationConfig data:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const getAllSensorData = async (req, res) => {
    console.log('Received request to getAllSensorData');

    try {
        const result = await pool.query('SELECT * FROM tb_buoy_01_measurements ORDER BY id ASC');
        console.log('Query successful:', result.rows);
        res.json(result.rows.reverse());
    } catch (error) {
        console.error('Error fetching SensorData data:', error.message);
        res.status(500).json({ error: error.message });
    }
}

const getSensorDataByDate = async (req, res) => {
    console.log('Received request to getSensorDataByDate');
    const { fromDate, toDate } = req.query;

    try {
        const result = await pool.query(
            `SELECT * FROM tb_buoy_01_measurements 
         WHERE timestamp BETWEEN $1 AND $2 ORDER BY id ASC`,
            [fromDate, toDate]
        );

        res.json(result.rows.reverse());
    } catch (error) {
        console.error('Error fetching getSensorDataByDate data:', error.message);
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
            TIMESTAMP TIMESTAMPTZ,
            RECORD INTEGER,
            BattV_Min NUMERIC,
            PTemp_C_Max NUMERIC,
            Datatim TEXT,
            Avg_Ws NUMERIC,
            WindGust NUMERIC,
            AvgWindr NUMERIC,
            AvgTemp NUMERIC,
            AvgRH NUMERIC,
            AvgBP NUMERIC,
            VisNM TEXT,
            AvgVisNM TEXT,
            WaterTempC_Avg NUMERIC,
            Motion TEXT,
            NMEA TEXT,
            Heading NUMERIC,
            Hs NUMERIC,
            DominantTimeperiod NUMERIC,
            DominantTimePeriodFW NUMERIC,
            Wave_direction NUMERIC,
            Wave_directionFW NUMERIC,
            Mean_wave_direction NUMERIC,
            HMax NUMERIC,
            Fourier_Coefficient_a1 NUMERIC,
            Fourier_Coefficient_b1 NUMERIC,
            Fourier_Coefficient_a2 NUMERIC,
            Fourier_Coefficient_b2 NUMERIC,
            TimeandDate TEXT,
            Samplenumber INTEGER,
            
            -- Current Profile Data (Speed & Direction)
            Cell_1_Speed TEXT,
            Cell_1_Dir TEXT,
            Cell_2_Speed TEXT,
            Cell_2_Dir TEXT,
            Cell_3_Speed TEXT,
            Cell_3_Dir TEXT,
            Cell_4_Speed TEXT,
            Cell_4_Dir TEXT,
            Cell_5_Speed TEXT,
            Cell_5_Dir TEXT,
            Cell_6_Speed TEXT,
            Cell_6_Dir TEXT,
            Cell_7_Speed TEXT,
            Cell_7_Dir TEXT,
            Cell_8_Speed TEXT,
            Cell_8_Dir TEXT,
            Cell_9_Speed TEXT,
            Cell_9_Dir TEXT,
            Cell_10_Speed TEXT,
            Cell_10_Dir TEXT,
            Cell_11_Speed TEXT,
            Cell_11_Dir TEXT,
            Cell_12_Speed TEXT,
            Cell_12_Dir TEXT,
            Cell_13_Speed TEXT,
            Cell_13_Dir TEXT,
            Cell_14_Speed TEXT,
            Cell_14_Dir TEXT,
            Cell_15_Speed TEXT,
            Cell_15_Dir TEXT,
            Cell_16_Speed TEXT,
            Cell_16_Dir TEXT,
            Cell_17_Speed TEXT,
            Cell_17_Dir TEXT,
            Cell_18_Speed TEXT,
            Cell_18_Dir TEXT,
            Cell_19_Speed TEXT,
            Cell_19_Dir TEXT,
            Cell_20_Speed TEXT,
            Cell_20_Dir TEXT
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
        console.log('Query successful:', result.rows);
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

  const addUser = async (req, res) => {
    try {
      const { name, username, email, password, role, designation, avatar } = req.body;
  
      // Hash the password before storing it
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
  
      let hashedPassword = password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
  
      const result = await pool.query(
        `UPDATE tb_users SET name=$1, username=$2, email=$3, password=$4, role=$5, designation=$6, avatar=$7
         WHERE id=$8 RETURNING *`,
        [name, username, email, hashedPassword, role, designation, avatar, id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }

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


module.exports = {
    loginUser,
    getStationConfig,
    getAllSensorData,
    getSensorDataByDate,
    getMetrologicalData,
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
    deleteDesignation

}