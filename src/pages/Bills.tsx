import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bill, TransactionStatus } from '@/types/finance';
import { formatCurrency } from '@/utils/finance';
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Bills() {
  const { bills, categories, persons, addBill, updateBill, deleteBill, markBillAsPaid } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [formData, setFormData] = useState({
    type: 'payable' as 'payable' | 'receivable',
    description: '',
    amount: '',
    categoryId: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending' as TransactionStatus,
    personId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.categoryId) return;

    const billData = {
      ...formData,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate).toISOString(),
      personId: formData.personId || undefined,
    };

    if (editingBill) {
      updateBill(editingBill.id, billData);
    } else {
      addBill(billData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'payable',
      description: '',
      amount: '',
      categoryId: '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      personId: '',
    });
    setEditingBill(null);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      type: bill.type,
      description: bill.description,
      amount: bill.amount.toString(),
      categoryId: bill.categoryId,
      dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
      status: bill.status,
      personId: bill.personId || '',
    });
    setIsDialogOpen(true);
  };

  const getBillStatus = (bill: Bill) => {
    if (bill.status === 'paid') return { icon: CheckCircle, text: 'Pago', color: 'text-green-600' };
    
    const dueDate = new Date(bill.dueDate);
    const now = new Date();
    
    if (dueDate < now) {
      return { icon: AlertCircle, text: 'Atrasado', color: 'text-red-600' };
    }
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) {
      return { icon: Clock, text: `Vence em ${daysUntilDue} dia(s)`, color: 'text-orange-600' };
    }
    
    return { icon: Clock, text: 'Pendente', color: 'text-muted-foreground' };
  };

  const payableBills = bills.filter(b => b.type === 'payable');
  const receivableBills = bills.filter(b => b.type === 'receivable');

  const BillsList = ({ bills }: { bills: Bill[] }) => (
    <div className="space-y-2">
      {bills.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhuma conta encontrada</p>
      ) : (
        bills.map(bill => {
          const category = categories.find(c => c.id === bill.categoryId);
          const person = persons.find(p => p.id === bill.personId);
          const status = getBillStatus(bill);
          const StatusIcon = status.icon;
          
          return (
            <Card key={bill.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${bill.type === 'receivable' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {bill.type === 'receivable' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{bill.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {category?.icon} {category?.name}
                        {person && ` • ${person.name}`}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${status.color} mt-1`}>
                        <StatusIcon className="h-4 w-4" />
                        <span>{status.text}</span>
                        <span className="text-muted-foreground">
                          • {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`text-xl font-bold ${bill.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(bill.amount)}
                    </p>
                    <div className="flex gap-2">
                      {bill.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => markBillAsPaid(bill.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(bill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBill(bill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas a Pagar/Receber</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBill ? 'Editar' : 'Nova'} Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'payable' | 'receivable') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payable">A Pagar</SelectItem>
                    <SelectItem value="receivable">A Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
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
                <Label>Vencimento</Label>
                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
              </div>
              {persons.length > 0 && (
                <div>
                  <Label>Cliente/Fornecedor (opcional)</Label>
                  <Select value={formData.personId} onValueChange={(value) => setFormData({ ...formData, personId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {persons.map(person => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full">
                {editingBill ? 'Atualizar' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="payable" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payable">
            Contas a Pagar ({payableBills.length})
          </TabsTrigger>
          <TabsTrigger value="receivable">
            Contas a Receber ({receivableBills.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="payable">
          <BillsList bills={payableBills} />
        </TabsContent>
        <TabsContent value="receivable">
          <BillsList bills={receivableBills} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
