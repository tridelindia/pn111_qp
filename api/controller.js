const { pool } = require('./db');
const moment = require('moment/moment');

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
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Both startDate and endDate parameters are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const query = `
            SELECT * FROM tb_buoy_01_measurements 
            WHERE timestamp >= $1 AND timestamp <= $2
            ORDER BY timestamp`;
            
        const { rows } = await pool.query(query, [startDate, endDate]);

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
        const averagedData = {
            timestamp: group.timestamp,
            dataPresent: {}
        };

        for (const [paramKey, presentCount] of Object.entries(group.dataPresent)) {

            averagedData.dataPresent[paramKey] = presentCount / group.count >= 0.5 ? 1 : 0;
        }

        return averagedData;
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
        // Show days if less than 31 points
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

module.exports = {
    getStationConfig,
    getAllSensorData,
    getMetrologicalData,
    getSensorDataForHealth
}