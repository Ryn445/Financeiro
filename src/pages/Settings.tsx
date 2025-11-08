import { useFinance } from '@/hooks/useFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { resetAllData, transactions, wallets, categories, goals, bills, persons } = useFinance();
  const { toast } = useToast();

  const handleBackup = () => {
    const data = { transactions, wallets, categories, goals, bills, persons };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: 'Backup realizado com sucesso' });
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.setItem('finance-data', JSON.stringify(data));
          window.location.reload();
        } catch (error) {
          toast({ title: 'Erro ao restaurar backup', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleBackup} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Fazer Backup Local
            </Button>
            <Button onClick={handleRestore} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Restaurar Backup
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Faça backup dos seus dados regularmente para não perder suas informações.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Transações</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Carteiras</p>
              <p className="text-2xl font-bold">{wallets.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Metas</p>
              <p className="text-2xl font-bold">{goals.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Contas</p>
              <p className="text-2xl font-bold">{bills.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Pessoas</p>
              <p className="text-2xl font-bold">{persons.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Resetar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos,
                  incluindo transações, carteiras, categorias, metas e contas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData} className="bg-destructive">
                  Sim, resetar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-sm text-muted-foreground mt-4">
            Atenção: Esta ação irá apagar todos os seus dados permanentemente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
