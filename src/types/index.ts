export type User = {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  businessAddress?: string;
  logoUrl?: string;
  themeColor?: string;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  taxRate?: number; // percentage
};
