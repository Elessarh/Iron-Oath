-- MIGRATION : Ajouter les fonctionnalités images et messages privés au chat existant
-- À exécuter dans Supabase SQL Editor si la table guild_chat existe déjà

-- ============================================================================
-- ÉTAPE 1 : Ajouter les nouvelles colonnes si elles n'existent pas
-- ============================================================================

-- Ajouter la colonne image_url
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guild_chat' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE guild_chat ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà';
    END IF;
END $$;

-- Ajouter la colonne is_private
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guild_chat' AND column_name = 'is_private'
    ) THEN
        ALTER TABLE guild_chat ADD COLUMN is_private BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne is_private ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_private existe déjà';
    END IF;
END $$;

-- Ajouter la colonne recipient_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guild_chat' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE guild_chat ADD COLUMN recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonne recipient_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne recipient_id existe déjà';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2 : Modifier la contrainte sur content (permettre vide si image présente)
-- ============================================================================

-- Supprimer l'ancienne contrainte sur content
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'guild_chat' 
        AND constraint_name LIKE '%content%check%'
    ) THEN
        ALTER TABLE guild_chat DROP CONSTRAINT IF EXISTS guild_chat_content_check;
        RAISE NOTICE 'Ancienne contrainte content supprimée';
    END IF;
END $$;

-- Ajouter la nouvelle contrainte (content ou image requis)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_content_or_image'
    ) THEN
        ALTER TABLE guild_chat ADD CONSTRAINT check_content_or_image 
        CHECK (
            (char_length(content) > 0) OR (image_url IS NOT NULL)
        );
        RAISE NOTICE 'Nouvelle contrainte check_content_or_image ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte check_content_or_image existe déjà';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : Ajouter la contrainte pour les messages privés
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_private_message'
    ) THEN
        ALTER TABLE guild_chat ADD CONSTRAINT check_private_message 
        CHECK (
            (is_private = FALSE AND recipient_id IS NULL) OR
            (is_private = TRUE AND recipient_id IS NOT NULL)
        );
        RAISE NOTICE 'Contrainte check_private_message ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte check_private_message existe déjà';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 4 : Ajouter les nouveaux index
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_guild_chat_recipient ON guild_chat(recipient_id);
CREATE INDEX IF NOT EXISTS idx_guild_chat_is_private ON guild_chat(is_private);

-- ============================================================================
-- ÉTAPE 5 : Mettre à jour les politiques RLS
-- ============================================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Membres peuvent lire les messages du chat" ON guild_chat;
DROP POLICY IF EXISTS "Membres peuvent envoyer des messages" ON guild_chat;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs messages" ON guild_chat;
DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs messages" ON guild_chat;

-- Recréer les politiques avec support des messages privés
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

CREATE POLICY "Utilisateurs peuvent modifier leurs messages"
ON guild_chat
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

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

-- ============================================================================
-- ÉTAPE 6 : Afficher un résumé
-- ============================================================================

DO $$ 
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'guild_chat' 
    AND column_name IN ('image_url', 'is_private', 'recipient_id');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION TERMINÉE !';
    RAISE NOTICE 'Colonnes ajoutées : %/3', col_count;
    RAISE NOTICE '========================================';
END $$;

-- Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'guild_chat'
ORDER BY ordinal_position;
