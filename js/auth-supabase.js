/* auth-supabase.js - Système d'authentification Supabase pour Iron Oath */

// Configuration Supabase
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://zhbuwwvafbrrxpsupebt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYnV3d3ZhZmJycnhwc3VwZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTExMTgsImV4cCI6MjA3ODA2NzExOH0.DN2TspNdoXwTQoDi1Ks4XFNJZT0Qovl0s5CX8KUDiKk';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let currentUser = null;
let userProfile = null;
// Cache thread-safe pour stocker les pseudos par email
const usernamePendingMap = new Map();

// Variable pour éviter les appels multiples simultanés
let isCheckingAuthState = false;
let lastAuthStateCheck = 0;

// ========== GESTION DE L'ÉTAT DE CONNEXION ==========
function checkAuthState() {
    // Éviter les appels trop fréquents (moins de 100ms d'écart)
    const now = Date.now();
    if (now - lastAuthStateCheck < 100) {
        console.log('🔍 Vérification auth ignorée (trop récente)');
        return;
    }
    lastAuthStateCheck = now;
    
    // Éviter les appels simultanés
    if (isCheckingAuthState) {
        console.log('🔍 Vérification auth en cours, ignorée');
        return;
    }
    isCheckingAuthState = true;
    
    try {
        const userInfo = document.getElementById('user-info');
        const loginLink = document.getElementById('login-link');
        const usernameSpan = document.getElementById('username');
        
        console.log('🔍 Vérification état auth Supabase:', currentUser ? `Connecté: ${userProfile?.username || currentUser.email}` : 'Non connecté');
        
        // Mettre à jour les variables globales
        if (typeof window !== 'undefined') {
            window.currentUser = currentUser;
            window.userProfile = userProfile;
        }
        
        if (currentUser) {
            // Utilisateur connecté - Masquer le bouton connexion et afficher les infos user
            if (userInfo) {
                userInfo.style.display = 'flex';
                userInfo.classList.add('show');
                userInfo.classList.add('js-visible');
                if (usernameSpan) {
                    // Toujours prioriser le pseudo joueur au lieu de l'email
                    let displayName = 'Joueur';
                    if (userProfile && userProfile.username) {
                        displayName = userProfile.username;
                    } else if (currentUser.email) {
                        // Créer un pseudo temporaire si pas de profil
                        displayName = 'Joueur_' + currentUser.email.split('@')[0];
                    }
                    usernameSpan.textContent = displayName;
                }
            }
            if (loginLink) {
                loginLink.style.display = 'none';
                loginLink.classList.remove('show');
                loginLink.classList.remove('js-visible');
            }
        } else {
            // Utilisateur non connecté - Afficher le bouton connexion et masquer les infos user
            if (userInfo) {
                userInfo.style.display = 'none';
                userInfo.classList.remove('show');
                userInfo.classList.remove('js-visible');
            }
            if (loginLink) {
                loginLink.style.display = 'block';
                loginLink.classList.add('show');
                loginLink.classList.add('js-visible');
            }
        }
    } catch (error) {
        console.error('❌ Erreur checkAuthState:', error);
    } finally {
        isCheckingAuthState = false;
    }
}

function showMessage(message, type = 'error') {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
        
        console.log(`Auth Message (${type}): ${message}`);
        
        // Auto-hide après 5 secondes pour les messages de succès
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// ========== FONCTIONS D'AUTHENTIFICATION ==========
async function registerUser(username, email, password, confirmPassword) {
    console.log('🚀 Fonction registerUser appelée');
    console.log('📊 Paramètres reçus:', { username, email, password: '***', confirmPassword: '***' });
    
    try {
        // Validation basique
        if (!username || !email || !password || !confirmPassword) {
            console.log('❌ Validation échouée: champs manquants');
            showMessage('Veuillez remplir tous les champs.');
            return false;
        }
        
        // Validation email simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Veuillez entrer un email valide.');
            return false;
        }
        
        // Validation pseudo joueur
        if (username.length < 3) {
            showMessage('Le pseudo joueur doit contenir au moins 3 caractères.');
            return false;
        }
        
        if (username.length > 20) {
            showMessage('Le pseudo joueur ne peut pas dépasser 20 caractères.');
            return false;
        }
        
        // Validation caractères autorisés (lettres, chiffres, underscore, tiret)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            showMessage('Le pseudo joueur ne peut contenir que des lettres, chiffres, underscore et tirets.');
            return false;
        }
        
        if (password !== confirmPassword) {
            showMessage('Les mots de passe ne correspondent pas.');
            return false;
        }
        
        if (password.length < 6) {
            showMessage('Le mot de passe doit contenir au moins 6 caractères.');
            return false;
        }
        
        // Vérifier si le nom d'utilisateur existe déjà
        try {
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('username')
                .eq('username', username)
                .single();
                
            if (existingProfile) {
                showMessage('Ce pseudo joueur est déjà pris. Choisissez-en un autre.');
                return false;
            }
        } catch (checkError) {
            // Si erreur 406, la table n'existe pas ou n'est pas accessible
            if (checkError.code === 'PGRST116' || checkError.message.includes('406')) {
                console.log('ℹ️ Vérification pseudo impossible (table inaccessible), on continue...');
            } else {
                console.error('Erreur vérification pseudo:', checkError);
                showMessage('Erreur technique lors de la vérification. Réessayez.');
                return false;
            }
        }
        
        // ÉTAPE CRITIQUE: Stocker le pseudo avec l'email AVANT la création du compte
        usernamePendingMap.set(email, username);
        console.log(`💾 Pseudo "${username}" stocké pour ${email}`);
        
        // Créer le compte Supabase
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (signUpError) {
            console.error('❌ Erreur inscription Supabase:', signUpError);
            showMessage(`Erreur lors de l'inscription: ${signUpError.message}`);
            return false;
        }
        
        // Si l'inscription réussit, créer le profil utilisateur
        if (authData.user) {
            console.log('✅ Compte Supabase créé, vérification du profil...');
            
            // Vérifier d'abord si le profil existe déjà
            const { data: existingProfile, error: checkError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
                
            if (existingProfile) {
                console.log('ℹ️ Profil déjà existant pour cet utilisateur');
                showMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.', 'success');
            } else {
                // Le profil n'existe pas, le créer
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            username: username,
                            role: 'joueur'
                        }
                    ]);
                    
                if (profileError) {
                    console.error('❌ Erreur création profil:', profileError);
                    
                    // Si c'est un conflit (409), le profil existe déjà (race condition)
                    if (profileError.code === '23505') {
                        console.log('ℹ️ Profil créé entre-temps (race condition), continuons...');
                        showMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.', 'success');
                    } else {
                        showMessage(`Erreur lors de la création du profil: ${profileError.message}. Contactez le support.`);
                        return false;
                    }
                } else {
                    console.log('✅ Profil utilisateur créé avec succès');
                    showMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.', 'success');
                }
            }
            
            // Basculer vers le formulaire de connexion après 3 secondes
            setTimeout(() => {
                showLoginForm();
            }, 3000);
            
            return true;
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        showMessage('Erreur technique lors de l\'inscription.');
        return false;
    }
}

async function loginUser(email, password) {
    console.log('🔑 Tentative de connexion pour:', email);
    
    try {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (signInError) {
            if (signInError.message.includes('Invalid login credentials')) {
                showMessage('Email ou mot de passe incorrect.');
            } else {
                showMessage(`Erreur de connexion: ${signInError.message}`);
            }
            return false;
        }
        
        if (authData.user) {
            currentUser = authData.user;
            await loadUserProfile();
            
            showMessage('Connexion réussie ! Redirection...', 'success');
            
            // Rediriger vers l'accueil après 2 secondes
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            
            return true;
        }
        
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        showMessage('Erreur technique lors de la connexion.');
        return false;
    }
}

async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
        
        currentUser = null;
        userProfile = null;
        
        // Rediriger vers l'accueil
        window.location.href = '../index.html';
        
    } catch (error) {
        console.error('Erreur technique lors de la déconnexion:', error);
    }
}

async function loadUserProfile() {
    if (!currentUser) return null;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error) {
            // Si le profil n'existe pas, le créer automatiquement
            if (error.code === 'PGRST116' || error.message.includes('406')) {
                console.log('👤 Profil utilisateur manquant, création automatique...');
                return await createMissingProfile();
            } else {
                console.error('Erreur chargement profil:', error);
                // Essayer de créer le profil même en cas d'autre erreur
                console.log('🔧 Tentative de création de profil automatique...');
                return await createMissingProfile();
            }
        }
        
        userProfile = data;
        console.log(`👤 Profil chargé: ${userProfile.username} (${userProfile.role})`);
        
        // CORRECTION AUTOMATIQUE: Vérifier si c'est un pseudo généré et le corriger si possible
        if (userProfile.username.includes('_') && userProfile.username.match(/.*_[a-z0-9]{4}$/)) {
            console.log('🔧 Pseudo généré automatiquement détecté, tentative de correction...');
            await autoCorrectUsername();
        }
        
        // Nettoyer le cache après utilisation
        if (currentUser.email && usernamePendingMap.has(currentUser.email)) {
            usernamePendingMap.delete(currentUser.email);
            console.log(`🧹 Cache nettoyé pour ${currentUser.email}`);
        }
        
        // Mettre à jour l'interface
        checkAuthState();
        return userProfile;
        
    } catch (error) {
        console.error('Erreur technique chargement profil:', error);
        
        // En cas d'erreur critique, essayer quand même de créer un profil
        console.log('🔧 Erreur critique, tentative de récupération automatique...');
        try {
            return await createMissingProfile();
        } catch (recoveryError) {
            console.error('❌ Échec de la récupération automatique:', recoveryError);
            showMessage('Erreur de synchronisation. Rechargez la page.', 'error');
            return null;
        }
    }
}

async function createMissingProfile() {
    if (!currentUser) return null;
    
    try {
        // Récupérer le pseudo depuis le cache ou générer un pseudo propre
        let username = usernamePendingMap.get(currentUser.email);
        
        if (username) {
            console.log(`🎯 Utilisation du pseudo choisi depuis le cache: ${username}`);
            // Nettoyer immédiatement après récupération
            usernamePendingMap.delete(currentUser.email);
        } else {
            // Générer un pseudo propre basé sur l'email (sans suffixe aléatoire)
            username = currentUser.email.split('@')[0];
            console.log(`🔨 Génération d'un pseudo propre: ${username}`);
        }
        
        console.log(`🔨 Création du profil pour ${currentUser.email} avec username: ${username}`);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([
                {
                    id: currentUser.id,
                    username: username,
                    role: 'joueur'
                }
            ])
            .select()
            .single();
            
        if (error) {
            console.error('❌ Erreur création profil:', error);
            
            // Si c'est un conflit (23505), le profil existe déjà
            if (error.code === '23505') {
                console.log('ℹ️ Profil déjà existant, récupération...');
                const { data: existingProfile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                    
                if (existingProfile) {
                    userProfile = existingProfile;
                    console.log(`✅ Profil récupéré: ${userProfile.username}`);
                    return userProfile;
                }
            }
            
            throw new Error(`Erreur création profil: ${error.message}`);
        }
        
        userProfile = data;
        console.log(`✅ Profil créé: ${userProfile.username} (${userProfile.role})`);
        checkAuthState();
        return userProfile;
        
    } catch (error) {
        console.error('❌ Erreur technique création profil:', error);
        throw error;
    }
}

// Fonction de correction automatique pour les comptes existants
async function autoCorrectUsername() {
    if (!currentUser || !userProfile) return;
    
    try {
        // Essayer d'utiliser le nom de base de l'email
        const baseName = currentUser.email.split('@')[0];
        
        // Vérifier si le nom de base est disponible
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('username', baseName)
            .single();
            
        if (!existingProfile) {
            // Le nom de base est disponible, faire la correction
            console.log(`✨ Correction automatique: ${userProfile.username} -> ${baseName}`);
            
            const { data, error } = await supabase
                .from('user_profiles')
                .update({ username: baseName })
                .eq('id', currentUser.id)
                .select()
                .single();
                
            if (!error && data) {
                userProfile = data;
                checkAuthState();
                console.log(`✅ Pseudo corrigé automatiquement: ${userProfile.username}`);
            }
        }
    } catch (error) {
        console.log('ℹ️ Correction automatique impossible:', error.message);
    }
}

// ========== GESTION DES FORMULAIRES ==========
function clearForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
}

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearForms();
    }
}

function showRegisterForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearForms();
    }
}

// ========== FONCTIONS UTILITAIRES ==========
function getCurrentUser() {
    return currentUser;
}

function getUserProfile() {
    return userProfile;
}

function isLoggedIn() {
    return currentUser !== null && userProfile !== null;
}

function isAdmin() {
    return userProfile && userProfile.role === 'admin';
}

// ========== INITIALISATION AUTOMATIQUE ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔐 Initialisation du système d\'authentification Supabase...');
    
    // Vérification immédiate pour éviter le flash
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user) {
        currentUser = session.data.session.user;
        await loadUserProfile();
    }
    
    // Appel immédiat pour masquer le bouton connexion si possible
    checkAuthState();
    
    // Vérifier l'état d'authentification initial
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        try {
            await loadUserProfile();
            checkAuthState();
        } catch (error) {
            console.error('⚠️ Erreur chargement profil initial:', error);
            console.log('ℹ️ Continuons sans profil, la table user_profiles doit être créée');
        }
    }
    
    // Mettre à jour l'interface selon l'état de connexion
    checkAuthState();
    
    // Écouter les changements d'état d'authentification
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Changement d\'état auth:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
            currentUser = session.user;
            await loadUserProfile();
            checkAuthState();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            checkAuthState();
        }
    });
    
    // Gestionnaires d'événements pour les formulaires
    const loginForm = document.querySelector('#login-form form');
    const registerForm = document.querySelector('#register-form form');
    
    console.log('🔍 Formulaires trouvés:', { 
        loginForm: !!loginForm, 
        registerForm: !!registerForm 
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔑 Formulaire de connexion soumis');
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await loginUser(email, password);
        });
    }
    
    if (registerForm) {
        console.log('✅ Gestionnaire d\'événement ajouté au formulaire d\'inscription');
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Formulaire d\'inscription soumis - début de traitement');
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            console.log('📊 Données du formulaire:', { 
                username: username || 'VIDE', 
                email: email || 'VIDE', 
                password: password ? '***' : 'VIDE', 
                confirmPassword: confirmPassword ? '***' : 'VIDE' 
            });
            
            await registerUser(username, email, password, confirmPassword);
        });
    } else {
        console.error('❌ Formulaire d\'inscription non trouvé dans le DOM');
    }
    
    // Boutons de basculement entre formulaires
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', showRegisterForm);
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginForm);
    }
    
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    console.log('✅ Système d\'authentification Supabase initialisé');
    console.log('📊 Utilisateur actuel:', currentUser ? userProfile?.username || currentUser.email : 'Aucun');
});

// Rendre les fonctions et variables accessibles globalement
window.getCurrentUser = getCurrentUser;
window.getUserProfile = getUserProfile;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.supabase = supabase;
window.currentUser = currentUser;
window.userProfile = userProfile;

// Fonction pour exposer les variables mises à jour
window.updateGlobalAuthVars = function() {
    window.currentUser = currentUser;
    window.userProfile = userProfile;
};