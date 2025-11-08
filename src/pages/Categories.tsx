import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, TransactionType } from '@/types/finance';
import { formatCurrency, getCategorySpending } from '@/utils/finance';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const EMOJI_OPTIONS = ['💰', '💼', '🍔', '🚗', '🎮', '🏥', '🏠', '📱', '✈️', '🎓', '👕', '⚡', '🎬', '🏋️', '🐕'];

export default function Categories() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    icon: '💰',
    type: 'expense' as TransactionType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#3b82f6', icon: '💰', type: 'expense' });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
    });
    setIsDialogOpen(true);
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ícone</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOJI_OPTIONS.map(emoji => (
                      <SelectItem key={emoji} value={emoji}>
                        <span className="text-2xl">{emoji}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor</Label>
                <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? 'Atualizar' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(category => {
          const spending = getCategorySpending(transactions, category.id, startOfMonth, now);
          const isIncome = category.type === 'income';
          
          return (
            <Card key={category.id} style={{ borderLeft: `4px solid ${category.color}` }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isIncome ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {isIncome ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total no mês</p>
                    <p className={`text-2xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(spending))}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, (Math.abs(spending) / 1000) * 100)}%`,
                          backgroundColor: category.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Nova Categoria" para começar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
