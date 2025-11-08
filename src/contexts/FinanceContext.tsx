import React, { createContext, useState, useEffect } from 'react';
import {
  Transaction,
  Wallet,
  Category,
  Goal,
  Bill,
  Person,
  Debt,
  FinanceContextType,
} from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'finance-data';

const defaultCategories: Category[] = [
  { id: '1', name: 'Salário', color: '#10b981', icon: '💰', type: 'income' },
  { id: '2', name: 'Freelance', color: '#3b82f6', icon: '💼', type: 'income' },
  { id: '3', name: 'Alimentação', color: '#ef4444', icon: '🍔', type: 'expense' },
  { id: '4', name: 'Transporte', color: '#f59e0b', icon: '🚗', type: 'expense' },
  { id: '5', name: 'Lazer', color: '#8b5cf6', icon: '🎮', type: 'expense' },
  { id: '6', name: 'Saúde', color: '#ec4899', icon: '🏥', type: 'expense' },
];

const defaultWallets: Wallet[] = [
  { id: '1', name: 'Conta Corrente', balance: 5000, type: 'Banco', color: '#3b82f6' },
  { id: '2', name: 'Dinheiro', balance: 500, type: 'Dinheiro', color: '#10b981' },
];

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>(defaultWallets);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setTransactions(data.transactions || []);
      setWallets(data.wallets || defaultWallets);
      setCategories(data.categories || defaultCategories);
      setGoals(data.goals || []);
      setBills(data.bills || []);
      setPersons(data.persons || []);
      setDebts(data.debts || []);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const data = { transactions, wallets, categories, goals, bills, persons, debts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [transactions, wallets, categories, goals, bills, persons, debts]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === transaction.walletId) {
        const change = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        return { ...w, balance: w.balance + change };
      }
      return w;
    }));
    
    toast({
      title: 'Transação adicionada',
      description: 'A transação foi registrada com sucesso.',
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    // Revert old wallet balance and apply new
    if (updates.amount !== undefined || updates.walletId !== undefined || updates.type !== undefined) {
      setWallets(prev => prev.map(w => {
        if (w.id === oldTransaction.walletId) {
          const revert = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
          return { ...w, balance: w.balance + revert };
        }
        return w;
      }));
      
      const newWalletId = updates.walletId || oldTransaction.walletId;
      const newAmount = updates.amount || oldTransaction.amount;
      const newType = updates.type || oldTransaction.type;
      
      setWallets(prev => prev.map(w => {
        if (w.id === newWalletId) {
          const change = newType === 'income' ? newAmount : -newAmount;
          return { ...w, balance: w.balance + change };
        }
        return w;
      }));
    }
    
    toast({ title: 'Transação atualizada' });
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    
    // Revert wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === transaction.walletId) {
        const revert = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        return { ...w, balance: w.balance + revert };
      }
      return w;
    }));
    
    toast({ title: 'Transação excluída' });
  };

  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    setWallets(prev => [...prev, { ...wallet, id: Date.now().toString() }]);
    toast({ title: 'Carteira adicionada' });
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    toast({ title: 'Carteira atualizada' });
  };

  const deleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    toast({ title: 'Carteira excluída' });
  };

  const transferBetweenWallets = (fromWalletId: string, toWalletId: string, amount: number, description: string) => {
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    if (!fromWallet || fromWallet.balance < amount) {
      toast({ title: 'Saldo insuficiente', variant: 'destructive' });
      return;
    }

    // Create two transactions
    const timestamp = Date.now();
    const expenseTransaction: Transaction = {
      id: `${timestamp}-out`,
      type: 'expense',
      description: `Transferência: ${description}`,
      amount,
      categoryId: categories[0]?.id || '1',
      walletId: fromWalletId,
      date: new Date().toISOString(),
      paymentMethod: 'transfer',
    };
    
    const incomeTransaction: Transaction = {
      id: `${timestamp}-in`,
      type: 'income',
      description: `Transferência: ${description}`,
      amount,
      categoryId: categories[0]?.id || '1',
      walletId: toWalletId,
      date: new Date().toISOString(),
      paymentMethod: 'transfer',
    };

    setTransactions(prev => [...prev, expenseTransaction, incomeTransaction]);
    
    setWallets(prev => prev.map(w => {
      if (w.id === fromWalletId) return { ...w, balance: w.balance - amount };
      if (w.id === toWalletId) return { ...w, balance: w.balance + amount };
      return w;
    }));
    
    toast({ title: 'Transferência realizada' });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
    toast({ title: 'Categoria adicionada' });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    toast({ title: 'Categoria atualizada' });
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Categoria excluída' });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now().toString(), currentAmount: 0 }]);
    toast({ title: 'Meta adicionada' });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    toast({ title: 'Meta atualizada' });
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast({ title: 'Meta excluída' });
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    setBills(prev => [...prev, { ...bill, id: Date.now().toString() }]);
    toast({ title: 'Conta adicionada' });
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    toast({ title: 'Conta atualizada' });
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    toast({ title: 'Conta excluída' });
  };

  const markBillAsPaid = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;

    // Create transaction
    addTransaction({
      type: bill.type === 'payable' ? 'expense' : 'income',
      description: bill.description,
      amount: bill.amount,
      categoryId: bill.categoryId,
      walletId: wallets[0]?.id || '1',
      date: new Date().toISOString(),
      paymentMethod: 'transfer',
      personId: bill.personId,
    });

    // Update bill status
    updateBill(id, { status: 'paid' });
  };

  const addPerson = (person: Omit<Person, 'id'>) => {
    setPersons(prev => [...prev, { ...person, id: Date.now().toString() }]);
    toast({ title: 'Pessoa adicionada' });
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast({ title: 'Pessoa atualizada' });
  };

  const deletePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Pessoa excluída' });
  };

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [...prev, { ...debt, id: Date.now().toString() }]);
    toast({ title: 'Dívida adicionada' });
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    toast({ title: 'Dívida atualizada' });
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Dívida excluída' });
  };

  const payDebtInstallment = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || debt.paidInstallments >= debt.installments) return;

    // Create expense transaction
    addTransaction({
      type: 'expense',
      description: `Parcela ${debt.paidInstallments + 1}/${debt.installments} - ${debt.description}`,
      amount: debt.installmentValue,
      categoryId: categories.find(c => c.type === 'expense')?.id || categories[0]?.id || '1',
      walletId: wallets[0]?.id || '1',
      date: new Date().toISOString(),
      paymentMethod: 'transfer',
    });

    // Update debt
    const newPaidInstallments = debt.paidInstallments + 1;
    const newRemainingAmount = debt.remainingAmount - debt.installmentValue;
    updateDebt(id, { 
      paidInstallments: newPaidInstallments,
      remainingAmount: Math.max(0, newRemainingAmount)
    });

    toast({ title: 'Parcela paga com sucesso' });
  };

  const resetAllData = () => {
    setTransactions([]);
    setWallets(defaultWallets);
    setCategories(defaultCategories);
    setGoals([]);
    setBills([]);
    setPersons([]);
    setDebts([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Dados resetados' });
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        wallets,
        categories,
        goals,
        bills,
        persons,
        debts,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        transferBetweenWallets,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        addPerson,
        updatePerson,
        deletePerson,
        addDebt,
        updateDebt,
        deleteDebt,
        payDebtInstallment,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
