import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Courses.css';
import { API_ENDPOINTS } from '../Constants';

const Courses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.COURSES);
        setAllCourses(response.data.data.courses);
        setFilteredCourses(response.data.data.courses); // Initially, no filter is applied
        extractDropdownOptions(response.data.data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const results = allCourses.filter(course =>
      (selectedProfessor ? course.faculty === selectedProfessor : true) &&
      (selectedSemester ? course.semester === selectedSemester : true) &&
      (selectedYear ? course.year === Number(selectedYear) : true)
    );
    setFilteredCourses(results);
  }, [selectedProfessor, selectedSemester, selectedYear, allCourses]);

  const extractDropdownOptions = (courses) => {
    const uniqueProfessors = Array.from(new Set(courses.map(course => course.faculty)));
    const uniqueSemesters = Array.from(new Set(courses.map(course => course.semester)));
    const uniqueYears = Array.from(new Set(courses.map(course => course.year.toString())));

    setProfessors(uniqueProfessors);
    setSemesters(uniqueSemesters);
    setYears(uniqueYears);
  };

  return (
    <div className="courses-container">
      <h2>Courses</h2>
      <div className="filter-container">
        <select
          value={selectedProfessor}
          onChange={e => setSelectedProfessor(e.target.value)}
          className="filter-select"
        >
          <option value="">All Professors</option>
          {professors.map(professor => (
            <option key={professor} value={professor}>{professor}</option>
          ))}
        </select>
        <select
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}
          className="filter-select"
        >
          <option value="">All Semesters</option>
          {semesters.map(semester => (
            <option key={semester} value={semester}>{semester}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="filter-select"
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <ul className="course-list">
        {filteredCourses.map((course) => (
          <li key={course.id} className="course-item">
            <span className="course-name">{course.name}</span>
            <span className="course-semester">{course.semester}, {course.year}</span>
            <span className="course-faculty">{course.faculty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Courses;
