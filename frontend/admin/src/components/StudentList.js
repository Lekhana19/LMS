import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentList.css'; // Import the CSS file for styling
import { API_ENDPOINTS } from '../Constants';

const StudentList = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);

  // Fetch courses on component mount
  useEffect(() => {
    axios.get(API_ENDPOINTS.COURSES)
      .then(response => {
        // Assuming response data is directly the array of courses
        setCourses(response.data.data.courses);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setCourses([]); // In case of error, set courses to an empty array
      });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      console.log(API_ENDPOINTS.COURSES)
      axios.get(API_ENDPOINTS.STUDENTS+selectedCourse)
        .then(response => {
          setStudents(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching students:', error);
          setStudents([]); 
        });
    } else {
      setStudents([]); 
    }
  }, [selectedCourse]);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="student-list-container">
      <h2>Student List</h2>
      <div className="controls">
        <select value={selectedCourse} onChange={handleCourseChange} className="course-select">
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
        <button onClick={handlePrint} className="print-btn">Print</button>
      </div>
      {selectedCourse && students.length > 0 && (
        <ul className="student-list">
          {students.map((student) => (
            <li key={student.UserID} className="student-item">
              <span className="student-id">{student.UserID}</span>
              <span className="student-name">{student.FirstName} {student.LastName}</span>
              <span className="student-email">{student.Email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentList;
