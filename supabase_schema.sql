-- SQL Schema for Supabase

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Invoices Table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Invoice Items Table
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for demo purposes, in production you'd restrict by user_id)
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all access to invoice_items" ON invoice_items FOR ALL USING (true);
