# Guide de Configuration - Réinitialisation Automatique des Présences

## 🎯 Objectif
Marquer automatiquement comme "absent" tous les membres qui n'ont pas déclaré leur présence avant 01:00 du matin.

## 📋 Prérequis
- Accès à votre dashboard Supabase
- Rôle Admin sur votre projet Supabase

## 🔧 Configuration dans Supabase

### Étape 1: Exécuter le SQL de configuration
1. Connectez-vous à votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Exécutez le fichier `supabase_guilde_setup.sql` pour créer la fonction `mark_automatic_absences()`

### Étape 2: Créer une fonction Edge (Cron Job)

#### Option A: Via Supabase Edge Functions (Recommandé)

1. Dans votre dashboard Supabase, allez dans **Database** > **Functions**
2. Créez une nouvelle fonction nommée `daily-presence-reset`
3. Configurez le trigger: **Scheduled** (Cron)
4. Expression cron: `0 1 * * *` (tous les jours à 01:00)
5. Code de la fonction:

```sql
SELECT mark_automatic_absences();
```

#### Option B: Via un serveur externe (Alternative)

Si vous préférez utiliser un serveur externe (Node.js, Python, etc.):

**Exemple Node.js avec node-cron:**

```javascript
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Clé SERVICE, pas anon
);

// Tous les jours à 01:00
cron.schedule('0 1 * * *', async () => {
    console.log('🕐 Exécution marquage absences automatiques...');
    
    const { error } = await supabase.rpc('mark_automatic_absences');
    
    if (error) {
        console.error('❌ Erreur:', error);
    } else {
        console.log('✅ Absences automatiques marquées');
    }
});
```

### Étape 3: Créer un webhook Supabase (Option C)

1. Utilisez un service comme **Zapier**, **Make.com**, ou **n8n**
2. Configurez un trigger de temps: tous les jours à 01:00
3. Action: Appel HTTP POST vers votre fonction Supabase

```
POST https://votre-projet.supabase.co/rest/v1/rpc/mark_automatic_absences
Headers:
  apikey: votre-anon-key
  Authorization: Bearer votre-anon-key
  Content-Type: application/json
```

## 🧪 Tester la fonction manuellement

Pour tester que la fonction fonctionne correctement:

1. Allez dans **SQL Editor**
2. Exécutez:

```sql
SELECT mark_automatic_absences();
```

3. Vérifiez dans la table `guild_presence` que les absences ont été créées

## 📊 Vérification des logs

Pour voir l'historique des présences:

```sql
SELECT 
    up.username,
    gp.date_presence,
    gp.statut,
    gp.created_at,
    gp.commentaire
FROM guild_presence gp
JOIN user_profiles up ON gp.user_id = up.id
WHERE gp.date_presence = CURRENT_DATE
ORDER BY gp.created_at DESC;
```

## ⚙️ Personnalisation

### Changer l'heure de réinitialisation

Pour changer l'heure (par exemple 02:00 au lieu de 01:00):
- Modifiez l'expression cron: `0 2 * * *`

### Exclure certains utilisateurs

Si vous voulez exclure certains utilisateurs (par exemple les admins):

```sql
CREATE OR REPLACE FUNCTION mark_automatic_absences()
RETURNS void AS $$
BEGIN
    INSERT INTO guild_presence (user_id, date_presence, statut, commentaire)
    SELECT 
        up.id,
        CURRENT_DATE,
        'absent',
        'Absence automatique - non marque'
    FROM user_profiles up
    WHERE up.role = 'membre' -- Exclure les admins
    AND NOT EXISTS (
        SELECT 1 FROM guild_presence gp
        WHERE gp.user_id = up.id
        AND gp.date_presence = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🎮 Utilisation pour les joueurs

### Marquer sa présence
Les membres peuvent marquer leur présence via:
1. **Espace Guilde** > Bouton "Marquer ma présence"
2. **Espace Guilde** > Bouton "Déclarer une absence"

### Changer son statut
Un membre peut changer son statut dans la même journée:
- De "Présent" à "Absent"
- De "Absent" à "Présent"

### Visualisation
- **Membres**: Voient tous les autres membres et leur statut dans l'Espace Guilde
- **Admins**: Voient un tableau détaillé dans le Dashboard Admin

## 🔍 Statistiques disponibles

Le Dashboard Admin affiche:
- **Présents**: Nombre de membres présents
- **Absents**: Nombre de membres absents (manuels + automatiques)
- **En mission**: Nombre de membres en mission
- **Détails**: Tableau avec nom, classe, niveau, statut, heure

## 🚨 Dépannage

### La fonction ne s'exécute pas
1. Vérifiez les logs Supabase
2. Testez manuellement la fonction SQL
3. Vérifiez que le cron job est actif

### Les absences ne sont pas marquées
1. Vérifiez que la table `user_profiles` a bien des utilisateurs avec role='membre'
2. Vérifiez les policies RLS sur `guild_presence`
3. Testez manuellement avec:
```sql
SELECT mark_automatic_absences();
SELECT * FROM guild_presence WHERE date_presence = CURRENT_DATE;
```

### Doublon de présences
La contrainte UNIQUE(user_id, date_presence) empêche les doublons.
Si un membre a déjà marqué sa présence, la fonction ne créera pas de doublon.

## 📝 Notes importantes

1. **Timezone**: Assurez-vous que votre serveur/cron utilise le bon fuseau horaire
2. **Service Key**: N'utilisez la service_key QUE côté serveur, jamais dans le frontend
3. **Backup**: Gardez une sauvegarde de vos données de présence régulièrement
4. **Monitoring**: Configurez des alertes si la fonction échoue

## 🎯 Prochaines améliorations possibles

- Notifications Discord/Email pour rappeler de marquer sa présence
- Historique des présences sur 7/30 jours
- Statistiques de présence par membre
- Export CSV des présences pour analyse
