// Announcements.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
  CListGroup, CListGroupItem
} from '@coreui/react';
import { API_ENDPOINTS } from '../../Constants';
import './Announcements.css';
import Cookies from 'js-cookie'

const Announcements = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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

  const fetchAnnouncements = async (courseId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ANNOUNCEMENTS.replace(':courseId', courseId));
      setAnnouncements(response.data);
    } catch (error) {
      console.error(`Error fetching announcements for course ${courseId}:`, error);
    }
  };

  const handleNewAnnouncement = (courseId) => {
    setShowForm(true);
    setSelectedCourseId(courseId);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(API_ENDPOINTS.ANNOUNCEMENTS.replace(':courseId', selectedCourseId), {
        title, content
      });
      setShowForm(false);
      fetchAnnouncements(selectedCourseId); // Refresh the announcements list
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  return (
    <CAccordion activeItemKey={0}>
      {courses.map((course) => (
        <CAccordionItem key={course.CourseID} itemKey={course.CourseID}>
          <CAccordionHeader onClick={() => fetchAnnouncements(course.CourseID)}>
            {course.Title}
          </CAccordionHeader>
          <CAccordionBody>
            <CListGroup >
              {announcements.map((announcement) => (
                <CListGroupItem key={announcement.id}>
                  <strong>{announcement.title}</strong><br />
                  {announcement.content}
                  <br /><small>Posted on: {new Date(announcement.postdate).toLocaleString()}</small>
                </CListGroupItem>
              ))}
            </CListGroup>
            <button
              className="btn btn-primary"
              onClick={() => handleNewAnnouncement(course.CourseID)}
            >
              Post a New Announcement
            </button>
            {showForm && selectedCourseId === course.CourseID && (
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="announcement-input"
                />
                <textarea
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="announcement-input"
                ></textarea>
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

export default Announcements;
