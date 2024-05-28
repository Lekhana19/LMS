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
import { API_ENDPOINTS } from '../../../Constants'
import Cookies from 'js-cookie'

const AssignmentMarks = () => {
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

  return (
    <div>
      <CAccordion activeItemKey={0}>
        {courses.map((course) => (
          <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
            <CAccordionHeader>{course.Title}</CAccordionHeader>
            <CAccordionBody>
              <AssignmentsList courseId={course.CourseID} />
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </div>
  )
}

const AssignmentsList = ({ courseId }) => {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    fetchAssignments(courseId)
  }, [courseId])

  const fetchAssignments = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ASSIGNMENTS.replace(':courseId', courseId))
      setAssignments(response.data)
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error)
    }
  }

  return (
    <CAccordion activeItemKey={0}>
      {assignments.map((assignment) => (
        <CAccordionItem key={assignment.assignmentId} itemKey={assignment.assignmentId}>
          <CAccordionHeader>{assignment.title}</CAccordionHeader>
          <CAccordionBody>
            <AssignmentMarksTable assignmentId={assignment.assignmentId} courseId={courseId} />
          </CAccordionBody>
        </CAccordionItem>
      ))}
    </CAccordion>
  )
}

const AssignmentMarksTable = ({ assignmentId, courseId }) => {
  const [students, setStudents] = useState([])
  const [editable, setEditable] = useState(false)
  const [editedMarks, setEditedMarks] = useState({})

  useEffect(() => {
    fetchMarks(assignmentId);
  }, [assignmentId]);

  const fetchMarks = async (assignmentId) => {
    try {
      const assignmentMarksUrl = API_ENDPOINTS.ASSIGNMENT_MARKS.replace(':courseId', courseId).replace(':assignmentId', assignmentId);
      const response = await axios.get(assignmentMarksUrl)
      setStudents(response.data)
      const initialMarks = response.data.reduce((acc, curr) => {
        acc[curr.studentId] = curr.marks // Initialize editedMarks with current marks
        return acc
      }, {})
      setEditedMarks(initialMarks)
    } catch (error) {
      console.error(`Error fetching marks for assignment ${assignmentId}:`, error)
    }
  }

  const toggleEdit = () => {
    setEditable(!editable)
  }

  const handleMarkChange = (studentId, newMarks) => {
    setEditedMarks(prevMarks => ({
      ...prevMarks,
      [studentId]: newMarks // Update the marks for the specific student
    }))
  }

// Updated handleSave function
const handleSave = async () => {
    const changedMarks = students.map(student => ({
      studentId: student.studentId,
      marks: editedMarks[student.studentId],
    })).filter(student => student.marks !== students.find(s => s.studentId === student.studentId).marks);
  
    if (changedMarks.length === 0) {
      // No changes were made, just toggle off edit mode
      setEditable(false);
      return;
    }
  
    try {
      const assignmentMarksUrl = API_ENDPOINTS.ASSIGNMENT_MARKS.replace(':courseId', courseId).replace(':assignmentId', assignmentId);
      await axios.post(assignmentMarksUrl, changedMarks);
      setEditable(false);
      fetchMarks(assignmentId); // Refresh student list with updated data
    } catch (error) {
      console.error('Error saving marks:', error);
    }
  };
  

  return (
    <div>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
            <CTableHeaderCell scope="col">Marks</CTableHeaderCell>
            <CTableHeaderCell scope="col">File Submission</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {students.map((student) => (
            <CTableRow key={student.studentId}>
              <CTableDataCell>{student.firstname} {student.lastname}</CTableDataCell>
              <CTableDataCell>
                {editable ? (
                  <input
                    type="text"
                    value={editedMarks[student.studentId] || ''}
                    onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                  />
                ) : (
                  student.marks
                )}
              </CTableDataCell>
              <CTableDataCell>
                {student.submissiondocurl ? (
                    <a href={student.submissiondocurl} target="_blank" rel="noopener noreferrer">
                    File
                    </a>
                ) : (
                    "No File Submission"
                )}
                </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      {editable ? (
        <CButton color="primary" onClick={handleSave}>
          Save
        </CButton>
      ) : (
        <CButton size="sm" color="primary" onClick={toggleEdit}>
          Edit
        </CButton>
      )}
    </div>
  );
};

export default AssignmentMarks;

