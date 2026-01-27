-- Création de la table pour le mur d'activité de la guilde
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table si elle existe déjà (ATTENTION: supprime les données)
-- DROP TABLE IF EXISTS guild_activity_wall CASCADE;

-- Créer la table
CREATE TABLE IF NOT EXISTS guild_activity_wall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titre TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('annonce', 'evenement', 'info', 'victoire')),
    contenu TEXT NOT NULL,
    image_url TEXT,
    author_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances de tri
CREATE INDEX IF NOT EXISTS idx_activity_wall_created_at ON guild_activity_wall(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_wall_type ON guild_activity_wall(type);

-- Politique RLS (Row Level Security)
ALTER TABLE guild_activity_wall ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire (authentifié)
CREATE POLICY "Membres peuvent lire les activités"
ON guild_activity_wall
FOR SELECT
TO authenticated
USING (true);

-- Politique: Seuls les admins peuvent créer
CREATE POLICY "Admins peuvent créer des activités"
ON guild_activity_wall
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Politique: Seuls les admins peuvent modifier
CREATE POLICY "Admins peuvent modifier des activités"
ON guild_activity_wall
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Politique: Seuls les admins peuvent supprimer
CREATE POLICY "Admins peuvent supprimer des activités"
ON guild_activity_wall
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_activity_wall_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_activity_wall_updated_at_trigger ON guild_activity_wall;
CREATE TRIGGER update_activity_wall_updated_at_trigger
BEFORE UPDATE ON guild_activity_wall
FOR EACH ROW
EXECUTE FUNCTION update_activity_wall_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE guild_activity_wall IS 'Stocke les publications du mur d''activité de la guilde, visible par tous les membres mais modifiable uniquement par les admins';
COMMENT ON COLUMN guild_activity_wall.titre IS 'Titre de la publication';
COMMENT ON COLUMN guild_activity_wall.type IS 'Type de publication: annonce, evenement, info, victoire';
COMMENT ON COLUMN guild_activity_wall.contenu IS 'Contenu/description de la publication';
COMMENT ON COLUMN guild_activity_wall.image_url IS 'URL optionnelle d''une image associée';
COMMENT ON COLUMN guild_activity_wall.author_name IS 'Nom de l''auteur (admin) de la publication';

-- Insérer des exemples de données (optionnel)
INSERT INTO guild_activity_wall (titre, type, contenu, author_name) VALUES
('Bienvenue sur le mur d''activité !', 'annonce', 'Ce nouveau mur vous permet de rester informés de toutes les actualités de la guilde. Les administrateurs y publieront régulièrement des annonces, des événements et nos victoires !', 'Admin'),
('Raid hebdomadaire', 'evenement', 'N''oubliez pas notre raid hebdomadaire ce samedi à 20h ! Venez nombreux, on compte sur vous pour conquérir le donjon de la Forêt Éternelle.', 'Admin'),
('Victoire épique !', 'victoire', '🎉 Félicitations à toute l''équipe ! Nous avons vaincu le Boss Final du Donjon des Ombres hier soir après 3 heures de combat acharné. Un grand bravo à tous les participants !', 'Admin');
