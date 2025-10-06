-- Add DELETE policy to invoices table
-- Only merchant owners can delete invoices
CREATE POLICY "invoices_delete"
ON public.invoices
FOR DELETE
USING (app.is_owner(merchant_id));