const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const assignCourseRoutes = require('./routes/assignCourseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');




const app = express();

app.use(express.json());
app.use(cors());
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/assigncourse', assignCourseRoutes);
app.use('/faculty', facultyRoutes);
module.exports = app;