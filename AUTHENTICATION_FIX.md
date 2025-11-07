# Correction du problème d'authentification UI

## Problème identifié
Le bouton "Connexion" restait visible même quand l'utilisateur était connecté.

## Corrections apportées

### 1. Fonction checkAuthState améliorée (js/auth-supabase.js)
- Ajout de gestion explicite des propriétés `display` CSS
- Gestion des classes CSS `show` et `js-visible`
- Logique claire : connecté → masquer bouton connexion, afficher info user
- Logique claire : non connecté → afficher bouton connexion, masquer info user

### 2. Scripts anti-flash corrigés (toutes les pages HTML)
**AVANT** : Masquage de TOUS les éléments par défaut
```javascript
// Masquer tous les éléments par défaut - le système auth les activera
if (loginLink) {
    loginLink.style.display = 'none';
    // ... masquage du bouton connexion
}
if (userInfo) {
    userInfo.style.display = 'none';
    // ... masquage des infos user
}
```

**APRÈS** : Masquage seulement des infos utilisateur
```javascript
// Masquer les infos utilisateur par défaut - elles ne s'affichent que si connecté
if (userInfo) {
    userInfo.style.display = 'none';
    // ... masquage des infos user uniquement
}

// Le bouton de connexion reste visible par défaut
// Il sera masqué par checkAuthState() si l'utilisateur est connecté
```

### 3. CSS de support (css/style.css)
Styles appropriés pour gérer les transitions d'état :
```css
/* Info utilisateur masquée par défaut */
body .nav-connexion .user-info {
    opacity: 0 !important;
    visibility: hidden !important;
    display: none !important;
}

/* Affichage quand activé */
body .nav-connexion .user-info.show,
body .nav-connexion .user-info.js-visible {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
}
```

## Test
1. Ouvrir http://localhost:8000
2. Vérifier que le bouton "Connexion" est visible par défaut
3. Se connecter avec un compte existant
4. Vérifier que le bouton "Connexion" disparaît
5. Vérifier que les infos utilisateur (nom + déconnexion) apparaissent
6. Tester la déconnexion
7. Vérifier le retour à l'état initial (bouton connexion visible)

## Résultat attendu
✅ Bouton "Connexion" visible uniquement quand non connecté
✅ Infos utilisateur visibles uniquement quand connecté  
✅ Transition fluide entre les états
✅ Aucun "flash" d'éléments lors du chargement