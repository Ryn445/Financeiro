import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle,
  Plus,
  BarChart3,
  Target
} from 'lucide-react';
import { 
  formatCurrency, 
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateWeeklyExpenses,
  getMostUsedCategory,
  getMostActiveWallet,
  calculatePreviousMonthComparison,
  getUpcomingBills,
  calculateGoalProgress
} from '@/utils/finance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { transactions, wallets, categories, goals, bills } = useFinance();
  const navigate = useNavigate();

  const totalBalance = calculateTotalBalance(wallets);
  const monthlyIncome = calculateMonthlyIncome(transactions);
  const monthlyExpenses = calculateMonthlyExpenses(transactions);
  const weeklyExpenses = calculateWeeklyExpenses(transactions);
  const mostUsedCategory = getMostUsedCategory(transactions, categories);
  const mostActiveWallet = getMostActiveWallet(transactions, wallets);
  const comparison = calculatePreviousMonthComparison(transactions);
  const upcomingBills = getUpcomingBills(bills);

  const chartData = [
    { name: 'Receitas', value: monthlyIncome },
    { name: 'Despesas', value: monthlyExpenses },
  ];

  const achievedGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal, transactions);
    return progress >= 100;
  });

  const alerts = [];
  if (achievedGoals.length > 0) {
    alerts.push({ type: 'success', message: `${achievedGoals.length} meta(s) atingida(s)!` });
  }
  if (monthlyExpenses > monthlyIncome * 0.8) {
    alerts.push({ type: 'warning', message: 'Despesas acima da média este mês' });
  }
  if (upcomingBills.length > 0) {
    alerts.push({ type: 'info', message: `${upcomingBills.length} conta(s) próxima(s) do vencimento` });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/transactions')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Relatórios
          </Button>
          <Button variant="outline" onClick={() => navigate('/goals')}>
            <Target className="mr-2 h-4 w-4" />
            Gerenciar Metas
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {alert.type === 'warning' && <AlertCircle className="h-4 w-4" />}
              {alert.type === 'info' && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Consolidado em {wallets.length} carteira(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            {comparison !== 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo: {formatCurrency(monthlyIncome - monthlyExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gastos da Semana</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(weeklyExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas x Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Semanal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Gasto Total da Semana</p>
              <p className="text-2xl font-bold">{formatCurrency(weeklyExpenses)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoria Mais Usada</p>
              <p className="text-lg font-semibold">
                {mostUsedCategory ? `${mostUsedCategory.icon} ${mostUsedCategory.name}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carteira Mais Ativa</p>
              <p className="text-lg font-semibold">
                {mostActiveWallet ? mostActiveWallet.name : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
