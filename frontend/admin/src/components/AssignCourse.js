import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AssignCourse.css';
import { API_ENDPOINTS } from '../Constants';

const AssignCourse = () => {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    // Fetch faculties
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.FACULTY);
        setFaculties(response.data.data); // Adjust according to your actual API response
      } catch (error) {
        console.error('Failed to fetch faculties:', error);
      }
    };

    // Fetch courses, only including Spring 2024
    const fetchCourses = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.COURSES);
        const filteredCourses = response.data.data.courses.filter(course => 
          course.semester === 'Spring' && course.year === 2024
        );
        setCourses(filteredCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchFaculties();
    fetchCourses();
  }, []);

  const handleFacultyChange = (event) => {
    setSelectedFaculty(event.target.value);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(API_ENDPOINTS.ASSIGN_COURSE, {
        facultyID: selectedFaculty,
        courseID: selectedCourse
      });
      alert('Assignment successful: ' + response.data.message); // Showing success message
    } catch (error) {
      console.error('Assignment failed:', error);
      alert('Assignment failed: ' + error.message); // Showing error message
    }
  };

  return (
    <div className="assign-course-container">
      <h2>Assign Course to Faculty</h2>
      <form onSubmit={handleSubmit} className="assign-course-form">
        <label htmlFor="faculty-select">Select Faculty:</label>
        <select id="faculty-select" value={selectedFaculty} onChange={handleFacultyChange} className="faculty-select">
          <option value="">--Please choose a faculty--</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>

        <label htmlFor="course-select">Select Course:</label>
        <select id="course-select" value={selectedCourse} onChange={handleCourseChange} className="course-select">
          <option value="">--Please choose a course--</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <button type="submit" className="submit-btn">Assign Course</button>
      </form>
    </div>
  );
};

export default AssignCourse;
