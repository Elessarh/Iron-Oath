/* auth-supabase.js - SystÃ¨me d'authentification Supabase pour Iron Oath */

// Utiliser var au lieu de let pour Ã©viter les erreurs de re-dÃ©claration lors des navigations
var supabase = supabase || null;

const ENCODED_SUPABASE_URL = 'aHR0cHM6Ly96aGJ1d3d2YWZicnJ4cHN1cGVidC5zdXBhYmFzZS5jbw==';
const ENCODED_SUPABASE_KEY = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5wb1luVjNkM1poWm1KeWNuaHdjM1Z3WldKMElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTmpJME9URXhNVGdzSW1WNGNDSTZNakEzT0RBMk56RXhPSDAuRE4yVHNwTmRvWHdUUW9EaTFLczRYRk5KWlQwUW92bDBzNUNYOEtVRGlLaw==';

function decodeKey(encodedKey) {
    try {
        // DÃ©codage Base64 simple - pas de rotation nÃ©cessaire
        const decoded = atob(encodedKey);
        return decoded;
    } catch (error) {
        console.error('Erreur dÃ©codage clÃ©:', error);
        return null;
    }
}

// Initialisation asynchrone du client Supabase
async function initSupabase() {
    try {
        const SUPABASE_URL = decodeKey(ENCODED_SUPABASE_URL);
        const SUPABASE_ANON_KEY = decodeKey(ENCODED_SUPABASE_KEY);
        
        debugLog('ðŸ” Debug Supabase URLs:');
        debugLog('URL dÃ©codÃ©e:', SUPABASE_URL);
        debugLog('URL valide?', SUPABASE_URL && SUPABASE_URL.startsWith('http'));
        debugLog('ClÃ© dÃ©codÃ©e (premiÃ¨res 20 chars):', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'null');
        debugLog('ClÃ© valide?', SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ'));
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Erreur de dÃ©codage des clÃ©s');
        }
        
        // VÃ©rifier si Supabase est disponible (soit via window.supabase, soit via un CDN dÃ©jÃ  chargÃ©)
        const supabaseLib = window.supabase || (window.supabasejs && window.supabasejs.supabase);
        
        if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
            debugLog('â³ Chargement de la bibliothÃ¨que Supabase...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = () => {
                    debugLog('âœ… Script Supabase chargÃ© depuis jsdelivr');
                    resolve();
                };
                script.onerror = () => {
                    debugWarn('âš ï¸ Ã‰chec jsdelivr, essai avec unpkg...');
                    const altScript = document.createElement('script');
                    altScript.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js';
                    altScript.onload = () => {
                        debugLog('âœ… Script Supabase chargÃ© depuis unpkg');
                        resolve();
                    };
                    altScript.onerror = () => reject(new Error('Impossible de charger Supabase depuis aucun CDN'));
                    document.head.appendChild(altScript);
                };
                document.head.appendChild(script);
            });
            
            // Attendre que le script soit complÃ¨tement initialisÃ©
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // RÃ©cupÃ©rer la fonction createClient
        const createClient = window.supabase?.createClient || window.supabasejs?.supabase?.createClient;
        
        if (!createClient || typeof createClient !== 'function') {
            throw new Error('createClient non disponible aprÃ¨s chargement');
        }
        
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        debugLog('âœ… Client Supabase crÃ©Ã©:', !!supabase);
        debugLog('ðŸ” Client Supabase URL:', supabase.supabaseUrl);
        
        // Partager l'instance Supabase globalement pour les autres modules
        window.globalSupabase = supabase;
        
        // Test rapide de connectivitÃ©
        try {
            const { data, error } = await supabase.auth.getUser();
            debugLog('ðŸ” Test connectivitÃ© Supabase:', { data: !!data, error: error?.message });
        } catch (testError) {
            debugWarn('âš ï¸ Test connectivitÃ© Ã©chouÃ©:', testError.message);
        }
        
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

// ========== GESTION DE L'Ã‰TAT DE CONNEXION ==========
function checkAuthState() {
    const now = Date.now();
    if (now - lastAuthStateCheck < 500) return; // RÃ©duit les appels rÃ©pÃ©tÃ©s
    lastAuthStateCheck = now;
    
    if (isCheckingAuthState) return;
    isCheckingAuthState = true;
    
    try {
        const userInfo = document.getElementById('user-info');
        const loginLink = document.getElementById('login-link');
        const usernameSpan = document.getElementById('username');
        
        debugLog('ðŸ” Debug checkAuthState:', {
            userInfo: !!userInfo,
            loginLink: !!loginLink,
            currentUser: !!currentUser,
            userProfile: userProfile?.username
        });
        
        if (typeof window !== 'undefined') {
            window.currentUser = currentUser;
            window.userProfile = userProfile;
        }
        
        if (currentUser) {
            // Utilisateur connectÃ©
            debugLog('âœ… Utilisateur connectÃ©:', currentUser.email);
            
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
            // Utilisateur non connectÃ©
            debugLog('ðŸ‘¤ Utilisateur non connectÃ© - affichage du bouton connexion');
            
            if (userInfo) {
                userInfo.style.display = 'none';
                userInfo.classList.remove('show');
                userInfo.classList.remove('js-visible');
            }
            
            if (loginLink) {
                debugLog('ðŸ”— Affichage du bouton connexion');
                loginLink.style.display = 'block';
                loginLink.classList.add('show');
                loginLink.classList.add('js-visible');
                debugLog('ðŸ”— Classes appliquÃ©es:', loginLink.className);
            } else {
                console.error('âŒ Bouton login-link non trouvÃ© dans le DOM');
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
            showMessage('Le pseudo joueur doit contenir au moins 3 caractÃ¨res.');
            return false;
        }
        
        if (username.length > 20) {
            showMessage('Le pseudo joueur ne peut pas dÃ©passer 20 caractÃ¨res.');
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
            showMessage('Le mot de passe doit contenir au moins 6 caractÃ¨res.');
            return false;
        }
        
        try {
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('username')
                .eq('username', username)
                .single();
                
            if (existingProfile) {
                showMessage('Ce pseudo joueur est dÃ©jÃ  pris. Choisissez-en un autre.');
                return false;
            }
        } catch (checkError) {
            if (checkError.code === 'PGRST116' || checkError.message.includes('406')) {
                // Table inaccessible, on continue
            } else {
                console.error('Erreur vÃ©rification pseudo:', checkError);
                showMessage('Erreur technique lors de la vÃ©rification. RÃ©essayez.');
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
            
            // Si l'utilisateur existe dÃ©jÃ  dans auth.users
            if (signUpError.message.includes('User already registered') || signUpError.message.includes('already been registered')) {
                // NE PAS se connecter automatiquement, juste vÃ©rifier si le profil existe
                // On ne connaÃ®t pas le vrai mot de passe de l'utilisateur existant
                
                showMessage('Ce compte existe dÃ©jÃ . Si c\'est votre compte, connectez-vous. Sinon, utilisez un autre email.');
                setTimeout(() => showLoginForm(), 2000);
                return false;
            }
            
            showMessage(`Erreur lors de l'inscription: ${signUpError.message}`);
            return false;
        }
        
        // Si l'inscription rÃ©ussit, crÃ©er le profil utilisateur
        if (authData.user) {
            debugLog('âœ… Compte Supabase crÃ©Ã©, vÃ©rification du profil...');
            
            // VÃ©rifier d'abord si le profil existe dÃ©jÃ 
            const { data: existingProfile, error: checkError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
                
            if (existingProfile) {
                debugLog('â„¹ï¸ Profil dÃ©jÃ  existant pour cet utilisateur');
                showMessage('Compte crÃ©Ã© avec succÃ¨s ! VÃ©rifiez votre email pour confirmer votre compte.', 'success');
            } else {
                // Le profil n'existe pas, le crÃ©er
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
                    console.error('Erreur crÃ©ation profil:', profileError);
                    
                    if (profileError.code === '23505') {
                        showMessage('Compte crÃ©Ã© avec succÃ¨s ! VÃ©rifiez votre email pour confirmer votre compte.', 'success');
                    } else {
                        showMessage(`Erreur lors de la crÃ©ation du profil: ${profileError.message}. Contactez le support.`);
                        return false;
                    }
                } else {
                    showMessage('Compte crÃ©Ã© avec succÃ¨s ! VÃ©rifiez votre email pour confirmer votre compte.', 'success');
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
    debugLog('ðŸ”‘ Tentative de connexion pour:', email);
    debugLog('ðŸ” Supabase client disponible?', !!supabase);
    debugLog('ðŸ” Supabase auth disponible?', !!supabase?.auth);
    
    try {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        debugLog('ðŸ” RÃ©ponse Supabase:', { authData: !!authData, error: signInError });
        
        if (signInError) {
            console.error('âŒ Erreur de connexion dÃ©taillÃ©e:', signInError);
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
            
            showMessage('Connexion rÃ©ussie ! Redirection...', 'success');
            
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
            console.error('Erreur lors de la dÃ©connexion:', error);
        }
        
        currentUser = null;
        userProfile = null;
        
        // Rediriger vers l'accueil
        window.location.href = '../index.html';
        
    } catch (error) {
        console.error('Erreur technique lors de la dÃ©connexion:', error);
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
        window.userProfile = userProfile; // Mettre Ã  jour immÃ©diatement
        
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
            console.error('Ã‰chec de la rÃ©cupÃ©ration automatique:', recoveryError);
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
            console.error('Erreur crÃ©ation profil:', error);
            
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
            
            throw new Error(`Erreur crÃ©ation profil: ${error.message}`);
        }
        
        userProfile = data;
        checkAuthState();
        return userProfile;
        
    } catch (error) {
        console.error('Erreur technique crÃ©ation profil:', error);
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
        // Correction automatique Ã©chouÃ©e
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
    debugLog('ðŸš€ DÃ©marrage de l\'initialisation auth...');
    
    const supabaseReady = await initSupabase();
    if (!supabaseReady) {
        console.error('âŒ Impossible d\'initialiser Supabase');
        // Forcer l'affichage du bouton connexion si Supabase Ã©choue
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
    
    // VÃ©rifier la session actuelle
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            debugWarn('âš ï¸ Erreur rÃ©cupÃ©ration session:', error);
            currentUser = null;
            userProfile = null;
        } else if (session?.user) {
            debugLog('âœ… Session trouvÃ©e pour:', session.user.email);
            currentUser = session.user;
            window.currentUser = currentUser;
            await loadUserProfile();
        } else {
            debugLog('â„¹ï¸ Aucune session active');
            currentUser = null;
            userProfile = null;
            window.currentUser = null;
            window.userProfile = null;
        }
    } catch (error) {
        console.error('âŒ Erreur lors de la vÃ©rification de session:', error);
        currentUser = null;
        userProfile = null;
    }
    
    // Mettre Ã  jour l'UI une seule fois
    checkAuthState();
    
    // Ã‰couter les changements d'authentification
    supabase.auth.onAuthStateChange(async (event, session) => {
        debugLog('ðŸ”„ Ã‰tat auth changÃ©:', event);
        
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
            } else {
                console.error('Formulaire inscription non trouve dans le DOM');
            }
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
    
    // Bouton de dÃ©connexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    debugLog('âœ… SystÃ¨me d\'authentification Supabase initialisÃ©');
    debugLog('ðŸ“Š Utilisateur actuel:', currentUser ? userProfile?.username || currentUser.email : 'Aucun');
    
    // Rendre les fonctions et variables accessibles globalement
    window.getCurrentUser = getCurrentUser;
    window.getUserProfile = getUserProfile;
    window.isLoggedIn = isLoggedIn;
    window.isAdmin = isAdmin;
    window.supabase = supabase;
    window.currentUser = currentUser;
    window.userProfile = userProfile;

    // Fonction pour exposer les variables mises Ã  jour
    window.updateGlobalAuthVars = function() {
        window.currentUser = currentUser;
        window.userProfile = userProfile;
    };

}); // Fin de DOMContentLoaded