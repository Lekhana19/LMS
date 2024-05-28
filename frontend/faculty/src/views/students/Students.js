import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    CAccordion,
    CAccordionItem,
    CAccordionHeader,
    CAccordionBody,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
  } from '@coreui/react'
import { API_ENDPOINTS } from '../../Constants'
import Cookies from 'js-cookie'

const CourseList = ({ facultyId }) => {
  const [courses, setCourses] = useState([])
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")))
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchStudents = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSE_STUDENTS.replace(':courseId', courseId))
      return response.data
    } catch (error) {
      console.error(`Error fetching students for course ${courseId}:`, error)
      return []
    }
  }

  return (
    <CAccordion activeItemKey={0}>
      {courses.map((course) => (
        <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
          <CAccordionHeader>{course.Title}</CAccordionHeader>
          <CAccordionBody>
            <StudentsTable courseId={course.CourseID} fetchStudents={fetchStudents} />
          </CAccordionBody>
        </CAccordionItem>
      ))}
    </CAccordion>
  )
}

const StudentsTable = ({ courseId, fetchStudents }) => {
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchStudents(courseId).then((data) => setStudents(data))
  }, [courseId, fetchStudents])

  return (
    <CTable>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>First Name</CTableHeaderCell>
          <CTableHeaderCell>Last Name</CTableHeaderCell>
          <CTableHeaderCell>Email</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {students.map((student) => (
          <CTableRow key={student.userId}>
            <CTableDataCell>{student.firstname}</CTableDataCell>
            <CTableDataCell>{student.lastname}</CTableDataCell>
            <CTableDataCell>{student.email}</CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )
}

export default CourseList
