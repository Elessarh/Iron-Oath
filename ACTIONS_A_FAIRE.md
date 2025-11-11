# ⚡ ACTIONS À FAIRE - Système de Profils et Rôles

## 🔴 URGENT - À faire MAINTENANT

### 1️⃣ Exécuter le script SQL dans Supabase
**PRIORITÉ MAXIMALE**

1. Allez sur https://app.supabase.com
2. Ouvrez votre projet Iron Oath
3. Menu : **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez TOUT le contenu de `supabase_profiles_setup.sql`
6. Cliquez sur **RUN** (Ctrl+Enter)
7. ✅ Vérifiez : "Success. No rows returned"

---

### 2️⃣ Vous promouvoir en Admin
**Après avoir exécuté le script SQL**

Remplacez `votre-email@exemple.com` par votre email réel :

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'votre-email@exemple.com';
```

Vérifiez avec :
```sql
SELECT username, email, role FROM user_profiles WHERE email = 'votre-email@exemple.com';
```

**Résultat attendu :**
```
username: Elessarh
email: votre-email@exemple.com
role: admin
```

---

### 3️⃣ Déployer sur GitHub
**Une fois le SQL exécuté**

```powershell
cd C:\Users\julie\OneDrive\Desktop\Iron-Oath
git add .
git commit -m "Ajout système de profils et rôles avec dashboard admin"
git push origin main
```

Attendez 2-3 minutes que GitHub Pages se mette à jour.

---

## ✅ Vérification - Ce que vous devriez voir

### Une fois connecté sur le site :

1. **Navigation (en haut à droite)** :
   - ✅ Lien "Dashboard" (orange) ← VISIBLE si vous êtes admin
   - ✅ Lien "Profil" (cyan) ← VISIBLE pour tous
   - ✅ Votre pseudo : "Elessarh" (pas "Joueur_julien.bernard599")
   - ✅ Bouton "Déconnexion"

2. **Page Profil** (cliquez sur "Profil") :
   - ✅ Pseudo : Elessarh
   - ✅ Email : votre email
   - ✅ Rôle : Badge doré "Administrateur"
   - ✅ Date d'inscription

3. **Dashboard Admin** (cliquez sur "Dashboard") :
   - ✅ Titre : "👑 Dashboard Administrateur"
   - ✅ 4 cartes de statistiques
   - ✅ Tableau avec tous les utilisateurs
   - ✅ Barre de recherche fonctionnelle
   - ✅ Filtre par rôle fonctionnel
   - ✅ Bouton "Modifier rôle" sur chaque utilisateur
   - ✅ Bouton "Supprimer" (sauf sur votre compte)

---

## 🚫 Problèmes possibles et solutions

### ❌ Le lien Dashboard n'apparaît pas
**Causes possibles :**
- Le script SQL n'a pas été exécuté
- Vous n'avez pas été promu admin
- Vous n'êtes pas reconnecté après la promotion

**Solutions :**
1. Vérifiez dans Supabase → Table Editor → user_profiles
2. Trouvez votre ligne, vérifiez la colonne `role`
3. Si `role` est NULL ou "utilisateur", exécutez :
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'votre@email.com';
   ```
4. Déconnectez-vous complètement du site
5. Reconnectez-vous
6. Videz le cache (Ctrl+Shift+Del)

---

### ❌ Le pseudo affiche "Joueur_julien.bernard599"
**Cause :**
- La colonne `username` est vide dans `user_profiles`

**Solution :**
```sql
UPDATE user_profiles 
SET username = 'Elessarh' 
WHERE email = 'votre@email.com';
```

---

### ❌ Erreur "Cannot read property 'role' of null"
**Cause :**
- Votre profil n'existe pas dans `user_profiles`

**Solution :**
```sql
INSERT INTO user_profiles (id, username, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'votre@email.com'),
  'Elessarh',
  'votre@email.com',
  'admin'
);
```

---

### ❌ Dashboard affiche "Accès Refusé"
**Causes :**
- Vous n'êtes pas admin
- La vérification du rôle échoue

**Solution :**
1. Ouvrez la console (F12)
2. Regardez les erreurs
3. Vérifiez votre rôle dans Supabase
4. Assurez-vous que le script SQL a bien été exécuté

---

## 🎨 Personnalisation future

### Modifier les couleurs des badges
Dans `pages/profil.html`, lignes 61-77 :
```css
.role-utilisateur {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.role-membre {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.role-admin {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
```

### Ajouter des permissions spécifiques
Modifiez `js/auth-supabase.js` pour créer des fonctions :
```javascript
function canAccessMemberArea() {
    return userProfile && (userProfile.role === 'membre' || userProfile.role === 'admin');
}

function canManageUsers() {
    return userProfile && userProfile.role === 'admin';
}
```

---

## 📊 Commandes SQL utiles

### Voir tous les utilisateurs
```sql
SELECT username, email, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
```

### Promouvoir un utilisateur
```sql
UPDATE user_profiles 
SET role = 'membre' 
WHERE username = 'PseudoDuJoueur';
```

### Rétrograder un admin
```sql
UPDATE user_profiles 
SET role = 'utilisateur' 
WHERE username = 'PseudoDuJoueur';
```

### Compter par rôle
```sql
SELECT role, COUNT(*) 
FROM user_profiles 
GROUP BY role;
```

---

## 🎯 TODO List

### Fait ✅
- [x] Script SQL de configuration
- [x] Page profil utilisateur
- [x] Dashboard admin
- [x] Gestion des rôles
- [x] Navigation dynamique
- [x] Sécurité RLS
- [x] Documentation complète

### À faire 🔲
- [ ] Exécuter le script SQL dans Supabase
- [ ] Se promouvoir en admin
- [ ] Déployer sur GitHub
- [ ] Tester la page profil
- [ ] Tester le dashboard admin
- [ ] Créer d'autres comptes de test
- [ ] Tester la modification de rôles

### Futur 🌟
- [ ] Implémenter les vraies statistiques
- [ ] Ajouter des permissions par rôle
- [ ] Créer un historique des modifications
- [ ] Système de badges/récompenses
- [ ] Pages réservées aux membres

---

## 📞 Si vous êtes bloqué

1. **Vérifiez la console du navigateur** (F12)
2. **Vérifiez les logs Supabase** (Menu Logs)
3. **Vérifiez la table user_profiles** (Table Editor)
4. **Relisez le guide** GUIDE_INSTALLATION_PROFILS_ROLES.md

---

## 🎉 Une fois que tout fonctionne

Vous pourrez :
- ✅ Voir votre profil avec votre vrai pseudo
- ✅ Accéder au dashboard admin
- ✅ Gérer les rôles de tous les utilisateurs
- ✅ Supprimer des comptes indésirables
- ✅ Voir les statistiques en temps réel

**Le système est prêt à l'emploi !**
