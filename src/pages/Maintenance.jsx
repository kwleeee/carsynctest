import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { invoiceService, vehicleService } from '../services/api';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: '',
    total_amount: '',
    payment_status: 'paid'
  });

  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadLogs();
    loadVehicles();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.fetchMaintenanceLogs(userData.user_id);
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    const res = await vehicleService.fetchVehicles(userData.user_id);
    setVehicles(res.vehicles || []);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        user_id: userData.user_id,
        total_amount: parseFloat(formData.total_amount)
      };
      const res = await invoiceService.createInvoice(payload);
      if (res.success) {
        setOpen(false);
        loadLogs(); // Refresh list
      }
    } catch (err) {
      alert("Failed to save log.");
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Service Record
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Log Record
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1c1c1e' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Vehicle</TableCell>
              <TableCell sx={{ color: 'white' }}>Service Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Cost</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.invoice_id}>
                <TableCell sx={{ color: 'white' }}>{log.make} {log.model}</TableCell>
                <TableCell sx={{ color: 'white' }}>{log.service_type}</TableCell>
                <TableCell sx={{ color: 'white' }}>{new Date(log.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ color: 'white' }}>${parseFloat(log.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={log.payment_status} color="success" size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Log Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Maintenance Record</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Select Vehicle"
            fullWidth
            value={formData.vehicle_id}
            onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
          >
            {vehicles.map((v) => (
              <MenuItem key={v.vehicle_id} value={v.vehicle_id}>
                {v.make} {v.model} ({v.license_plate})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Service Performed"
            placeholder="e.g. Oil Change"
            fullWidth
            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
          />
          <TextField
            label="Cost"
            type="number"
            fullWidth
            onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;