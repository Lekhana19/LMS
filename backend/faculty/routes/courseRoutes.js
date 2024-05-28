const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/:courseId/students', courseController.getStudentListForCourse);
router.get('/:courseId/grades', courseController.getGradesForCourse);
router.post('/:courseId/grades', courseController.assignCourseGrade);
router.post('/:courseId/assignments/:assignmentId/marks', courseController.addAssignmentMarks);
router.post('/:courseId/quizzes/:quizId/marks', courseController.addQuizMarks);
router.get('/:courseId/assignments/:assignmentId/marks', courseController.viewAssignmentMarks);
router.get('/:courseId/quizzes/:quizId/marks', courseController.viewQuizMarks);
router.post('/:courseId/announcements', courseController.postAnnouncement);
router.get('/:courseId/assignments', courseController.listAssignments);
router.post('/:courseId/assignments', courseController.postAssignment);
router.post('/:courseId/quizzes', courseController.postQuiz);
router.get('/:courseId/quizzes', courseController.listQuizzes);
router.get('/:courseId/assignments/:assignmentId/submissions', courseController.listAssignmentSubmissions);
router.get('/:courseId/quizzes/:quizId/submissions', courseController.listQuizSubmissions);
router.get('/:courseId/announcements', courseController.getAnnouncements);
router.post('/:courseId/assignments/:assignmentId/file', courseController.uploadAssignmentFile);
router.post('/:courseId/quizzes/:quizId/file', courseController.uploadQuizFile);
router.get('/:courseId/syllabus', courseController.getSyllabus);
router.post('/:courseId/syllabus', courseController.postSyllabus);
router.post('/:courseId/publish',courseController.publishCourse);

module.exports = router;