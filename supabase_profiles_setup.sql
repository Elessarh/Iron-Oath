-- ========================================
-- CONFIGURATION DES RÔLES UTILISATEURS
-- Table: user_profiles (existante)
-- ========================================

-- 1. Créer le type ENUM pour les rôles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('joueur', 'membre', 'admin');
    END IF;
END $$;

-- 2. Ajouter la colonne 'role' à la table user_profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN role user_role DEFAULT 'joueur';
    END IF;
END $$;

-- 3. Ajouter la colonne 'updated_at' si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Mettre à jour les utilisateurs existants sans rôle
UPDATE user_profiles 
SET role = 'joueur' 
WHERE role IS NULL;

-- 5. Activer Row Level Security (RLS) sur user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture publique des profils" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur profil" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leur profil" ON user_profiles;
DROP POLICY IF EXISTS "Admins peuvent tout modifier" ON user_profiles;
DROP POLICY IF EXISTS "Admins peuvent supprimer" ON user_profiles;

-- 7. Politique : Tous peuvent lire les profils (pour afficher les usernames)
CREATE POLICY "Lecture publique des profils"
ON user_profiles FOR SELECT
USING (true);

-- 8. Politique : Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
CREATE POLICY "Utilisateurs peuvent mettre à jour leur profil"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
);

-- 9. Politique : Seuls les admins peuvent modifier les rôles
CREATE POLICY "Admins peuvent tout modifier"
ON user_profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- 10. Politique : Seuls les admins peuvent supprimer des profils
CREATE POLICY "Admins peuvent supprimer"
ON user_profiles FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- 11. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VÉRIFICATION
-- ========================================
-- Pour vérifier que tout fonctionne :
-- SELECT id, username, email, role, created_at, updated_at FROM user_profiles;

-- ========================================
-- PROMOUVOIR UN UTILISATEUR EN ADMIN
-- ========================================
-- Remplacer 'votre-email@example.com' par votre email
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'votre-email@example.com';
