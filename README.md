# Iron Oath - Sword Art Online Fan Site

Un site web interactif dédié à l'univers de Sword Art Online, offrant une expérience immersive d'Aincrad.

## 🚀 Démarrage Rapide

### Test en local

1. **Démarrer le serveur web :**
```bash
python -m http.server 8080
```

2. **Ouvrir la carte :** http://localhost:8080/pages/map.html

### Déploiement sur GitHub Pages

Voir le guide complet : **[DEPLOY.md](DEPLOY.md)**

En résumé :
1. Créer un repository public sur GitHub
2. Uploader tous vos fichiers
3. Activer GitHub Pages dans Settings > Pages

## ✨ Fonctionnalités

### 🗺️ Carte Interactive

- **Carte sphérique 5000x5000** avec votre carte personnalisée

### ⚔️ Système de Quêtes- **Limites de déplacement** - Impossible de sortir trop loin du cadre

- Guide complet des quêtes du Palier 1- **Zoom de 1 à 6 niveaux**

- Navigation intégrée entre quêtes et carte- **Mode plein écran** fonctionnel (sans bug)

- Progression détaillée étape par étape

### 📍 Système de Marqueurs

### 🔐 Authentification- **Éditeur visuel** avec vraies icônes des assets

- Système de connexion/inscription- **5 types de marqueurs :**

- Gestion des profils utilisateurs  - 🏙️ Ville (Ville.png)

- Intégration Supabase  - 🏛️ Donjon (Donjon.png) 

  - 🎯 Quête (Quête.png)

## 🚀 Technologies Utilisées  - ⚔️ Monstre/Boss (Monstre.png)

  - 🛒 Marchand (Marchand.png)

- **Frontend**: HTML5, CSS3, JavaScript ES6+

- **Cartographie**: Leaflet.js### 💾 Stockage Local Simple

- **Backend**: Supabase- **Sauvegarde localStorage** : vos marqueurs persistent

- **Hébergement**: GitHub Pages- **Pas de configuration** : fonctionne immédiatement

- **Fiable et simple** : aucune dépendance externe

## 📁 Structure du Projet

### 🎨 Interface SAO

```- **Design futuriste** avec effets de transparence

iron-oath/- **Animations fluides**

├── assets/               # Images et ressources- **Police Orbitron** pour le style SAO

│   ├── items/           # Icônes d'objets- **Dégradés et effets lumineux**

│   ├── map_assets/      # Icônes de carte

│   └── carte.png        # Image principale de la carte## 🛠️ Utilisation

├── css/                 # Styles CSS

│   ├── style.css        # Styles principaux### Créer un Marqueur

│   └── components/      # Styles par composant1. Cliquez sur **"✏️ Mode Éditeur"**

├── js/                  # Scripts JavaScript2. Sélectionnez le **type de marqueur** (avec vraies icônes)

├── pages/               # Pages HTML3. **Cliquez sur la carte** où vous voulez placer le marqueur

└── index.html           # Page d'accueil4. Remplissez le **nom** et la **description**

```5. Cliquez **"💾 Sauvegarder"**



## 🎮 Utilisation### Stockage des Marqueurs

- Les marqueurs sont **sauvegardés localement** dans votre navigateur

1. Visitez le site web- **Persistants** : restent même après fermeture/réouverture

2. Explorez les différentes sections via la navigation- **Simples** : aucune configuration requise

3. Créez un compte pour accéder aux fonctionnalités avancées

4. Naviguez sur la carte d'Aincrad## 🔧 Architecture Technique

5. Consultez le bestiaire et les objets

6. Suivez votre progression dans les quêtes### Frontend

- **Leaflet.js** avec système de coordonnées sphérique (EPSG:3857)

## 🔧 Installation en Local- **JavaScript ES6+** avec async/await

- **CSS avancé** avec backdrop-filter et animations

1. Clonez le repository- **Responsive design** adaptatif

2. Ouvrez `index.html` dans un navigateur

3. Ou utilisez un serveur local :### Stockage

   ```bash- **localStorage** uniquement : simple et fiable

   python -m http.server 8000- **Pas de serveur** nécessaire

   ```- **Compatible GitHub Pages** : déploiement gratuit

4. Accédez à `http://localhost:8000`

### Assets

## 🤝 Contribution- Tous les fichiers PNG des marqueurs dans `/assets/map_assets/`

- Carte principale : `/assets/carte.png` (5000x5000)

Ce projet est un fan site non-commercial dédié à l'univers de Sword Art Online.

## 📁 Structure du Projet

## 📝 Licence```

Iron-Oath/

Ce projet est à des fins éducatives et de divertissement uniquement. Sword Art Online appartient à ses créateurs originaux.├── pages/

│   └── map.html          # Page de la carte

---├── js/

│   └── map.js           # Logique principale de la carte

**⚔️ Que votre lame reste affûtée, aventuriers d'Aincrad ! ⚔️**├── css/
│   └── components/
│       └── map.css      # Styles de la carte
├── assets/
│   ├── carte.png        # Carte principale 5000x5000
│   └── map_assets/      # Icônes des marqueurs
├── data/
│   └── markers.json     # Stockage des marqueurs (généré automatiquement)
├── server.js            # Serveur de synchronisation Node.js
├── package.json         # Dépendances Node.js
└── README.md           # Ce fichier
```

## 🎯 Prochaines Améliorations Possibles
- [ ] Base de données (PostgreSQL/MySQL) au lieu de JSON
- [ ] Authentification utilisateur
- [ ] Permissions de modification des marqueurs
- [ ] Historique des modifications
- [ ] Chat en temps réel sur la carte
- [ ] Filtres avancés des marqueurs
- [ ] Import/Export des marqueurs