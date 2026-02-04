import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  IconButton
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Mock data for now
const initialVehicles = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2020, mileage: 45000, vin: '4T1BF1FK0HU123456' },
  { id: 2, make: 'Honda', model: 'Civic', year: 2021, mileage: 25000, vin: '2HGFC2F56MH123456' },
  { id: 3, make: 'Ford', model: 'F-150', year: 2019, mileage: 75000, vin: '1FTFW1E5XJFA12345' },
];

const VehicleList = () => {
  const [vehicles, setVehicles] = useState(initialVehicles);

  const handleAddVehicle = () => {
    const newVehicle = {
      id: vehicles.length + 1,
      make: 'New',
      model: 'Vehicle',
      year: new Date().getFullYear(),
      mileage: 0,
      vin: 'VIN' + Date.now()
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleDeleteVehicle = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <DirectionsCarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Vehicles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </Button>
      </Box>

      {vehicles.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DirectionsCarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No vehicles yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first vehicle to start tracking maintenance
          </Typography>
          <Button variant="contained" onClick={handleAddVehicle}>
            Add Your First Vehicle
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {vehicle.make} {vehicle.model}
                    </Typography>
                  </Box>
                  <Typography color="textSecondary">
                    <strong>Year:</strong> {vehicle.year}
                  </Typography>
                  <Typography color="textSecondary">
                    <strong>VIN:</strong> {vehicle.vin}
                  </Typography>
                  <Typography color="textSecondary">
                    <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} miles
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default VehicleList;
