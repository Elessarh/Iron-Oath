-- Création de la table pour le chat de la guilde
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table
CREATE TABLE IF NOT EXISTS guild_chat (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
    image_url TEXT,
    reply_to_message_id BIGINT REFERENCES guild_chat(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT FALSE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_private_message CHECK (
        (is_private = FALSE AND recipient_id IS NULL) OR
        (is_private = TRUE AND recipient_id IS NOT NULL)
    )
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_guild_chat_created_at ON guild_chat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guild_chat_user_id ON guild_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_chat_reply_to ON guild_chat(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_guild_chat_recipient ON guild_chat(recipient_id);
CREATE INDEX IF NOT EXISTS idx_guild_chat_is_private ON guild_chat(is_private);

-- Politique RLS (Row Level Security)
ALTER TABLE guild_chat ENABLE ROW LEVEL SECURITY;

-- Politique: Les membres peuvent lire tous les messages publics ou leurs messages privés
CREATE POLICY "Membres peuvent lire les messages du chat"
ON guild_chat
FOR SELECT
TO authenticated
USING (
    (
        is_private = FALSE
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('membre', 'admin')
        )
    )
    OR
    (
        is_private = TRUE
        AND (user_id = auth.uid() OR recipient_id = auth.uid())
    )
);

-- Politique: Les membres peuvent créer des messages
CREATE POLICY "Membres peuvent envoyer des messages"
ON guild_chat
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('membre', 'admin')
    )
);

-- Politique: Les utilisateurs peuvent modifier leurs propres messages (optionnel)
CREATE POLICY "Utilisateurs peuvent modifier leurs messages"
ON guild_chat
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Politique: Les utilisateurs peuvent supprimer leurs propres messages, les admins peuvent tout supprimer
CREATE POLICY "Utilisateurs peuvent supprimer leurs messages"
ON guild_chat
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_guild_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_guild_chat_updated_at_trigger ON guild_chat;
CREATE TRIGGER update_guild_chat_updated_at_trigger
BEFORE UPDATE ON guild_chat
FOR EACH ROW
EXECUTE FUNCTION update_guild_chat_updated_at();

-- Fonction pour nettoyer les vieux messages (garder les 500 derniers)
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM guild_chat
    WHERE id NOT IN (
        SELECT id FROM guild_chat
        ORDER BY created_at DESC
        LIMIT 500
    );
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE guild_chat IS 'Stocke les messages du chat de la guilde, visible par tous les membres';
COMMENT ON COLUMN guild_chat.user_id IS 'ID de l''utilisateur qui a envoyé le message';
COMMENT ON COLUMN guild_chat.content IS 'Contenu du message (max 500 caractères)';
COMMENT ON COLUMN guild_chat.image_url IS 'URL de l''image jointe (optionnel)';
COMMENT ON COLUMN guild_chat.reply_to_message_id IS 'ID du message auquel on répond (optionnel)';
COMMENT ON COLUMN guild_chat.is_private IS 'Indique si le message est privé';
COMMENT ON COLUMN guild_chat.recipient_id IS 'ID du destinataire pour les messages privés';
COMMENT ON COLUMN guild_chat.created_at IS 'Date et heure de création du message';
COMMENT ON COLUMN guild_chat.updated_at IS 'Date et heure de dernière modification';

-- Activer Realtime pour les nouveaux messages
ALTER PUBLICATION supabase_realtime ADD TABLE guild_chat;

-- Insérer un message de bienvenue (optionnel)
INSERT INTO guild_chat (user_id, content)
SELECT id, '👋 Bienvenue dans le chat de la guilde Iron Oath ! Ici vous pouvez communiquer avec tous les membres en temps réel.'
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;
