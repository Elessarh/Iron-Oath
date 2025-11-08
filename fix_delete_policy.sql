-- Script SQL pour ajouter la politique de suppression manquante
-- À exécuter dans l'éditeur SQL de Supabase

-- Politique pour supprimer ses propres messages (reçus ou envoyés)
CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (
        auth.uid() = sender_id OR auth.uid() = recipient_id
    );

-- Vérifier toutes les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'messages';