const express = require("express");
const router = express.Router();
const controllers = require("../controllers/controllers");

// Route to handle user signup
router.post("/signup", controllers.verify);

router.post("/student/getCourses", controllers.getCourses);

router.post("/student/getAnnouncements", controllers.getAnnouncements);

router.post("/student/getAssignments", controllers.getAssignments);
router.post("/student/getQuizzes", controllers.getQuizzes);

router.post("/getUserId", controllers.getUserId);

router.post("/saveNotificationPreference", controllers.saveNotificationPreference);

router.post("/getUserDetails", controllers.getUserDetails);

router.post("/student/assignment", controllers.setAssignments);
router.post("/student/quiz", controllers.setQuiz);
router.post("/student/getGrades", controllers.getGrades);

module.exports = router;
