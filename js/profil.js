/* profil.js - Gestion de la page profil utilisateur */

// Variables locales (currentUser et userProfile sont globaux depuis auth-supabase.js)
let localUserProfile = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Initialisation de la page profil...');
    
    // Attendre que auth-supabase.js soit chargé ET que l'utilisateur soit connecté
    await waitForAuthAndUser();
    
    // Charger le profil
    await loadProfilePage();
});

// Attendre que l'authentification soit prête ET que l'utilisateur soit connecté
function waitForAuthAndUser() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 secondes max
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            // Vérifier que Supabase ET window.currentUser sont prêts
            if (typeof supabase !== 'undefined' && supabase !== null && window.currentUser !== null && window.currentUser !== undefined) {
                clearInterval(checkAuth);
                console.log('✅ Auth prête et utilisateur connecté:', window.currentUser.email);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                console.error('❌ Timeout: utilisateur non connecté après 10s');
                console.log('État:', {
                    supabase: typeof supabase !== 'undefined',
                    currentUser: window.currentUser
                });
                showError('Vous devez être connecté pour voir votre profil.');
                setTimeout(() => {
                    window.location.href = 'connexion.html';
                }, 2000);
                resolve();
            }
        }, 100);
    });
}

// Charger le profil de l'utilisateur connecté (renommé pour éviter conflit avec auth-supabase.js)
async function loadProfilePage() {
    try {
        // Double vérification
        if (!window.currentUser) {
            console.error('❌ Pas d\'utilisateur connecté (window.currentUser est null)');
            showError('Vous devez être connecté pour voir votre profil.');
            setTimeout(() => {
                window.location.href = 'connexion.html';
            }, 2000);
            return;
        }
        
        console.log('✅ Utilisateur connecté:', window.currentUser.email);
        
        // Récupérer le profil depuis user_profiles
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', window.currentUser.id)
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
        
        localUserProfile = profile;
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
    document.getElementById('profile-email').textContent = window.currentUser.email || 'Inconnu';
    
    // Afficher le rôle avec le bon badge
    const roleBadge = document.getElementById('profile-role');
    const role = profile.role || 'joueur';
    
    roleBadge.textContent = getRoleLabel(role);
    roleBadge.className = 'role-badge role-' + role;
    
    // Afficher classe et niveau
    document.getElementById('profile-classe').value = profile.classe || 'Guerrier';
    document.getElementById('profile-niveau').value = profile.niveau || 1;
    
    // Formater la date de création
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
    
    // Charger les statistiques (pour l'instant valeurs par défaut)
    loadStats();
}

// Obtenir le label du rôle en français
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
            showError('Le niveau doit être entre 1 et 100.');
            return;
        }
        
        // Mettre à jour le profil
        const { error } = await supabase
            .from('user_profiles')
            .update({ 
                classe: classe,
                niveau: niveau
            })
            .eq('id', window.currentUser.id);
        
        if (error) {
            console.error('❌ Erreur sauvegarde profil:', error);
            showError('Impossible de sauvegarder vos modifications.');
            return;
        }
        
        console.log('✅ Profil mis à jour');
        showSuccess('Modifications sauvegardées avec succès !');
        
        // Recharger le profil
        await loadProfilePage();
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showError('Une erreur technique est survenue.');
    }
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
    alert('❌ ' + message);
}

// Afficher un message de succès
function showSuccess(message) {
    alert('✅ ' + message);
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
