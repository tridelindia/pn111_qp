const { pool } = require('./db');
const moment = require('moment/moment');
const sendEmail = require('./sendEmail');
const { last } = require('rxjs');
require('dotenv').config();
// const whatsappSender = require('./sendWhatsapp');
// const sendSMS = require('./sendSMS');

const getStationConfig = async (req, res) => {
    console.log('Received request to getStationConfig');

    try {
        const result = await pool.query('SELECT * FROM tb_stations_config');
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
        const result = await pool.query('SELECT * FROM tb_buoy_01_measurements');
        console.log('Query successful:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching SensorData data:', error.message);
        res.status(500).json({ error: error.message });
    }
}

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
    getMetrologicalData,
    getSensorDataForHealth,
    getLastSensorData,
    getAllNotifications,
    addNotification,
    deleteNotification,
    updateNotification,
    updateNotificationStatus,
    saveLogs
}