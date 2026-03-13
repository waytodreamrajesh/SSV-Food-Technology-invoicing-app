export interface Product {
  id: string;
  product_name: string;
  price: number;
  tax_percent: number;
}

export interface Customer {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  gst_number?: string;
}

export interface InvoiceItem {
  id?: string;
  product_id: string;
  product_name: string; // For display
  quantity: number;
  rate: number;
  tax_percent: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  customer_id: string;
  date: string;
  subtotal: number;
  tax: number;
  grand_total: number;
  items: InvoiceItem[];
}
