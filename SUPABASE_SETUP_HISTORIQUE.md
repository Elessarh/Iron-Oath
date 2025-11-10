# Configuration de la table purchase_history dans Supabase

## Instructions pour créer la table dans Supabase

Pour que le système d'historique d'achat fonctionne, vous devez créer une nouvelle table dans votre base de données Supabase.

### 1. Se connecter à Supabase

1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche

### 2. Créer la table purchase_history

Copiez et exécutez le code SQL suivant dans l'éditeur SQL :

```sql
-- Création de la table purchase_history pour l'historique des transactions HDV
CREATE TABLE IF NOT EXISTS purchase_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informations de l'ordre original
    order_id UUID,
    
    -- Informations du vendeur
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    
    -- Informations de l'acheteur
    buyer_id TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    
    -- Informations de l'item
    item_name TEXT NOT NULL,
    item_image TEXT,
    item_category TEXT,
    
    -- Détails de la transaction
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sell', 'buy')),
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_purchase_history_seller_id ON purchase_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_buyer_id ON purchase_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_created_at ON purchase_history(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_purchase_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS trigger_update_purchase_history_updated_at ON purchase_history;
CREATE TRIGGER trigger_update_purchase_history_updated_at
    BEFORE UPDATE ON purchase_history
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_history_updated_at();

-- Activer RLS (Row Level Security)
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire leur propre historique
CREATE POLICY "Les utilisateurs peuvent voir leur propre historique"
    ON purchase_history
    FOR SELECT
    TO authenticated
    USING (
        seller_id = auth.uid()::text 
        OR buyer_id = auth.uid()::text
    );

-- Politique pour permettre aux utilisateurs d'insérer dans l'historique
CREATE POLICY "Les utilisateurs peuvent créer des entrées d'historique"
    ON purchase_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel - à retirer si vous voulez restreindre)
CREATE POLICY "Lecture publique de l'historique"
    ON purchase_history
    FOR SELECT
    TO anon
    USING (true);
```

### 3. Vérifier la création

Après avoir exécuté le script :

1. Allez dans "Table Editor" dans le menu de gauche
2. Vous devriez voir la nouvelle table `purchase_history`
3. Vérifiez que toutes les colonnes sont présentes

### 4. Structure de la table

La table `purchase_history` contient les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique de la transaction |
| order_id | UUID | ID de l'ordre original (référence) |
| seller_id | TEXT | ID de l'utilisateur vendeur |
| seller_name | TEXT | Nom du vendeur |
| buyer_id | TEXT | ID de l'utilisateur acheteur |
| buyer_name | TEXT | Nom de l'acheteur |
| item_name | TEXT | Nom de l'item échangé |
| item_image | TEXT | Chemin de l'image de l'item |
| item_category | TEXT | Catégorie de l'item |
| quantity | INTEGER | Quantité échangée |
| price | INTEGER | Prix unitaire |
| total_price | INTEGER | Prix total de la transaction |
| transaction_type | TEXT | Type de transaction ('sell' ou 'buy') |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de dernière mise à jour |

## Utilisation dans le code

Le système sauvegarde automatiquement les transactions dans cette table lorsqu'un utilisateur clique sur "Vendu/Acheté" dans "Mes Ordres".

### Fonction de sauvegarde (dans hdv-supabase.js)

```javascript
await window.hdvSupabaseManager.saveTransactionToHistory(transactionData);
```

### Fonction de récupération (dans hdv-supabase.js)

```javascript
const history = await window.hdvSupabaseManager.getUserPurchaseHistory(userId);
```

## Fonctionnalités implémentées

✅ **Suppression d'ordres** : Les joueurs peuvent maintenant supprimer leurs ordres depuis :
- La place de marché (bouton 🗑️ Supprimer visible uniquement sur leurs propres ordres)
- L'onglet "Mes Ordres" (bouton 🗑️ en haut à droite de chaque ordre)

✅ **Bouton Vendu/Acheté** : Quand un joueur clique sur ce bouton :
1. Une modal s'ouvre pour demander à qui l'item a été vendu/acheté
2. La transaction est sauvegardée dans `purchase_history` avec les infos des 2 parties
3. L'ordre est automatiquement supprimé de l'HDV
4. L'historique est accessible pour les deux parties (vendeur ET acheteur)

✅ **Fallback localStorage** : Si Supabase n'est pas disponible, les données sont sauvegardées localement

## Prochaines étapes (optionnel)

Pour afficher l'historique d'achat aux utilisateurs, vous pouvez :

1. Créer un nouvel onglet "Historique" dans l'HDV
2. Utiliser la fonction `getUserPurchaseHistory()` pour charger les données
3. Afficher les transactions passées avec filtres par date, type, etc.

Exemple de code pour afficher l'historique :

```javascript
async loadPurchaseHistory() {
    const userInfo = this.getCurrentUserInfo();
    if (!userInfo) return;

    const history = await window.hdvSupabaseManager.getUserPurchaseHistory(userInfo.id);
    
    // Afficher l'historique dans l'interface
    console.log('Historique d\'achat:', history);
}
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que la table a bien été créée dans Supabase
2. Vérifiez les permissions RLS (Row Level Security)
3. Consultez la console du navigateur pour les messages d'erreur
