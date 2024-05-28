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

const QuizMarks = () => {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")));
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
              <QuizzesList courseId={course.CourseID} />
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </div>
  )
}

const QuizzesList = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState([])

  useEffect(() => {
    fetchQuizzes(courseId)
  }, [courseId])

  const fetchQuizzes = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.QUIZZES.replace(':courseId', courseId));
      setQuizzes(response.data)
    } catch (error) {
      console.error(`Error fetching quizzes for course ${courseId}:`, error)
    }
  }

  return (
    <CAccordion activeItemKey={0}>
      {quizzes.map((quiz) => (
        <CAccordionItem key={quiz.quizId} itemKey={quiz.quizId}>
          <CAccordionHeader>{quiz.title}</CAccordionHeader>
          <CAccordionBody>
            <QuizMarksTable quizId={quiz.quizId} courseId={courseId} />
          </CAccordionBody>
        </CAccordionItem>
      ))}
    </CAccordion>
  )
}

const QuizMarksTable = ({ quizId, courseId }) => {
  const [students, setStudents] = useState([])
  const [editable, setEditable] = useState(false)
  const [editedMarks, setEditedMarks] = useState({})

  useEffect(() => {
    fetchMarks(quizId);
  }, [quizId]);

  const fetchMarks = async (quizId) => {
    try {
      const quizMarksUrl = API_ENDPOINTS.QUIZ_MARKS.replace(':courseId', courseId).replace(':quizId', quizId);
      const response = await axios.get(quizMarksUrl);
      setStudents(response.data)
      const initialMarks = response.data.reduce((acc, curr) => {
        acc[curr.studentId] = curr.marks // Initialize editedMarks with current marks
        return acc
      }, {})
      setEditedMarks(initialMarks)
    } catch (error) {
      console.error(`Error fetching marks for quiz ${quizId}:`, error)
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

  const handleSave = async () => {
    // Check if there are any changes
    const hasChanges = students.some(student => editedMarks[student.studentId] !== student.marks);
  
    // If no changes, exit edit mode without making API call
    if (!hasChanges) {
      setEditable(false);
      return;
    }
  
    const changedMarks = students.map(student => ({
      studentId: student.studentId,
      marks: editedMarks[student.studentId],
    })).filter(student => student.marks !== students.find(s => s.studentId === student.studentId).marks);
  
    try {
      const quizMarksUrl = API_ENDPOINTS.QUIZ_MARKS.replace(':courseId', courseId).replace(':quizId', quizId);
      await axios.post(quizMarksUrl, changedMarks);
      setEditable(false);
      // Assuming the backend returns the updated marks, we refresh our student list
      fetchMarks(quizId);
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

export default QuizMarks;

