-- Add DELETE policy to payments table
-- Only merchant owners can delete payments
-- Check ownership through the invoice relationship
CREATE POLICY "payments_delete"
ON public.payments
FOR DELETE
USING (
  app.is_owner(
    (SELECT merchant_id FROM invoices WHERE invoices.id = payments.invoice_id)
  )
);