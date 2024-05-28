// Assignments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CButton, CListGroup, CListGroupItem
} from '@coreui/react';
import { API_ENDPOINTS } from '../../Constants';
import './Assignments.css';
import Cookies from 'js-cookie'

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
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

  const fetchAssignments = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ASSIGNMENTS.replace(':courseId', courseId));
      setAssignments(response.data);
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error);
    }
  };

  const handleNewAssignment = (courseId) => {
    setShowForm(true);
    setSelectedCourseId(courseId);
  };

  const handleSubmit = async () => {
    try {
      // 1. Post assignment data except S3 URL
      const assignmentData = {
        title,
        description,
        dueDate,
        maxmarks: parseInt(maxMarks)
      };
      const assignmentResponse = await axios.post(API_ENDPOINTS.ASSIGNMENTS.replace(':courseId', selectedCourseId), assignmentData);

      console.log('assignment posted without url', assignmentResponse.data)

      const assignmentId = assignmentResponse.data.assignmentId;

      // 2. Upload the file to S3 using the backend API
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadUrl = API_ENDPOINTS.ASSIGNMENTS_FILE_UPLOAD
        .replace(':courseId', selectedCourseId)
        .replace(':assignmentId', assignmentId);

      await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }

      // Clear the form and refresh assignments
      setShowForm(false);
      fetchAssignments(selectedCourseId);
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  return (
    <CAccordion activeItemKey={0}>
      {courses.map((course) => (
        <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
          <CAccordionHeader onClick={() => fetchAssignments(course.CourseID)}>
            {course.Title}
          </CAccordionHeader>
          <CAccordionBody>
          <CListGroup>
              {assignments.map((assignment) => (
                <CListGroupItem key={assignment.assignmentId}>
                  <strong>{assignment.title}</strong><br />
                  {assignment.description}
                  <br /><small>Due date: {new Date(assignment.duedate).toLocaleString()}</small>
                  {assignment.maxMarks && <><br /><small>Max Marks: {assignment.maxMarks}</small></>}
                  {assignment.s3url && (
                    <>
                      <br /><a href={assignment.s3url} target="_blank" rel="noopener noreferrer">View File</a>
                    </>
                  )}
                </CListGroupItem>
              ))}
            </CListGroup>
            <button
              className="btn btn-primary"
              onClick={() => handleNewAssignment(course.CourseID)}
            >
              Post a New Assignment
            </button>
            {showForm && selectedCourseId === course.CourseID && (
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="assignment-input"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="assignment-input"
                ></textarea>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="assignment-input"
                />
                <input
                  type="number"
                  placeholder="Max Marks"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="assignment-input"
                />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div>
                  <button
                    className="save-button"
                    onClick={handleSubmit}
                  >Save Changes</button>
                  <button
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >Cancel</button>
                </div>
              </div>
            )}
          </CAccordionBody>
        </CAccordionItem>
      ))}
    </CAccordion>
  );
};

export default Assignments;
