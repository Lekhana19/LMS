import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import AssignCourse from './components/AssignCourse';
import StudentList from './components/StudentList';
import Sidebar from './components/Sidebar';
import CssBaseline from '@mui/material/CssBaseline';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex' }}>
          <Sidebar />  
          <div style={{ flexGrow: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/assign-course" element={<AssignCourse />} />
              <Route path="/students" element={<StudentList />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
