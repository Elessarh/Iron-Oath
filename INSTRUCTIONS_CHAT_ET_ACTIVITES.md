# Instructions : Configuration du Chat et du Mur d'Activité

## ⚠️ ÉTAPE IMPORTANTE : Créer les tables dans Supabase

Pour que le mur d'activité et le chat fonctionnent, vous devez créer les tables dans votre base de données Supabase.

### 1. Créer la table du Mur d'Activité

**C'est pour cela que vous ne pouvez pas publier actuellement !**

1. Ouvrez Supabase : https://supabase.com
2. Allez dans votre projet Iron Oath
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**
5. Copiez-collez TOUT le contenu du fichier `sql/create_activity_wall_table.sql`
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)
7. Attendez le message de succès

### 2. Mettre à jour la table du Chat (pour les nouvelles fonctionnalités)

1. Dans Supabase SQL Editor, créez une nouvelle requête
2. Copiez-collez TOUT le contenu du fichier `sql/create_guild_chat_table.sql`
3. Cliquez sur **Run**
4. Attendez le message de succès

### 3. Vérifier le bucket de stockage

1. Dans Supabase, allez dans **Storage**
2. Vérifiez qu'un bucket nommé `iron-oath-storage` existe
3. Si ce n'est pas le cas :
   - Cliquez sur **New Bucket**
   - Nom : `iron-oath-storage`
   - **Important** : Décochez "Public bucket" pour garder le contrôle
   - Cliquez sur **Create bucket**
4. Configurez les politiques de sécurité :
   - Cliquez sur le bucket `iron-oath-storage`
   - Allez dans **Policies**
   - Ajoutez ces politiques :

```sql
-- Politique: Les membres peuvent uploader des fichiers
CREATE POLICY "Membres peuvent uploader"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'iron-oath-storage'
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('membre', 'admin')
    )
);

-- Politique: Tout le monde peut voir les fichiers
CREATE POLICY "Tout le monde peut voir"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'iron-oath-storage');

-- Politique: Les utilisateurs peuvent supprimer leurs fichiers
CREATE POLICY "Utilisateurs peuvent supprimer leurs fichiers"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'iron-oath-storage'
    AND owner = auth.uid()
);
```

---

## 🎉 Nouvelles Fonctionnalités du Chat

### 1. 📸 Envoi d'Images

- Cliquez sur le bouton **📷** à côté du champ de saisie
- Sélectionnez une image (max 5MB)
- Un aperçu s'affichera
- Vous pouvez envoyer l'image seule ou avec du texte
- Cliquez sur **✕** pour supprimer l'aperçu

**Formats acceptés :** JPG, PNG, GIF, WEBP, AVIF

### 2. 🔒 Messages Privés

- Utilisez le sélecteur en haut du chat
- Choisissez un membre de la guilde dans la liste
- Le mode privé s'active automatiquement
- Vos messages privés auront un badge 🔒
- Seuls vous et le destinataire pourrez les voir

**Pour revenir au mode public :** Sélectionnez "Message public" dans le sélecteur

### 3. 🔔 Compteur de Messages Non Lus

- Un badge rouge apparaît sur le bouton flottant du chat quand il y a de nouveaux messages
- Le nombre de messages non lus s'affiche (jusqu'à 99+)
- Le bouton pulse légèrement pour attirer l'attention
- Le compteur se réinitialise à l'ouverture du chat

### 4. ↩️ Réponses aux Messages

- Survolez un message d'un autre membre
- Cliquez sur **↩️ Répondre**
- Le message cité apparaît au-dessus de votre champ de saisie
- Votre réponse sera liée au message original
- Cliquez sur **✕** pour annuler

---

## 📋 Fonctionnalités du Mur d'Activité

### Types de Publications

1. **📢 Annonce** (orange)
   - Pour les communications importantes
   - Mises à jour, changements, etc.

2. **📅 Événement** (bleu)
   - Pour annoncer des événements
   - Raids, événements spéciaux

3. **ℹ️ Info** (vert)
   - Informations générales
   - Conseils, guides

4. **🏆 Victoire** (violet)
   - Célébrer les succès de la guilde
   - Boss vaincus, accomplissements

### Publier sur le Mur (Admins uniquement)

1. Allez dans **Admin Dashboard** → Onglet **Activités**
2. Remplissez le formulaire :
   - Titre de l'activité
   - Type (Annonce, Événement, etc.)
   - Contenu
   - Image (optionnel)
3. Cliquez sur **Publier**

### Modifier/Supprimer une Publication

- Cliquez sur **✏️ Modifier** ou **🗑️ Supprimer** sur la publication
- Seuls les admins peuvent modifier/supprimer

---

## 🐛 Résolution des Problèmes

### Le mur d'activité ne charge pas
✅ **Solution :** Exécutez `sql/create_activity_wall_table.sql` dans Supabase

### Erreur lors de l'upload d'images
✅ **Solution :** Vérifiez que le bucket `iron-oath-storage` existe et que les politiques sont configurées

### Les messages privés ne s'affichent pas
✅ **Solution :** Exécutez `sql/create_guild_chat_table.sql` pour mettre à jour la table

### Le chat ne se charge pas
✅ **Solution :** 
1. Vérifiez que vous êtes connecté
2. Vérifiez que votre rôle est "membre" ou "admin"
3. Regardez la console du navigateur (F12) pour voir les erreurs

### Les images ne s'affichent pas
✅ **Solution :**
1. Vérifiez que le bucket existe
2. Vérifiez les politiques de sécurité du bucket
3. Vérifiez que l'image n'est pas trop volumineuse (max 5MB)

---

## 📝 Notes Techniques

### Structure des Tables

**guild_activity_wall**
- id, titre, type, contenu, image_url, author_name, created_at

**guild_chat**
- id, user_id, content, image_url, reply_to_message_id, is_private, recipient_id, created_at

### Fichiers Modifiés

- ✅ `css/components/guild-chat.css` - Styles pour images et messages privés
- ✅ `js/guild-chat.js` - Logique pour images, messages privés, compteur
- ✅ `pages/espace-guilde.html` - Interface avec upload d'image et sélecteur
- ✅ `sql/create_guild_chat_table.sql` - Schéma avec nouvelles colonnes
- ✅ `sql/create_activity_wall_table.sql` - Schéma du mur d'activité

---

## 🚀 Prochaines Étapes

1. **Exécutez les fichiers SQL** dans Supabase (PRIORITÉ)
2. **Créez le bucket** de stockage si nécessaire
3. **Testez la publication** sur le mur d'activité
4. **Testez le chat** avec images et messages privés
5. **Profitez** de vos nouvelles fonctionnalités ! 🎉

---

Besoin d'aide ? Vérifiez la console du navigateur (F12) pour voir les erreurs détaillées.
