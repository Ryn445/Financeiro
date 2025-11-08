import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, DollarSign, Calendar, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/finance';
import { Debt } from '@/types/finance';
import { Progress } from '@/components/ui/progress';

export default function Debts() {
  const { debts, addDebt, updateDebt, deleteDebt, payDebtInstallment } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState<{
    description: string;
    totalAmount: string;
    interestRate: string;
    installments: string;
    startDate: string;
    dueDay: string;
    creditor: string;
    type: 'loan' | 'financing' | 'credit_card' | 'other';
  }>({
    description: '',
    totalAmount: '',
    interestRate: '',
    installments: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDay: '10',
    creditor: '',
    type: 'other',
  });

  const debtTypes = [
    { value: 'loan', label: 'Empréstimo' },
    { value: 'financing', label: 'Financiamento' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'other', label: 'Outro' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(formData.totalAmount);
    const interestRate = parseFloat(formData.interestRate) || 0;
    const installments = parseInt(formData.installments);
    
    // Calculate installment value with interest
    const totalWithInterest = totalAmount * (1 + interestRate / 100);
    const installmentValue = totalWithInterest / installments;

    if (editingDebt) {
      updateDebt(editingDebt.id, {
        description: formData.description,
        totalAmount,
        interestRate,
        installments,
        installmentValue,
        startDate: formData.startDate,
        dueDay: parseInt(formData.dueDay),
        creditor: formData.creditor,
        type: formData.type,
      });
    } else {
      addDebt({
        description: formData.description,
        totalAmount,
        remainingAmount: totalWithInterest,
        interestRate,
        installments,
        paidInstallments: 0,
        installmentValue,
        startDate: formData.startDate,
        dueDay: parseInt(formData.dueDay),
        creditor: formData.creditor,
        type: formData.type,
      });
    }

    setIsDialogOpen(false);
    setEditingDebt(null);
    setFormData({
      description: '',
      totalAmount: '',
      interestRate: '',
      installments: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDay: '10',
      creditor: '',
      type: 'other',
    });
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      description: debt.description,
      totalAmount: debt.totalAmount.toString(),
      interestRate: debt.interestRate.toString(),
      installments: debt.installments.toString(),
      startDate: debt.startDate,
      dueDay: debt.dueDay.toString(),
      creditor: debt.creditor,
      type: debt.type,
    });
    setIsDialogOpen(true);
  };

  const totalDebts = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.totalAmount * (1 + debt.interestRate / 100) - debt.remainingAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dívidas</h1>
          <p className="text-muted-foreground">Gerencie empréstimos e financiamentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDebt(null);
              setFormData({
                description: '',
                totalAmount: '',
                interestRate: '',
                installments: '',
                startDate: new Date().toISOString().split('T')[0],
                dueDay: '10',
                creditor: '',
                type: 'other',
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Dívida
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDebt ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {debtTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Taxa de Juros (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parcelas</Label>
                  <Input
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Dia de Vencimento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Credor</Label>
                <Input
                  value={formData.creditor}
                  onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingDebt ? 'Atualizar' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Dívidas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalDebts)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debts.filter(d => d.paidInstallments < d.installments).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {debts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma dívida cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          debts.map((debt) => {
            const progress = (debt.paidInstallments / debt.installments) * 100;
            const isPaid = debt.paidInstallments >= debt.installments;
            
            return (
              <Card key={debt.id} className={isPaid ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {debt.description}
                        {isPaid && <span className="text-sm font-normal text-success">(Quitada)</span>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {debtTypes.find(t => t.value === debt.type)?.label} • {debt.creditor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(debt)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDebt(debt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-lg font-semibold">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Devedor</p>
                      <p className="text-lg font-semibold text-destructive">{formatCurrency(debt.remainingAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                      <p className="text-lg font-semibold">{formatCurrency(debt.installmentValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Juros</p>
                      <p className="text-lg font-semibold">{debt.interestRate}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parcelas Pagas: {debt.paidInstallments}/{debt.installments}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Vencimento dia {debt.dueDay}
                    </div>
                    {!isPaid && (
                      <Button onClick={() => payDebtInstallment(debt.id)} size="sm">
                        Pagar Parcela
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
