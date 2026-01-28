/* performance-monitor.js - Moniteur de performance pour Iron Oath */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            dbQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalRequests: 0,
            errors: []
        };
        this.startTime = performance.now();
        this.init();
    }

    init() {
        // Mesurer le temps de chargement de la page
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now() - this.startTime;
            // console.log(`⏱️ Page chargée en ${this.metrics.pageLoadTime.toFixed(2)}ms`);
        });

        // Intercepter les logs du cache
        this.monitorCache();
        
        // Afficher les métriques après 5 secondes
        setTimeout(() => this.displayMetrics(), 5000);
    }

    monitorCache() {
        const originalLog = console.log;
        console.log = (...args) => {
            const message = args.join(' ');
            
            // Compter les cache hits/misses
            if (message.includes('📦 Cache HIT')) {
                this.metrics.cacheHits++;
            } else if (message.includes('🔄 Cache MISS')) {
                this.metrics.cacheMisses++;
                this.metrics.dbQueries++;
            }
            
            // Compter les requêtes totales
            if (message.includes('chargé') || message.includes('charge')) {
                this.metrics.totalRequests++;
            }
            
            originalLog.apply(console, args);
        };
    }

    recordError(error, context = '') {
        this.metrics.errors.push({
            message: error.message || error,
            context: context,
            timestamp: new Date().toISOString()
        });
    }

    displayMetrics() {
        // console.log('\n📊 === RAPPORT DE PERFORMANCE ===');
        // console.log(`⏱️  Temps de chargement: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
        // console.log(`🗄️  Requêtes DB: ${this.metrics.dbQueries}`);
        // console.log(`📦 Cache Hits: ${this.metrics.cacheHits}`);
        // console.log(`🔄 Cache Misses: ${this.metrics.cacheMisses}`);
        
        const cacheEfficiency = this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(1)
            : 0;
        // console.log(`💯 Efficacité cache: ${cacheEfficiency}%`);
        
        // console.log(`🌐 Requêtes totales: ${this.metrics.totalRequests}`);
        
        if (this.metrics.errors.length > 0) {
            // console.log(`❌ Erreurs: ${this.metrics.errors.length}`);
            this.metrics.errors.forEach(err => {
                // console.log(`   - ${err.context}: ${err.message}`);
            });
        } else {
            // console.log(`✅ Aucune erreur`);
        }
        
        // console.log('=================================\n');
        
        // Évaluation
        this.evaluatePerformance();
    }

    evaluatePerformance() {
        // console.log('🎯 === ÉVALUATION ===');
        
        // Temps de chargement
        if (this.metrics.pageLoadTime < 1500) {
            // console.log('✅ Temps de chargement: EXCELLENT');
        } else if (this.metrics.pageLoadTime < 2500) {
            // console.log('⚠️  Temps de chargement: BON');
        } else {
            // console.log('❌ Temps de chargement: À AMÉLIORER');
        }
        
        // Requêtes DB
        if (this.metrics.dbQueries < 5) {
            // console.log('✅ Requêtes DB: OPTIMAL');
        } else if (this.metrics.dbQueries < 10) {
            // console.log('⚠️  Requêtes DB: ACCEPTABLE');
        } else {
            // console.log('❌ Requêtes DB: TROP NOMBREUSES');
        }
        
        // Cache
        const cacheEfficiency = this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100)
            : 0;
            
        if (cacheEfficiency > 70) {
            // console.log('✅ Cache: TRÈS EFFICACE');
        } else if (cacheEfficiency > 40) {
            // console.log('⚠️  Cache: EFFICACE');
        } else if (cacheEfficiency > 0) {
            // console.log('❌ Cache: PEU EFFICACE');
        } else {
            // console.log('ℹ️  Cache: Pas encore utilisé (normal au premier chargement)');
        }
        
        // console.log('====================\n');
    }

    getMetrics() {
        return this.metrics;
    }

    reset() {
        this.metrics = {
            pageLoadTime: 0,
            dbQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalRequests: 0,
            errors: []
        };
        this.startTime = performance.now();
        // console.log('🔄 Métriques réinitialisées');
    }
}

// Activer le moniteur de performance en mode développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.perfMonitor = new PerformanceMonitor();
    // console.log('📊 Moniteur de performance activé (mode développement)');
    // console.log('💡 Utilisez perfMonitor.displayMetrics() pour voir les statistiques');
    // console.log('💡 Utilisez perfMonitor.reset() pour réinitialiser les compteurs');
}
