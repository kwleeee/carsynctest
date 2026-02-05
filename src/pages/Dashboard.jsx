import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, IconButton, Card, CardContent, 
  LinearProgress, Chip, Avatar, Button, CircularProgress, Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

const ServiceCard = ({ title, subtitle, date, status }) => (
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
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle} • {new Date(date).toLocaleDateString()}</Typography>
      </Box>
    </Box>
    <Chip 
      label={status.toUpperCase()} 
      size="small" 
      color={status === 'completed' ? 'success' : status === 'confirmed' ? 'info' : 'warning'}
      sx={{ height: 20, fontSize: '0.7rem' }} 
    />
  </Paper>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [dashboardData, setDashboardData] = useState({
    stat1: 0, // Vehicles (Owner) OR Total Vehicles (Mechanic)
    stat2: 0, // Upcoming Jobs
    stat3: 0, // Spent (Owner) OR Completed (Mechanic)
    stat4: 0, // Health (Owner) OR Pending (Mechanic)
    recentActivity: [],
    progressData: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;
      setUser(userData);

      const isMechanic = userData.user_type === 'mechanic' || userData.role === 'mechanic';

      if (isMechanic) {
        // --- MECHANIC DATA FETCH (REAL DB DATA) ---
        try {
          const res = await appointmentService.fetchMechanicAppointments();
          const allApps = res.success ? res.appointments : [];

          // 1. Calculate Real Counts based on DB status
          const pendingCount = allApps.filter(a => a.status === 'pending').length; 
          const confirmedCount = allApps.filter(a => a.status === 'confirmed').length;
          const completedCount = allApps.filter(a => a.status === 'completed').length;
          
          // 2. Calculate "Total Vehicles" (Unique vehicles currently in Pending or Confirmed status)
          // This ensures if one car has 2 appointments, it only counts as 1 car in the garage.
          const activeAppointments = allApps.filter(a => ['pending', 'confirmed'].includes(a.status));
          const uniqueVehiclesInShop = new Set(activeAppointments.map(a => a.vehicle_id)).size;

          // 3. Get real upcoming jobs (Confirmed only, sorted by date)
          const upcoming = allApps
            .filter(a => a.status === 'confirmed')
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
            .slice(0, 5);

          setDashboardData({
            stat1: uniqueVehiclesInShop, // Real count of cars currently involved in active work
            stat2: confirmedCount,       // Active Jobs count
            stat3: completedCount,       // Real completed count
            stat4: pendingCount,         // Real pending count
            recentActivity: upcoming,    // Real upcoming jobs
            progressData: [] 
          });
        } catch (e) {
          console.error("Failed to load mechanic data", e);
          // If error, show 0s instead of mock data so we know it failed
          setDashboardData({ stat1: 0, stat2: 0, stat3: 0, stat4: 0, recentActivity: [], progressData: [] });
        }

      } else {
        // --- OWNER/ADMIN DATA FETCH ---
        const [vRes, aRes, iRes] = await Promise.all([
          vehicleService.fetchVehicles(userData.user_id),
          appointmentService.fetchAppointments(userData.user_id),
          invoiceService.fetchInvoices(userData.user_id)
        ]);

        const vehicles = vRes.vehicles || [];
        const appointments = aRes.appointments || [];
        const invoices = iRes.invoices || [];
        const totalSpent = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

        setDashboardData({
          stat1: vehicles.length,
          stat2: appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
          stat3: totalSpent.toFixed(2),
          stat4: vehicles.length > 0 ? 94 : 0, // Mock health score since we don't calculate it yet
          recentActivity: appointments.slice(0, 3),
          progressData: vehicles
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return (
    <Box sx={{ p: 5, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Syncing Dashboard...</Typography>
    </Box>
  );

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'User';
  const isMechanic = user?.user_type === 'mechanic' || user?.role === 'mechanic';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome back, {displayName}!</Typography>
        <Typography variant="body1" color="text.secondary">
          {isMechanic ? 'Here is your workshop overview for today.' : 'Your fleet is currently healthy and tracked.'}
        </Typography>
      </Box>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Vehicles */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={DirectionsCarIcon} 
            title={isMechanic ? "Total Vehicles" : "My Vehicles"} 
            value={dashboardData.stat1} 
            subtitle={isMechanic ? "In Workshop" : "In Garage"} 
            color="#ff2d55" 
          />
        </Grid>
        
        {/* Card 2: Jobs/Appointments */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={isMechanic ? BuildIcon : CalendarTodayIcon} 
            title={isMechanic ? "Active Jobs" : "Upcoming Jobs"} 
            value={dashboardData.stat2} 
            subtitle={isMechanic ? "In Progress" : "Waitlist"} 
            color="#007aff" 
          />
        </Grid>

        {/* Card 3: Completed/Spent (CONDITIONAL) */}
        {isMechanic ? (
          <Grid item xs={12} sm={6} md={3}>
             {/* Mechanic sees Completed Jobs instead of Money */}
            <StatCard 
              icon={CheckCircleIcon} 
              title="Jobs Completed" 
              value={dashboardData.stat3} 
              subtitle="All Time" 
              color="#34c759" 
            />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={3}>
            {/* Owner sees Spent */}
            <StatCard 
              icon={AttachMoneyIcon} 
              title="Total Spent" 
              value={`$${dashboardData.stat3}`} 
              subtitle="Record" 
              color="#34c759" 
            />
          </Grid>
        )}

        {/* Card 4: Health/Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={isMechanic ? ScheduleIcon : TrendingUpIcon} 
            title={isMechanic ? "Pending Requests" : "Fleet Health"} 
            value={isMechanic ? dashboardData.stat4 : `${dashboardData.stat4}%`} 
            subtitle={isMechanic ? "Action Required" : "Optimal"} 
            color="#ff9500" 
          />
        </Grid>
      </Grid>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={3}>
        {/* Recent Activity Column */}
        <Grid item xs={12} md={8}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {isMechanic ? 'Job Schedule' : 'Recent Activity'}
              </Typography>
              
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((app, i) => (
                  <ServiceCard 
                    key={i} 
                    title={isMechanic 
                      ? (app.customer_name || 'Customer') 
                      : (app.make ? `${app.make} ${app.model}` : 'Vehicle Info')} 
                    subtitle={app.service_type} 
                    date={app.appointment_date} 
                    status={app.status} 
                  />
                ))
              ) : (
                <Typography color="text.secondary">No active items.</Typography>
              )}

              <Button 
                component={Link} 
                to={isMechanic ? "/mechanic-dashboard" : "/appointments"} 
                sx={{ mt: 2 }}
              >
                {isMechanic ? "Go to Workshop Panel" : "View All Schedule"}
              </Button>
            </CardContent>
          </GradientCard>
        </Grid>

        {/* Sidebar Column */}
        <Grid item xs={12} md={4}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {isMechanic ? 'Quick Actions' : 'Maintenance Progress'}
              </Typography>

              {isMechanic ? (
                // Mechanic Actions
                <Stack spacing={2}>
                  <Button variant="outlined" startIcon={<ScheduleIcon />} component={Link} to="/mechanic-dashboard">
                    Review Requests
                  </Button>
                  <Button variant="outlined" startIcon={<BuildIcon />} component={Link} to="/mechanic-dashboard">
                    Update Status
                  </Button>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">💡 Tip</Typography>
                    <Typography variant="body2">Mark jobs as "Completed" to generate invoices.</Typography>
                  </Box>
                </Stack>
              ) : (
                // Owner Progress
                <>
                  {dashboardData.progressData.length > 0 ? dashboardData.progressData.map((v, i) => (
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
                </>
              )}
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
