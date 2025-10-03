import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MerchantInfo, FeatureFlags } from '@/types/store';

export function useMerchant() {
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchant();
  }, []);

  const fetchMerchant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's default merchant using helper function
      // @ts-ignore - RPC function exists in database
      const { data: merchantId, error: merchantIdError } = await supabase.rpc('current_merchant');

      if (merchantIdError || !merchantId) {
        console.error('Error getting current merchant:', merchantIdError);
        return;
      }

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single();

      if (merchantError) {
        console.error('Error fetching merchant data:', merchantError);
        return;
      }

      if (merchantData) {
        setMerchant({
          name: merchantData.name,
          logoUrl: merchantData.logo_url || undefined,
          walletMasked: merchantData.wallet_masked,
          category: merchantData.category || undefined,
          email: merchantData.email || undefined,
          phone: merchantData.phone || undefined,
        });

        setFlags({
          pixSettlement: merchantData.pix_settlement,
          payWithBinance: merchantData.pay_with_binance,
          useProgram: merchantData.use_program,
          demoMode: merchantData.demo_mode,
        });
      }
    } catch (error) {
      console.error('Error fetching merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMerchant = async (updates: Partial<MerchantInfo>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current merchant using helper function
      // @ts-ignore - RPC function exists in database
      const { data: merchantId, error: merchantIdError } = await supabase.rpc('current_merchant');

      if (merchantIdError || !merchantId) {
        console.error('Error getting current merchant:', merchantIdError);
        return;
      }

      await supabase
        .from('merchants')
        .update({
          name: updates.name,
          logo_url: updates.logoUrl,
          category: updates.category,
          email: updates.email,
          phone: updates.phone,
        })
        .eq('id', merchantId);

      await fetchMerchant();
    } catch (error) {
      console.error('Error updating merchant:', error);
    }
  };

  const updateFlags = async (updates: Partial<FeatureFlags>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current merchant using helper function
      // @ts-ignore - RPC function exists in database
      const { data: merchantId, error: merchantIdError } = await supabase.rpc('current_merchant');

      if (merchantIdError || !merchantId) {
        console.error('Error getting current merchant:', merchantIdError);
        return;
      }

      await supabase
        .from('merchants')
        .update({
          pix_settlement: updates.pixSettlement,
          pay_with_binance: updates.payWithBinance,
          use_program: updates.useProgram,
          demo_mode: updates.demoMode,
        })
        .eq('id', merchantId);

      await fetchMerchant();
    } catch (error) {
      console.error('Error updating flags:', error);
    }
  };

  return {
    merchant,
    flags,
    loading,
    updateMerchant,
    updateFlags,
    refetch: fetchMerchant,
  };
}
