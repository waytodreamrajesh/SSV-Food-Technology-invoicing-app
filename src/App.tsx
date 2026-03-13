import React, { useState } from 'react';
import { LayoutDashboard, Package, Users, FileText, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InvoiceBuilder from './components/InvoiceBuilder';
import ProductManager from './components/ProductManager';
import CustomerManager from './components/CustomerManager';
import ProductManagercopy from './components/ProductManagercopy';

type Tab = 'invoices' | 'products' | 'customers';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('invoices');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'invoices', label: 'Invoice Builder', icon: FileText },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'products copy', label: 'Products Copy', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside 
        className={`hidden md:flex bg-white border-r border-slate-200 transition-all duration-300 flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl text-indigo-600 tracking-tight">Invoicer</span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              JD
            </div>
            {isSidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto min-h-screen">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 mt-1">Manage your business operations efficiently.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              System Online
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'invoices' && <InvoiceBuilder />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'products copy' && <ProductManagercopy />}
            {activeTab === 'customers' && <CustomerManager />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
