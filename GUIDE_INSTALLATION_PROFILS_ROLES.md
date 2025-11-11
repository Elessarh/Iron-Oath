# 📋 GUIDE D'INSTALLATION - Système de Profils et Rôles

## ✅ Ce qui a été créé

### 1. Base de données (Supabase)
- **Script SQL** : `supabase_profiles_setup.sql`
- Ajoute la colonne `role` à la table existante `user_profiles`
- Crée 3 rôles : Utilisateur, Membre, Admin
- Configure les permissions (RLS)

### 2. Page Profil Utilisateur
- **HTML** : `pages/profil.html`
- **JavaScript** : `js/profil.js`
- Affiche : pseudo, email, rôle avec badge coloré, date d'inscription
- Statistiques (prêtes pour future implémentation)

### 3. Dashboard Administrateur
- **HTML** : `pages/admin-dashboard.html`
- **JavaScript** : `js/admin-dashboard.js`
- Tableau de tous les utilisateurs
- Modification des rôles
- Suppression d'utilisateurs
- Recherche et filtres
- Statistiques en temps réel

### 4. Navigation
- Lien **"Profil"** visible par tous les utilisateurs connectés
- Lien **"Dashboard"** visible UNIQUEMENT par les administrateurs
- Liens ajoutés sur toutes les pages

---

## 🚀 ÉTAPES D'INSTALLATION

### ÉTAPE 1 : Exécuter le script SQL dans Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet Iron Oath
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**
5. Copiez-collez TOUT le contenu du fichier `supabase_profiles_setup.sql`
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)
7. Vérifiez qu'il n'y a pas d'erreur (message "Success. No rows returned")

### ÉTAPE 2 : Promouvoir votre compte en Administrateur

Remplacez `votre-email@exemple.com` par votre véritable email et exécutez :

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'votre-email@exemple.com';
```

Vérification :
```sql
SELECT username, email, role FROM user_profiles WHERE email = 'votre-email@exemple.com';
```

Vous devriez voir : `role = admin`

### ÉTAPE 3 : Déployer sur GitHub

```powershell
cd C:\Users\julie\OneDrive\Desktop\Iron-Oath
git add .
git commit -m "Ajout système de profils et rôles avec dashboard admin"
git push origin main
```

### ÉTAPE 4 : Tester le système

1. **Connectez-vous** sur votre site
2. Vous devriez voir :
   - Votre **pseudo** dans la navigation
   - Le lien **"Profil"** (bleu cyan)
   - Le lien **"Dashboard"** (orange) ← SEULEMENT si vous êtes admin

3. **Testez la page Profil** :
   - Cliquez sur "Profil"
   - Vérifiez que votre pseudo s'affiche correctement (ex: "Elessarh")
   - Vérifiez que votre rôle est "Administrateur" avec badge doré

4. **Testez le Dashboard Admin** :
   - Cliquez sur "Dashboard"
   - Vous devriez voir la liste de tous les utilisateurs
   - Testez la recherche
   - Testez le filtre par rôle
   - Testez la modification d'un rôle

---

## 🎨 Rôles disponibles

### 👤 Utilisateur (par défaut)
- Badge violet
- Accès basique au site
- Peut voir son profil

### 🎖️ Membre
- Badge rose
- Accès étendu (à définir selon vos besoins)
- Peut voir son profil

### 👑 Administrateur
- Badge doré avec effet lumineux
- Accès au Dashboard de gestion
- Peut modifier tous les rôles
- Peut supprimer des utilisateurs

---

## 🔧 Utilisation du Dashboard Admin

### Modifier un rôle
1. Trouvez l'utilisateur dans le tableau
2. Cliquez sur **"Modifier rôle"**
3. Sélectionnez le nouveau rôle
4. Cliquez sur **"Confirmer"**

### Supprimer un utilisateur
1. Trouvez l'utilisateur dans le tableau
2. Cliquez sur **"Supprimer"**
3. Confirmez l'action
⚠️ **Attention** : Vous ne pouvez pas supprimer votre propre compte

### Rechercher un utilisateur
- Tapez dans le champ de recherche (pseudo ou email)
- Filtrez par rôle avec le menu déroulant

---

## 📊 Structure de la table user_profiles

```
user_profiles
├── id (UUID) - Clé primaire liée à auth.users
├── username (TEXT) - Pseudo du joueur
├── email (TEXT) - Email de l'utilisateur
├── role (user_role ENUM) - Rôle : 'utilisateur', 'membre', 'admin'
├── created_at (TIMESTAMPTZ) - Date de création du compte
└── updated_at (TIMESTAMPTZ) - Dernière modification
```

---

## 🛡️ Sécurité (RLS - Row Level Security)

Les politiques de sécurité configurées :

1. **Lecture publique** : Tout le monde peut voir les profils
2. **Modification personnelle** : Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
3. **Modification admin** : Seuls les admins peuvent modifier les rôles
4. **Suppression admin** : Seuls les admins peuvent supprimer des profils

---

## ❓ Dépannage

### Le lien Dashboard n'apparaît pas
- Vérifiez que votre rôle est bien 'admin' dans la base de données
- Déconnectez-vous et reconnectez-vous
- Videz le cache du navigateur (Ctrl+Shift+Del)

### Le pseudo ne s'affiche pas correctement
- Vérifiez que la colonne `username` existe dans `user_profiles`
- Vérifiez que votre profil a bien un username dans la base

### Erreur lors de l'exécution du SQL
- Vérifiez que la table `user_profiles` existe déjà
- Si la colonne `role` existe déjà, le script ne fera rien (c'est normal)

### Page profil affiche "Erreur"
- Vérifiez que vous êtes bien connecté
- Ouvrez la console (F12) et regardez les erreurs
- Vérifiez que votre profil existe dans `user_profiles`

---

## 📝 Commandes SQL utiles

### Voir tous les utilisateurs et leurs rôles
```sql
SELECT username, email, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
```

### Promouvoir un utilisateur en Membre
```sql
UPDATE user_profiles 
SET role = 'membre' 
WHERE email = 'utilisateur@exemple.com';
```

### Compter les utilisateurs par rôle
```sql
SELECT role, COUNT(*) as nombre
FROM user_profiles
GROUP BY role;
```

### Réinitialiser tous les rôles en Utilisateur
```sql
UPDATE user_profiles 
SET role = 'utilisateur' 
WHERE role != 'admin';
```

---

## 🎯 Prochaines étapes possibles

- [ ] Ajouter des permissions spécifiques par rôle
- [ ] Créer des pages réservées aux Membres
- [ ] Implémenter les vraies statistiques dans le profil
- [ ] Ajouter un système de badges/récompenses
- [ ] Créer un historique des modifications de rôles
- [ ] Ajouter la possibilité de bannir des utilisateurs

---

## 📞 Support

En cas de problème :
1. Vérifiez d'abord la console du navigateur (F12)
2. Vérifiez les logs de Supabase (onglet Logs)
3. Consultez ce guide

---

✅ **Le système est maintenant opérationnel !**
