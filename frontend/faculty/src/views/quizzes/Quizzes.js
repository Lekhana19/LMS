// Quizzes.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CButton, CListGroup, CListGroupItem
} from '@coreui/react';
import { API_ENDPOINTS } from '../../Constants';
import './Quizzes.css';
import Cookies from 'js-cookie'

const Quizzes = () => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
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

  const fetchQuizzes = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.QUIZZES.replace(':courseId', courseId));
      setQuizzes(response.data);
    } catch (error) {
      console.error(`Error fetching quizzes for course ${courseId}:`, error);
    }
  };

  const handleNewQuiz = (courseId) => {
    setShowForm(true);
    setSelectedCourseId(courseId);
  };

  const handleSubmit = async () => {
    try {
      // 1. Post quiz data except S3 URL
      const quizData = {
        title,
        description,
        dueDate,
        maxmarks: parseInt(maxMarks)
      };
      const quizResponse = await axios.post(API_ENDPOINTS.QUIZZES.replace(':courseId', selectedCourseId), quizData);

      console.log('Quiz response after post is: ',quizResponse)
      const quizId = quizResponse.data.quizId;

      // 2. Upload the file to S3 using the backend API
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadUrl = API_ENDPOINTS.QUIZZES_FILE_UPLOAD
          .replace(':courseId', selectedCourseId)
          .replace(':quizId', quizId);

        await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Clear the form and refresh quizzes
      setShowForm(false);
      fetchQuizzes(selectedCourseId);
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  return (
    <CAccordion activeItemKey={0}>
      {courses.map((course) => (
        <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
          <CAccordionHeader onClick={() => fetchQuizzes(course.CourseID)}>
            {course.Title}
          </CAccordionHeader>
          <CAccordionBody>
            <CListGroup>
              {quizzes.map((quiz) => (
                <CListGroupItem key={quiz.quizId}>
                  <strong>{quiz.title}</strong><br />
                  {quiz.description}
                  <br /><small>Due date: {new Date(quiz.duedate).toLocaleString()}</small>
                  {quiz.maxMarks && <><br /><small>Max Marks: {quiz.maxMarks}</small></>}
                  {quiz.s3url && (
                    <>
                      <br /><a href={quiz.s3url} target="_blank" rel="noopener noreferrer">View File</a>
                    </>
                  )}
                </CListGroupItem>
              ))}
            </CListGroup>
            <button
              className="btn btn-primary"
              onClick={() => handleNewQuiz(course.CourseID)}
            >
              Post a New Quiz
            </button>
            {showForm && selectedCourseId === course.CourseID && (
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="quiz-input"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="quiz-input"
                ></textarea>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="quiz-input"
                />
                <input
                  type="number"
                  placeholder="Max Marks"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="quiz-input"
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

export default Quizzes;
