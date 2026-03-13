import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';

export default function ProductManagercopy() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update({ product_name: name, price, tax_percent: tax })
        .eq('id', editingId);
      if (!error) {
        setEditingId(null);
        fetchProducts();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ product_name: name, price, tax_percent: tax });
      if (!error) {
        fetchProducts();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setName('');
    setPrice(0);
    setTax(0);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.product_name);
    setPrice(product.price);
    setTax(product.tax_percent);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
            <input 
              type="number" 
              required
              step="0.01"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax %</label>
            <input 
              type="number" 
              required
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={resetForm}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tax %</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{product.product_name}</td>
                <td className="px-6 py-4 text-slate-600">{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600">{product.tax_percent}%</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-800 p-1">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-rose-600 hover:text-rose-800 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
