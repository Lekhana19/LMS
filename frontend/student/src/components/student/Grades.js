import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import awsConfig from "../AwsConfig";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]); // State to store grades
  const { backendUrl } = awsConfig;

  useEffect(() => {
    // Extract username from JWT token
    const jwtToken = Cookies.get("jwtToken");

    // Check if the JWT token exists
    if (!jwtToken) {
      // Redirect to the login page if the token does not exist
      navigate("/login");
      return;
    }
    try {
      // Decode the JWT token
      const decodedToken = decodeJwtToken(jwtToken);

      // Fetch grades data
      fetch(`${backendUrl}/student/getGrades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: decodedToken.email }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Set grades state with the fetched data
          console.log(data);
          setGrades(data.courseGrades);
        })
        .catch((error) => {
          console.error("Error fetching grades:", error);
        });
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      // Redirect to the login page if there's an error decoding the token
      navigate("/login");
    }
  }, [navigate, backendUrl]);

  function decodeJwtToken(token) {
    // Example implementation: decode the JWT token using a library like jwt-decode
    // This is a simplified example, please replace it with a proper implementation
    return JSON.parse(atob(token.split(".")[1]));
  }

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout actions here
    // For example, clear local storage, reset state, etc.
    setIsLoggedIn(false); // Update isLoggedIn state to false
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Canvas
          </a>
          <div>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mt-5">
        <h2 className="mb-4">Grades</h2>
        {grades.map((course) => (
          <div key={course.courseID} className="card mb-3">
            <div className="card-header">
              <h5>Course ID: {course.courseID}</h5>
            </div>
            <div className="card-body">
              {/* Render grades for each course */}
              <ul>
                {course.grades.map((grade, index) => (
                  <li key={index}>
                    {/* Render grade details */}
                    GradeID: {grade.GradeID}, EnrollmentID: {grade.EnrollmentID}, AssignmentID: {grade.AssignmentID},
                    QuizID: {grade.QuizID}, Grade: {grade.Grade}, Marks: {grade.marks}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
