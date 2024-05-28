const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

// Route to get all faculties
router.get('/', facultyController.getFaculties);

module.exports = router;
