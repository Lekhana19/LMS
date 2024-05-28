import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./Dashboard.css"; // Import CSS file for styling
import awsConfig from "../AwsConfig";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [notificationPreference, setNotificationPreference] = useState("email"); // State to hold notification preference
  const { backendUrl } = awsConfig;

  const decodedToken = decodeJwtToken(Cookies.get("jwtToken"));

  const handleNotificationPreferenceChange = async (e) => {
    const preference = e.target.value;
    setNotificationPreference(preference);
    try {
      const jwtToken = Cookies.get("jwtToken");
      const decodedToken = decodeJwtToken(jwtToken);
      const response = await fetch(`${backendUrl}/saveNotificationPreference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`, // Send JWT token in the Authorization header
        },
        body: JSON.stringify({ email: decodedToken.email, preference }), // Send email and preference to the backend
      });
      if (!response.ok) {
        throw new Error("Failed to save notification preference");
      }
    } catch (error) {
      console.error("Error saving notification preference:", error);
      // Handle error saving notification preference
    }
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

      // Set username
      setUsername(decodedToken["given_name"]);

      // Fetch user details
      fetchUserDetails(decodedToken.email); // Assuming email is available in the JWT token
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

  async function fetchUserDetails(email) {
    try {
      const response = await fetch(`${backendUrl}/getUserDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        setUserDetails(userData.userId); // Assuming the response is an array with one object
      } else {
        throw new Error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
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
                <h2>Student Details</h2>
                {console.log(userDetails)}
                {userDetails && (
                  <div>
                    <p>User ID: {userDetails.UserID}</p>
                    <p>First Name: {userDetails.FirstName}</p>
                    <p>Last Name: {userDetails.LastName}</p>
                    <p>Email: {userDetails.Email}</p>
                    <div>
                      <p>Notification Preferences:</p>
                      <label>
                        <input
                          type="radio"
                          value="Yes"
                          checked={notificationPreference === "Yes"}
                          onChange={handleNotificationPreferenceChange}
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="No"
                          checked={notificationPreference === "No"}
                          onChange={handleNotificationPreferenceChange}
                        />
                        No
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
