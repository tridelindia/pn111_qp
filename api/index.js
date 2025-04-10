// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const roleRoutes = require('./routes/roles');
const userRoutes = require('./routes/users');
const designationRoutes = require('./routes/designations');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/designations', designationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
