/* supabase-loader.js - Chargement conditionnel de Supabase */

// Fonction pour charger Supabase seulement si nécessaire
async function loadSupabaseConditionally() {
    try {
        // Configuration Supabase - À configurer selon votre environnement
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        
        // Vérifier si la configuration est valide
        if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
            console.log('⚠️ Supabase non configuré - Mode localStorage uniquement');
            window.supabase = null;
            return false;
        }
        
        // Essayer de charger le module Supabase
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        window.supabase = supabase;
        
        console.log('✅ Supabase chargé avec succès');
        return true;
    } catch (error) {
        console.log('⚠️ Supabase non disponible - Mode localStorage uniquement');
        window.supabase = null;
        return false;
    }
}

// Charger Supabase au démarrage
loadSupabaseConditionally().then(() => {
    // Charger ensuite le système d'authentification si disponible
    if (window.supabase) {
        const script = document.createElement('script');
        script.src = '../js/supabase-config.js';
        script.type = 'module';
        document.head.appendChild(script);
    } else {
        // Créer un auth factice pour compatibilité
        window.ironOathAuth = {
            isLoggedIn: () => false,
            isAdmin: () => false,
            currentUser: null,
            username: 'Invité',
            userRole: 'guest'
        };
    }
});