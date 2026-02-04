// vehiclelist.jsx - Updated imports
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Fab,
  Tooltip,
  CircularProgress,
  InputAdornment    
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import apiServices from '../services/api';
const vehicleService = apiServices.vehicleService;

// Fuel types
const fuelTypes = [
  { value: 'petrol', label: 'Petrol' }, // Must match ENUM 'petrol'
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

// Function to transform backend vehicle to frontend format
const transformBackendToFrontend = (backendVehicle) => {
  if (!backendVehicle) return null;
  
  console.log('🔄 Transforming backend vehicle:', backendVehicle);
  
  return {
    id: backendVehicle.vehicle_id || backendVehicle.id,
    vehicle_id: backendVehicle.vehicle_id || backendVehicle.id,
    make: backendVehicle.make || '',
    model: backendVehicle.model || '',
    year: backendVehicle.year || new Date().getFullYear(),
    licensePlate: backendVehicle.license_plate || '',
    license_plate: backendVehicle.license_plate || '',
    color: backendVehicle.color || '',
    fuelType: backendVehicle.fuel_type || 'gasoline',
    fuel_type: backendVehicle.fuel_type || 'gasoline',
    currentMileage: backendVehicle.current_mileage || 0,
    current_mileage: backendVehicle.current_mileage || 0,
    lastServiceMileage: backendVehicle.last_service_mileage || 0,
    last_service_mileage: backendVehicle.last_service_mileage || 0,
    vin: backendVehicle.vin || '',
    engine_no: backendVehicle.engine_no || '',
    created_at: backendVehicle.created_at || new Date().toISOString()
  };
};

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [user, setUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    fuelType: 'gasoline',
    currentMileage: '',
    color: '',
  });

  // Load vehicles
  useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    // Explicitly check for both naming conventions
    const userId = parsedUser.user_id || parsedUser.id; 
    
    if (userId) {
      setUser(parsedUser);
      loadVehicles(userId);
    }
  }
}, []);

  const loadVehicles = async (userId) => {
    setLoading(true);
    try {
      console.log('🔍 Loading vehicles for user ID:', userId);
      
      // Check if userId is valid
      if (!userId) {
        console.error('❌ No user ID provided');
        throw new Error('No user ID found');
      }
      
      // Now this will work with the fixed api.js
      const response = await vehicleService.fetchVehicles(userId);
      console.log('📥 API Response:', response);
      
      // Check response structure - backend returns { success, vehicles }
      if (response && response.success !== undefined) {
        if (Array.isArray(response.vehicles)) {
          // Transform backend vehicles to frontend format
          const transformedVehicles = response.vehicles.map(transformBackendToFrontend);
          console.log('✅ Transformed vehicles:', transformedVehicles);
          setVehicles(transformedVehicles);
        } else {
          console.warn('⚠️ No vehicles array in response:', response);
          setVehicles([]);
        }
      } else {
        console.warn('⚠️ Unexpected API response format:', response);
        setVehicles([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading vehicles from API:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setVehicles([]);
      
      setSnackbar({ 
        open: true, 
        message: `Failed to load vehicles: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingVehicle(null);
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      fuelType: 'gasoline',
      currentMileage: '',
      color: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      licensePlate: vehicle.licensePlate || vehicle.license_plate || '',
      fuelType: vehicle.fuelType || vehicle.fuel_type || 'gasoline',
      currentMileage: vehicle.currentMileage || vehicle.current_mileage || '',
      color: vehicle.color || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setSnackbar({
        open: true,
        message: 'User not found. Please login again.',
        severity: 'error'
      });
      return;
    }

    try {
      // Get user ID correctly
      const userId = user.user_id || user.id;
      
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'User ID not found. Please login again.',
          severity: 'error'
        });
        return;
      }

      // Transform form data to backend format
      const backendData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        license_plate: formData.licensePlate,
        color: formData.color || '',
        fuel_type: formData.fuelType,
        current_mileage: parseInt(formData.currentMileage) || 0
      };

      console.log('📤 Vehicle Data to Send:', {
        userId: userId,
        data: backendData
      });

      if (editingVehicle) {
        // Update via API
        console.log('🔄 Updating vehicle:', editingVehicle.id, backendData);
        const response = await vehicleService.updateVehicle(editingVehicle.id, backendData);
        
        if (response.success) {
          // Update local state
          const updatedVehicles = vehicles.map(vehicle =>
            vehicle.id === editingVehicle.id ? transformBackendToFrontend({ 
              ...vehicle, 
              ...backendData,
              vehicle_id: editingVehicle.id 
            }) : vehicle
          );
          setVehicles(updatedVehicles);
          
          setSnackbar({ 
            open: true, 
            message: 'Vehicle updated successfully!', 
            severity: 'success' 
          });
          handleCloseDialog();
        } else {
          setSnackbar({ 
            open: true, 
            message: response.message || 'Failed to update vehicle', 
            severity: 'error' 
          });
        }
        
      } else {
        // Add via API
        console.log('➕ Adding vehicle for user:', userId, backendData);
        const response = await vehicleService.addVehicle(userId, backendData);
        
        console.log('📥 Add vehicle response:', response);
        
        if (response.success) {
          if (response.vehicle) {
            // Update local state with new vehicle
            const newVehicle = transformBackendToFrontend(response.vehicle);
            setVehicles(prev => [...prev, newVehicle]);
          }
          
          setSnackbar({ 
            open: true, 
            message: 'Vehicle added successfully!', 
            severity: 'success' 
          });
          handleCloseDialog();
        } else {
          setSnackbar({ 
            open: true, 
            message: response.message || 'Failed to add vehicle', 
            severity: 'error' 
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error saving vehicle:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to save vehicle. Please try again.';
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete || !user) return;
    
    try {
      console.log('🗑️ Deleting vehicle:', vehicleToDelete.id);
      const response = await vehicleService.deleteVehicle(vehicleToDelete.id);
      
      if (response.success) {
        // Update local state
        const updatedVehicles = vehicles.filter(
          vehicle => vehicle.id !== vehicleToDelete.id
        );
        setVehicles(updatedVehicles);
        
        setSnackbar({ 
          open: true, 
          message: 'Vehicle deleted successfully!', 
          severity: 'success' 
        });
      }
      
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete vehicle. Please try again.', 
        severity: 'error' 
      });
    }
    
    setOpenDeleteDialog(false);
    setVehicleToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getVehicleStatus = (vehicle) => {
    if (!vehicle) return { status: 'info', message: 'No data' };
    return { status: 'success', message: 'Active' };
  };

  // Safe vehicles check
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading vehicles...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Vehicles
          </Typography>
          <Typography color="text.secondary">
            Manage your vehicle fleet and maintenance schedule
          </Typography>
        </Box>
        <Tooltip title="Add New Vehicle">
          <Fab
            color="primary"
            onClick={handleOpenAddDialog}
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

      {/* Vehicle Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)' }}>
                  <DirectionsCarIcon sx={{ color: '#ff2d55' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{safeVehicles.length}</Typography>
                  <Typography color="text.secondary">Total Vehicles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)' }}>
                  <CheckCircleIcon sx={{ color: '#34c759' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {safeVehicles.filter(v => getVehicleStatus(v).status === 'success').length}
                  </Typography>
                  <Typography color="text.secondary">Good Status</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 204, 0, 0.1)' }}>
                  <WarningIcon sx={{ color: '#ffcc00' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {safeVehicles.filter(v => getVehicleStatus(v).status === 'warning').length}
                  </Typography>
                  <Typography color="text.secondary">Needs Attention</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(0, 122, 255, 0.1)' }}>
                  <WarningIcon sx={{ color: '#007aff' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {safeVehicles.filter(v => {
                      const currentMileage = Number(v.currentMileage || v.current_mileage) || 0;
                      const lastServiceMileage = Number(v.lastServiceMileage || v.last_service_mileage) || 0;
                      return currentMileage - lastServiceMileage > 5000;
                    }).length}
                  </Typography>
                  <Typography color="text.secondary">Service Due</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vehicles Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>License Plate</TableCell>
                <TableCell>Fuel Type</TableCell>
                <TableCell>Mileage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <DirectionsCarIcon sx={{ 
                      fontSize: 48, 
                      color: 'text.secondary', 
                      mb: 2 
                    }} />
                    <Typography color="text.secondary" gutterBottom>
                      No vehicles added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add your first vehicle to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                safeVehicles.map((vehicle) => {
                  const status = getVehicleStatus(vehicle);
                  return (
                    <TableRow key={vehicle.id || vehicle.vehicle_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)' }}>
                            <DirectionsCarIcon sx={{ color: '#ff2d55' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {vehicle.color || 'N/A'} • {vehicle.fuelType || vehicle.fuel_type || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={vehicle.licensePlate || vehicle.license_plate || 'N/A'} 
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        {fuelTypes.find(t => t.value === (vehicle.fuelType || vehicle.fuel_type))?.label || 
                         vehicle.fuelType || vehicle.fuel_type || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <span>
                            {(vehicle.currentMileage || vehicle.current_mileage || 0).toLocaleString()} km
                          </span>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.message}
                          size="small"
                          color={status.status === 'success' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(vehicle)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(vehicle)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Make (e.g., Toyota)"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model (e.g., Camry)"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  margin="dense"
                  inputProps={{ 
                    min: 1900, 
                    max: new Date().getFullYear() + 1 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Plate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Fuel Type"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  required
                  margin="dense"
                >
                  {fuelTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Mileage (km)"
                  name="currentMileage"
                  type="number"
                  value={formData.currentMileage}
                  onChange={handleChange}
                  required
                  margin="dense"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {vehicleToDelete ? 
              `Are you sure you want to delete "${vehicleToDelete.year} ${vehicleToDelete.make} ${vehicleToDelete.model}"?` :
              'Are you sure you want to delete this vehicle?'}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehicleList;