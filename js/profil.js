/* profil.js - Gestion de la page profil utilisateur */

// Variables locales (currentUser et userProfile sont globaux depuis auth-supabase.js)
let localUserProfile = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    debugLog('ðŸ“„ Initialisation de la page profil...');
    
    // Attendre que auth-supabase.js soit chargÃ© ET que l'utilisateur soit connectÃ©
    await waitForAuthAndUser();
    
    // Charger le profil
    await loadProfilePage();
});

// Attendre que l'authentification soit prÃªte ET que l'utilisateur soit connectÃ©
function waitForAuthAndUser() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 secondes max
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            // VÃ©rifier que Supabase ET window.currentUser sont prÃªts
            if (typeof supabase !== 'undefined' && supabase !== null && window.currentUser !== null && window.currentUser !== undefined) {
                clearInterval(checkAuth);
                debugLog('âœ… Auth prÃªte et utilisateur connectÃ©:', window.currentUser.email);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                console.error('âŒ Timeout: utilisateur non connectÃ© aprÃ¨s 10s');
                debugLog('Ã‰tat:', {
                    supabase: typeof supabase !== 'undefined',
                    currentUser: window.currentUser
                });
                showError('Vous devez Ãªtre connectÃ© pour voir votre profil.');
                setTimeout(() => {
                    window.location.href = 'connexion.html';
                }, 2000);
                resolve();
            }
        }, 100);
    });
}

// Charger le profil de l'utilisateur connectÃ© (renommÃ© pour Ã©viter conflit avec auth-supabase.js)
async function loadProfilePage() {
    try {
        // Double vÃ©rification
        if (!window.currentUser) {
            console.error('âŒ Pas d\'utilisateur connectÃ© (window.currentUser est null)');
            showError('Vous devez Ãªtre connectÃ© pour voir votre profil.');
            setTimeout(() => {
                window.location.href = 'connexion.html';
            }, 2000);
            return;
        }
        
        debugLog('âœ… Utilisateur connectÃ©:', window.currentUser.email);
        
        // Essayer de charger depuis le cache d'abord
        const cacheKey = `user_profile_${window.currentUser.id}`;
        const cachedProfile = window.cacheManager?.get(cacheKey);
        
        if (cachedProfile) {
            debugLog('ðŸ“¦ Profil chargÃ© depuis le cache');
            localUserProfile = cachedProfile;
            displayProfile(cachedProfile);
            return;
        }
        
        // RÃ©cupÃ©rer le profil depuis user_profiles
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', window.currentUser.id)
            .single();
            
        if (error) {
            console.error('âŒ Erreur chargement profil:', error);
            showError('Impossible de charger votre profil. Veuillez rÃ©essayer.');
            return;
        }
        
        if (!profile) {
            console.error('âŒ Profil introuvable');
            showError('Votre profil n\'existe pas encore. Contactez un administrateur.');
            return;
        }
        
        localUserProfile = profile;
        debugLog('âœ… Profil chargÃ©:', profile);
        
        // Mettre en cache pour 5 minutes
        if (window.cacheManager) {
            window.cacheManager.set(cacheKey, profile);
        }
        
        // Afficher le profil
        displayProfile(profile);
        
    } catch (error) {
        console.error('âŒ Erreur lors du chargement du profil:', error);
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
    document.getElementById('profile-email').textContent = window.currentUser.email || 'Inconnu';
    
    // Afficher le rÃ´le avec le bon badge
    const roleBadge = document.getElementById('profile-role');
    const role = (profile.role || 'joueur').trim(); // Nettoyer les espaces
    
    roleBadge.textContent = getRoleLabel(role);
    roleBadge.className = 'role-badge role-' + role;
    
    // Afficher classe et niveau
    document.getElementById('profile-classe').value = profile.classe || 'Guerrier';
    document.getElementById('profile-niveau').value = profile.niveau || 1;
    
    // Afficher le bouton Dashboard si admin
    const dashboardBtn = document.getElementById('dashboard-btn');
    debugLog('[DEBUG] Role de l utilisateur:', role);
    debugLog('[DEBUG] Bouton dashboard:', dashboardBtn ? 'trouve' : 'non trouve');
    
    if (dashboardBtn) {
        if (role === 'admin') {
            debugLog('[OK] Affichage bouton Dashboard (admin)');
            dashboardBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            debugLog('[INFO] Bouton Dashboard cache (role:', role, ')');
            dashboardBtn.style.setProperty('display', 'none', 'important');
        }
    }
    
    // Afficher le bouton Guilde si membre ou admin
    const guildeBtn = document.getElementById('guilde-btn');
    debugLog('[DEBUG] Bouton guilde:', guildeBtn ? 'trouve' : 'non trouve');
    
    if (guildeBtn) {
        if (role === 'membre' || role === 'admin') {
            debugLog('[OK] Affichage bouton Guilde (membre/admin)');
            guildeBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            debugLog('[INFO] Bouton Guilde cache (role:', role, ')');
            guildeBtn.style.setProperty('display', 'none', 'important');
        }
    }
    
    // Formater la date de crÃ©ation
    if (profile.created_at) {
        const date = new Date(profile.created_at);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('profile-created').textContent = date.toLocaleDateString('fr-FR', options);
    } else {
        document.getElementById('profile-created').textContent = 'Date inconnue';
    }
    
    // Ajouter l'event listener pour le bouton de sauvegarde
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        saveBtn.onclick = saveProfileChanges;
    }
    
    // Charger les statistiques avec le vrai niveau
    loadStats(profile);
}

// Obtenir le label du rÃ´le en franÃ§ais
function getRoleLabel(role) {
    const labels = {
        'joueur': 'Joueur',
        'membre': 'Membre',
        'admin': 'Administrateur'
    };
    return labels[role] || 'Joueur';
}

// Sauvegarder les modifications du profil
async function saveProfileChanges() {
    try {
        const classe = document.getElementById('profile-classe').value;
        const niveau = parseInt(document.getElementById('profile-niveau').value);
        
        // Valider le niveau
        if (niveau < 1 || niveau > 100) {
            showError('Le niveau doit Ãªtre entre 1 et 100.');
            return;
        }
        
        // Mettre Ã  jour le profil
        const { error } = await supabase
            .from('user_profiles')
            .update({ 
                classe: classe,
                niveau: niveau
            })
            .eq('id', window.currentUser.id);
        
        if (error) {
            console.error('âŒ Erreur sauvegarde profil:', error);
            showError('Impossible de sauvegarder vos modifications.');
            return;
        }
        
        debugLog('âœ… Profil mis Ã  jour');
        showSuccess('Modifications sauvegardÃ©es avec succÃ¨s !');
        
        // Invalider le cache du profil
        if (window.cacheManager) {
            window.cacheManager.invalidate(`user_profile_${window.currentUser.id}`);
            window.cacheManager.invalidate('all_users'); // Aussi invalider la liste complÃ¨te
        }
        
        // Recharger le profil
        await loadProfilePage();
        
    } catch (error) {
        console.error('âŒ Erreur lors de la sauvegarde:', error);
        showError('Une erreur technique est survenue.');
    }
}

// Charger les statistiques avec les vraies donnÃ©es du profil
function loadStats(profile) {
    // Afficher le vrai niveau de l'utilisateur
    document.getElementById('stat-messages').textContent = '0';
    document.getElementById('stat-items').textContent = '0';
    document.getElementById('stat-level').textContent = profile.niveau || 1;
    
    // TODO: ImplÃ©menter la rÃ©cupÃ©ration des vraies statistiques
    // - Compter les messages dans la table mailbox
    // - Compter les items possÃ©dÃ©s
}

// Afficher un message d'erreur
function showError(message) {
    alert('âŒ ' + message);
}

// Afficher un message de succÃ¨s
function showSuccess(message) {
    alert('âœ… ' + message);
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

debugLog('âœ… Module profil.js chargÃ©');
