const express = require('express')
const { getStationConfig, getAllSensorData, getMetrologicalData, getSensorDataForHealth } = require('./controller')

const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData', getAllSensorData);
router.get('/getMetrologicalData', getMetrologicalData);
router.get('/getHealthData', getSensorDataForHealth);

module.exports = router;