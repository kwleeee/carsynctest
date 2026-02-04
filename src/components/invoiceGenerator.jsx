import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';

const InvoiceGenerator = ({ invoice, onDownload }) => {
  const generatePDF = () => {
//mock function
    const invoiceContent = `
      Invoice: ${invoice.id}
      Date: ${new Date(invoice.date).toLocaleDateString()}
      Vehicle: ${invoice.vehicle}
      Service: ${invoice.service}
      Total: $${invoice.amount.toFixed(2)}
      Status: ${invoice.status}
    `;
    
    //mock PDF generation
    alert(`Generating PDF for invoice ${invoice.id}\n\n${invoiceContent}`);
    
    if (onDownload) {
      onDownload(invoice);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PictureAsPdfIcon />}
        onClick={generatePDF}
        sx={{ mb: 2 }}
      >
        Generate PDF Invoice
      </Button>
      
      {/*invoice preview */}
      <Paper sx={{ p: 3, border: '1px dashed #ccc' }}>
        <Typography variant="h5" gutterBottom>
          Invoice Preview
        </Typography>
        <Typography variant="subtitle1">
          <strong>Invoice #:</strong> {invoice.id}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Vehicle:</strong> {invoice.vehicle}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Service:</strong> {invoice.service}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          Total: ${invoice.amount.toFixed(2)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default InvoiceGenerator;