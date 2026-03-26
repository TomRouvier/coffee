-- Add price column to coffees table (store price at time of consumption)
ALTER TABLE public.coffees ADD COLUMN price DECIMAL(10,2);

-- Backfill existing rows with current coffee price
UPDATE public.coffees
SET price = (SELECT value::DECIMAL(10,2) FROM public.settings WHERE key = 'coffee_price');

-- Make NOT NULL (no default — forces every insert to provide the price explicitly)
ALTER TABLE public.coffees ALTER COLUMN price SET NOT NULL;

-- Allow admins to insert coffees for other users (needed by setUserCoffeeCount)
CREATE POLICY "Admins insert coffees" ON public.coffees
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
