import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Customer } from '../types';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: Invoice, customer: Customer | undefined) => {
  const doc = new jsPDF();
  const companyName = "MY BUSINESS NAME";
  const companyAddress = "123 Business Street, City, State, ZIP";
  const companyGST = "GSTIN: 12ABCDE3456F1Z2";

  // Header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(companyName, 20, 30);
  doc.text(companyAddress, 20, 35);
  doc.text(companyGST, 20, 40);

  // Invoice Details
  doc.text(`Invoice No: ${invoice.invoice_number}`, 140, 30);
  doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, 140, 35);

  // Customer Details
  if (customer) {
    doc.setFontSize(12);
    doc.text("Bill To:", 20, 55);
    doc.setFontSize(10);
    doc.text(customer.customer_name, 20, 62);
    doc.text(customer.address, 20, 67);
    doc.text(`Phone: ${customer.phone}`, 20, 72);
    if (customer.gst_number) {
      doc.text(`GST: ${customer.gst_number}`, 20, 77);
    }
  }

  // Table
  const tableData = invoice.items.map((item, index) => [
    index + 1,
    item.product_name,
    item.quantity,
    item.rate.toFixed(2),
    `${item.tax_percent}%`,
    item.total.toFixed(2)
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['S.No', 'Item', 'Qty', 'Rate', 'Tax%', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`${invoice.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
  
  doc.text(`Tax:`, 140, finalY + 7);
  doc.text(`${invoice.tax.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total:`, 140, finalY + 15);
  doc.text(`${invoice.grand_total.toFixed(2)}`, 180, finalY + 15, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", 105, 280, { align: 'center' });

  doc.save(`${invoice.invoice_number}.pdf`);
};
