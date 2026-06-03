-- Création de la table des avis clients
CREATE TABLE reviews (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un seul avis par commande
  UNIQUE (order_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX reviews_freelancer_id_idx ON reviews (freelancer_id);
CREATE INDEX reviews_client_id_idx    ON reviews (client_id);

-- Activation de la sécurité au niveau des lignes
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are shown on public freelancer profiles and service detail pages.
CREATE POLICY "Avis visibles par tous"
  ON reviews
  FOR SELECT
  USING (true);

-- Requires (1) the inserting user is the order's client, (2) the order is in
-- 'livré' status — prevents reviewing orders that were never delivered, and
-- prevents a freelancer from self-reviewing or reviewing on another client's behalf.
-- The UNIQUE (order_id) constraint on the table enforces one review per order.
CREATE POLICY "Le client peut laisser un avis pour une commande livrée"
  ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1
      FROM   orders
      WHERE  orders.id        = order_id
        AND  orders.client_id = auth.uid()
        AND  orders.status    = 'livré'
    )
  );

-- UPDATE intentionally absent: reviews are immutable once published.
-- DELETE intentionally absent: clients cannot retract a review.
