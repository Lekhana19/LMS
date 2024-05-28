import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout actions here
    // For example, clear local storage, reset state, etc.
    setIsLoggedIn(false); // Update isLoggedIn state to false
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard Admin!</p>
      {/* Logout button */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
