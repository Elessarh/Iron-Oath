# Chat de la Guilde - Iron Oath

## 🎉 Fonctionnalités

### Chat en Temps Réel
Un système de chat complet inspiré de Twitch pour la communication entre membres de la guilde.

## ✨ Caractéristiques

### Pour tous les membres :
- ✅ **Bouton flottant** : En bas à droite de la page
- ✅ **Chat en temps réel** : Messages instantanés via Supabase Realtime
- ✅ **Système de réponses** : Cliquez sur un message pour y répondre
- ✅ **Badge de notifications** : Affiche le nombre de nouveaux messages
- ✅ **Interface type Twitch** : Design moderne et intuitif
- ✅ **Responsive** : Fonctionne sur mobile et desktop
- ✅ **Limite de caractères** : 500 caractères par message
- ✅ **Historique** : Conserve les 500 derniers messages

### Interface :
- 💬 Bouton flottant en bas à droite
- 🔔 Badge de nouveaux messages
- 📝 Zone de saisie avec placeholder
- ↩️ Bouton "Répondre" sur chaque message
- ⏱️ Horodatage intelligent (1min, 2h, 12 Jan, etc.)
- 🎨 Messages de l'utilisateur en surbrillance
- 📱 Adaptation mobile automatique

## 📁 Structure des fichiers

```
css/components/
  └── guild-chat.css           # Styles du chat

js/
  └── guild-chat.js            # Logique du chat

pages/
  └── espace-guilde.html       # Intégration du chat

sql/
  └── create_guild_chat_table.sql  # Table de la BDD
```

## 🗄️ Base de Données

### Table `guild_chat`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique auto-incrémenté |
| user_id | UUID | ID de l'utilisateur (lié à auth.users) |
| content | TEXT | Contenu du message (1-500 caractères) |
| reply_to_message_id | BIGINT | ID du message parent (pour les réponses) |
| created_at | TIMESTAMP | Date et heure de création |
| updated_at | TIMESTAMP | Date de dernière modification |

### Politiques de sécurité (RLS)

- ✅ **Lecture** : Tous les membres de la guilde
- ✅ **Écriture** : Tous les membres de la guilde
- ✅ **Modification** : Auteur du message uniquement
- ✅ **Suppression** : Auteur ou administrateur

## 🚀 Installation

### 1. Créer la table dans Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu de `sql/create_guild_chat_table.sql`
4. Vérifiez que la table `guild_chat` a été créée

### 2. Activer Realtime

Le script SQL active automatiquement Realtime pour la table. Vérifiez dans :
- **Database** > **Replication** > `guild_chat` doit être coché

### 3. Tester

1. Connectez-vous avec un compte membre ou admin
2. Allez dans "Guilde"
3. Cliquez sur le bouton 💬 en bas à droite
4. Envoyez un message !

## 💡 Utilisation

### Envoyer un message

1. Ouvrez le chat en cliquant sur le bouton flottant 💬
2. Tapez votre message dans la zone de saisie
3. Appuyez sur Entrée ou cliquez sur ➤

### Répondre à un message

1. Survolez un message (pas le vôtre)
2. Cliquez sur "↩️ Répondre"
3. Tapez votre réponse
4. Envoyez

### Annuler une réponse

- Cliquez sur "Annuler" dans la bannière de réponse
- Ou commencez à répondre à un autre message

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `css/components/guild-chat.css` :

```css
/* Couleur principale */
background: linear-gradient(135deg, #4ecdc4, #44a3ff);

/* Couleur des messages */
border-left-color: #4ecdc4;

/* Couleur des réponses */
border-left-color: #f39c12;
```

### Changer la limite de messages

Éditez `sql/create_guild_chat_table.sql` :

```sql
-- Dans la fonction cleanup_old_chat_messages
LIMIT 500  -- Changer ce nombre
```

### Ajuster la limite de caractères

Éditez la table SQL :

```sql
CHECK (char_length(content) <= 500)  -- Changer 500
```

Et le HTML :

```html
<input maxlength="500">  <!-- Changer 500 -->
```

## 🔧 Maintenance

### Nettoyer les vieux messages

Exécutez dans Supabase SQL :

```sql
SELECT cleanup_old_chat_messages();
```

Ou créez une tâche cron automatique.

### Voir les statistiques

```sql
-- Nombre total de messages
SELECT COUNT(*) FROM guild_chat;

-- Messages par utilisateur
SELECT u.username, COUNT(c.id) as message_count
FROM guild_chat c
JOIN user_profiles u ON c.user_id = u.id
GROUP BY u.username
ORDER BY message_count DESC;

-- Messages avec réponses
SELECT COUNT(*) 
FROM guild_chat 
WHERE reply_to_message_id IS NOT NULL;
```

## 🐛 Dépannage

### Le chat ne s'affiche pas
1. Vérifiez que vous êtes connecté
2. Vérifiez que votre rôle est "membre" ou "admin"
3. Regardez la console du navigateur pour les erreurs

### Les messages ne s'affichent pas
1. Vérifiez que la table existe dans Supabase
2. Vérifiez les politiques RLS
3. Vérifiez que Realtime est activé

### Les messages ne se mettent pas à jour en temps réel
1. Vérifiez que Realtime est activé pour `guild_chat`
2. Vérifiez la connexion Internet
3. Actualisez la page

### Le bouton "Répondre" ne fonctionne pas
1. Vérifiez la console pour les erreurs JavaScript
2. Assurez-vous que `guild-chat.js` est bien chargé

## 🎯 Futures améliorations possibles

- [ ] Modification de messages
- [ ] Réactions aux messages (emojis)
- [ ] Mentions (@username)
- [ ] Recherche dans l'historique
- [ ] Partage d'images
- [ ] Messages privés
- [ ] Salons multiples
- [ ] Commandes slash (/help, /clear, etc.)
- [ ] Mode sombre/clair

## 📊 Performance

- **Optimisé** : Index sur created_at, user_id
- **Léger** : CSS < 10KB, JS < 15KB
- **Rapide** : Requêtes avec LIMIT 100
- **Temps réel** : Latence < 100ms avec Supabase Realtime

## 🔐 Sécurité

- ✅ Authentification requise
- ✅ Vérification du rôle membre/admin
- ✅ RLS (Row Level Security) activé
- ✅ Validation de la longueur des messages
- ✅ Protection XSS (escapeHtml)
- ✅ Rate limiting via Supabase

## 📱 Compatibilité

- ✅ Chrome / Edge / Firefox / Safari
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablettes

## Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Bon chat ! 💬✨**
