# 📱 Guide de Test Mobile - Iron Oath

## ✅ Corrections Appliquées

### 1. Navigation Mobile Complète
- ✅ Hamburger menu ajouté sur toutes les pages
- ✅ Script navbar-mobile.js chargé partout
- ✅ CSS responsive avec !important pour forcer les styles
- ✅ Menu coulissant avec animation fluide
- ✅ Overlay sombre pour fermer le menu

### 2. Fichiers Modifiés
```
✅ css/style.css - Styles responsive renforcés avec !important
✅ index.html - Script navbar-mobile.js ajouté
✅ pages/connexion.html - Script navbar-mobile.js ajouté
✅ pages/quetes.html - Script navbar-mobile.js ajouté
✅ pages/espace-guilde.html - Déjà présent ✅
✅ pages/profil.html - Déjà présent ✅
✅ pages/map.html - Déjà présent ✅
✅ pages/items.html - Déjà présent ✅
✅ pages/hdv.html - Déjà présent ✅
✅ pages/bestiaire.html - Déjà présent ✅
```

---

## 🔍 Comment Tester sur Mobile

### Étape 1: Vider le Cache du Navigateur
**TRÈS IMPORTANT!** Le navigateur mobile garde les anciens fichiers CSS/JS en cache.

#### Sur Android (Chrome/Firefox):
1. Ouvrir le site sur votre téléphone
2. Appuyer sur les **3 points** en haut à droite
3. Aller dans **Paramètres** > **Confidentialité**
4. Cliquer sur **Effacer les données de navigation**
5. Cocher **Images et fichiers en cache**
6. Cliquer sur **Effacer les données**

#### Sur iPhone (Safari):
1. Aller dans **Réglages** > **Safari**
2. Descendre et cliquer sur **Effacer historique et données**
3. Confirmer

#### Alternative Rapide:
- Ouvrir le site en **mode navigation privée**
- Cela force le navigateur à recharger tous les fichiers

---

### Étape 2: Vérifier la Navigation

#### Ce que vous devriez voir:
1. **En haut à droite**: Un bouton hamburger (☰) avec 3 barres cyan
2. **Navbar compacte**: Seulement ~55px de hauteur
3. **Logo à gauche**: "Iron Oath"
4. **Bouton connexion**: Au centre

#### Au clic sur le hamburger:
1. Menu coulisse de gauche à droite
2. Fond sombre apparaît derrière
3. Liste des liens en colonne:
   - Accueil
   - Profil  
   - Guilde
   - Map
   - Items
   - etc.

#### Pour fermer le menu:
- Cliquer sur le hamburger (il tourne en X)
- Ou cliquer sur la zone sombre
- Ou appuyer sur ESC (clavier)
- Ou cliquer sur un lien

---

### Étape 3: Page de Test

J'ai créé une page de test spéciale: **test-mobile.html**

Pour l'utiliser:
1. Ouvrir `test-mobile.html` sur votre téléphone
2. Cette page affiche des informations de debug:
   - Largeur de l'écran
   - Si le hamburger est visible
   - Si le menu est actif

Cette page vous aide à vérifier que tout fonctionne correctement.

---

## 🎨 Fonctionnalités du Menu Mobile

### Animations
- **Menu**: Glisse depuis la gauche (translateX)
- **Hamburger**: Les 3 barres tournent pour former un X
- **Overlay**: Fond sombre avec flou

### Auto-Hide Navbar
- La navbar se cache automatiquement quand vous scrollez vers le bas
- Elle réapparaît quand vous scrollez vers le haut
- Cela libère de l'espace d'écran

### Responsive Design
- **Mobile (< 768px)**: Menu hamburger
- **Tablette (768px - 1200px)**: Navbar réduite
- **Desktop (> 1200px)**: Navbar complète

---

## 🐛 Résolution de Problèmes

### Le hamburger ne s'affiche pas
**Cause probable**: Cache du navigateur
**Solution**: 
1. Vider le cache (voir Étape 1)
2. Recharger la page (tirer vers le bas)
3. Fermer et rouvrir le navigateur

### Le menu ne s'ouvre pas au clic
**Vérification**:
1. Ouvrir la console mobile:
   - Chrome Android: Menu > Outils > Console
   - Safari iOS: Connecter à un Mac avec Safari > Développement
2. Vérifier s'il y a des erreurs JavaScript

### La navbar prend toujours tout l'écran
**Solutions**:
1. Vérifier que vous êtes bien en mode portrait
2. Vérifier la largeur d'écran dans test-mobile.html
3. Forcer le rechargement: Maintenez le bouton de rafraîchissement

### Le site semble identique à avant
**Action CRITIQUE**:
1. **Vider complètement le cache** (voir Étape 1)
2. Ou utiliser la **navigation privée**
3. Les navigateurs mobiles gardent TRÈS longtemps les fichiers en cache

---

## 📊 Breakpoints Responsive

```css
/* Très petits téléphones */
@media (max-width: 320px)
  - Navbar: 50px
  - Font: 0.7rem

/* Smartphones */  
@media (max-width: 480px)
  - Navbar: 50px
  - Hamburger visible
  - Menu en colonne

/* Tablettes */
@media (max-width: 768px)
  - Navbar: 55px
  - Hamburger visible
  - Menu plein écran

/* Desktop */
@media (min-width: 769px)
  - Navbar: 80px
  - Hamburger caché
  - Menu horizontal
```

---

## ✨ Améliorations Appliquées

### CSS
- Utilisation de `!important` pour forcer les styles mobiles
- Spécificité élevée avec `body .nav-menu`
- Transitions fluides (0.3s ease-in-out)
- Z-index corrects (menu: 1000, overlay: 999, hamburger: 1001)

### JavaScript
- Classe `MobileNavbar` complète
- Gestion des événements (click, scroll, resize, keydown)
- Création dynamique de l'overlay
- Désactivation du scroll du body quand menu ouvert
- Auto-fermeture au clic sur un lien

### Accessibilité
- Fermeture avec ESC
- Fermeture avec overlay
- Animations désactivables
- Focus management

---

## 📝 Fichiers Importants

```
css/style.css - Styles responsive principaux
js/navbar-mobile.js - Logique du menu mobile
test-mobile.html - Page de test et debug
```

---

## 🚀 Prochaines Étapes

1. **VIDER LE CACHE** de votre navigateur mobile
2. Ouvrir le site en navigation privée
3. Tester sur test-mobile.html
4. Vérifier que le hamburger est visible
5. Cliquer dessus pour ouvrir le menu
6. Naviguer sur les différentes pages

---

**IMPORTANT**: Si vous ne voyez toujours AUCUN changement après avoir vidé le cache, cela signifie probablement que:
- Le serveur ne sert pas les nouveaux fichiers
- Le cache côté serveur n'a pas été vidé
- Les fichiers CSS/JS ne sont pas rechargés

Dans ce cas, essayez d'ajouter `?v=2` à la fin de la ligne CSS dans les fichiers HTML:
```html
<link rel="stylesheet" href="css/style.css?v=2">
```

Cela force le navigateur à recharger le fichier CSS.
