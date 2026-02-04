// PDF Generator Utilities
export const generateInvoicePDF = (invoiceData) => {
  console.log('📄 Generating PDF for invoice:', invoiceData.id);
  
  // This is a placeholder. You can use jsPDF for real PDF generation
  // Example with jsPDF (you need to install it: npm install jspdf)
  
  try {
    // Mock PDF generation - in real app, you would use:
    // import jsPDF from 'jspdf';
    // import autoTable from 'jspdf-autotable';
    
    const pdfData = {
      invoiceNumber: invoiceData.id,
      vehicle: invoiceData.vehicle,
      service: invoiceData.service,
      date: invoiceData.date,
      amount: invoiceData.amount,
      items: invoiceData.items || [],
      status: invoiceData.status
    };
    
    console.log('PDF data prepared:', pdfData);
    
    // For now, create a downloadable blob
    const content = `
      INVOICE
      ==============
      Invoice #: ${invoiceData.id}
      Date: ${new Date(invoiceData.date).toLocaleDateString()}
      Vehicle: ${invoiceData.vehicle}
      Service: ${invoiceData.service}
      
      ITEMS:
      ${(invoiceData.items || []).map(item => 
        `- ${item.description}: ${item.quantity} x $${item.price} = $${(item.quantity * item.price).toFixed(2)}`
      ).join('\n')}
      
      TOTAL: $${invoiceData.amount.toFixed(2)}
      Status: ${invoiceData.status}
      
      Thank you for your business!
    `;
    
    // Create a blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return `invoice-${invoiceData.id}.pdf`;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateAppointmentPDF = (appointmentData) => {
  console.log('📅 Generating appointment PDF:', appointmentData.id);
  
  const content = `
    APPOINTMENT CONFIRMATION
    ========================
    Appointment #: ${appointmentData.id}
    Date: ${new Date(appointmentData.date).toLocaleDateString()}
    Time: ${appointmentData.time}
    Vehicle: ${appointmentData.vehicle}
    Service: ${appointmentData.service}
    Status: ${appointmentData.status}
    
    Please arrive 15 minutes before your appointment.
    Bring your vehicle registration and insurance documents.
    
    Contact: (555) 123-4567
  `;
  
  // Create downloadable file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${appointmentData.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return `appointment-${appointmentData.id}.pdf`;
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}