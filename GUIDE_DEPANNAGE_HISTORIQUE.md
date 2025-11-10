# Guide de dépannage - Historique des transactions HDV

## Problème : Les transactions ne s'affichent pas dans la base de données

Si vous cliquez sur "Vendu/Acheté" et que la transaction se supprime mais ne s'affiche pas dans Supabase, voici comment diagnostiquer le problème :

### 1. Vérifier la console du navigateur

1. Ouvrez votre page HDV
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Effectuez une transaction en cliquant sur "Vendu/Acheté"
5. Regardez les messages dans la console :

#### Messages de succès ✅
```
💾 Sauvegarde transaction dans l'historique: {...}
👤 Utilisateur actuel: {...}
📤 Données historique envoyées à Supabase: {...}
✅ Transaction sauvegardée dans l'historique: {...}
```

#### Messages d'erreur ❌
```
❌ Supabase non disponible pour sauvegarder l'historique
❌ Erreur Supabase historique: {...}
⚠️ Échec sauvegarde historique Supabase
```

### 2. Vérifier que Supabase est connecté

Dans la console du navigateur, tapez :
```javascript
window.hdvSupabaseManager.isSupabaseAvailable()
```

- Si retourne `true` ✅ : Supabase est connecté
- Si retourne `false` ❌ : Problème de connexion

### 3. Vérifier que la table existe

1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Allez dans **Table Editor** (menu de gauche)
4. Cherchez la table `purchase_history`

**Si la table n'existe pas** :
- Exécutez le script SQL fourni dans `SUPABASE_SETUP_HISTORIQUE.md`

**Si la table existe** :
- Vérifiez que toutes les colonnes sont présentes (voir structure ci-dessous)

### 4. Structure attendue de la table

La table `purchase_history` doit avoir ces colonnes :

| Colonne | Type | Nullable | Description |
|---------|------|----------|-------------|
| id | uuid | NO | Clé primaire (auto-généré) |
| order_id | uuid | YES | Référence à l'ordre original |
| seller_id | text | NO | ID du vendeur |
| seller_name | text | NO | Nom du vendeur |
| buyer_id | text | NO | ID de l'acheteur |
| buyer_name | text | NO | Nom de l'acheteur |
| item_name | text | NO | Nom de l'item |
| item_image | text | YES | Chemin de l'image |
| item_category | text | YES | Catégorie de l'item |
| quantity | integer | NO | Quantité échangée |
| price | integer | NO | Prix unitaire |
| total_price | integer | NO | Prix total |
| transaction_type | text | NO | 'sell' ou 'buy' |
| created_at | timestamptz | NO | Date de création (auto) |
| updated_at | timestamptz | NO | Date de mise à jour (auto) |

### 5. Vérifier les permissions RLS (Row Level Security)

1. Dans Supabase, allez dans **Table Editor** > `purchase_history`
2. Cliquez sur **RLS Policies** (ou **Policies**)
3. Vérifiez que ces politiques existent :

#### Politique de lecture
- **Nom** : "Les utilisateurs peuvent voir leur propre historique"
- **Type** : SELECT
- **Target** : authenticated
- **USING** : `seller_id = auth.uid()::text OR buyer_id = auth.uid()::text`

#### Politique d'insertion
- **Nom** : "Les utilisateurs peuvent créer des entrées d'historique"
- **Type** : INSERT
- **Target** : authenticated
- **WITH CHECK** : `true`

### 6. Tester manuellement l'insertion

Dans Supabase SQL Editor, essayez d'insérer une ligne manuellement :

```sql
INSERT INTO purchase_history (
    seller_id,
    seller_name,
    buyer_id,
    buyer_name,
    item_name,
    quantity,
    price,
    total_price,
    transaction_type
) VALUES (
    'test-seller-id',
    'TestSeller',
    'test-buyer-id',
    'TestBuyer',
    'Épée Test',
    1,
    1000,
    1000,
    'sell'
);
```

- **Si ça marche** ✅ : Le problème vient du code JavaScript
- **Si ça ne marche pas** ❌ : Le problème vient de la structure de la table ou des permissions

### 7. Erreurs courantes et solutions

#### Erreur : "relation 'purchase_history' does not exist"
**Solution** : La table n'existe pas. Exécutez le script SQL de création.

#### Erreur : "new row violates check constraint"
**Solution** : Vérifiez que `transaction_type` est bien 'sell' ou 'buy' (pas autre chose).

#### Erreur : "permission denied for table purchase_history"
**Solution** : Les politiques RLS sont mal configurées. Vérifiez les permissions.

#### Erreur : "null value in column violates not-null constraint"
**Solution** : Un champ obligatoire est vide. Vérifiez les données envoyées dans la console.

### 8. Vérifier les données envoyées

Dans la console, cherchez le message :
```
📤 Données historique envoyées à Supabase: {...}
```

Vérifiez que l'objet contient bien toutes les propriétés requises :
- seller_id
- seller_name
- buyer_id
- buyer_name
- item_name
- quantity
- price
- total_price
- transaction_type

### 9. Vérifier l'historique local (fallback)

Si Supabase ne fonctionne pas, les données sont sauvegardées localement :

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Développez **Local Storage**
4. Cherchez la clé `hdv_purchase_history`
5. Vérifiez qu'elle contient vos transactions

### 10. Forcer le rechargement de l'historique

Dans la console du navigateur, tapez :
```javascript
hdvSystem.loadPurchaseHistory()
```

Cela force le rechargement de l'onglet Historique et affiche les erreurs éventuelles.

## Utilisation de l'historique

Une fois la table créée et configurée :

1. **Créer une transaction** :
   - Allez dans "Mes Ordres"
   - Cliquez sur "✅ Vendu/Acheté"
   - Entrez le nom de l'autre partie
   - Confirmez

2. **Voir l'historique** :
   - Cliquez sur l'onglet "📜 Historique"
   - Toutes vos transactions apparaissent
   - 🔴 Rouge = Ventes
   - 🔵 Bleu = Achats

3. **Actualiser** :
   - Cliquez sur le bouton "🔄 Actualiser" dans l'onglet Historique

## Support supplémentaire

Si le problème persiste après avoir suivi tous ces steps :

1. Exportez les messages de la console (clic droit > Save as...)
2. Vérifiez les logs Supabase dans le dashboard
3. Contactez le support en fournissant :
   - Les messages d'erreur de la console
   - La structure de votre table `purchase_history`
   - Les politiques RLS configurées
