import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { Plus, Trash2, Edit2, Save, X, Loader2, User } from 'lucide-react';

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { customer_name: name, phone, address, gst_number: gst };
    
    if (editingId) {
      const { error } = await supabase.from('customers').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        fetchCustomers();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('customers').insert(payload);
      if (!error) {
        fetchCustomers();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setGst('');
    setEditingId(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setName(customer.customer_name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setGst(customer.gst_number || '');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (!error) fetchCustomers();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea 
              required
              rows={2}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GST Number (Optional)</label>
            <input 
              type="text" 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? 'Update Customer' : 'Add Customer'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <User size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(customer)} className="text-indigo-600 hover:text-indigo-800 p-1">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(customer.id)} className="text-rose-600 hover:text-rose-800 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{customer.customer_name}</h3>
            <p className="text-slate-500 text-sm mb-3">{customer.phone}</p>
            <p className="text-slate-600 text-sm line-clamp-2 mb-4">{customer.address}</p>
            {customer.gst_number && (
              <div className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">
                GST: {customer.gst_number}
              </div>
            )}
          </div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 italic">No customers found</div>
        )}
      </div>
    </div>
  );
}
