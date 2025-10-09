-- Create settlement dashboard view for metrics and analytics
-- This view provides aggregated data about settlements, crypto balance, and performance

-- 1. Settlement metrics view (per merchant, last 30 days)
CREATE OR REPLACE VIEW public.settlement_dashboard AS
SELECT 
  i.merchant_id,
  
  -- Date grouping
  DATE(p.created_at) as transaction_date,
  
  -- Payment counts
  COUNT(DISTINCT p.id) as total_payments,
  COUNT(DISTINCT CASE WHEN p.status = 'confirmed' THEN p.id END) as crypto_only,
  COUNT(DISTINCT CASE WHEN p.status = 'settled' THEN p.id END) as settled_to_fiat,
  
  -- Volume in BRL
  COALESCE(SUM(i.amount_brl), 0) as total_volume_brl,
  COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN i.amount_brl END), 0) as crypto_volume_brl,
  COALESCE(SUM(CASE WHEN p.status = 'settled' THEN i.amount_brl END), 0) as settled_volume_brl,
  
  -- Settlement metrics
  COALESCE(SUM(s.amount), 0) as settled_amount_total,
  COALESCE(SUM(s.fee), 0) as total_fees_paid,
  
  -- Performance metrics
  AVG(
    CASE 
      WHEN p.confirmed_at IS NOT NULL AND p.created_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (p.confirmed_at - p.created_at))
    END
  ) as avg_confirmation_time_seconds,
  
  AVG(
    CASE 
      WHEN s.completed_at IS NOT NULL AND s.requested_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (s.completed_at - s.requested_at))
    END
  ) as avg_settlement_time_seconds,
  
  -- Settlement providers breakdown
  COUNT(DISTINCT CASE WHEN s.provider = 'circle' THEN s.id END) as circle_settlements,
  COUNT(DISTINCT CASE WHEN s.provider = 'wise' THEN s.id END) as wise_settlements,
  COUNT(DISTINCT CASE WHEN s.provider = 'mercadopago' THEN s.id END) as mercadopago_settlements

FROM public.payments p
JOIN public.invoices i ON i.id = p.invoice_id
LEFT JOIN public.settlements s ON s.payment_id = p.id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
GROUP BY i.merchant_id, DATE(p.created_at)
ORDER BY transaction_date DESC;

-- 2. Settlement summary view (aggregated, per merchant)
CREATE OR REPLACE VIEW public.settlement_summary AS
SELECT 
  i.merchant_id,
  
  -- Overall metrics
  COUNT(DISTINCT p.id) as total_payments,
  COALESCE(SUM(i.amount_brl), 0) as total_volume_brl,
  
  -- Crypto vs Fiat
  COUNT(DISTINCT CASE WHEN p.status = 'confirmed' AND p.settled_at IS NULL THEN p.id END) as holding_crypto,
  COUNT(DISTINCT CASE WHEN p.status = 'settled' THEN p.id END) as settled_count,
  
  COALESCE(
    SUM(CASE WHEN p.status = 'confirmed' AND p.settled_at IS NULL THEN i.amount_brl END), 
    0
  ) as crypto_balance_brl,
  
  COALESCE(SUM(CASE WHEN p.status = 'settled' THEN s.amount END), 0) as settled_total,
  COALESCE(SUM(s.fee), 0) as total_fees,
  
  -- Success rate
  ROUND(
    100.0 * COUNT(CASE WHEN s.status = 'completed' THEN 1 END) / 
    NULLIF(COUNT(s.id), 0),
    2
  ) as settlement_success_rate,
  
  -- Average times
  ROUND(
    AVG(
      CASE 
        WHEN p.confirmed_at IS NOT NULL AND p.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (p.confirmed_at - p.created_at))
      END
    ),
    2
  ) as avg_confirm_seconds,
  
  ROUND(
    AVG(
      CASE 
        WHEN s.completed_at IS NOT NULL AND s.requested_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (s.completed_at - s.requested_at))
      END
    ),
    2
  ) as avg_settlement_seconds

FROM public.payments p
JOIN public.invoices i ON i.id = p.invoice_id
LEFT JOIN public.settlements s ON s.payment_id = p.id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
GROUP BY i.merchant_id;

-- 3. Enable RLS on views (inherit from base tables)
ALTER VIEW public.settlement_dashboard OWNER TO postgres;
ALTER VIEW public.settlement_summary OWNER TO postgres;

-- 4. Grant access
GRANT SELECT ON public.settlement_dashboard TO authenticated;
GRANT SELECT ON public.settlement_summary TO authenticated;

-- 5. Add comments
COMMENT ON VIEW public.settlement_dashboard IS 'Daily settlement metrics per merchant for the last 30 days';
COMMENT ON VIEW public.settlement_summary IS 'Aggregated settlement summary per merchant';

-- 6. Create helper function to get current merchant summary
CREATE OR REPLACE FUNCTION public.get_my_settlement_summary()
RETURNS TABLE(
  total_payments bigint,
  total_volume_brl numeric,
  holding_crypto bigint,
  settled_count bigint,
  crypto_balance_brl numeric,
  settled_total numeric,
  total_fees numeric,
  settlement_success_rate numeric,
  avg_confirm_seconds numeric,
  avg_settlement_seconds numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _merchant_id uuid;
BEGIN
  -- Get current merchant
  SELECT id INTO _merchant_id
  FROM public.merchants m
  JOIN public.merchant_members mm ON mm.merchant_id = m.id
  WHERE mm.user_id = auth.uid()
    AND mm.is_default = true
    AND mm.status = 'active'
  LIMIT 1;

  IF _merchant_id IS NULL THEN
    RAISE EXCEPTION 'No default merchant found';
  END IF;

  RETURN QUERY
  SELECT 
    ss.total_payments,
    ss.total_volume_brl,
    ss.holding_crypto,
    ss.settled_count,
    ss.crypto_balance_brl,
    ss.settled_total,
    ss.total_fees,
    ss.settlement_success_rate,
    ss.avg_confirm_seconds,
    ss.avg_settlement_seconds
  FROM public.settlement_summary ss
  WHERE ss.merchant_id = _merchant_id;
END;
$$;

COMMENT ON FUNCTION public.get_my_settlement_summary IS 'Returns settlement summary for current merchant';

