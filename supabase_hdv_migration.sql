-- Migration HDV vers Supabase
-- Script SQL pour créer la table des ordres de marché

-- Supprimer la table existante si elle existe (pour repartir de zéro)
DROP TABLE IF EXISTS market_orders CASCADE;

-- Supprimer la fonction si elle existe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Table des ordres de marché
CREATE TABLE market_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_image TEXT,
    item_category TEXT,
    item_type TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les contraintes après la création de la table
ALTER TABLE market_orders ADD CONSTRAINT check_type CHECK (type IN ('buy', 'sell'));
ALTER TABLE market_orders ADD CONSTRAINT check_status CHECK (status IN ('active', 'completed', 'cancelled'));

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_market_orders_user_id ON market_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_market_orders_type ON market_orders(type);
CREATE INDEX IF NOT EXISTS idx_market_orders_status ON market_orders(status);
CREATE INDEX IF NOT EXISTS idx_market_orders_created_at ON market_orders(created_at);

-- RLS (Row Level Security) - Tous les ordres actifs sont visibles par tous
ALTER TABLE market_orders ENABLE ROW LEVEL SECURITY;

-- Politique pour voir tous les ordres actifs
CREATE POLICY "Anyone can view active market orders" ON market_orders
    FOR SELECT USING (status = 'active');

-- Politique pour insérer ses propres ordres
CREATE POLICY "Users can insert their own orders" ON market_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour modifier ses propres ordres
CREATE POLICY "Users can update their own orders" ON market_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour supprimer ses propres ordres
CREATE POLICY "Users can delete their own orders" ON market_orders
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_market_orders_updated_at 
    BEFORE UPDATE ON market_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();