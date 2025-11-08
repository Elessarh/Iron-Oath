/**
 * Script de test pour HDV et système de messagerie Iron Oath
 */

class HDVTestSuite {
    constructor() {
        this.testResults = [];
    }

    // Test complet du système HDV
    async testHDVSystem() {
        console.log('🧪 TESTS HDV IRON OATH');
        console.log('======================\n');

        // Test 1: Vérifier que HDV est chargé
        this.test('HDV System chargé', () => {
            return typeof window.hdvSystem !== 'undefined';
        });

        // Test 2: Vérifier l'authentification
        this.test('Utilisateur authentifié', () => {
            return window.currentUser !== null;
        });

        // Test 3: Vérifier Supabase
        this.test('Supabase connecté', () => {
            return typeof window.supabase !== 'undefined';
        });

        // Test 4: Vérifier le système de messagerie
        this.test('Système de messagerie chargé', () => {
            return typeof window.mailboxSystem !== 'undefined';
        });

        // Test 5: Vérifier l'interface HDV
        this.test('Interface HDV présente', () => {
            const marketplace = document.getElementById('marketplace');
            const ordersTab = document.getElementById('orders-tab');
            const messagesTab = document.getElementById('messages-tab');
            return marketplace && ordersTab && messagesTab;
        });

        // Test 6: Vérifier les boutons d'action
        this.test('Boutons HDV fonctionnels', () => {
            const addOrderBtn = document.getElementById('add-order-btn');
            const refreshBtn = document.getElementById('refresh-orders-btn');
            return addOrderBtn && refreshBtn;
        });

        this.showTestResults();
    }

    // Test spécifique du système de messagerie
    async testMessagingSystem() {
        console.log('\n📧 TESTS SYSTÈME DE MESSAGERIE');
        console.log('===============================\n');

        // Test 1: Vérifier que mailboxSystem existe
        this.test('MailboxSystem initialisé', () => {
            return window.mailboxSystem && typeof window.mailboxSystem.sendMessage === 'function';
        });

        // Test 2: Vérifier Supabase Manager
        this.test('Supabase Manager messagerie', () => {
            return window.mailboxSystem && window.mailboxSystem.supabaseManager;
        });

        // Test 3: Vérifier l'interface de messagerie
        this.test('Interface messagerie présente', () => {
            const messagesContainer = document.getElementById('messages-container');
            const composeForm = document.querySelector('.compose-form');
            return messagesContainer !== null;
        });

        // Test 4: Vérifier les fonctions de base
        this.test('Fonctions messagerie disponibles', () => {
            if (!window.mailboxSystem) return false;
            
            const requiredMethods = [
                'sendMessage',
                'loadMessages', 
                'deleteMessage',
                'markAsRead'
            ];
            
            return requiredMethods.every(method => 
                typeof window.mailboxSystem[method] === 'function'
            );
        });

        this.showTestResults();
    }

    // Test des ordres HDV
    async testHDVOrders() {
        console.log('\n💰 TESTS ORDRES HDV');
        console.log('===================\n');

        if (!window.hdvSystem) {
            console.log('❌ HDV System non disponible pour les tests');
            return;
        }

        // Test 1: Charger les ordres
        this.test('Chargement des ordres', async () => {
            try {
                if (typeof window.hdvSystem.loadOrdersFromStorage === 'function') {
                    await window.hdvSystem.loadOrdersFromStorage();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Erreur chargement ordres:', error);
                return false;
            }
        });

        // Test 2: Vérifier les filtres
        this.test('Système de filtres', () => {
            const categoryFilter = document.getElementById('filter-category');
            const typeFilter = document.getElementById('filter-type');
            return categoryFilter && typeFilter;
        });

        // Test 3: Vérifier la recherche
        this.test('Barre de recherche', () => {
            const searchInput = document.getElementById('search-orders');
            return searchInput !== null;
        });

        this.showTestResults();
    }

    // Exécuter un test individuel
    test(name, testFunction) {
        try {
            const result = testFunction();
            if (result === true) {
                console.log(`✅ ${name}`);
                this.testResults.push({ name, status: 'success' });
            } else if (result === false) {
                console.log(`❌ ${name}`);
                this.testResults.push({ name, status: 'failed' });
            } else if (result instanceof Promise) {
                // Test asynchrone
                result.then(res => {
                    if (res) {
                        console.log(`✅ ${name} (async)`);
                    } else {
                        console.log(`❌ ${name} (async)`);
                    }
                }).catch(err => {
                    console.log(`❌ ${name} (erreur: ${err.message})`);
                });
            }
        } catch (error) {
            console.log(`❌ ${name} (exception: ${error.message})`);
            this.testResults.push({ name, status: 'error', error: error.message });
        }
    }

    // Afficher les résultats des tests
    showTestResults() {
        const success = this.testResults.filter(r => r.status === 'success').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const errors = this.testResults.filter(r => r.status === 'error').length;
        
        console.log('\n📊 RÉSULTATS DES TESTS');
        console.log(`✅ Réussis: ${success}`);
        console.log(`❌ Échoués: ${failed}`);
        console.log(`🚨 Erreurs: ${errors}`);
        console.log(`📋 Total: ${this.testResults.length}`);
    }

    // Test de l'envoi d'un message (simulation)
    async testMessageSending() {
        console.log('\n✉️ TEST ENVOI DE MESSAGE');
        console.log('=========================\n');

        if (!window.mailboxSystem) {
            console.log('❌ Système de messagerie non disponible');
            return;
        }

        if (!window.currentUser) {
            console.log('❌ Utilisateur non connecté');
            return;
        }

        console.log('🔍 Test simulation envoi de message...');
        
        // Simuler la préparation d'un message
        const testMessage = {
            to: 'TestUser',
            subject: 'Test de fonctionnement',
            content: 'Ceci est un test automatique du système de messagerie'
        };

        console.log('📝 Message de test préparé:');
        console.log(`  - Destinataire: ${testMessage.to}`);
        console.log(`  - Sujet: ${testMessage.subject}`);
        console.log(`  - Contenu: ${testMessage.content}`);

        // Vérifier que la fonction sendMessage existe
        if (typeof window.mailboxSystem.sendMessage === 'function') {
            console.log('✅ Fonction sendMessage disponible');
        } else {
            console.log('❌ Fonction sendMessage non disponible');
        }

        console.log('⚠️ Test d\'envoi non exécuté (mode simulation)');
    }
}

// Test de connectivité Supabase
async function testSupabaseConnection() {
    console.log('\n🔗 TEST CONNEXION SUPABASE');
    console.log('===========================\n');

    if (typeof window.supabase === 'undefined') {
        console.log('❌ Supabase non chargé');
        return;
    }

    try {
        // Test de connexion simple
        const { data, error } = await window.supabase.from('messages').select('id').limit(1);
        
        if (error) {
            console.log('❌ Erreur connexion Supabase:', error.message);
        } else {
            console.log('✅ Connexion Supabase fonctionnelle');
        }
    } catch (error) {
        console.log('❌ Exception Supabase:', error.message);
    }
}

// Fonctions globales
window.testHDVSystem = async function() {
    const tester = new HDVTestSuite();
    await tester.testHDVSystem();
};

window.testMessagingSystem = async function() {
    const tester = new HDVTestSuite();
    await tester.testMessagingSystem();
};

window.testHDVOrders = async function() {
    const tester = new HDVTestSuite();
    await tester.testHDVOrders();
};

window.testMessageSending = async function() {
    const tester = new HDVTestSuite();
    await tester.testMessageSending();
};

window.testSupabaseConnection = testSupabaseConnection;

window.fullHDVTest = async function() {
    console.log('🚀 TEST COMPLET HDV & MESSAGERIE IRON OATH');
    console.log('==========================================\n');
    
    const tester = new HDVTestSuite();
    
    await tester.testHDVSystem();
    await tester.testMessagingSystem();
    await tester.testHDVOrders();
    await tester.testMessageSending();
    await testSupabaseConnection();
    
    console.log('\n🎯 TESTS TERMINÉS !');
    console.log('\nCommandes disponibles:');
    console.log('- testHDVSystem() : Test système HDV');
    console.log('- testMessagingSystem() : Test messagerie');
    console.log('- testHDVOrders() : Test ordres HDV');
    console.log('- testMessageSending() : Test envoi messages');
    console.log('- testSupabaseConnection() : Test Supabase');
};

// Auto-chargement
if (document.title.includes('HDV') || document.title.includes('Iron Oath')) {
    console.log('🔧 Tests HDV chargés. Utilisez fullHDVTest() pour tester.');
}

console.log('✅ Suite de tests HDV & Messagerie prête !');