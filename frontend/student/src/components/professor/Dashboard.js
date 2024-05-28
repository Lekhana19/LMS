import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    const jwtToken = location.state?.jwtToken;
    console.log("Hi");
    console.log(jwtToken);
    if (jwtToken) {
      try {
        const decodedToken = jwtDecode(jwtToken);
        const userRole = decodedToken["custom:role"];
        setCurrentUserRole(userRole);
        console.log("JWT Token:", jwtToken);
        console.log("User Role:", userRole);
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  }, [location.state]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (!currentUserRole || currentUserRole !== "professor") {
    return null; // Return null to prevent rendering dashboard content
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard, {currentUserRole}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
