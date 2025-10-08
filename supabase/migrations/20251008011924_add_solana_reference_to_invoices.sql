-- Add Solana Pay reference column to invoices table
-- This stores the PublicKey used as reference in Solana Pay transactions

-- Add reference column (nullable initially for existing records)
alter table public.invoices 
  add column if not exists reference text;

-- Create unique index on reference (only for non-null values)
create unique index if not exists invoices_reference_unique 
  on public.invoices(reference) 
  where reference is not null;

-- Add comment explaining the column
comment on column public.invoices.reference is 
  'Solana Pay reference (PublicKey as base58 string). Used for on-chain transaction validation.';

-- The ref column remains for human-readable reference (REFXXXX)
-- The reference column is for Solana Pay PublicKey

