import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.user_id) return;
    try {
      // 1. Fetch Logs
      const logRes = await axios.get(`http://localhost:5000/api/users/${user.user_id}/maintenance`);
      if (logRes.data.success) setLogs(logRes.data.logs);

      // 2. Fetch User's Vehicles (for dropdown)
      const vehRes = await axios.get(`http://localhost:5000/api/users/${user.user_id}/vehicles`);
      if (vehRes.data.success) setVehicles(vehRes.data.vehicles);
      
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.service_type) {
      alert("Please select a vehicle and enter service type.");
      return;
    }

    try {
      const payload = { ...formData, user_id: user.user_id };
      await axios.post('http://localhost:5000/api/maintenance', payload);
      alert("Maintenance Log Added!");
      setOpen(false);
      loadData(); // Refresh list
      setFormData({ 
        vehicle_id: '', service_type: '', service_date: new Date().toISOString().split('T')[0], 
        mileage: '', cost: '', notes: '' 
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save log.");
    }
  };

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Maintenance Log</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          + Log Maintenance
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vehicle</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mileage</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cost</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No logs found.</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.log_id}>
                  <TableCell>{new Date(log.service_date).toLocaleDateString()}</TableCell>
                  <TableCell>{log.make} {log.model}</TableCell>
                  <TableCell>{log.service_type}</TableCell>
                  <TableCell>{log.mileage} km</TableCell>
                  <TableCell>${log.cost}</TableCell>
                  <TableCell>{log.notes || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ADD LOG POPUP */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Maintenance Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Vehicle</InputLabel>
              <Select value={formData.vehicle_id} label="Select Vehicle" onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}>
                {vehicles.map(v => <MenuItem key={v.vehicle_id} value={v.vehicle_id}>{v.make} {v.model} ({v.license_plate})</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Service Type" fullWidth value={formData.service_type} onChange={(e) => setFormData({...formData, service_type: e.target.value})} />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} fullWidth value={formData.service_date} onChange={(e) => setFormData({...formData, service_date: e.target.value})} />
                <TextField label="Mileage" type="number" fullWidth value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
            </Box>
            <TextField label="Cost ($)" type="number" fullWidth value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
            <TextField label="Notes" multiline rows={3} fullWidth value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save Log</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
