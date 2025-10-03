import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/store';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: members } = await supabase
        .from('merchant_members')
        .select('merchant_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (!members) return;

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', members.merchant_id)
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            priceBRL: Number(p.price_brl),
            imageUrl: p.image_url || undefined,
            category: p.category || undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: members } = await supabase
        .from('merchant_members')
        .select('merchant_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (!members) return;

      await supabase.from('products').insert({
        merchant_id: members.merchant_id,
        name: product.name,
        price_brl: product.priceBRL,
        image_url: product.imageUrl,
        category: product.category,
      });

      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await supabase
        .from('products')
        .update({
          name: updates.name,
          price_brl: updates.priceBRL,
          image_url: updates.imageUrl,
          category: updates.category,
        })
        .eq('id', id);

      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
