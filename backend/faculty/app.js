const express = require('express');
const cors = require('cors');
const facultyRoutes = require('./routes/facultyRoutes.js');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);


module.exports = app;
