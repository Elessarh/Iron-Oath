/* auth-supabase.js - Système d'authentification Supabase pour Iron Oath */

// Utiliser var au lieu de let pour éviter les erreurs de re-déclaration lors des navigations
var supabase = supabase || null;

const ENCODED_SUPABASE_URL = 'aHR0cHM6Ly96aGJ1d3d2YWZicnJ4cHN1cGVidC5zdXBhYmFzZS5jbw==';
const ENCODED_SUPABASE_KEY = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5wb1luVjNkM1poWm1KeWNuaHdjM1Z3WldKMElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTmpJME9URXhNVGdzSW1WNGNDSTZNakEzT0RBMk56RXhPSDAuRE4yVHNwTmRvWHdUUW9EaTFLczRYRk5KWlQwUW92bDBzNUNYOEtVRGlLaw==';

function decodeKey(encodedKey) {
    try {
        // Décodage Base64 simple - pas de rotation nécessaire
        const decoded = atob(encodedKey);
        return decoded;
    } catch (error) {
        console.error('Erreur décodage clé:', error);
        return null;
    }
}

// Initialisation asynchrone du client Supabase
async function initSupabase() {
    try {
        const SUPABASE_URL = decodeKey(ENCODED_SUPABASE_URL);
        const SUPABASE_ANON_KEY = decodeKey(ENCODED_SUPABASE_KEY);
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Erreur de décodage des clés');
        }
        
        // Vérifier si Supabase est disponible (soit via window.supabase, soit via un CDN déjà chargé)
        const supabaseLib = window.supabase || (window.supabasejs && window.supabasejs.supabase);
        
        if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = () => resolve();
                script.onerror = () => {
                    const altScript = document.createElement('script');
                    altScript.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js';
                    altScript.onload = () => resolve();
                    altScript.onerror = () => reject(new Error('Impossible de charger Supabase depuis aucun CDN'));
                    document.head.appendChild(altScript);
                };
                document.head.appendChild(script);
            });
            
            // Attendre que le script soit complètement initialisé
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Récupérer la fonction createClient
        const createClient = window.supabase?.createClient || window.supabasejs?.supabase?.createClient;
        
        if (!createClient || typeof createClient !== 'function') {
            throw new Error('createClient non disponible après chargement');
        }
        
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Partager l'instance Supabase globalement pour les autres modules
        window.globalSupabase = supabase;
        
        return true;
    } catch (error) {
        console.error('Erreur initialisation Supabase:', error);
        return false;
    }
}

// Variables globales
let currentUser = null;
let userProfile = null;
const usernamePendingMap = new Map();

let isCheckingAuthState = false;
let lastAuthStateCheck = 0;

// ========== GESTION DE L'ÉTAT DE CONNEXION ==========
function checkAuthState() {
    const now = Date.now();
    if (now - lastAuthStateCheck < 100) return;
    lastAuthStateCheck = now;
    
    if (isCheckingAuthState) return;
    isCheckingAuthState = true;
    
    try {
        const userInfo = document.getElementById('user-info');
        const loginLink = document.getElementById('login-link');
        const usernameSpan = document.getElementById('username');
        
        if (typeof window !== 'undefined') {
            window.currentUser = currentUser;
            window.userProfile = userProfile;
        }
        
        if (currentUser) {
            // Utilisateur connecté
            
            if (userInfo) {
                userInfo.style.display = 'flex';
                userInfo.classList.add('show');
                userInfo.classList.add('js-visible');
                
                if (usernameSpan) {
                    let displayName = 'Joueur';
                    if (userProfile && userProfile.username) {
                        displayName = userProfile.username;
                    } else if (currentUser.email) {
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
            // Utilisateur non connecté
            
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
        console.error('Erreur checkAuthState:', error);
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
        
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// ========== FONCTIONS D'AUTHENTIFICATION ==========
async function registerUser(username, email, password, confirmPassword) {
    try {
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Veuillez remplir tous les champs.');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Veuillez entrer un email valide.');
            return false;
        }
        
        if (username.length < 3) {
            showMessage('Le pseudo joueur doit contenir au moins 3 caractères.');
            return false;
        }
        
        if (username.length > 20) {
            showMessage('Le pseudo joueur ne peut pas dépasser 20 caractères.');
            return false;
        }
        
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
            if (checkError.code === 'PGRST116' || checkError.message.includes('406')) {
                // Table inaccessible, on continue
            } else {
                console.error('Erreur vérification pseudo:', checkError);
                showMessage('Erreur technique lors de la vérification. Réessayez.');
                return false;
            }
        }
        
        usernamePendingMap.set(email, username);
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (signUpError) {
            console.error('Erreur inscription Supabase:', signUpError);
            
            // Si l'utilisateur existe déjà dans auth.users
            if (signUpError.message.includes('User already registered') || signUpError.message.includes('already been registered')) {
                // NE PAS se connecter automatiquement, juste vérifier si le profil existe
                // On ne connaît pas le vrai mot de passe de l'utilisateur existant
                
                showMessage('Ce compte existe déjà. Si c\'est votre compte, connectez-vous. Sinon, utilisez un autre email.');
                setTimeout(() => showLoginForm(), 2000);
                return false;
            }
            
            showMessage(`Erreur lors de l'inscription: ${signUpError.message}`);
            return false;
        }
        
        // Si l'inscription réussit, créer le profil utilisateur
        if (authData.user) {
            
            // Vérifier d'abord si le profil existe déjà
            const { data: existingProfile, error: checkError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
                
            if (existingProfile) {
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
                    console.error('Erreur création profil:', profileError);
                    
                    if (profileError.code === '23505') {
                        showMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.', 'success');
                    } else {
                        showMessage(`Erreur lors de la création du profil: ${profileError.message}. Contactez le support.`);
                        return false;
                    }
                } else {
                    showMessage('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.', 'success');
                }
            }
            
            setTimeout(() => {
                window.location.href = '../index.html';
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
    try {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (signInError) {
            console.error('❌ Erreur de connexion détaillée:', signInError);
            if (signInError.message.includes('Invalid login credentials')) {
                showMessage('Email ou mot de passe incorrect.');
            } else if (signInError.message.includes('Email not confirmed')) {
                showMessage('Veuillez confirmer votre email avant de vous connecter.');
            } else {
                showMessage(`Erreur de connexion: ${signInError.message}`);
            }
            return false;
        }
        
        if (authData.user) {
            currentUser = authData.user;
            await loadUserProfile();
            
            showMessage('Connexion réussie ! Redirection...', 'success');
            
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
            if (error.code === 'PGRST116' || error.message.includes('406')) {
                return await createMissingProfile();
            } else {
                console.error('Erreur chargement profil:', error);
                return await createMissingProfile();
            }
        }
        
        userProfile = data;
        window.userProfile = userProfile; // Mettre à jour immédiatement
        
        if (userProfile.username.includes('_') && userProfile.username.match(/.*_[a-z0-9]{4}$/)) {
            await autoCorrectUsername();
        }
        
        if (currentUser.email && usernamePendingMap.has(currentUser.email)) {
            usernamePendingMap.delete(currentUser.email);
        }
        
        checkAuthState();
        return userProfile;
        
    } catch (error) {
        console.error('Erreur technique chargement profil:', error);
        
        try {
            return await createMissingProfile();
        } catch (recoveryError) {
            console.error('Échec de la récupération automatique:', recoveryError);
            showMessage('Erreur de synchronisation. Rechargez la page.', 'error');
            return null;
        }
    }
}

async function createMissingProfile() {
    if (!currentUser) return null;
    
    try {
        let username = usernamePendingMap.get(currentUser.email);
        
        if (username) {
            usernamePendingMap.delete(currentUser.email);
        } else {
            username = currentUser.email.split('@')[0];
        }
        
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
            console.error('Erreur création profil:', error);
            
            if (error.code === '23505') {
                const { data: existingProfile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                    
                if (existingProfile) {
                    userProfile = existingProfile;
                    return userProfile;
                }
            }
            
            throw new Error(`Erreur création profil: ${error.message}`);
        }
        
        userProfile = data;
        checkAuthState();
        return userProfile;
        
    } catch (error) {
        console.error('Erreur technique création profil:', error);
        throw error;
    }
}

async function autoCorrectUsername() {
    if (!currentUser || !userProfile) return;
    
    try {
        const baseName = currentUser.email.split('@')[0];
        
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('username', baseName)
            .single();
            
        if (!existingProfile) {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({ username: baseName })
                .eq('id', currentUser.id)
                .select()
                .single();
                
            if (!error && data) {
                userProfile = data;
                checkAuthState();
            }
        }
    } catch (error) {
        // Correction automatique échouée
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

function isMemberOrAdmin() {
    return userProfile && (userProfile.role === 'membre' || userProfile.role === 'admin');
}

// ========== INITIALISATION AUTOMATIQUE ==========
document.addEventListener('DOMContentLoaded', async function() {
    // Afficher immédiatement le bouton connexion (masqué plus tard si connecté)
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.style.display = 'block';
        loginLink.classList.add('show');
        loginLink.classList.add('js-visible');
    }
    
    const supabaseReady = await initSupabase();
    if (!supabaseReady) {
        console.error('❌ Impossible d\'initialiser Supabase');
        // Forcer l'affichage du bouton connexion si Supabase échoue
        setTimeout(() => {
            const loginLink = document.getElementById('login-link');
            if (loginLink) {
                loginLink.style.display = 'block';
                loginLink.classList.add('show');
                loginLink.classList.add('js-visible');
            }
            const userInfo = document.getElementById('user-info');
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }, 500);
        return;
    }
    
    // Vérifier la session actuelle
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            currentUser = null;
            userProfile = null;
        } else if (session?.user) {
            currentUser = session.user;
            window.currentUser = currentUser;
            await loadUserProfile();
        } else {
            currentUser = null;
            userProfile = null;
            window.currentUser = null;
            window.userProfile = null;
        }
    } catch (error) {
        currentUser = null;
        userProfile = null;
    }
    
    // Mettre à jour l'UI une seule fois
    checkAuthState();
    
    // Écouter les changements d'authentification
    supabase.auth.onAuthStateChange(async (event, session) => {
        
        if (event === 'SIGNED_IN' && session?.user) {
            currentUser = session.user;
            window.currentUser = currentUser;
            await loadUserProfile();
            checkAuthState();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            window.currentUser = null;
            window.userProfile = null;
            checkAuthState();
        }
    });
    
    const loginForm = document.querySelector('#login-form form');
    const registerForm = document.querySelector('#register-form form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await loginUser(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            await registerUser(username, email, password, confirmPassword);
        });
    } else {
        setTimeout(() => {
            const form = document.querySelector('form[id*="register"]');
            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const username = document.getElementById('register-username').value;
                    const email = document.getElementById('register-email').value;
                    const password = document.getElementById('register-password').value;
                    const confirmPassword = document.getElementById('register-confirm').value;
                    
                    await registerUser(username, email, password, confirmPassword);
                });
            }
            // Message d'erreur supprimé - c'est normal de ne pas trouver le formulaire sur les pages sans inscription
        }, 500);
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

}); // Fin de DOMContentLoaded