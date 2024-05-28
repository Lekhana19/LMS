const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');

router.get('/:facultyId/courses', facultyController.getCourses);



// Define other routes for adding content to syllabus, viewing student list, etc.

module.exports = router;
