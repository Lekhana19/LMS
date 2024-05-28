import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import SignUpForm from "./components/Signup";
import ProfessorDashboard from "./components/professor/Dashboard";
import StudentDashboard from "./components/student/Dashboard_test";
import StudentAssignment from "./components/student/Assignment";
import StudentQuiz from "./components/student/Quiz";
import Profile from "./components/student/Profile";
import AdminDashboard from "./components/admin/Dashboard";
import StudentAnnouncements from "./components/student/Announcements";
import Grades from "./components/student/Grades";
import Login from "./components/Login_test"; // Import the Login component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        {/* Routes for admin, professor, and student dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard role="admin" setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/professor/dashboard"
          element={<ProfessorDashboard role="professor" setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/student/dashboard" element={<StudentDashboard role="student" setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/student/assignment"
          element={<StudentAssignment role="student" setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/student/quiz" element={<StudentQuiz role="student" setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/student/announcements"
          element={<StudentAnnouncements role="student" setIsLoggedIn={setIsLoggedIn} />}
        />
        {/* <Route path="/student/submenu" element={<StudentMenu role="student" setIsLoggedIn={setIsLoggedIn} />} />{" "} */}
        <Route path="/student/grades" element={<Grades role="student" setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/student/profile" element={<Profile role="student" setIsLoggedIn={setIsLoggedIn} />} />

        {/* Corrected the route path for submenu */}
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
