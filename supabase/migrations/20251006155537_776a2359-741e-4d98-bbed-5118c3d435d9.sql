-- Add UPDATE and DELETE policies to receipts table
-- Receipts are immutable financial records, so UPDATE is completely blocked
-- Only merchant owners can DELETE receipts (for exceptional administrative cases)

-- Block all UPDATE operations on receipts (immutable records)
CREATE POLICY "receipts_update_blocked"
ON public.receipts
FOR UPDATE
USING (false);

-- Only merchant owners can delete receipts
CREATE POLICY "receipts_delete"
ON public.receipts
FOR DELETE
USING (
  app.is_owner(
    (SELECT i.merchant_id 
     FROM invoices i
     JOIN payments p ON p.invoice_id = i.id
     WHERE p.id = receipts.payment_id)
  )
);