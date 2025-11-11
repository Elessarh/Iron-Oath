/* profil.js - Gestion de la page profil utilisateur */

let currentUser = null;
let userProfile = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Initialisation de la page profil...');
    
    // Attendre que auth-supabase.js soit chargé
    await waitForAuth();
    
    // Charger le profil
    await loadUserProfile();
});

// Attendre que l'authentification soit prête
function waitForAuth() {
    return new Promise((resolve) => {
        const checkAuth = setInterval(() => {
            if (typeof supabase !== 'undefined' && supabase !== null) {
                clearInterval(checkAuth);
                resolve();
            }
        }, 100);
        
        // Timeout après 10 secondes
        setTimeout(() => {
            clearInterval(checkAuth);
            resolve();
        }, 10000);
    });
}

// Charger le profil de l'utilisateur connecté
async function loadUserProfile() {
    try {
        // Vérifier la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error('❌ Pas de session active');
            showError('Vous devez être connecté pour voir votre profil.');
            setTimeout(() => {
                window.location.href = 'connexion.html';
            }, 2000);
            return;
        }
        
        currentUser = session.user;
        console.log('✅ Utilisateur connecté:', currentUser.email);
        
        // Récupérer le profil depuis user_profiles
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error) {
            console.error('❌ Erreur chargement profil:', error);
            showError('Impossible de charger votre profil. Veuillez réessayer.');
            return;
        }
        
        if (!profile) {
            console.error('❌ Profil introuvable');
            showError('Votre profil n\'existe pas encore. Contactez un administrateur.');
            return;
        }
        
        userProfile = profile;
        console.log('✅ Profil chargé:', profile);
        
        // Afficher le profil
        displayProfile(profile);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        showError('Une erreur technique est survenue.');
    }
}

// Afficher le profil dans l'interface
function displayProfile(profile) {
    // Masquer le loading
    document.getElementById('loading').style.display = 'none';
    
    // Afficher le contenu
    document.getElementById('profil-content').style.display = 'block';
    
    // Remplir les informations
    document.getElementById('profile-username').textContent = profile.username || 'Inconnu';
    document.getElementById('profile-email').textContent = currentUser.email || 'Inconnu';
    
    // Afficher le rôle avec le bon badge
    const roleBadge = document.getElementById('profile-role');
    const role = profile.role || 'utilisateur';
    
    roleBadge.textContent = getRoleLabel(role);
    roleBadge.className = 'role-badge role-' + role;
    
    // Formater la date de création
    if (profile.created_at) {
        const date = new Date(profile.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('profile-created').textContent = date.toLocaleDateString('fr-FR', options);
    } else {
        document.getElementById('profile-created').textContent = 'Date inconnue';
    }
    
    // Charger les statistiques (pour l'instant valeurs par défaut)
    loadStats();
}

// Obtenir le label du rôle en français
function getRoleLabel(role) {
    const labels = {
        'utilisateur': 'Utilisateur',
        'membre': 'Membre',
        'admin': 'Administrateur'
    };
    return labels[role] || 'Utilisateur';
}

// Charger les statistiques (à implémenter plus tard avec de vraies données)
function loadStats() {
    // Pour l'instant, valeurs par défaut
    // Ces données pourront être récupérées depuis d'autres tables plus tard
    
    document.getElementById('stat-messages').textContent = '0';
    document.getElementById('stat-items').textContent = '0';
    document.getElementById('stat-level').textContent = '1';
    
    // TODO: Implémenter la récupération des vraies statistiques
    // - Compter les messages dans la table mailbox
    // - Compter les items possédés
    // - Calculer le niveau basé sur l'activité
}

// Afficher un message d'erreur
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('profil-content').style.display = 'none';
    
    const errorDiv = document.getElementById('error-content');
    errorDiv.style.display = 'block';
    document.getElementById('error-text').textContent = message;
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    if (!dateString) return 'Inconnue';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
}

console.log('✅ Module profil.js chargé');
