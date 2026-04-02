-- Ajout de la methode de paiement (wero, paypal, revolut, liquide)
ALTER TABLE public.payments ADD COLUMN method TEXT;
