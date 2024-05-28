import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css"; // Import CSS file for styling
import Cookies from "js-cookie";
import awsConfig from "../AwsConfig";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [courses, setCourses] = useState([]);
  const [prev, setPrev] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // Define currentUserRole state
  const { backendUrl } = awsConfig;

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout actions here
    // For example, clear local storage, reset state, etc.
    setIsLoggedIn(false); // Update isLoggedIn state to false
    navigate("/login"); // Redirect to login page after logout
  };

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

      // Get the user role from the decoded token
      const userRole = decodedToken.role;

      // Update the current user role state
      setCurrentUserRole(userRole);

      // Perform additional authentication checks if needed

      // Set username
      setUsername(decodedToken["given_name"]);

      fetch(`${backendUrl}/student/getCourses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: decodedToken.email }), // Pass user email as body data
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response data
          setCourses(data.courses);
          setPrev(data.prev);
          console.log(data);
        })
        .catch((error) => {
          console.error("Error fetching user courses:", error);
        });
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      // Redirect to the login page if there's an error decoding the token
      navigate("/login");
    }
  }, [navigate]);

  // Function to parse JWT token
  function decodeJwtToken(token) {
    // Example implementation: decode the JWT token using a library like jwt-decode
    // This is a simplified example, please replace it with a proper implementation
    return JSON.parse(atob(token.split(".")[1]));
  }

  return (
    <div className="dashboard-container">
      <div className="container-fluid">
        <div className="row flex-nowrap">
          <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
            <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
              <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-5 d-none d-sm-inline">Menu</span>
              </a>
              <ul
                className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
                id="menu"
              >
                <li className="nav-item">
                  <Link to="/student/dashboard" className="nav-link align-middle px-0" style={{ color: "white" }}>
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Dashboard
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/announcements" className="nav-link px-0 align-middle" style={{ color: "white" }}>
                    <i className="fs-4 bi-speedometer2"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Announcements
                    </span>{" "}
                  </Link>
                </li>
                <li>
                  <Link to="/student/assignment" className="nav-link px-0 align-middle" style={{ color: "white" }}>
                    <i className="fs-4 bi-speedometer2"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Assignments
                    </span>{" "}
                  </Link>
                </li>
                <li>
                  <Link to="/student/quiz" className="nav-link px-0 align-middle" style={{ color: "white" }}>
                    <i className="fs-4 bi-table"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Quizzes
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/grades" className="nav-link px-0 align-middle" style={{ color: "white" }}>
                    <i className="fs-4 bi-bootstrap"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Grades
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/student/profile" className="nav-link px-0 align-middle" style={{ color: "white" }}>
                    <i className="fs-4 bi-bootstrap"></i>{" "}
                    <span className="ms-1 d-none d-sm-inline" style={{ color: "white" }}>
                      Profile
                    </span>
                  </Link>
                </li>
              </ul>

              <hr />
            </div>
          </div>
          <div className="col py-3">
            <div className="main-content">
              <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div className="container-fluid">
                  <a className="navbar-brand" href="#">
                    Canvas
                  </a>
                </div>
                <span className="navbar-text">
                  <button onClick={handleLogout}>Logout</button>
                </span>
              </nav>
              <div className="dashboard-content">
                <div class="card" style={{ width: "18rem;", marginTop: "6%" }}>
                  <div class="card-header">Current Semester</div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                      <table class="table">
                        <thead>
                          <tr>
                            <th scope="col">CourseID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Description</th>
                            <th scope="col">Semester</th>
                            <th scope="col">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.CourseID}>
                              <th scope="row">{course.CourseID}</th>
                              <td>{course.Title}</td>
                              <td>{course.Description}</td>
                              <td>{course.Semester}</td>
                              <td>{course.Year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>

                <div class="card" style={{ width: "18rem;", marginTop: "2%" }}>
                  <div class="card-header">Previous Semesters</div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                      <table class="table">
                        <thead>
                          <tr>
                            <th scope="col">CourseID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Description</th>
                            <th scope="col">Semester</th>
                            <th scope="col">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prev.map((pre) => (
                            <tr key={pre.CourseID}>
                              <th scope="row">{pre.CourseID}</th>
                              <td>{pre.Title}</td>
                              <td>{pre.Description}</td>
                              <td>{pre.Semester}</td>
                              <td>{pre.Year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
