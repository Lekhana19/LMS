import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CButton,
  CFormTextarea,
} from '@coreui/react'
import { API_ENDPOINTS } from '../../Constants'
import Cookies from 'js-cookie'

const Syllabus = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COURSES.replace(':facultyId', Cookies.get("facultyId")))
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div>
      <CAccordion activeItemKey={0}>
        {courses.map((course) => (
          <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
            <CAccordionHeader>{course.Title}</CAccordionHeader>
            <CAccordionBody>
              <SyllabusContent courseId={course.CourseID} />
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    </div>
  );
};

const SyllabusContent = ({ courseId }) => {
  const [syllabus, setSyllabus] = useState('');
  const [updatedSyllabus, setUpdatedSyllabus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSyllabus, setIsAddingSyllabus] = useState(false);

  useEffect(() => {
    fetchSyllabus(courseId);
  }, [courseId]);

  const fetchSyllabus = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.SYLLABUS.replace(':courseId', courseId))
      setSyllabus(response.data?.syllabus || '');
    } catch (error) {
      console.error(`Error fetching syllabus for course ${courseId}:`, error);
    }
  };

  const handleEdit = () => {
    setUpdatedSyllabus(syllabus);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(API_ENDPOINTS.SYLLABUS.replace(':courseId', courseId), { syllabus: updatedSyllabus });
      setSyllabus(updatedSyllabus);
      setIsEditing(false);
      setUpdatedSyllabus(''); // Reset the text field after saving
    } catch (error) {
      console.error('Error saving syllabus:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingSyllabus(false); // Cancel adding syllabus
    setUpdatedSyllabus(''); // Reset the text field after canceling
  };

  const handleTextareaChange = (e) => {
    setUpdatedSyllabus(e.target.value);
  };

  const handleAddSyllabus = () => {
    setIsAddingSyllabus(true); // Set adding syllabus mode
  };

  const handleAddSyllabusSave = async () => {
    try {
      await axios.post(API_ENDPOINTS.SYLLABUS.replace(':courseId', courseId), { syllabus: updatedSyllabus });
      setSyllabus(updatedSyllabus);
      setIsAddingSyllabus(false);
      setUpdatedSyllabus(''); // Reset the text field after saving
    } catch (error) {
      console.error('Error adding syllabus:', error);
    }
  };

  return (
    <div>
      {syllabus ? (
        <>
          {isEditing ? (
            <div>
              <CFormTextarea value={updatedSyllabus} onChange={handleTextareaChange} rows="5" />
              <div style={{ marginTop: '10px' }}>
                <CButton color="primary" onClick={handleSave}>Save</CButton>
                <CButton color="secondary" onClick={handleCancel}>Cancel</CButton>
              </div>
            </div>
          ) : (
            <>
              <div>{syllabus}</div>
              <CButton color="primary" onClick={handleEdit}>Edit</CButton>
            </>
          )}
        </>
      ) : (
        <>
          {isAddingSyllabus ? (
            <div>
              <CFormTextarea value={updatedSyllabus} onChange={handleTextareaChange} rows="5" />
              <div style={{ marginTop: '10px' }}>
                <CButton color="primary" onClick={handleAddSyllabusSave}>Save</CButton>
                <CButton color="secondary" onClick={handleCancel}>Cancel</CButton>
              </div>
            </div>
          ) : (
            <CButton color="primary" onClick={handleAddSyllabus}>Add Syllabus</CButton>
          )}
        </>
      )}
    </div>
  );
};

export default Syllabus;
