import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal } from '@/types/finance';
import { formatCurrency, calculateGoalProgress } from '@/utils/finance';
import { Plus, Edit, Trash2, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Goals() {
  const { goals, categories, transactions, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    targetAmount: '',
    period: 'monthly' as 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.targetAmount) return;

    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      startDate: new Date(formData.startDate).toISOString(),
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      targetAmount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      categoryId: goal.categoryId,
      targetAmount: goal.targetAmount.toString(),
      period: goal.period,
      startDate: new Date(goal.startDate).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Metas Financeiras</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Editar' : 'Nova'} Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome da Meta</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Alvo (R$)</Label>
                <Input type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
              </div>
              <div>
                <Label>Período</Label>
                <Select value={formData.period} onValueChange={(value: 'monthly' | 'yearly') => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full">
                {editingGoal ? 'Atualizar' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map(goal => {
          const progress = calculateGoalProgress(goal, transactions);
          const category = categories.find(c => c.id === goal.categoryId);
          const isAchieved = progress >= 100;
          const isExceeded = progress > 100;
          
          return (
            <Card key={goal.id} className={isAchieved ? 'border-green-500' : isExceeded ? 'border-red-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.name}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {category?.icon} {category?.name} • {goal.period === 'monthly' ? 'Mensal' : 'Anual'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Desde {new Date(goal.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {isAchieved && (
                    <div className="flex items-center gap-2 text-green-600">
                      {isExceeded ? (
                        <>
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Excedido!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Atingido!</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className={`text-sm font-bold ${isExceeded ? 'text-red-600' : isAchieved ? 'text-green-600' : ''}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Gasto</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency((goal.targetAmount * progress) / 100)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">Defina suas metas financeiras para acompanhar seus gastos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
