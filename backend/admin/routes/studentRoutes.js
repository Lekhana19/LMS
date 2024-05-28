const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Route to get all students, optionally filtered by course
router.get('/', studentController.listStudents);

module.exports = router;
