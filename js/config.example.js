/* 
 * CONFIGURATION SUPABASE - EXEMPLE
 * 
 * Pour utiliser votre propre instance Supabase :
 * 
 * 1. Créez un compte sur https://supabase.com
 * 2. Créez un nouveau projet
 * 3. Copiez l'URL et la clé publique de votre projet
 * 4. Remplacez les valeurs dans supabase-loader.js :
 * 
 *    const supabaseUrl = 'https://votre-projet.supabase.co';
 *    const supabaseKey = 'votre-clé-publique-anon';
 * 
 * 5. Configurez les URLs autorisées dans Supabase :
 *    - Site URL: https://votre-username.github.io/iron-oath/
 *    - Redirect URLs: https://votre-username.github.io/iron-oath/**
 * 
 * SÉCURITÉ :
 * - Ne jamais committer vos vraies clés API
 * - Utilisez les restrictions de domaine dans Supabase
 * - La clé "anon" est sûre pour le frontend (lecture publique)
 */

// Exemple de configuration
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};