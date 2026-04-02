-- Ajout de la methode de paiement (wero, paypal, revolut, liquide)
ALTER TABLE public.payments ADD COLUMN method TEXT;

-- Policy pour permettre aux admins de modifier les paiements
CREATE POLICY "Admins update any payments" ON public.payments
  FOR UPDATE USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
