import React from 'react'

//Dashboards
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//Grades
const CourseGrades = React.lazy(() => import('./views/grades/coursegrades/CourseGrades'))
const AssignmentMarks = React.lazy(() => import('./views/grades/assignmentmarks/AssignmentMarks'))
const QuizMarks = React.lazy(() => import('./views/grades/quizmarks/QuizMarks'))

//Courses
const Courses = React.lazy(() => import('./views/courses/Courses'))

//Students
const Students = React.lazy(() => import('./views/students/Students'))

//Announcements
const Announcements = React.lazy(() => import('./views/announcements/Announcements'))

//Assignments
const Assignments = React.lazy(() => import('./views/assignments/Assignments'))

//Quizzes
const Quizzes = React.lazy(() => import('./views/quizzes/Quizzes'))

//Syllabus
const Syllabus = React.lazy(() => import('./views/syllabus/Syllabus'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/grades/coursegrades', name: 'Course Grades', element: CourseGrades },
  { path: '/grades/assignmentmarks', name: 'Assignment Marks', element: AssignmentMarks },
  { path: '/grades/quizmarks', name: 'Quiz Marks', element: QuizMarks },
  { path: '/students', name: 'Students', element: Students },
  { path: '/announcements', name: 'Announcements', element: Announcements },
  { path: '/assignments', name: 'Assignments', element: Assignments },
  { path: '/quizzes', name: 'Quizzes', element: Quizzes },
  { path: '/syllabus', name: 'Syllabus', element: Syllabus },
  { path: '/courses', name: 'Courses', element: Courses },
]

export default routes
