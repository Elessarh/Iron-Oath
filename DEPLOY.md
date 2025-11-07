# Guide de Déploiement GitHub Pages

## 📋 Étapes pour déployer sur GitHub

### 1. Préparer le Repository

```bash
# Initialiser Git dans votre dossier
cd "c:\Users\julie\OneDrive\Desktop\Iron-Oath"
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Iron Oath SAO Fan Site"
```

### 2. Créer le Repository GitHub

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `iron-oath` (ou le nom de votre choix)
4. **NE PAS** cocher "Initialize with README" (vous en avez déjà un)
5. Cliquez "Create repository"

### 3. Connecter et Pousser

```bash
# Ajouter l'origine GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/iron-oath.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### 4. Activer GitHub Pages

1. Dans votre repository GitHub, allez dans **Settings**
2. Scrollez jusqu'à **Pages** dans le menu latéral
3. Dans "Source", sélectionnez **"Deploy from a branch"**
4. Choisissez **"main"** branch et **"/ (root)"**
5. Cliquez **Save**

### 5. Accéder à votre Site

Votre site sera accessible à :
```
https://VOTRE-USERNAME.github.io/iron-oath/
```

⏱️ **Note**: Le déploiement peut prendre 5-10 minutes lors de la première activation.

## 🔧 Configuration Supabase pour GitHub Pages

Si vous utilisez Supabase, mettez à jour les URLs autorisées :

1. Allez dans votre projet Supabase
2. Settings → Authentication → URL Configuration
3. Ajoutez votre URL GitHub Pages dans :
   - **Site URL**: `https://VOTRE-USERNAME.github.io/iron-oath/`
   - **Redirect URLs**: `https://VOTRE-USERNAME.github.io/iron-oath/**`

## 🚀 Mises à Jour Futures

Pour mettre à jour votre site :

```bash
# Faire vos modifications...
git add .
git commit -m "Description de vos changements"
git push
```

Le site se mettra à jour automatiquement !

## 🎯 Optimisations pour GitHub Pages

✅ **Déjà configuré :**
- Fichier `.nojekyll` (évite les problèmes Jekyll)
- Structure de fichiers optimisée
- Chemins relatifs corrects
- README.md documenté

## 🔒 Sécurité

⚠️ **Important**: Ne jamais commit vos clés API Supabase !
- Utilisez les variables d'environnement
- Ou configurez les restrictions de domaine dans Supabase