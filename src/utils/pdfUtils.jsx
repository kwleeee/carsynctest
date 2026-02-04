import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoiceData) => {
  try {
    const doc = new jsPDF();
    const primaryColor = [255, 45, 85]; 

    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CARSYNC SERVICE INVOICE', 105, 20, { align: 'center' });
    
    // Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoiceData.id}`, 20, 40);
    doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 20, 47);
    doc.text(`Vehicle: ${invoiceData.vehicle}`, 20, 54);

    // Table - Fixed Syntax
    autoTable(doc, {
      startY: 65,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: [
        [invoiceData.service, 1, `$${invoiceData.amount.toFixed(2)}`, `$${invoiceData.amount.toFixed(2)}`]
      ],
      headStyles: { fillColor: primaryColor },
      theme: 'striped'
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`GRAND TOTAL: $${invoiceData.amount.toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.save(`Invoice_${invoiceData.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert("PDF Generation failed. Check console.");
  }
};