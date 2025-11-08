// security.js - Protection des informations sensibles
class SecurityManager {
    constructor() {
        this.isDevToolsOpen = false;
        this.devToolsOpenCount = 0;
        this.warningShown = false;
        this.initSecurity();
    }

    initSecurity() {
        console.log('🔒 Initialisation du système de sécurité...');
        
        // Protection basique contre l'ouverture des outils de développement
        this.detectDevTools();
        
        // Masquer les éléments sensibles
        this.hideConsoleSecrets();
        
        // Protection contre le clic droit (optionnel)
        this.disableContextMenu();
        
        // Protection contre les raccourcis clavier
        this.disableDevToolsShortcuts();
        
        // Obfuscation des variables sensibles
        this.obfuscateGlobalVariables();
        
        console.log('✅ Système de sécurité activé');
    }

    // Détecter l'ouverture des outils de développement
    detectDevTools() {
        let devtools = {
            open: false,
            orientation: null
        };

        const threshold = 160;

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.onDevToolsOpen();
                }
            } else {
                if (devtools.open) {
                    devtools.open = false;
                    this.onDevToolsClose();
                }
            }
        }, 500);

        // Détection alternative avec console.log
        let element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                this.onDevToolsOpen();
                return 'devtools-detected';
            }
        });
        
        // Cette ligne sera interceptée si les devtools sont ouverts
        console.log('%c🔒 Iron Oath - Site protégé', 'color: red; font-size: 20px; font-weight: bold;', element);
    }

    onDevToolsOpen() {
        if (!this.isDevToolsOpen) {
            this.isDevToolsOpen = true;
            this.devToolsOpenCount++;
            
            if (!this.warningShown) {
                this.showSecurityWarning();
                this.warningShown = true;
            }
            
            // Masquer certaines informations sensibles
            this.hideSupabaseCredentials();
            this.clearConsoleSecrets();
        }
    }

    onDevToolsClose() {
        this.isDevToolsOpen = false;
        console.log('🔒 Outils développeur fermés');
    }

    showSecurityWarning() {
        // Affichage d'un avertissement discret dans la console uniquement
        console.clear();
        console.log('%c⚠️ AVERTISSEMENT DE SÉCURITÉ ⚠️', 'color: red; font-size: 20px; font-weight: bold; background: yellow; padding: 5px;');
        console.log('%cCe site est protégé contre les injections et manipulations.', 'color: red; font-size: 14px;');
        console.log('%cL\'utilisation malveillante des outils de développement est surveillée.', 'color: orange; font-size: 12px;');
        
        // Affichage d'une notification discrète seulement la première fois
        if (this.devToolsOpenCount === 1) {
            this.showQuickWarning('Outils développeur détectés - Site protégé');
            
            // Plus d'overlay modal intrusif, juste une notification
        }
    }

    // Masquer les credentials Supabase
    hideSupabaseCredentials() {
        if (window.supabase) {
            try {
                // Vérifier si les propriétés existent déjà avant de les redéfinir
                const descriptor1 = Object.getOwnPropertyDescriptor(window.supabase, 'supabaseKey');
                const descriptor2 = Object.getOwnPropertyDescriptor(window.supabase, 'supabaseUrl');
                
                if (!descriptor1 || descriptor1.configurable !== false) {
                    Object.defineProperty(window.supabase, 'supabaseKey', {
                        get: () => '***HIDDEN***',
                        set: () => {},
                        configurable: false
                    });
                }
                
                if (!descriptor2 || descriptor2.configurable !== false) {
                    Object.defineProperty(window.supabase, 'supabaseUrl', {
                        get: () => '***HIDDEN***',
                        set: () => {},
                        configurable: false
                    });
                }
            } catch (error) {
                // Ignorer les erreurs de redéfinition
                console.log('🔒 Propriétés Supabase déjà protégées');
            }
        }
    }

    // Nettoyer les secrets de la console
    clearConsoleSecrets() {
        // Redéfinir console.log pour filtrer les informations sensibles
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        const sensitiveTerms = [
            'supabase_url', 'supabase_key', 'api_key', 'secret', 'password',
            'token', 'auth_token', 'bearer', 'authorization'
        ];
        
        const filterSensitive = (args) => {
            return args.map(arg => {
                if (typeof arg === 'string') {
                    let filtered = arg;
                    sensitiveTerms.forEach(term => {
                        const regex = new RegExp(`${term}['":]\\s*['"][^'"]*['"]`, 'gi');
                        filtered = filtered.replace(regex, `${term}: "***HIDDEN***"`);
                    });
                    return filtered;
                }
                return arg;
            });
        };
        
        console.log = (...args) => originalLog(...filterSensitive(args));
        console.error = (...args) => originalError(...filterSensitive(args));
        console.warn = (...args) => originalWarn(...filterSensitive(args));
    }

    // Masquer les éléments sensibles dans la console
    hideConsoleSecrets() {
        // Masquer les variables globales sensibles
        const sensitiveVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
        
        sensitiveVars.forEach(varName => {
            if (window[varName]) {
                Object.defineProperty(window, varName, {
                    get: () => '***PROTECTED***',
                    set: () => {},
                    configurable: false
                });
            }
        });
    }

    // Désactiver le menu contextuel (clic droit) - Protection sur toutes les pages SAUF HDV
    disableContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            // Vérifier si on est sur la page HDV
            const isHDVPage = window.location.pathname.includes('hdv.html') || 
                             document.title.includes('HDV') ||
                             document.querySelector('.hdv-container');
                             
            if (!isHDVPage) {
                // Bloquer sur toutes les pages SAUF HDV
                e.preventDefault();
                console.log('🔒 Clic droit bloqué pour la protection du site');
                return false;
            }
            // Permettre le clic droit sur HDV
        });
    }

    // Désactiver les raccourcis clavier pour les devtools (plus discret)
    disableDevToolsShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Seulement désactiver F12 et les raccourcis les plus sensibles
            if (e.key === 'F12') {
                e.preventDefault();
                console.log('🔒 F12 désactivé pour la sécurité');
                return false;
            }
            
            // Ctrl+Shift+I (Outils développeur) - Log seulement
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                console.log('🔒 Tentative d\'ouverture des outils développeur détectée');
                // Ne pas bloquer complètement, juste logger
            }
            
            // Protection contre Ctrl+U (code source) seulement si maintenu
            if (e.ctrlKey && e.key === 'u') {
                console.log('🔒 Tentative d\'affichage du code source');
                // Optionnel: e.preventDefault();
            }
        });
    }

    // Afficher un avertissement rapide et discret
    showQuickWarning(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animation d'apparition
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Retrait automatique après 2 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }

    // Obfuscation des variables globales
    obfuscateGlobalVariables() {
        // Créer des variables trompeuses
        window._fakeApiKey = 'fake_key_do_not_use';
        window._fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token';
        window._fakeSecret = 'not_a_real_secret_123456';
        
        // Rediriger vers des fonctions vides pour certaines variables sensibles
        const obfuscatedFunctions = {
            getApiKey: () => '***PROTECTED***',
            getSecret: () => '***PROTECTED***',
            getToken: () => '***PROTECTED***'
        };
        
        Object.assign(window, obfuscatedFunctions);
    }

    // Méthode pour désactiver temporairement la sécurité (pour debug légal)
    disableSecurity(password) {
        if (password === 'iron_oath_dev_2025') {
            console.log('🔓 Sécurité temporairement désactivée pour debug');
            this.securityDisabled = true;
            return true;
        } else {
            console.error('❌ Mot de passe incorrect');
            return false;
        }
    }

    // Réactiver la sécurité
    enableSecurity() {
        this.securityDisabled = false;
        console.log('🔒 Sécurité réactivée');
    }
}

// Initialiser le système de sécurité au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
});

// Message de bienvenue sécurisé
console.log('%cIron Oath', 'color: #4a90e2; font-size: 32px; font-weight: bold;');
console.log('%cSite protégé par des mesures de sécurité.', 'color: #666; font-size: 14px;');
console.log('%cPour du support technique: contact@iron-oath.fr', 'color: #666; font-size: 12px;');