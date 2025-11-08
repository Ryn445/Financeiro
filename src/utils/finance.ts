import { Transaction, Wallet, Category, Goal, Bill } from '@/types/finance';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateTotalBalance = (wallets: Wallet[]): number => {
  return wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
};

export const calculateMonthlyIncome = (transactions: Transaction[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);
};

export const calculateMonthlyExpenses = (transactions: Transaction[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);
};

export const calculateWeeklyExpenses = (transactions: Transaction[]): number => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date >= weekAgo && date <= now;
    })
    .reduce((acc, t) => acc + t.amount, 0);
};

export const getMostUsedCategory = (
  transactions: Transaction[],
  categories: Category[]
): Category | null => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= weekAgo && date <= now;
  });
  
  const categoryCount: { [key: string]: number } = {};
  recentTransactions.forEach(t => {
    categoryCount[t.categoryId] = (categoryCount[t.categoryId] || 0) + 1;
  });
  
  const mostUsedId = Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b, ''
  );
  
  return categories.find(c => c.id === mostUsedId) || null;
};

export const getMostActiveWallet = (
  transactions: Transaction[],
  wallets: Wallet[]
): Wallet | null => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= weekAgo && date <= now;
  });
  
  const walletCount: { [key: string]: number } = {};
  recentTransactions.forEach(t => {
    walletCount[t.walletId] = (walletCount[t.walletId] || 0) + 1;
  });
  
  const mostActiveId = Object.keys(walletCount).reduce((a, b) => 
    walletCount[a] > walletCount[b] ? a : b, ''
  );
  
  return wallets.find(w => w.id === mostActiveId) || null;
};

export const calculatePreviousMonthComparison = (transactions: Transaction[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const currentBalance = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const previousBalance = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    })
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  if (previousBalance === 0) return 0;
  return ((currentBalance - previousBalance) / previousBalance) * 100;
};

export const getUpcomingBills = (bills: Bill[]): Bill[] => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return bills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return b.status === 'pending' && dueDate >= now && dueDate <= nextWeek;
  });
};

export const getOverdueBills = (bills: Bill[]): Bill[] => {
  const now = new Date();
  return bills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return b.status === 'pending' && dueDate < now;
  });
};

export const calculateGoalProgress = (goal: Goal, transactions: Transaction[]): number => {
  const goalTransactions = transactions.filter(t => 
    t.categoryId === goal.categoryId &&
    new Date(t.date) >= new Date(goal.startDate)
  );
  
  const spent = goalTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  return (spent / goal.targetAmount) * 100;
};

export const getCategorySpending = (
  transactions: Transaction[],
  categoryId: string,
  startDate?: Date,
  endDate?: Date
): number => {
  return transactions
    .filter(t => {
      const date = new Date(t.date);
      const matchesCategory = t.categoryId === categoryId;
      const matchesDateRange = (!startDate || date >= startDate) && 
                               (!endDate || date <= endDate);
      return matchesCategory && matchesDateRange;
    })
    .reduce((acc, t) => {
      return acc + (t.type === 'expense' ? t.amount : -t.amount);
    }, 0);
};
