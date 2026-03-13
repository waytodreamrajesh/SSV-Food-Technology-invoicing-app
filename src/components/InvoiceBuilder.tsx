import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Customer, Invoice, InvoiceItem } from '../types';
import { Plus, Trash2, Printer, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function InvoiceBuilder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Invoice State
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    fetchInitialData();
    generateNewInvoiceNumber();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('customers').select('*')
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (custRes.data) setCustomers(custRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInvoiceNumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].invoice_number.split('-').pop() || '0');
      nextNum = lastNum + 1;
    }
    setInvoiceNumber(`INV-${year}-${nextNum.toString().padStart(4, '0')}`);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductId(productId);
      setRate(product.price);
      setTaxPercent(product.tax_percent);
    }
  };

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const subtotal = rate * quantity;
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount - discount;

    const newItem: InvoiceItem = {
      product_id: selectedProductId,
      product_name: product.product_name,
      quantity,
      rate,
      tax_percent: taxPercent,
      discount,
      total
    };

    setInvoiceItems([...invoiceItems, newItem]);
    // Reset item fields
    setSelectedProductId('');
    setQuantity(1);
    setRate(0);
    setTaxPercent(0);
    setDiscount(0);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((acc, item) => acc + (item.rate * item.quantity), 0);
    const tax = invoiceItems.reduce((acc, item) => acc + ((item.rate * item.quantity * item.tax_percent) / 100), 0);
    const grandTotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    return { subtotal, tax, grandTotal };
  };

  const totals = calculateTotals();

  const handleSaveInvoice = async () => {
    if (!selectedCustomerId || invoiceItems.length === 0) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    const { data: invData, error: invError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        customer_id: selectedCustomerId,
        date: format(new Date(), 'yyyy-MM-dd'),
        subtotal: totals.subtotal,
        tax: totals.tax,
        grand_total: totals.grandTotal
      })
      .select()
      .single();

    if (invError) {
      alert('Error saving invoice: ' + invError.message);
      return;
    }

    const itemsToInsert = invoiceItems.map(item => ({
      invoice_id: invData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      rate: item.rate,
      tax_percent: item.tax_percent,
      discount: item.discount,
      total: item.total
    }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
    if (itemsError) {
      alert('Error saving items: ' + itemsError.message);
    } else {
      alert('Invoice saved successfully!');
      setInvoiceItems([]);
      setSelectedCustomerId('');
      generateNewInvoiceNumber();
    }
  };

  const handlePrint = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const invoice: Invoice = {
      invoice_number: invoiceNumber,
      customer_id: selectedCustomerId,
      date: format(new Date(), 'yyyy-MM-dd'),
      subtotal: totals.subtotal,
      tax: totals.tax,
      grand_total: totals.grandTotal,
      items: invoiceItems
    };
    generateInvoicePDF(invoice, customer);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT PANEL: Data Entry */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Invoice Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.customer_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice No</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50" 
                value={invoiceNumber} 
                readOnly 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50" 
                value={format(new Date(), 'dd/MM/yyyy')} 
                readOnly 
              />
            </div>
          </div>

          <hr className="my-6 border-slate-100" />
          
          <h3 className="font-medium text-slate-800 mb-4">Add Items</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.product_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rate</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qty</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax %</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            <button 
              onClick={addItem}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add to List
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={handleSaveInvoice}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save size={20} /> Save Invoice
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Printer size={20} /> Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Invoice Preview */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 min-h-[800px] flex flex-col">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MY BUSINESS NAME</h1>
            <p className="text-slate-500 text-sm mt-1">123 Business Street, City, State, ZIP</p>
            <p className="text-slate-500 text-sm">GSTIN: 12ABCDE3456F1Z2</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest">Invoice</h2>
            <p className="font-medium text-slate-700 mt-2">{invoiceNumber}</p>
            <p className="text-slate-500 text-sm">{format(new Date(), 'dd MMM yyyy')}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
          {selectedCustomer ? (
            <div>
              <p className="font-semibold text-slate-800 text-lg">{selectedCustomer.customer_name}</p>
              <p className="text-slate-600">{selectedCustomer.address}</p>
              <p className="text-slate-600">Ph: {selectedCustomer.phone}</p>
              {selectedCustomer.gst_number && <p className="text-slate-600">GST: {selectedCustomer.gst_number}</p>}
            </div>
          ) : (
            <p className="text-slate-300 italic">No customer selected</p>
          )}
        </div>

        <div className="flex-grow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">S.No</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Rate</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tax%</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoiceItems.map((item, index) => (
                <tr key={index} className="group">
                  <td className="py-4 text-slate-600">{index + 1}</td>
                  <td className="py-4 font-medium text-slate-800">{item.product_name}</td>
                  <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                  <td className="py-4 text-slate-600 text-right">{item.rate.toFixed(2)}</td>
                  <td className="py-4 text-slate-600 text-center">{item.tax_percent}%</td>
                  <td className="py-4 font-semibold text-slate-800 text-right">{item.total.toFixed(2)}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => removeItem(index)} className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {invoiceItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-300 italic">No items added yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-100">
              <span>Grand Total</span>
              <span>{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
