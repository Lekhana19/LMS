import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@coreui/react';
import { API_ENDPOINTS } from '../../../Constants';
import Cookies from 'js-cookie'

const CourseGrades = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [editable, setEditable] = useState(false);
  const [editedGrades, setEditedGrades] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Track the selected course ID

  useEffect(() => {
    // Fetch list of courses upon component mount
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")));
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchGradesForCourse = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.GRADES.replace(':courseId', courseId));
      setGrades(response.data);
      // Initialize editedGrades with the fetched grades
      setEditedGrades(response.data.map((grade) => ({ ...grade })));
    } catch (error) {
      console.error(`Error fetching grades for course ${courseId}:`, error);
    }
  };

  const handleCourseClick = (courseId) => {
    // Fetch grades for the selected course
    fetchGradesForCourse(courseId);
    setSelectedCourseId(courseId); // Set the selected course ID
  };

  const toggleEdit = () => {
    setEditable(!editable);
  };

  const handleGradeChange = (index, value) => {
    const updatedGrades = [...editedGrades];
    updatedGrades[index].grade = value;
    setEditedGrades(updatedGrades);
  };

  const handleSave = async () => {
    try {
      const gradesUrl = API_ENDPOINTS.GRADES.replace(':courseId', selectedCourseId); // Use the selected course ID
      await axios.post(gradesUrl, editedGrades);
      // Reset editable state to make fields non-editable
      setEditable(false);
      // Update grades state with new values
      setGrades([...editedGrades]);
    } catch (error) {
      console.error('Error saving grades:', error);
      // Optional: Display an error message or handle errors
    }
  };

  return (
    <div>
      <CAccordion activeItemKey={0}>
        {courses.map((course) => (
          <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
            <CAccordionHeader onClick={() => handleCourseClick(course.CourseID)}>
              {course.Title}
            </CAccordionHeader>
            <CAccordionBody>
              {/* Render grades table here */}
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Grade
                      <CButton size="sm" color="primary" onClick={toggleEdit} disabled={editable}>
                        Edit
                      </CButton>
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {grades.map((grade, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{grade.student_name}</CTableDataCell>
                      <CTableDataCell>
                        {editable ? (
                          <input
                            type="text"
                            value={editedGrades[index]?.grade || ''}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                          />
                        ) : (
                          grade.grade
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {editable && (
                <CButton color="primary" onClick={handleSave}>
                  Save
                </CButton>
              )}
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </div>
  );
};

export default CourseGrades;
