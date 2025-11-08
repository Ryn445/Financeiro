import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet as WalletType } from '@/types/finance';
import { formatCurrency, calculateTotalBalance } from '@/utils/finance';
import { Plus, Edit, Trash2, ArrowRightLeft, Wallet as WalletIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet, transferBetweenWallets } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    type: '',
    color: '#3b82f6',
  });

  const [transferData, setTransferData] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.balance || !formData.type) return;

    const walletData = {
      ...formData,
      balance: parseFloat(formData.balance),
    };

    if (editingWallet) {
      updateWallet(editingWallet.id, walletData);
    } else {
      addWallet(walletData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.fromWalletId || !transferData.toWalletId || !transferData.amount || !transferData.description) return;

    transferBetweenWallets(
      transferData.fromWalletId,
      transferData.toWalletId,
      parseFloat(transferData.amount),
      transferData.description
    );

    setIsTransferOpen(false);
    setTransferData({ fromWalletId: '', toWalletId: '', amount: '', description: '' });
  };

  const resetForm = () => {
    setFormData({ name: '', balance: '', type: '', color: '#3b82f6' });
    setEditingWallet(null);
  };

  const handleEdit = (wallet: WalletType) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      balance: wallet.balance.toString(),
      type: wallet.type,
      color: wallet.color,
    });
    setIsDialogOpen(true);
  };

  const totalBalance = calculateTotalBalance(wallets);
  const chartData = wallets.map(w => ({ name: w.name, value: w.balance }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Carteiras</h1>
        <div className="flex gap-2">
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transferir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transferir entre Carteiras</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <Label>De</Label>
                  <Select value={transferData.fromWalletId} onValueChange={(value) => setTransferData({ ...transferData, fromWalletId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map(wallet => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({formatCurrency(wallet.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Para</Label>
                  <Select value={transferData.toWalletId} onValueChange={(value) => setTransferData({ ...transferData, toWalletId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.filter(w => w.id !== transferData.fromWalletId).map(wallet => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({formatCurrency(wallet.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={transferData.amount} onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })} required />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={transferData.description} onChange={(e) => setTransferData({ ...transferData, description: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full">Confirmar Transferência</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Carteira
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWallet ? 'Editar' : 'Nova'} Carteira</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="Ex: Banco, Dinheiro, Poupança" required />
                </div>
                <div>
                  <Label>Saldo Inicial (R$)</Label>
                  <Input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} required />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">
                  {editingWallet ? 'Atualizar' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Total Consolidado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-muted-foreground mt-2">Distribuído em {wallets.length} carteira(s)</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {wallets.map(wallet => (
            <Card key={wallet.id} style={{ borderLeft: `4px solid ${wallet.color}` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted" style={{ backgroundColor: `${wallet.color}20` }}>
                      <WalletIcon className="h-6 w-6" style={{ color: wallet.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{wallet.name}</h3>
                      <p className="text-sm text-muted-foreground">{wallet.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((wallet.balance / totalBalance) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(wallet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteWallet(wallet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
