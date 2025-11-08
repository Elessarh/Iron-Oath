/**
 * Script de vérification des liens et redirections Iron Oath
 * Vérifie que tous les liens fonctionnent correctement
 */

class LinkChecker {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    // Vérifier tous les liens de la page courante
    checkAllLinks() {
        console.log('🔍 Vérification des liens de la page...');
        
        const links = document.querySelectorAll('a[href]');
        console.log(`📊 ${links.length} liens trouvés`);
        
        links.forEach((link, index) => {
            this.checkLink(link, index);
        });
        
        this.showResults();
    }
    
    // Vérifier un lien individuel
    checkLink(link, index) {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        // Ignorer les liens externes
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            this.success.push(`✅ Lien externe valide: ${text} → ${href}`);
            return;
        }
        
        // Vérifier les liens internes
        if (href.startsWith('#')) {
            // Liens d'ancrage
            const target = document.querySelector(href);
            if (target) {
                this.success.push(`✅ Ancrage valide: ${text} → ${href}`);
            } else {
                this.errors.push(`❌ Ancrage introuvable: ${text} → ${href}`);
            }
            return;
        }
        
        // Vérifier les chemins de fichiers
        this.checkFilePath(href, text);
    }
    
    // Vérifier un chemin de fichier
    checkFilePath(href, text) {
        // Nettoyer le chemin
        let path = href;
        if (path.includes('?')) {
            path = path.split('?')[0];
        }
        if (path.includes('#')) {
            path = path.split('#')[0];
        }
        
        // Vérifier selon le type de fichier
        if (path.endsWith('.html')) {
            // Pages HTML
            const expectedPages = [
                'index.html',
                '../index.html',
                'pages/about.html',
                'about.html',
                'pages/map.html', 
                'map.html',
                'pages/bestiaire.html',
                'bestiaire.html',
                'pages/items.html',
                'items.html',
                'pages/hdv.html',
                'hdv.html',
                'pages/quetes.html',
                'quetes.html',
                'pages/connexion.html',
                'connexion.html'
            ];
            
            if (expectedPages.includes(path)) {
                this.success.push(`✅ Page valide: ${text} → ${path}`);
            } else {
                this.warnings.push(`⚠️  Page inconnue: ${text} → ${path}`);
            }
        } else if (path.includes('assets/')) {
            // Assets
            if (path.includes('Logo_3.png')) {
                this.success.push(`✅ Logo: ${text} → ${path}`);
            } else {
                this.warnings.push(`⚠️  Asset: ${text} → ${path}`);
            }
        } else {
            this.warnings.push(`⚠️  Lien non classifié: ${text} → ${path}`);
        }
    }
    
    // Afficher les résultats
    showResults() {
        console.log('\n📋 RÉSULTATS DE LA VÉRIFICATION');
        console.log('================================');
        
        console.log(`\n✅ SUCCÈS (${this.success.length})`);
        this.success.forEach(msg => console.log(msg));
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  AVERTISSEMENTS (${this.warnings.length})`);
            this.warnings.forEach(msg => console.log(msg));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ERREURS (${this.errors.length})`);
            this.errors.forEach(msg => console.log(msg));
        }
        
        console.log('\n📊 RÉSUMÉ');
        console.log(`- Liens valides: ${this.success.length}`);
        console.log(`- Avertissements: ${this.warnings.length}`);
        console.log(`- Erreurs: ${this.errors.length}`);
        
        if (this.errors.length === 0) {
            console.log('\n🎉 Tous les liens critiques fonctionnent !');
        } else {
            console.log('\n⚠️  Certains liens nécessitent votre attention.');
        }
    }
    
    // Vérifier spécifiquement les redirections du logo
    checkLogoRedirections() {
        console.log('🔍 Vérification des redirections du logo...');
        
        const logoLinks = document.querySelectorAll('a[href*="about.html"] img[src*="Logo_3.png"]');
        const logoImages = document.querySelectorAll('img[src*="Logo_3.png"]');
        
        console.log(`📊 ${logoImages.length} logo(s) trouvé(s)`);
        console.log(`📊 ${logoLinks.length} logo(s) avec redirection vers about.html`);
        
        if (logoLinks.length > 0) {
            logoLinks.forEach((img, index) => {
                const link = img.closest('a');
                console.log(`✅ Logo ${index + 1}: Redirige vers ${link.href}`);
            });
        }
        
        // Vérifier si certains logos ne sont pas dans des liens
        logoImages.forEach((img, index) => {
            const parentLink = img.closest('a');
            if (!parentLink) {
                console.log(`⚠️  Logo ${index + 1}: Pas de redirection`);
            }
        });
    }
    
    // Vérifier la cohérence de la navigation
    checkNavigationConsistency() {
        console.log('🧭 Vérification de la cohérence de navigation...');
        
        const navLinks = document.querySelectorAll('.nav-menu a');
        const expectedNavItems = [
            'Accueil',
            'À Propos', 
            'Carte',
            'Bestiaire',
            'Items',
            'HDV',
            'Quêtes'
        ];
        
        const foundNavItems = Array.from(navLinks).map(link => link.textContent.trim());
        
        console.log('📋 Navigation trouvée:', foundNavItems);
        console.log('📋 Navigation attendue:', expectedNavItems);
        
        expectedNavItems.forEach(item => {
            if (foundNavItems.includes(item)) {
                console.log(`✅ Élément de navigation présent: ${item}`);
            } else {
                console.log(`❌ Élément de navigation manquant: ${item}`);
            }
        });
        
        // Vérifier la page active
        const activeLinks = document.querySelectorAll('.nav-menu a.active');
        if (activeLinks.length === 1) {
            console.log(`✅ Page active correctement marquée: ${activeLinks[0].textContent.trim()}`);
        } else if (activeLinks.length === 0) {
            console.log('⚠️  Aucune page active marquée');
        } else {
            console.log('❌ Plusieurs pages marquées comme actives');
        }
    }
}

// Fonction globale pour vérifier tous les liens
window.checkAllLinks = function() {
    const checker = new LinkChecker();
    checker.checkAllLinks();
};

// Fonction pour vérifier spécifiquement les logos
window.checkLogoRedirections = function() {
    const checker = new LinkChecker();
    checker.checkLogoRedirections();
};

// Fonction pour vérifier la navigation
window.checkNavigation = function() {
    const checker = new LinkChecker();
    checker.checkNavigationConsistency();
};

// Fonction de vérification complète
window.fullLinkCheck = function() {
    console.log('🚀 VÉRIFICATION COMPLÈTE DES LIENS IRON OATH');
    console.log('===========================================\n');
    
    const checker = new LinkChecker();
    
    // Vérifications individuelles
    checker.checkNavigationConsistency();
    console.log('\n' + '='.repeat(50) + '\n');
    
    checker.checkLogoRedirections();
    console.log('\n' + '='.repeat(50) + '\n');
    
    checker.checkAllLinks();
    
    console.log('\n🎯 VÉRIFICATION TERMINÉE !');
    console.log('Pour des vérifications spécifiques, utilisez:');
    console.log('- checkAllLinks() : Tous les liens');
    console.log('- checkLogoRedirections() : Redirections du logo');
    console.log('- checkNavigation() : Cohérence de navigation');
};

// Auto-exécution si on est sur une page Iron Oath
if (document.title.includes('Iron Oath')) {
    console.log('🔧 Script de vérification des liens chargé');
    console.log('📞 Utilisez fullLinkCheck() pour une vérification complète');
    
    // Vérification automatique légère au chargement
    setTimeout(() => {
        const checker = new LinkChecker();
        checker.checkLogoRedirections();
    }, 1000);
}

console.log('✅ Link Checker Iron Oath prêt !');