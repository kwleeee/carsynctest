import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  Fab,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { appointmentService, vehicleService } from '../services/api';

//styled Card
const StyledCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
}));

//service types
const serviceTypes = [
  { value: 'oil_change', label: 'Oil Change', duration: '1 hour', price: '$80-120' },
  { value: 'tire_rotation', label: 'Tire Rotation', duration: '45 min', price: '$60-100' },
  { value: 'brake_service', label: 'Brake Service', duration: '2-3 hours', price: '$150-300' },
  { value: 'engine_diagnostic', label: 'Engine Diagnostic', duration: '1-2 hours', price: '$100-200' },
];

//time slots
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM'
];

//mechanics (mock)
const mechanics = [
  { id: 1, name: 'John Smith', specialty: 'General Repair', rating: 4.8 },
  { id: 2, name: 'Mike Johnson', specialty: 'Electrical Systems', rating: 4.9 },
  { id: 3, name: 'Sarah Williams', specialty: 'Engine Specialist', rating: 4.7 },
];

//initial form state
const initialFormData = {
  vehicle: '',
  service: 'oil_change',
  date: '',
  time: '09:00 AM',
  mechanic: '',
  notes: '',
  urgency: 'normal'
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);

  //load user data and vehicles
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setSnackbar({ open: true, message: 'Please login first', severity: 'error' });
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        console.log('👤 User loaded:', parsedUser);
        
        //load user's vehicles
        await loadVehicles(parsedUser.user_id);
        
        //load appointments
        await loadAppointments(parsedUser.user_id);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  //load vehicles
  const loadVehicles = async (userId) => {
    try {
      console.log('🚗 Loading vehicles for user:', userId);
      const response = await vehicleService.fetchVehicles(userId);
      console.log('📥 Vehicles response:', response);
      
      if (response.success) {
        setVehicles(response.vehicles || []);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('❌ Error loading vehicles:', error);
      setVehicles([]);
    }
  };

  //load appointments from API
  const loadAppointments = async (userId) => {
    try {
      console.log('📅 Loading appointments for user:', userId);
      const response = await appointmentService.fetchAppointments(userId);
      console.log('📥 Appointments response:', response);
      
      if (response.success) {
        setAppointments(response.appointments || []);
      } else {
        //fallback to localStorage or empty array
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        setAppointments(savedAppointments.filter(app => app.user_id === userId));
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      //fallback to localStorage
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const userAppointments = savedAppointments.filter(app => app.user_id === userId);
      setAppointments(userAppointments);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'success',
      'pending': 'warning',
      'completed': 'info',
      'cancelled': 'error',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  };

  const handleAddAppointment = async () => {
    if (!formData.vehicle || !formData.date) {
      setSnackbar({ open: true, message: 'Please select a vehicle and date', severity: 'error' });
      return;
    }

    try {
      //find selected vehicle
      const selectedVehicle = vehicles.find(v => v.vehicle_id.toString() === formData.vehicle);
      const selectedService = serviceTypes.find(s => s.value === formData.service);
      const selectedMechanic = mechanics.find(m => m.id.toString() === formData.mechanic);

      if (!selectedVehicle) {
        setSnackbar({ open: true, message: 'Invalid vehicle selection', severity: 'error' });
        return;
      }

      //prepare appointment data
      const appointmentData = {
        user_id: user.user_id,
        vehicle_id: selectedVehicle.vehicle_id,
        service_type: formData.service,
        appointment_date: formData.date,
        appointment_time: formData.time,
        notes: formData.notes,
        status: 'pending',
        urgency: formData.urgency,
        mechanic_id: formData.mechanic || null
      };

      console.log('📤 Booking appointment:', appointmentData);
      
      //try to book via API
      const response = await appointmentService.bookAppointment(appointmentData);
      
      if (response.success) {
        //add the new appointment to the list
        const newAppointment = {
          appointment_id: response.appointment_id || Date.now(),
          ...appointmentData,
          vehicle: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
          vehicle_license: selectedVehicle.license_plate,
          service_name: selectedService?.label || formData.service,
          mechanic_name: selectedMechanic?.name || 'To be assigned'
        };
        
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        
        //save to localStorage for offline access
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        
        //close dialog and reset form
        setOpenDialog(false);
        setFormData(initialFormData);

        //show success message
        setSnackbar({ 
          open: true, 
          message: 'Appointment requested successfully!',
          severity: 'success' 
        });
      }
      
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to book appointment. Please try again.',
        severity: 'error' 
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      console.log('🗑️ Cancelling appointment:', selectedAppointment.appointment_id);
      
      //try to cancel via API
      const response = await appointmentService.cancelAppointment(
        selectedAppointment.appointment_id, 
        cancelReason
      );
      
      if (response.success) {
        //update local state
        const updatedAppointments = appointments.map(app =>
          app.appointment_id === selectedAppointment.appointment_id
            ? { ...app, status: 'cancelled', cancel_reason: cancelReason }
            : app
        );
        setAppointments(updatedAppointments);
        
        //save to localStorage
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        
        setCancelDialogOpen(false);
        setCancelReason('');
        setSelectedAppointment(null);
        
        setSnackbar({ 
          open: true, 
          message: 'Appointment cancelled successfully',
          severity: 'success' 
        });
      }
      
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to cancel appointment',
        severity: 'error' 
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const filteredAppointments = () => {
    const filters = {
      'upcoming': (a) => ['confirmed', 'pending'].includes(a.status),
      'pending': (a) => a.status === 'pending',
      'completed': (a) => a.status === 'completed',
      'cancelled': (a) => ['cancelled', 'rejected'].includes(a.status)
    };
    
    const filterFunc = filters[activeTab] || (() => true);
    return appointments.filter(filterFunc);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const currentAppointments = filteredAppointments();

  const getVehicleDisplayName = (appointment) => {
    if (appointment.vehicle) {
      return appointment.vehicle;
    }
    
    //try to find vehicle in vehicles list
    const vehicle = vehicles.find(v => v.vehicle_id === appointment.vehicle_id);
    if (vehicle) {
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
    
    return 'Unknown Vehicle';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading appointments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Appointments
          </Typography>
          <Typography color="text.secondary">
            Schedule and track your vehicle services
          </Typography>
        </Box>
        <Tooltip title="Book New Appointment">
          <Fab
            color="primary"
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #ff2d55 0%, #ff5c7f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #cc0033 0%, #ff2d55 100%)',
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/*stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)' }}>
                  <CalendarTodayIcon sx={{ color: '#ff2d55' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => ['confirmed', 'pending'].includes(a.status)).length}
                  </Typography>
                  <Typography color="text.secondary">Upcoming</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)' }}>
                  <ScheduleIcon sx={{ color: '#ff9500' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => a.status === 'pending').length}
                  </Typography>
                  <Typography color="text.secondary">Pending</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)' }}>
                  <CheckCircleIcon sx={{ color: '#34c759' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => a.status === 'completed').length}
                  </Typography>
                  <Typography color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 59, 48, 0.1)' }}>
                  <CancelIcon sx={{ color: '#ff3b30' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {appointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length}
                  </Typography>
                  <Typography color="text.secondary">Cancelled</Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label={
            <Badge badgeContent={appointments.filter(a => a.status === 'pending').length} color="warning">
              Pending
            </Badge>
          } value="pending" />
          <Tab label="Completed" value="completed" />
          <Tab label="Cancelled" value="cancelled" />
        </Tabs>
      </Paper>

      {/*appointments table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle & Service</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Mechanic</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CalendarTodayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    {activeTab === 'upcoming' 
                      ? 'No upcoming appointments' 
                      : activeTab === 'pending'
                      ? 'No pending appointments'
                      : 'No appointments found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentAppointments.map((appointment) => (
                <TableRow key={appointment.appointment_id || appointment.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)' }}>
                        <DirectionsCarIcon sx={{ color: '#ff2d55' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{getVehicleDisplayName(appointment)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.service_name || appointment.service_type || 'Service'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                      {appointment.appointment_time || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                        {(appointment.mechanic_name || '?').charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{appointment.mechanic_name || 'To be assigned'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                    {appointment.cancel_reason && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        Reason: {appointment.cancel_reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setViewDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {['confirmed', 'pending'].includes(appointment.status) && (
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/*add appointment dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Book New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Vehicle</InputLabel>
                <Select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  label="Select Vehicle"
                  required
                >
                  {vehicles.length === 0 ? (
                    <MenuItem disabled>No vehicles found. Add a vehicle first.</MenuItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.vehicle_id} value={vehicle.vehicle_id.toString()}>
                        {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Service Type</InputLabel>
                <Select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  label="Service Type"
                  required
                >
                  {serviceTypes.map((service) => (
                    <MenuItem key={service.value} value={service.value}>
                      {service.label} - {service.duration} - {service.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Time</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  label="Preferred Time"
                  required
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Mechanic</InputLabel>
                <Select
                  name="mechanic"
                  value={formData.mechanic}
                  onChange={handleChange}
                  label="Preferred Mechanic"
                >
                  <MenuItem value="">Any Available</MenuItem>
                  {mechanics.map((mechanic) => (
                    <MenuItem key={mechanic.id} value={mechanic.id.toString()}>
                      {mechanic.name} - {mechanic.specialty} ⭐{mechanic.rating}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  label="Urgency"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Any specific issues or concerns..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddAppointment} 
            variant="contained" 
            disabled={!formData.vehicle || !formData.date || vehicles.length === 0}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/*view appointment dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DirectionsCarIcon sx={{ color: '#ff2d55' }} />
                Appointment Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity={getStatusColor(selectedAppointment.status)} sx={{ mb: 2 }}>
                    Status: {getStatusLabel(selectedAppointment.status)}
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Vehicle</Typography>
                  <Typography variant="body1" fontWeight={500}>{getVehicleDisplayName(selectedAppointment)}</Typography>
                  <Typography variant="caption">{selectedAppointment.vehicle_license || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Service</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.service_name || selectedAppointment.service_type || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.appointment_date 
                      ? new Date(selectedAppointment.appointment_date).toLocaleDateString() 
                      : 'N/A'} at {selectedAppointment.appointment_time || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Mechanic</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedAppointment.mechanic_name || 'To be assigned'}
                  </Typography>
                </Grid>
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Notes</Typography>
                    <Typography variant="body1">{selectedAppointment.notes}</Typography>
                  </Grid>
                )}
                {selectedAppointment.cancel_reason && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Cancellation Reason</Typography>
                    <Typography variant="body1" color="error">{selectedAppointment.cancel_reason}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/*cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel the appointment for{" "}
            <strong>{selectedAppointment && getVehicleDisplayName(selectedAppointment)}</strong> on{" "}
            <strong>{selectedAppointment && new Date(selectedAppointment.appointment_date).toLocaleDateString()}</strong>?
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelAppointment}
            disabled={!cancelReason.trim()}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/*snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appointments;