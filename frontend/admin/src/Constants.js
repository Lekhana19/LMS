//const BASE_URL = 'http://localhost:3000'
const BASE_URL = 'http://localhost:3000'

export const API_ENDPOINTS = {
  COURSES: `${BASE_URL}/courses`,
  STUDENTS: `${BASE_URL}/students?courseID=`,
  FACULTY: `${BASE_URL}/faculty`,
  ASSIGN_COURSE: `${BASE_URL}/assignCourse`,
  LOGOUT_URL: `http://202-student-frontend-alb-217815477.us-east-1.elb.amazonaws.com/login`
}

export default API_ENDPOINTS
