export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'pix' | 'card' | 'cash' | 'boleto' | 'transfer';
export type PersonType = 'client' | 'supplier';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  categoryId: string;
  walletId: string;
  date: string;
  paymentMethod: PaymentMethod;
  personId?: string;
}

export interface Goal {
  id: string;
  name: string;
  categoryId: string;
  targetAmount: number;
  currentAmount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
}

export interface Bill {
  id: string;
  type: 'payable' | 'receivable';
  description: string;
  amount: number;
  categoryId: string;
  dueDate: string;
  status: TransactionStatus;
  personId?: string;
}

export interface Person {
  id: string;
  name: string;
  contact: string;
  type: PersonType;
}

export interface Debt {
  id: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  installments: number;
  paidInstallments: number;
  installmentValue: number;
  startDate: string;
  dueDay: number;
  creditor: string;
  type: 'loan' | 'financing' | 'credit_card' | 'other';
}

export interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  goals: Goal[];
  bills: Bill[];
  persons: Person[];
  debts: Debt[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  transferBetweenWallets: (fromWalletId: string, toWalletId: string, amount: number, description: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (id: string) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebtInstallment: (id: string) => void;
  resetAllData: () => void;
}
