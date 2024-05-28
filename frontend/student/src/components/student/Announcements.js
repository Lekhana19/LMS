import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import "./Dashboard.css"; // Import CSS file for styling
import awsConfig from "../AwsConfig";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // Define currentUserRole state
  const [collapseState, setCollapseState] = useState({});
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

      // Get the user role from the decoded token
      const userRole = decodedToken.role;

      // Update the current user role state
      setCurrentUserRole(userRole);

      // Perform additional authentication checks if needed

      // Set username
      setUsername(decodedToken["given_name"]);

      fetch(`${backendUrl}/student/getAnnouncements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: decodedToken.email }), // Pass user email as body data
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response data
          setCourses(data.courseTitles);
          setAnnouncements(data.announcements);
          console.log(data);

          // Initialize collapse state for each course
          const initialCollapseState = {};
          data.courses.forEach((course, index) => {
            initialCollapseState[`collapse${index}`] = index === 0; // Expand the first collapse by default
          });
          setCollapseState(initialCollapseState);
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

  function decodeJwtToken(token) {
    // Example implementation: decode the JWT token using a library like jwt-decode
    // This is a simplified example, please replace it with a proper implementation
    return JSON.parse(atob(token.split(".")[1]));
  }

  // Function to toggle collapse state
  const toggleCollapse = (collapseId) => {
    setCollapseState((prevState) => ({
      ...prevState,
      [collapseId]: !prevState[collapseId],
    }));
  };

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout actions here
    // For example, clear local storage, reset state, etc.
    setIsLoggedIn(false); // Update isLoggedIn state to false
    navigate("/login"); // Redirect to login page after logout
  };

  // Function to handle submenu item click
  const handleSubmenuItem = (item) => {
    navigate(`/student/submenu?item=${item}`); // Navigate to the submenu with the specified item
    setSubmenuOpen(false); // Close the submenu
  };

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
              <div className="dashboard-content" style={{ marginTop: "50px" }}>
                <h2>Announcements</h2>
                <div id="accordion">
                  {courses.map((course, index) => (
                    <div className="card" key={index}>
                      <div className="card-header" id={`heading${index}`}>
                        <h5 className="mb-0">
                          <button
                            className="btn "
                            onClick={() => toggleCollapse(`collapse${index}`)}
                            aria-expanded={collapseState[`collapse${index}`]}
                          >
                            {course} {/* Render the course title */}
                          </button>
                        </h5>
                      </div>
                      <div
                        id={`collapse${index}`}
                        className={`collapse ${collapseState[`collapse${index}`] ? "show" : ""}`}
                        aria-labelledby={`heading${index}`}
                      >
                        <div className="card-body">
                          {/* Render announcements for this course */}
                          {announcements
                            .filter((announcement) => announcement.CourseTitle === course) // Filter announcements by CourseTitle
                            .map((announcement, i) => (
                              <div key={i}>
                                <h4>{announcement.Title}</h4>
                                <h6>Announcement Date: {announcement.PostDate}</h6>
                                <p>{announcement.Content}</p>
                                {i !== announcements.length - 1 && <hr />}{" "}
                                {/* Render horizontal line if it's not the last announcement */}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
