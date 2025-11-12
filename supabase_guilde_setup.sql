-- ========================================
-- TABLES POUR L'ESPACE GUILDE IRON OATH
-- ========================================

-- Table pour les plannings de la guilde
CREATE TABLE IF NOT EXISTS guild_planning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_event TIMESTAMPTZ NOT NULL,
    type_event VARCHAR(50) DEFAULT 'reunion', -- 'reunion', 'raid', 'event', 'pvp', etc.
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les objectifs hebdomadaires
CREATE TABLE IF NOT EXISTS guild_objectives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    semaine_numero INT NOT NULL, -- Numéro de la semaine dans l'année
    annee INT NOT NULL,
    statut VARCHAR(50) DEFAULT 'en_cours', -- 'en_cours', 'termine', 'abandonne'
    progression INT DEFAULT 0, -- Pourcentage de progression (0-100)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour l'appel quotidien (présence des membres)
CREATE TABLE IF NOT EXISTS guild_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date_presence DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'en_mission'
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date_presence) -- Un seul appel par jour par utilisateur
);

-- ========================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE guild_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_presence ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Les membres peuvent voir les plannings" ON guild_planning;
DROP POLICY IF EXISTS "Les admins peuvent créer des plannings" ON guild_planning;
DROP POLICY IF EXISTS "Les admins peuvent modifier des plannings" ON guild_planning;
DROP POLICY IF EXISTS "Les admins peuvent supprimer des plannings" ON guild_planning;

DROP POLICY IF EXISTS "Les membres peuvent voir les objectifs" ON guild_objectives;
DROP POLICY IF EXISTS "Les admins peuvent gérer les objectifs" ON guild_objectives;

DROP POLICY IF EXISTS "Les membres peuvent voir les présences" ON guild_presence;
DROP POLICY IF EXISTS "Les membres peuvent marquer leur présence" ON guild_presence;
DROP POLICY IF EXISTS "Les membres peuvent modifier leur présence" ON guild_presence;
DROP POLICY IF EXISTS "Les admins peuvent gérer toutes les présences" ON guild_presence;

-- Politiques pour guild_planning
-- Lecture : Tous les membres peuvent voir
CREATE POLICY "Les membres peuvent voir les plannings"
    ON guild_planning FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('membre', 'admin')
        )
    );

-- Création/Modification : Seulement les admins
CREATE POLICY "Les admins peuvent créer des plannings"
    ON guild_planning FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Les admins peuvent modifier des plannings"
    ON guild_planning FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Les admins peuvent supprimer des plannings"
    ON guild_planning FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Politiques pour guild_objectives
CREATE POLICY "Les membres peuvent voir les objectifs"
    ON guild_objectives FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('membre', 'admin')
        )
    );

CREATE POLICY "Les admins peuvent gérer les objectifs"
    ON guild_objectives FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Politiques pour guild_presence
-- Lecture : Tous les membres peuvent voir toutes les présences
CREATE POLICY "Les membres peuvent voir les présences"
    ON guild_presence FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('membre', 'admin')
        )
    );

-- Les membres peuvent marquer leur propre présence
CREATE POLICY "Les membres peuvent marquer leur présence"
    ON guild_presence FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('membre', 'admin')
        )
    );

-- Les membres peuvent modifier leur propre présence du jour
CREATE POLICY "Les membres peuvent modifier leur présence"
    ON guild_presence FOR UPDATE
    USING (
        auth.uid() = user_id
        AND date_presence = CURRENT_DATE
    );

-- Les admins peuvent tout gérer
CREATE POLICY "Les admins peuvent gérer toutes les présences"
    ON guild_presence FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- ========================================
-- INDEX POUR OPTIMISATION
-- ========================================

CREATE INDEX IF NOT EXISTS idx_planning_date ON guild_planning(date_event);
CREATE INDEX IF NOT EXISTS idx_objectives_semaine ON guild_objectives(annee, semaine_numero);
CREATE INDEX IF NOT EXISTS idx_presence_date ON guild_presence(date_presence);
CREATE INDEX IF NOT EXISTS idx_presence_user ON guild_presence(user_id);

-- ========================================
-- FONCTION POUR OBTENIR LE NUMÉRO DE SEMAINE
-- ========================================

CREATE OR REPLACE FUNCTION get_current_week()
RETURNS TABLE(week_number INT, year_number INT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(WEEK FROM CURRENT_DATE)::INT AS week_number,
        EXTRACT(YEAR FROM CURRENT_DATE)::INT AS year_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FONCTION POUR MARQUER LES ABSENCES AUTOMATIQUES
-- ========================================
-- Cette fonction marque comme "absent" tous les membres qui n'ont pas marqué leur présence
CREATE OR REPLACE FUNCTION mark_automatic_absences()
RETURNS void AS $$
BEGIN
    -- Insérer une absence pour chaque membre/admin qui n'a pas encore marqué sa présence aujourd'hui
    INSERT INTO guild_presence (user_id, date_presence, statut, commentaire)
    SELECT 
        up.id,
        CURRENT_DATE,
        'absent',
        'Absence automatique - non marque'
    FROM user_profiles up
    WHERE up.role IN ('membre', 'admin')
    AND NOT EXISTS (
        SELECT 1 FROM guild_presence gp
        WHERE gp.user_id = up.id
        AND gp.date_presence = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FONCTION POUR OBTENIR LES STATISTIQUES DE PRÉSENCE
-- ========================================
CREATE OR REPLACE FUNCTION get_presence_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    total_membres BIGINT,
    presents BIGINT,
    absents BIGINT,
    en_mission BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE up.role IN ('membre', 'admin')) as total_membres,
        COUNT(*) FILTER (WHERE gp.statut = 'present') as presents,
        COUNT(*) FILTER (WHERE gp.statut = 'absent') as absents,
        COUNT(*) FILTER (WHERE gp.statut = 'en_mission') as en_mission
    FROM user_profiles up
    LEFT JOIN guild_presence gp ON up.id = gp.user_id AND gp.date_presence = target_date
    WHERE up.role IN ('membre', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

