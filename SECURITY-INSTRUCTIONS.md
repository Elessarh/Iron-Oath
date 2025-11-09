# 🔒 INSTRUCTIONS DE SÉCURITÉ - IRON OATH

## ⚠️ PROBLÈME CRITIQUE RÉSOLU

Les clés Supabase étaient exposées dans le code source côté client. Voici ce qui a été fait :

### 🚫 Clés supprimées du code public :
- `SUPABASE_URL` : `https://zhbuwwvafbrrxpsupebt.supabase.co`
- `SUPABASE_ANON_KEY` : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ✅ Actions de sécurisation effectuées :

1. **Suppression des clés sensibles** dans `js/auth-supabase.js`
2. **Création d'un système de configuration sécurisé** dans `js/config.js`
3. **Messages d'erreur explicites** pour configuration manquante
4. **Audit complet** des autres fichiers (aucune autre exposition détectée)

## 🔧 CONFIGURATION REQUISE

### Pour la production :
1. **Régénérer les clés Supabase** (les anciennes sont compromises)
2. **Configurer côté serveur** ou via variables d'environnement
3. **Ne jamais commiter** les vraies clés dans le code source

### Variables d'environnement recommandées :
```bash
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
```

### Configuration côté serveur :
```javascript
// Injecter via le serveur
window.SUPABASE_URL = process.env.SUPABASE_URL;
window.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```

## 🛡️ BONNES PRATIQUES DE SÉCURITÉ

### ✅ À FAIRE :
- Utiliser des variables d'environnement
- Configurer côté serveur
- Régénérer les clés compromises
- Auditer régulièrement le code
- Utiliser .gitignore pour les fichiers de config

### ❌ À ÉVITER :
- Clés dans le code source
- Clés dans les commits Git
- Partage de clés par email/chat
- Clés en commentaires
- Clés dans les images/screenshots

## 📋 CHECKLIST IMMÉDIATE

- [ ] Régénérer les clés Supabase
- [ ] Configurer les nouvelles clés côté serveur
- [ ] Vérifier que l'ancien code ne contient plus de clés
- [ ] Tester le système avec la nouvelle configuration
- [ ] Documenter le processus pour l'équipe

## 🔍 MONITORING CONTINU

Vérifiez régulièrement :
- Aucune clé dans le code source
- Configuration sécurisée en production
- Logs d'accès pour détecter une utilisation malveillante
- Rotation périodique des clés

---

**⚠️ IMPORTANT** : Ce fichier contient des informations sensibles et ne doit pas être partagé publiquement.