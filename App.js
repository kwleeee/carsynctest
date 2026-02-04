import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Import components (we'll create these next)
import Dashboard from './pages/Dashboard';
import VehicleList from './components/VehicleList';
import Maintenance from './pages/Maintenance';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoices';
// Create a theme
const theme = createTheme({
  palette: {
    primary: {
main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Layout component
const Layout = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <AppBar position="static">
      <Toolbar>
<DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CarSync - Vehicle Maintenance Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            <DashboardIcon sx={{ mr: 1 }} />
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/vehicles">
            <DirectionsCarIcon sx={{ mr: 1 }} />
            Vehicles
          </Button>
          <Button color="inherit" component={Link} to="/maintenance">
<HistoryIcon sx={{ mr: 1 }} />
            Maintenance
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Container component="main" sx={{ flex: 1, py: 3 }}>
      {children}
    </Container>
    <Box component="footer" sx={{ py: 3, backgroundColor: '#f5f5f5' }}>
      <Container>
        <Typography variant="body2" color="text.secondary" align="center">
          � {new Date().getFullYear()} CarSync Vehicle Maintenance Tracker
        </Typography>
        <Button color="inherit" component={Link} to="/appointments">
  <CalendarTodayIcon sx={{ mr: 1 }} />
  Appointments
</Button>
<Button color="inherit" component={Link} to="/invoices">
  <ReceiptIcon sx={{ mr: 1 }} />
  Invoices
</Button>
</Container>
    </Box>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
  } />
          <Route path="/vehicles" element={
            <Layout>
              <VehicleList />
            </Layout>
          } />
          <Route path="/maintenance" element={
            <Layout>
              <Maintenance />
            </Layout>
          } />
          <Route path="/appointments" element={
  <Layout>
    <Appointments />
  </Layout>
} />
<Route path="/invoices" element={
  <Layout>
    <Invoices />
  </Layout>
} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
