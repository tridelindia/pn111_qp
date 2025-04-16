const express = require('express')
const { getStationConfig, getAllSensorData, getMetrologicalData, getSensorDataForHealth, getLastSensorData } = require('./controller')

const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData', getAllSensorData);
router.get('/getMetrologicalData', getMetrologicalData);
router.get('/getHealthData', getSensorDataForHealth);
router.get('/getLastSensorData', getLastSensorData);

module.exports = router;