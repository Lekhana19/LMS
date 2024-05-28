import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
} from '@coreui/react'
import axios from 'axios'
import { API_ENDPOINTS } from '../../Constants'
import Cookies from 'js-cookie'

const Courses = () => {
  const [currentPublishedCourses, setCurrentPublishedCourses] = useState([])
  const [currentUnpublishedCourses, setCurrentUnpublishedCourses] = useState([])
  const [previousCourses, setPreviousCourses] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")))
        const courses = response.data
        filterCourses(courses)
      } catch (error) {
        console.error('Error fetching courses', error)
      }
    }

    fetchCourses()
  }, [])

  const filterCourses = (courses) => {
    const currentPublished = courses.filter((course) => course.Year === 2024 && course.Semester === 'Spring' && course.IsPublished)
    const currentUnpublished = courses.filter((course) => course.Year === 2024 && course.Semester === 'Spring' && !course.IsPublished)
    const previous = courses.filter((course) => !(course.Year === 2024 && course.Semester === 'Spring'))

    setCurrentPublishedCourses(currentPublished)
    setCurrentUnpublishedCourses(currentUnpublished)
    setPreviousCourses(previous)
  }

  const handlePublish = async (courseId) => {
    try {
      await axios.post(`${API_ENDPOINTS.PUBLISH_COURSE.replace(':courseId', courseId)}`)
      // Refetch courses after publishing
      const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")))
      const courses = response.data
      filterCourses(courses)
    } catch (error) {
      console.error('Error publishing course', error)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Current Courses</strong> <small>Spring 2024</small>
          </CCardHeader>
          <CCardBody>
            {/* Published Courses */}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Semester</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Published</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentPublishedCourses.map((course) => (
                  <CTableRow key={course.CourseID}>
                    <CTableDataCell>{course.Title}</CTableDataCell>
                    <CTableDataCell>{course.Description}</CTableDataCell>
                    <CTableDataCell>{course.Semester}</CTableDataCell>
                    <CTableDataCell>{course.Year}</CTableDataCell>
                    <CTableDataCell>Yes</CTableDataCell>
                    <CTableDataCell>
                      {/* Additional actions for published courses */}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            {/* Unpublished Courses */}
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Semester</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Published</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentUnpublishedCourses.map((course) => (
                  <CTableRow key={course.CourseID}>
                    <CTableDataCell>{course.Title}</CTableDataCell>
                    <CTableDataCell>{course.Description}</CTableDataCell>
                    <CTableDataCell>{course.Semester}</CTableDataCell>
                    <CTableDataCell>{course.Year}</CTableDataCell>
                    <CTableDataCell>No</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="primary" onClick={() => handlePublish(course.CourseID)}>Publish</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Previous Courses</strong> <small>Other Semesters</small>
          </CCardHeader>
          <CCardBody>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Semester</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Year</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Published</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {previousCourses.map((course) => (
                  <CTableRow key={course.CourseID}>
                    <CTableDataCell>{course.Title}</CTableDataCell>
                    <CTableDataCell>{course.Description}</CTableDataCell>
                    <CTableDataCell>{course.Semester}</CTableDataCell>
                    <CTableDataCell>{course.Year}</CTableDataCell>
                    <CTableDataCell>{course.IsPublished ? 'Yes' : 'No'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Courses
