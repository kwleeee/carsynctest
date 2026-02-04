import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  Navigate,
  useNavigate,
  useLocation 
} from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Box, 
  CssBaseline, 
  Paper, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build'; // Icon for Mechanic

// Pages & Components
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import VehicleList from './components/vehicleList';
import Maintenance from './pages/Maintenance';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleBadge from './components/roleBadge';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoice';
import MechanicDashboard from './pages/MechanicDashboard'; // Import new page

const appleTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000', paper: '#1c1c1e' },
    primary: { main: '#ff2d55' },
    secondary: { main: '#007aff' },
    text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: { borderRadius: 12 },
});

const ProtectedRoute = ({ children }) => {//check for user in localstorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
    setLoading(false);
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
      <CircularProgress />
    </Box>
  );

  return isLoggedIn ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {//for role based nav items
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');//retrieve user data from localstorage
    if (userData) setUser(JSON.parse(userData));//convert to json
  }, []);//run once

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();// clear all localstorage data
      navigate('/login');//navigate to login page
    }
  };

  const isAdmin = user?.user_type === 'admin' || user?.role === 'admin';
  const isMechanic = user?.user_type === 'mechanic' || user?.role === 'mechanic';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/vehicles', label: 'Vehicles', icon: <DirectionsCarIcon /> },
    { path: '/maintenance', label: 'Service Records', icon: <HistoryIcon /> },
    { path: '/appointments', label: 'Appointments', icon: <CalendarTodayIcon /> },
    { path: '/invoices', label: 'Invoices', icon: <ReceiptIcon /> },
  ];

  if (isMechanic) {
    navItems.push({ path: '/mechanic-dashboard', label: 'Workshop Panel', icon: <BuildIcon /> });
  }

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: <SecurityIcon /> });
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
      <Paper sx={{
        width: 260,
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, backgroundColor: '#ff2d55', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
            <DirectionsCarIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>CarSync</Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                fullWidth
                startIcon={item.icon}
                sx={{
                  justifyContent: 'flex-start',
                  mb: 0.8, py: 1.2, px: 2, borderRadius: 2,
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: isActive ? 'rgba(255, 45, 85, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 45, 85, 0.3)' : '1px solid transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                <Typography variant="body2" fontWeight={isActive ? 600 : 500}>{item.label}</Typography>
              </Button>
            );
          })}
        </Box>

        <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
              {user?.firstName?.[0] || <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
               {/* Priority: firstName > full_name (split) > "User" */}
               {user?.firstName || (user?.full_name ? user.full_name.split(' ')[0] : 'User')}
              </Typography>
              <RoleBadge role={user?.user_type || user?.role} />
            </Box>
          </Box>
          
          <Button 
            fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />}
            onClick={handleLogout} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, ml: '260px', p: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={appleTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vehicles" element={<VehicleList />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;