# 🏛️ Système de Guilde Iron Oath - Documentation Complète

## ✅ Résumé des modifications

### 1. **Affichage du niveau corrigé** ✅
- Le niveau dans l'onglet Profil affiche maintenant correctement le niveau de l'utilisateur
- Modification dans `profil.js` : `profile.niveau || 1` au lieu de valeur hardcodée

### 2. **Espace Guilde créé** ✅
- Page dédiée `espace-guilde.html` pour les membres Iron Oath
- Accessible UNIQUEMENT aux membres et admins
- Sections :
  - 📅 **Planning** : Événements à venir (raids, réunions, PvP, etc.)
  - 🎯 **Objectifs** : Objectifs hebdomadaires avec progression 0-100%
  - ✅ **Présence** : Suivi quotidien de présence des membres

### 3. **Gestion admin dans le Dashboard** ✅
- Section complète dans `admin-dashboard.html`
- 3 onglets de gestion :
  - **Planning** : Ajouter/supprimer événements
  - **Objectifs** : Créer/modifier objectifs avec progression
  - **Présence** : Marquer manuellement les présences
- Toutes les données de la guilde sont modifiables par les admins

### 4. **Navigation optimisée** ✅
- ❌ **Supprimé** : Lien "Guilde" de la navigation principale de toutes les pages
- ✅ **Ajouté** : Bouton "🏛️ Espace Iron Oath" dans la page Profil uniquement
- Le bouton apparaît uniquement pour les membres et admins
- Logo de la guilde rendu **non-cliquable** dans espace-guilde.html

### 5. **Contrôle d'accès renforcé** ✅
- Page `espace-guilde.html` : Vérification rôle membre/admin
- Message "Accès Refusé" pour les joueurs simples
- Bouton guilde visible seulement dans le profil des membres/admins

## 📁 Fichiers modifiés

### HTML (9 fichiers)
1. `index.html` - Supprimé lien guilde navigation
2. `pages/map.html` - Supprimé lien guilde navigation
3. `pages/bestiaire.html` - Supprimé lien guilde navigation
4. `pages/items.html` - Supprimé lien guilde navigation
5. `pages/hdv.html` - Supprimé lien guilde navigation
6. `pages/quetes.html` - Supprimé lien guilde navigation
7. `pages/profil.html` - Ajouté bouton "Espace Iron Oath", supprimé lien navigation
8. `pages/admin-dashboard.html` - Section gestion guilde ajoutée, lien navigation supprimé
9. `pages/espace-guilde.html` - Logo rendu non-cliquable

### JavaScript (3 fichiers)
1. `js/profil.js` - Logique d'affichage bouton guilde (membre/admin)
2. `js/auth-supabase.js` - Supprimé fonction showGuildeLinkIfAuthorized()
3. `js/espace-guilde.js` - Logique complète de l'espace guilde
4. `js/admin-dashboard.js` - Fonctions de gestion guilde ajoutées

### CSS (1 fichier)
1. `css/components/guilde.css` - Styles de l'espace guilde

### SQL (1 fichier)
1. `supabase_guilde_setup.sql` - Schéma complet de la base de données

## 🎯 Accès à l'espace guilde

### Pour les membres et admins :
1. Se connecter avec un compte membre ou admin
2. Aller dans **Profil**
3. Cliquer sur le bouton **🏛️ Espace Iron Oath**
4. Accès aux trois sections :
   - Planning des événements
   - Objectifs de la semaine
   - Présences quotidiennes
5. Possibilité de marquer sa présence quotidienne

### Pour les admins :
1. Aller dans **Profil**
2. Cliquer sur **🛡️ Accéder au Dashboard Admin**
3. Faire défiler jusqu'à **Gestion de la Guilde Iron Oath**
4. Gérer tout depuis les 3 onglets :
   - Ajouter/supprimer événements
   - Créer/modifier objectifs
   - Marquer présences manuellement

## 🔒 Sécurité

### Contrôles d'accès :
- ✅ RLS (Row Level Security) activé sur toutes les tables guilde
- ✅ Membres : Lecture seule + marquage de leur propre présence
- ✅ Admins : Lecture + Écriture complète
- ✅ Joueurs simples : Aucun accès (page affiche "Accès Refusé")

### Contraintes :
- Un utilisateur ne peut marquer sa présence qu'une fois par jour
- UNIQUE(user_id, date_presence) dans la table guild_presence

## 📊 Structure des données

### Tables créées :

#### `guild_planning`
```
- Événements de guilde (raids, réunions, PvP, etc.)
- Types : reunion, raid, event, pvp, construction, autre
- Champs : titre, description, date_event, type_event, created_by
```

#### `guild_objectives`
```
- Objectifs hebdomadaires
- Progression : 0-100%
- Statuts : en_cours, termine, abandonne
- Champs : titre, description, semaine_numero, annee, statut, progression
```

#### `guild_presence`
```
- Suivi quotidien de présence
- Statuts : present, absent, en_mission
- Contrainte UNIQUE par utilisateur/jour
- Champs : user_id, date_presence, statut, commentaire
```

## 🚀 Installation

### Étape 1 : Exécuter le SQL
```sql
-- Dans Supabase > SQL Editor
-- Copier/coller le contenu de supabase_guilde_setup.sql
-- Cliquer sur Run
```

### Étape 2 : Créer des membres
```sql
-- Dans le dashboard admin, changer le rôle d'utilisateurs :
UPDATE user_profiles 
SET role = 'membre' 
WHERE id = 'UUID_DE_L_UTILISATEUR';
```

### Étape 3 : Tester
1. Se connecter avec un compte membre
2. Aller dans Profil
3. Voir le bouton "🏛️ Espace Iron Oath"
4. Cliquer et accéder à l'espace guilde

## 🎨 Design

### Couleurs :
- **Orange** (#ff6b35) : Headers, titres Iron Oath
- **Cyan** (#4ecdc4) : Sections, borders
- **Vert** (#4caf50) : Présent
- **Rouge** (#f44336) : Absent
- **Orange** (#ff9800) : En mission

### Layout :
- Responsive avec grids adaptatives
- Cartes avec hover effects
- Barres de progression pour objectifs
- Design cohérent avec le thème Iron Oath

## ✅ Checklist finale

- [x] Niveau affiché correctement dans Profil
- [x] Espace guilde créé pour membres
- [x] Planning d'événements fonctionnel
- [x] Objectifs hebdomadaires avec progression
- [x] Suivi de présence quotidien
- [x] Gestion admin complète dans Dashboard
- [x] Lien guilde supprimé de la navigation principale
- [x] Bouton guilde ajouté dans Profil uniquement
- [x] Logo guilde rendu non-cliquable
- [x] Accès restreint membres/admins
- [x] RLS policies configurées
- [x] SQL schema complet
- [x] Documentation complète

## 📝 Notes importantes

1. **Le bouton "Guilde" n'apparaît que dans la page Profil** - Plus dans la navigation
2. **Seuls les membres et admins voient le bouton** - Les joueurs simples ne le voient pas
3. **Les admins gèrent tout depuis le Dashboard** - Section dédiée avec 3 onglets
4. **Le logo dans espace-guilde n'est plus cliquable** - Simple image de header
5. **Marquage de présence limité à 1 fois par jour** - Contrainte UNIQUE en base

## 🐛 Dépannage

### Le bouton guilde n'apparaît pas dans le Profil :
- Vérifier que le rôle est "membre" ou "admin"
- Vérifier dans la console : `window.userProfile.role`

### "Accès Refusé" sur espace-guilde :
- Se connecter avec un compte membre ou admin
- Vérifier le rôle dans Supabase : `SELECT role FROM user_profiles WHERE id = 'UUID'`

### Erreur lors du marquage de présence :
- Vérifier qu'on n'a pas déjà marqué aujourd'hui
- Vérifier les RLS policies dans Supabase

## 🎉 Résultat final

L'espace guilde Iron Oath est maintenant **pleinement fonctionnel** avec :
- ✅ Accès optimisé via le Profil uniquement
- ✅ Navigation épurée sans lien guilde
- ✅ Gestion admin complète et centralisée
- ✅ Contrôle d'accès strict par rôle
- ✅ Design cohérent et professionnel
- ✅ Base de données sécurisée avec RLS

**Tout est prêt pour être utilisé !** 🚀
