import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilAddressBook,
  cilBook,
  cilChatBubble,
  cilBell,
  cilCalculator,
  cilClipboard,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Faculty',
  },
  {
    component: CNavGroup,
    name: 'Grades',
    to: '/grades',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Course Grades',
        to: '/grades/coursegrades',
      },
      {
        component: CNavItem,
        name: 'Assignment Marks',
        to: '/grades/assignmentmarks',
      },
      {
        component: CNavItem,
        name: 'Quiz Marks',
        to: '/grades/quizmarks',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Courses',
    to: '/courses',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Students',
    to: '/students',
    icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Announcements',
    to: '/announcements',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Assignments',
    to: '/assignments',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Quizzes',
    to: '/quizzes',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Syllabus',
    to: '/syllabus',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
]

export default _nav
