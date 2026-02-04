import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Stack
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { appointmentService, invoiceService } from '../services/api';

const MechanicDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    serviceDetails: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.fetchMechanicAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Failed to load workshop tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(id, newStatus);
      if (res.success) {
        loadAppointments(); // Refresh to show new status
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update appointment status.");
    }
  };

  const handleOpenInvoice = (appt) => {
    setSelectedAppt(appt);
    setInvoiceForm({
      amount: '',
      serviceDetails: appt.service_type 
    });
    setOpenInvoiceDialog(true);
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.amount || isNaN(invoiceForm.amount)) {
      alert("Please enter a valid total amount");
      return;
    }

    const payload = {
      user_id: Number(selectedAppt.user_id),
      vehicle_id: Number(selectedAppt.vehicle_id),
      appointment_id: selectedAppt.appointment_id ? Number(selectedAppt.appointment_id) : null,
      service_type: String(invoiceForm.serviceDetails),
      total_amount: parseFloat(invoiceForm.amount),
      payment_status: 'pending'
    };

    try {
      const res = await invoiceService.createInvoice(payload);
      if (res.success) {
        alert("Invoice generated and sent to customer!");
        setOpenInvoiceDialog(false);
        loadAppointments(); 
      }
    } catch (err) {
      console.error("❌ Invoice creation failed:", err);
      alert("Error generating invoice.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'info';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <BuildIcon sx={{ fontSize: 40, color: '#ff2d55' }} />
        <Typography variant="h4" fontWeight="bold">Workshop Management</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1c1c1e', borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white' }}>Vehicle</TableCell>
              <TableCell sx={{ color: 'white' }}>Service</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.appointment_id}>
                <TableCell sx={{ color: 'white' }}>{appt.customer_name}</TableCell>
                <TableCell sx={{ color: 'white' }}>{appt.make} {appt.model} ({appt.license_plate})</TableCell>
                <TableCell sx={{ color: 'white' }}>{appt.service_type}</TableCell>
                <TableCell>
                  <Chip 
                    label={appt.status.toUpperCase()} 
                    color={getStatusColor(appt.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {appt.status === 'pending' && (
                      <>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateStatus(appt.appointment_id, 'confirmed')}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error" 
                          startIcon={<CancelIcon />}
                          onClick={() => handleUpdateStatus(appt.appointment_id, 'cancelled')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {appt.status === 'confirmed' && (
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={() => handleOpenInvoice(appt)}
                        sx={{ borderRadius: 2 }}
                      >
                        Issue Invoice
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Issuing invoice for: <strong>{selectedAppt?.customer_name}</strong>
            </Typography>
            <TextField
              label="Service Description"
              fullWidth
              value={invoiceForm.serviceDetails}
              onChange={(e) => setInvoiceForm({...invoiceForm, serviceDetails: e.target.value})}
            />
            <TextField
              label="Total Cost"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateInvoice}>Confirm & Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MechanicDashboard;