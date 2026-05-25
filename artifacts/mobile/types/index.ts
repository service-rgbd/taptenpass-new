export interface User {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  walletBalance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  operator: string;
  phone: string;
  packageName: string;
  data: string;
  amount: number;
  paymentMethod: string;
  status: 'success' | 'pending' | 'failed';
  transactionReference: string;
  createdAt: string;
}

export interface Package {
  id: string;
  operator: 'Orange' | 'MTN' | 'Moov';
  name: string;
  data: string;
  price: number;
  validity: string;
}
