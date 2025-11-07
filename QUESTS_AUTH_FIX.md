# Résolution du problème du bouton de déconnexion manquant

## Problème identifié
La page des quêtes (`pages/quetes.html`) n'affichait pas le bouton de déconnexion car le script d'authentification `auth-supabase.js` n'était pas inclus.

## Solution appliquée
✅ Ajout du script d'authentification dans `pages/quetes.html` :
```html
<!-- Script d'authentification Supabase -->
<script type="module" src="../js/auth-supabase.js"></script>
```

## Vérification des autres pages
✅ Toutes les pages incluent maintenant le script d'authentification :
- `index.html` → `js/auth-supabase.js`
- `pages/connexion.html` → `../js/auth-supabase.js`  
- `pages/map.html` → `../js/auth-supabase.js`
- `pages/bestiaire.html` → `../js/auth-supabase.js`
- `pages/items.html` → `../js/auth-supabase.js`
- `pages/hdv.html` → `../js/auth-supabase.js`
- `pages/quetes.html` → `../js/auth-supabase.js` ✨ **AJOUTÉ**

## Structure HTML confirmée
La page des quêtes contient bien les éléments d'authentification :
```html
<div class="nav-connexion">
    <span id="user-info" class="user-info" style="display: none;">
        <span id="username"></span>
        <button id="logout-btn" class="logout-btn">Déconnexion</button>
    </span>
    <a href="connexion.html" class="nav-link connexion-link" id="login-link">Connexion</a>
</div>
```

## Test
1. Ouvrir http://localhost:8000/pages/quetes.html
2. Se connecter
3. Vérifier que les infos utilisateur s'affichent avec le bouton "Déconnexion"
4. Tester la déconnexion

## Résultat attendu
✅ Bouton de déconnexion maintenant visible dans l'onglet Quêtes quand connecté
✅ Comportement cohérent avec toutes les autres pages