// hdv-supabase.js - Système HDV avec intégration Supabase
// Fonctions pour remplacer localStorage par Supabase

class HDVSupabaseManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.waitForSupabase();
    }

    // Attendre que Supabase soit disponible
    async waitForSupabase() {
        console.log('⏳ Attente de Supabase...');
        
        for (let i = 0; i < 50; i++) { // Max 5 secondes d'attente
            if (window.supabase) {
                this.supabase = window.supabase;
                this.initialized = true;
                console.log('✅ Supabase connecté au HDV Manager');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.error('❌ Timeout: Supabase non disponible après 5 secondes');
        return false;
    }

    // S'assurer que Supabase est initialisé
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
        return this.initialized;
    }

    // Sauvegarder un ordre dans Supabase
    async saveOrderToSupabase(order) {
        try {
            // S'assurer que Supabase est initialisé
            const ready = await this.ensureInitialized();
            if (!ready) {
                throw new Error('Supabase non disponible');
            }

            console.log('💾 Sauvegarde ordre vers Supabase:', order);
            
            // Obtenir l'utilisateur actuel
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Utilisateur non connecté');
            }

            // Préparer les données de l'ordre
            const orderData = {
                user_id: user.id,
                username: order.username,
                type: order.type,
                item_name: order.item.name,
                item_image: order.item.image,
                item_category: order.item.category,
                item_type: order.item.type,
                quantity: order.quantity,
                price: order.price,
                total_price: order.total,
                status: 'active'
            };

            console.log('📤 Données envoyées à Supabase:', orderData);

            const { data, error } = await this.supabase
                .from('market_orders')
                .insert([orderData])
                .select();

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw error;
            }

            console.log('✅ Ordre sauvegardé:', data[0]);
            return data[0];
        } catch (error) {
            console.error('❌ Erreur sauvegarde ordre:', error);
            throw error;
        }
    }

    // Charger tous les ordres actifs depuis Supabase
    async loadOrdersFromSupabase() {
        try {
            // S'assurer que Supabase est initialisé
            const ready = await this.ensureInitialized();
            if (!ready) {
                throw new Error('Supabase non disponible');
            }

            console.log('📥 Chargement ordres depuis Supabase...');

            const { data, error } = await this.supabase
                .from('market_orders')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw error;
            }

            console.log(`✅ ${data.length} ordres chargés depuis Supabase`);
            return this.formatOrdersFromSupabase(data);
        } catch (error) {
            console.error('❌ Erreur chargement ordres:', error);
            return { orders: [], myOrders: [] };
        }
    }

    // Charger les ordres de l'utilisateur actuel
    async loadMyOrdersFromSupabase() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return [];
            }

            const { data, error } = await this.supabase
                .from('market_orders')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return this.formatMyOrdersFromSupabase(data);
        } catch (error) {
            console.error('❌ Erreur chargement mes ordres:', error);
            return [];
        }
    }

    // Supprimer un ordre
    async deleteOrderFromSupabase(orderId) {
        try {
            console.log('🗑️ Suppression ordre:', orderId);

            const { error } = await this.supabase
                .from('market_orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            console.log('✅ Ordre supprimé');
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression ordre:', error);
            return false;
        }
    }

    // Formater les ordres depuis Supabase vers le format HDV
    formatOrdersFromSupabase(data) {
        const orders = [];
        const user = this.getCurrentUserSync();
        const myOrders = [];

        data.forEach(order => {
            const formattedOrder = {
                id: order.id,
                type: order.type,
                item: {
                    name: order.item_name,
                    image: order.item_image,
                    category: order.item_category,
                    type: order.item_type
                },
                quantity: order.quantity,
                price: order.price,
                total: order.total_price,
                username: order.username,
                timestamp: new Date(order.created_at).toLocaleString(),
                created_at: order.created_at
            };

            orders.push(formattedOrder);

            // Si c'est un ordre de l'utilisateur actuel, l'ajouter aussi à myOrders
            if (user && order.user_id === user.id) {
                myOrders.push(formattedOrder);
            }
        });

        return { orders, myOrders };
    }

    formatMyOrdersFromSupabase(data) {
        return data.map(order => ({
            id: order.id,
            type: order.type,
            item: {
                name: order.item_name,
                image: order.item_image,
                category: order.item_category,
                type: order.item_type
            },
            quantity: order.quantity,
            price: order.price,
            total: order.total_price,
            username: order.username,
            timestamp: new Date(order.created_at).toLocaleString(),
            created_at: order.created_at
        }));
    }

    // Obtenir l'utilisateur actuel (async)
    async getCurrentUser() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }

    // Obtenir l'utilisateur actuel (sync) - utilise les variables globales
    getCurrentUserSync() {
        if (typeof currentUser !== 'undefined') {
            return currentUser;
        }
        return null;
    }

    // Obtenir le profil utilisateur actuel
    getCurrentUserProfile() {
        if (typeof userProfile !== 'undefined') {
            return userProfile;
        }
        return null;
    }

    // Vérifier si Supabase est disponible
    async isSupabaseAvailable() {
        const ready = await this.ensureInitialized();
        return ready && this.supabase !== null;
    }
}

// Instance globale
window.hdvSupabaseManager = new HDVSupabaseManager();