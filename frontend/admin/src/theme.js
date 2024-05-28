// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: 'rgba(255, 255, 255, .87)',
      paper: '#212631',
    },
  },
});

export default theme;
