import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { invoiceService } from '../services/api';
import { generateInvoicePDF } from '../utils/pdfUtils'; // Ensure this path is correct

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceService.fetchInvoices(user.user_id);
      // Backend returns { success: true, invoices: [...] }
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (inv) => {
    // Transform data to match what pdfUtils expects
    const pdfData = {
      id: inv.invoice_id,
      date: inv.created_at,
      vehicle: `${inv.make} ${inv.model} (${inv.license_plate})`,
      service: inv.service_type || "General Maintenance",
      amount: parseFloat(inv.total_amount),
      status: inv.payment_status,
      items: [] // You can add dynamic items here if your DB stores them
    };
    
    generateInvoicePDF(pdfData);
  };

  if (loading) return <CircularProgress sx={{ m: 5 }} />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>My Invoices</Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1c1c1e' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Invoice ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Vehicle</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No invoices found.</TableCell></TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.invoice_id}>
                  <TableCell>#INV-{inv.invoice_id}</TableCell>
                  <TableCell>{inv.make} {inv.model}</TableCell>
                  <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>${inv.total_amount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={inv.payment_status.toUpperCase()} 
                      color={inv.payment_status === 'paid' ? 'success' : 'warning'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      startIcon={<DownloadIcon />} 
                      onClick={() => handleDownloadPDF(inv)}
                      variant="outlined"
                      size="small"
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Invoices;