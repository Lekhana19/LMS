// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon style={{ color: "#F7F7F7" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" style={{ color: "#F7F7F7" }}/>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/courses">
            <ListItemIcon style={{ color: "#F7F7F7" }}>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText primary="Courses" style={{ color: "#F7F7F7" }}/>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/students">
            <ListItemIcon style={{ color: "#F7F7F7" }}>
              <PeopleIcon/>
            </ListItemIcon>
            <ListItemText primary="Students" style={{ color: "#F7F7F7" }}/>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;