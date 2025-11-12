# Installation du Système de Guilde Iron Oath

## 📋 Étapes d'installation

### 1. Exécuter le SQL dans Supabase

1. Connectez-vous à votre compte Supabase
2. Allez dans votre projet Iron Oath
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New query**
5. Copiez le contenu du fichier `supabase_guilde_setup.sql`
6. Collez-le dans l'éditeur SQL
7. Cliquez sur **Run** pour exécuter le script

### 2. Vérifier l'installation

Après avoir exécuté le SQL, vous devriez avoir :

#### Tables créées :
- `guild_planning` - Pour les événements de guilde
- `guild_objectives` - Pour les objectifs hebdomadaires
- `guild_presence` - Pour le suivi de présence quotidien

#### Policies RLS créées :
- **Members can view** - Les membres peuvent voir toutes les données
- **Admins can manage** - Les admins peuvent créer/modifier/supprimer
- **Users can mark own presence** - Les utilisateurs peuvent marquer leur propre présence

#### Fonctions créées :
- `get_current_week()` - Retourne le numéro de semaine actuel

### 3. Tester l'accès

1. Créez un utilisateur avec le rôle **membre** ou **admin**
2. Connectez-vous avec cet utilisateur
3. Le lien "Guilde" devrait apparaître dans la navigation
4. Accédez à l'espace guilde pour voir les sections :
   - 📅 Planning des événements
   - 🎯 Objectifs de la semaine
   - ✅ Présences quotidiennes

### 4. Gestion admin

Les administrateurs peuvent gérer la guilde depuis le **Dashboard Admin** :

1. Connectez-vous en tant qu'admin
2. Allez dans votre profil
3. Cliquez sur "Accéder au Dashboard Admin"
4. Faites défiler jusqu'à la section "Gestion de la Guilde Iron Oath"
5. Utilisez les onglets pour :
   - Ajouter des événements au planning
   - Créer des objectifs hebdomadaires
   - Marquer manuellement les présences

## 📝 Utilisation

### Pour les membres :

1. **Voir le planning** : Consultez les événements à venir (raids, réunions, PvP, etc.)
2. **Suivre les objectifs** : Voyez la progression des objectifs de la semaine
3. **Marquer votre présence** : Cliquez sur "Marquer ma présence" chaque jour

### Pour les admins :

1. **Gérer les événements** : Ajoutez/supprimez des événements au planning
2. **Définir les objectifs** : Créez des objectifs hebdomadaires avec progression (0-100%)
3. **Suivre les présences** : Voyez qui est présent/absent/en mission chaque jour
4. **Marquer manuellement** : Enregistrez les présences pour les membres

## 🎨 Personnalisation

### Types d'événements disponibles :
- 🗣️ Réunion
- ⚔️ Raid
- 🎉 Événement
- 🗡️ PvP
- 🏗️ Construction
- 📌 Autre

### Statuts de présence :
- ✅ Présent (vert)
- ❌ Absent (rouge)
- 🎯 En mission (orange)

### Statuts d'objectifs :
- ⏳ En cours
- ✅ Terminé
- ❌ Abandonné

## 🔒 Sécurité

- **Accès restreint** : Seuls les membres et admins peuvent voir l'espace guilde
- **RLS activé** : Les policies Supabase protègent les données
- **Unique constraint** : Un utilisateur ne peut marquer sa présence qu'une fois par jour
- **Admin only** : Seuls les admins peuvent gérer les événements et objectifs

## 🐛 Dépannage

### Le lien "Guilde" n'apparaît pas :
- Vérifiez que votre rôle est "membre" ou "admin" dans `user_profiles`
- Rechargez la page après avoir changé le rôle

### Erreur lors de l'exécution du SQL :
- Vérifiez que les tables n'existent pas déjà
- Supprimez les tables existantes si nécessaire :
  ```sql
  DROP TABLE IF EXISTS guild_presence CASCADE;
  DROP TABLE IF EXISTS guild_objectives CASCADE;
  DROP TABLE IF EXISTS guild_planning CASCADE;
  DROP FUNCTION IF EXISTS get_current_week();
  ```

### "Accès Refusé" sur la page guilde :
- Connectez-vous avec un compte membre/admin
- Vérifiez dans Supabase que votre profil a le bon rôle

## 📊 Structure de données

### guild_planning
```
id (uuid)
titre (text)
description (text, nullable)
date_event (timestamptz)
type_event (text)
created_by (uuid)
created_at, updated_at
```

### guild_objectives
```
id (uuid)
titre (text)
description (text)
semaine_numero (integer)
annee (integer)
statut (text)
progression (integer 0-100)
created_by (uuid)
created_at, updated_at
```

### guild_presence
```
id (uuid)
user_id (uuid)
date_presence (date)
statut (text)
commentaire (text, nullable)
created_at, updated_at
UNIQUE(user_id, date_presence)
```

## ✅ Checklist d'installation

- [ ] SQL exécuté dans Supabase
- [ ] Tables créées et visibles
- [ ] RLS policies actives
- [ ] Au moins un utilisateur avec rôle "membre" créé
- [ ] Lien "Guilde" visible dans la navigation
- [ ] Page espace-guilde.html accessible
- [ ] Section admin visible dans le dashboard
- [ ] Test de marquage de présence réussi
- [ ] Test de création d'événement réussi (admin)
- [ ] Test de création d'objectif réussi (admin)
