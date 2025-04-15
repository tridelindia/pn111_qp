const express = require('express')
const { getStationConfig, getAllSensorData, getMetrologicalData, addStation, editStation, saveSensorConfigurations, insertSensorConfigs, getSensorConfig, updateSensorConfig } = require('./controller')

const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData', getAllSensorData);
router.get('/getMetrologicalData', getMetrologicalData);
router.post('/addStation', addStation);
router.post('/editStation', editStation);
router.post('/savesensorconfig', insertSensorConfigs);
router.get('/getSensorConfig', getSensorConfig);
router.post('/updateSensor', updateSensorConfig)


module.exports = router;;