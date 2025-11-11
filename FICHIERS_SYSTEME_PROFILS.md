# 📁 FICHIERS DU SYSTÈME DE PROFILS ET RÔLES

## Fichiers SQL

### `supabase_profiles_setup.sql` (121 lignes)
**Script d'installation de la base de données**
- Crée le type ENUM `user_role` avec 3 valeurs : utilisateur, membre, admin
- Ajoute la colonne `role` à la table `user_profiles` existante
- Ajoute la colonne `updated_at` pour tracker les modifications
- Configure Row Level Security (RLS) avec 5 politiques
- Crée un trigger pour auto-updater `updated_at`
- Met à jour les utilisateurs existants avec le rôle par défaut

---

## Pages HTML

### `pages/profil.html` (230 lignes)
**Page de profil utilisateur**

Structure :
- Header avec navigation complète
- Section profil avec 4 informations :
  * 👤 Pseudo Joueur
  * 📧 Email
  * 🎖️ Rôle (avec badge coloré)
  * 📅 Membre depuis
- Section statistiques (3 cartes) :
  * Messages envoyés
  * Items possédés
  * Niveau

Styles :
- Fond dégradé dark
- Bordures cyan lumineuses
- Badges de rôle avec couleurs :
  * Utilisateur : Violet (#667eea)
  * Membre : Rose (#f5576c)
  * Admin : Doré avec ombre lumineuse
- Layout responsive

---

### `pages/admin-dashboard.html` (403 lignes)
**Dashboard de gestion pour les administrateurs**

Structure :
- Header orange avec titre "Dashboard Administrateur"
- 4 cartes de statistiques :
  * Total utilisateurs
  * Nombre d'admins
  * Nombre de membres
  * Nombre d'utilisateurs
- Section gestion avec :
  * Barre de recherche
  * Filtre par rôle
  * Tableau des utilisateurs (pseudo, email, rôle, date, actions)
  * Boutons : Modifier rôle, Supprimer
- Modal de modification de rôle

Sécurité :
- Accès vérifié côté client ET serveur
- Redirection automatique si non-admin
- Impossible de supprimer son propre compte

---

## Fichiers JavaScript

### `js/profil.js` (207 lignes)
**Logique de la page profil**

Fonctions principales :
- `waitForAuth()` : Attend que Supabase soit chargé
- `loadUserProfile()` : Récupère le profil depuis user_profiles
- `displayProfile()` : Affiche les informations
- `getRoleLabel()` : Convertit les rôles en français
- `loadStats()` : Charge les statistiques (placeholder)
- `showError()` : Gère l'affichage des erreurs

Gestion d'erreurs :
- Redirection vers connexion.html si non connecté
- Message d'erreur si profil introuvable
- Messages clairs pour l'utilisateur

---

### `js/admin-dashboard.js` (385 lignes)
**Logique du dashboard admin**

Fonctions principales :
- `checkAdminAccess()` : Vérifie que l'utilisateur est admin
- `loadUsers()` : Charge tous les utilisateurs depuis user_profiles
- `updateStats()` : Calcule les statistiques en temps réel
- `displayUsers()` : Affiche le tableau des utilisateurs
- `filterUsers()` : Filtre par recherche et rôle
- `openRoleModal()` : Ouvre le modal de modification
- `confirmRoleChange()` : Met à jour le rôle dans Supabase
- `deleteUser()` : Supprime un utilisateur

Features :
- Recherche en temps réel (pseudo + email)
- Filtre par rôle (tous, admin, membre, utilisateur)
- Modification de rôle avec modal
- Suppression avec confirmation
- Protection : impossible de se supprimer soi-même

---

### `js/auth-supabase.js` (724 lignes - MODIFIÉ)
**Système d'authentification (ajout fonction admin)**

Nouvelle fonction :
- `checkAndShowDashboardLink()` : 
  * Récupère le rôle depuis user_profiles
  * Affiche le lien Dashboard uniquement si role = 'admin'
  * Masque le lien pour les autres utilisateurs
  * Appelée automatiquement lors de checkAuthState()

Modifications :
- Ajout d'un appel à `checkAndShowDashboardLink()` dans `checkAuthState()`
- Utilisation de `user_profiles` partout (pas de table profiles)

---

## Fichiers HTML modifiés (Navigation)

### `index.html`
Ajout dans la navigation :
```html
<a href="pages/admin-dashboard.html" id="dashboard-link" style="display: none;">Dashboard</a>
<a href="pages/profil.html">Profil</a>
<span id="username"></span>
<button id="logout-btn">Déconnexion</button>
```

### Pages modifiées (6 fichiers)
- `pages/map.html`
- `pages/bestiaire.html`
- `pages/items.html`
- `pages/hdv.html`
- `pages/quetes.html`
- `pages/profil.html` (nouveau)

Toutes ont maintenant les liens Dashboard (masqué) et Profil.

---

## Documentation

### `GUIDE_INSTALLATION_PROFILS_ROLES.md`
Guide complet d'installation avec :
- Liste de ce qui a été créé
- Étapes d'installation (4 étapes)
- Explication des rôles
- Utilisation du dashboard
- Structure de la base de données
- Politiques de sécurité
- Dépannage
- Commandes SQL utiles
- Prochaines étapes possibles

---

## Résumé des modifications

### Nouveaux fichiers créés : 5
1. `supabase_profiles_setup.sql` - Configuration BDD
2. `pages/profil.html` - Page profil
3. `pages/admin-dashboard.html` - Dashboard admin
4. `js/profil.js` - Logique profil
5. `js/admin-dashboard.js` - Logique dashboard

### Fichiers modifiés : 8
1. `index.html` - Navigation
2. `pages/map.html` - Navigation
3. `pages/bestiaire.html` - Navigation
4. `pages/items.html` - Navigation
5. `pages/hdv.html` - Navigation
6. `pages/quetes.html` - Navigation
7. `js/auth-supabase.js` - Fonction admin
8. `GUIDE_INSTALLATION_PROFILS_ROLES.md` - Documentation

---

## 🎯 Système complet et fonctionnel

✅ Base de données configurée (table user_profiles)
✅ Page profil pour tous les utilisateurs
✅ Dashboard admin pour la gestion
✅ Liens dynamiques selon le rôle
✅ 3 rôles : Utilisateur, Membre, Admin
✅ Sécurité RLS configurée
✅ Navigation mise à jour sur toutes les pages
✅ Documentation complète

**Total : 13 fichiers concernés (5 nouveaux + 8 modifiés)**
