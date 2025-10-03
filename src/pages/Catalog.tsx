import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from '@/components/HeaderBar';
import { BottomTabs } from '@/components/BottomTabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Plus, Zap, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Catalog() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const products = useStore((state) => state.products);
  const addProduct = useStore((state) => state.addProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const createCharge = useStore((state) => state.createCharge);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    if (!name || !price) {
      toast.error('Preencha nome e preço');
      return;
    }

    addProduct({
      name,
      priceBRL: parseFloat(price),
      category,
    });

    toast.success('Produto adicionado!');
    setIsOpen(false);
    setName('');
    setPrice('');
    setCategory('');
  };

  const handleQuickCharge = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      createCharge(product.priceBRL, [productId]);
      navigate('/pos');
      toast.success('Cobrança criada!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este produto?')) {
      deleteProduct(id);
      toast.success('Produto excluído');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <HeaderBar title={t('catalog.title')} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Produtos</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('catalog.addProduct')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Café Expresso"
                  />
                </div>
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label>Categoria (opcional)</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Bebidas"
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('catalog.empty')}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      R$ {product.priceBRL.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickCharge(product.id)}
                      className="flex-1"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Cobrar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
