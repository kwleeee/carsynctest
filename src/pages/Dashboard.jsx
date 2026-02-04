import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, IconButton, Card, CardContent, 
  LinearProgress, Chip, Avatar, Button, CircularProgress, Alert 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { vehicleService, appointmentService, invoiceService } from '../services/api';

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 8px 32px rgba(255, 45, 85, 0.15)`,
  },
}));

const StatCard = ({ icon: Icon, title, value, subtitle, color, loading }) => (
  <GradientCard>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ 
          width: 48, height: 48, borderRadius: 12, 
          backgroundColor: `${color}20`, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon sx={{ fontSize: 24, color: color }} />
        </Box>
        <IconButton size="small"><MoreHorizIcon /></IconButton>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        {loading ? '...' : value}
      </Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="caption" sx={{ color: color, display: 'block', mt: 1 }}>
        {loading ? 'Loading...' : subtitle}
      </Typography>
    </CardContent>
  </GradientCard>
);

const ServiceCard = ({ vehicle, service, date, status }) => (
  <Paper sx={{ 
    p: 2, mb: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)' }}>
        <HistoryIcon sx={{ fontSize: 20, color: '#ff2d55' }} />
      </Avatar>
      <Box>
        <Typography variant="subtitle2">{vehicle}</Typography>
        <Typography variant="caption" color="text.secondary">{service} • {new Date(date).toLocaleDateString()}</Typography>
      </Box>
    </Box>
    <Chip 
      label={status.toUpperCase()} 
      size="small" 
      color={status === 'completed' ? 'success' : 'warning'}
      sx={{ height: 20, fontSize: '0.7rem' }} 
    />
  </Paper>
);

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    upcomingServices: 0,
    totalSpent: 0,
    healthScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;
      
      // Save user data to state for the Welcome header
      setUser(userData);

      const [vRes, aRes, iRes] = await Promise.all([
        vehicleService.fetchVehicles(userData.user_id),
        appointmentService.fetchAppointments(userData.user_id),
        invoiceService.fetchInvoices(userData.user_id)
      ]);

      // Map vehicle_id to id for component compatibility
      const vehicleList = (vRes.vehicles || []).map(v => ({
        ...v,
        id: v.vehicle_id 
      }));

      // Map appointment_id to id for component compatibility
      const appointmentList = (aRes.appointments || []).map(a => ({
        ...a,
        id: a.appointment_id
      }));

      setVehicles(vehicleList);
      
      // Filter for active appointments (not completed/cancelled)
      setAppointments(appointmentList.filter(a => a.status === 'pending' || a.status === 'confirmed').slice(0, 3));

      // Calculate Total Spent from invoices
      const totalSpent = (iRes.invoices || []).reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

      setStats({
        totalVehicles: vehicleList.length,
        upcomingServices: appointmentList.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
        totalSpent: totalSpent.toFixed(2),
        healthScore: vehicleList.length > 0 ? 94 : 0
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Syncing with MySQL...</Typography></Box>;

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Driver';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome back, {displayName}!</Typography>
        <Typography variant="body1" color="text.secondary">Your fleet is currently healthy and tracked.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={DirectionsCarIcon} title="My Vehicles" value={stats.totalVehicles} subtitle="In Garage" color="#ff2d55" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={CalendarTodayIcon} title="Upcoming Jobs" value={stats.upcomingServices} subtitle="Waitlist" color="#007aff" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={AttachMoneyIcon} title="Total Spent" value={`$${stats.totalSpent}`} subtitle="Record" color="#34c759" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={TrendingUpIcon} title="Fleet Health" value={`${stats.healthScore}%`} subtitle="Optimal" color="#ff9500" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
              {appointments.length > 0 ? (
                appointments.map((app, i) => (
                  <ServiceCard 
                    key={i} 
                    vehicle={app.make ? `${app.make} ${app.model}` : 'Vehicle Info Missing'} 
                    service={app.service_type} 
                    date={app.appointment_date} 
                    status={app.status} 
                  />
                ))
              ) : (
                <Typography color="text.secondary">No active service appointments.</Typography>
              )}
              <Button component={Link} to="/appointments" sx={{ mt: 2 }}>View All Schedule</Button>
            </CardContent>
          </GradientCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Maintenance Progress</Typography>
              {vehicles.length > 0 ? vehicles.map((v, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">{v.make} {v.model}</Typography>
                    <Typography variant="caption">Healthy</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              )) : (
                <Typography variant="caption" color="text.secondary">Register a vehicle to track health.</Typography>
              )}
              <Button component={Link} to="/vehicles" fullWidth variant="outlined" sx={{ mt: 1 }}>Manage Fleet</Button>
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;