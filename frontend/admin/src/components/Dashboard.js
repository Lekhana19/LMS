import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const Dashboard = () => {

  const handleLogout = () => {
    // Redirect to the login page
    window.location.href = "http://202-student-frontend-alb-217815477.us-east-1.elb.amazonaws.com/login";
  };

  return (
    <Box sx={{
      padding: '20px',
      backgroundColor: '#f9f9f9',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: '#333', marginBottom: '20px' }}>
          Admin Dashboard
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', marginBottom: '20px', background: '#5856d6' }}>
              <CardActionArea>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ color: '#f7f7f7' }}>
                    View Courses
                  </Typography>
                  <Typography variant="body2" color="#f7f7f7">
                    Manage and view all courses by semester and faculty.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Link to="/assign-course" style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', marginBottom: '20px', background: '#f9b115' }}>
              <CardActionArea>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ color: '#f7f7f7' }}>
                    Assign Courses
                  </Typography>
                  <Typography variant="body2" color="#f7f7f7">
                    Assign courses to faculty for upcoming semesters.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Link to="/students" style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', marginBottom: '20px', background: '#e55353' }}>
              <CardActionArea>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ color: '#f7f7f7' }}>
                    Student Lists
                  </Typography>
                  <Typography variant="body2" color="#f7f7f7">
                    View list of students enrolled in each course.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
