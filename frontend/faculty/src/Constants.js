//const BASE_URL = 'http://localhost:3000'
const BASE_URL = 'http://34.204.40.112:3000'

export const API_ENDPOINTS = {
  COURSES: `${BASE_URL}/api/faculty/:facultyId/courses`,
  COURSE_STUDENTS: `${BASE_URL}/api/courses/:courseId/students`,
  ANNOUNCEMENTS: `${BASE_URL}/api/courses/:courseId/announcements`,
  ASSIGNMENTS: `${BASE_URL}/api/courses/:courseId/assignments`,
  ASSIGNMENT_MARKS: `${BASE_URL}/api/courses/:courseId/assignments/:assignmentId/marks`,
  ASSIGNMENTS_FILE_UPLOAD: `${BASE_URL}/api/courses/:courseId/assignments/:assignmentId/file`,
  QUIZZES: `${BASE_URL}/api/courses/:courseId/quizzes`,
  QUIZ_MARKS: `${BASE_URL}/api/courses/:courseId/quizzes/:quizId/marks`,
  QUIZZES_FILE_UPLOAD: `${BASE_URL}/api/courses/:courseId/quizzes/:quizId/file`,
  SYLLABUS: `${BASE_URL}/api/courses/:courseId/syllabus`,
  GRADES: `${BASE_URL}/api/courses/:courseId/grades`,
  PUBLISH_COURSE: `${BASE_URL}/api/courses/:courseId/publish`,
  LOGOUT_URL: `http://202-student-frontend-alb-217815477.us-east-1.elb.amazonaws.com/login`,
}

export default API_ENDPOINTS
