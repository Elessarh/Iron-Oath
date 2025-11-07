// migration-hdv.js - Script pour migrer les données HDV de localStorage vers Supabase
class HDVMigration {
    constructor() {
        this.supabase = window.supabase;
    }

    async migrateLocalDataToSupabase() {
        console.log('🔄 Début de la migration HDV localStorage → Supabase');
        
        try {
            // Vérifier si l'utilisateur est connecté
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                console.log('❌ Utilisateur non connecté, migration impossible');
                return false;
            }

            // Récupérer les données locales
            const localOrders = localStorage.getItem('hdv_orders');
            const localMyOrders = localStorage.getItem('hdv_my_orders');

            if (!localOrders && !localMyOrders) {
                console.log('ℹ️ Aucune donnée locale à migrer');
                return true;
            }

            let ordersToMigrate = [];
            
            // Parser les ordres locaux
            if (localOrders) {
                const orders = JSON.parse(localOrders);
                ordersToMigrate = ordersToMigrate.concat(orders);
            }
            
            if (localMyOrders) {
                const myOrders = JSON.parse(localMyOrders);
                // Éviter les doublons
                const existingIds = ordersToMigrate.map(o => o.id);
                const newOrders = myOrders.filter(o => !existingIds.includes(o.id));
                ordersToMigrate = ordersToMigrate.concat(newOrders);
            }

            console.log(`📦 ${ordersToMigrate.length} ordres à migrer`);

            // Migrer chaque ordre
            let migrated = 0;
            let errors = 0;

            for (const order of ordersToMigrate) {
                try {
                    const orderData = {
                        user_id: user.id,
                        username: order.username || order.creator || 'Joueur_Inconnu',
                        type: order.type,
                        item_name: order.item.name,
                        item_image: order.item.image,
                        item_category: order.item.category,
                        item_type: order.item.type,
                        quantity: order.quantity,
                        price: order.price,
                        total_price: order.total || (order.quantity * order.price),
                        status: 'active',
                        created_at: order.timestamp ? new Date(order.timestamp).toISOString() : new Date().toISOString()
                    };

                    const { error } = await this.supabase
                        .from('market_orders')
                        .insert([orderData]);

                    if (error) {
                        console.error('❌ Erreur migration ordre:', order.id, error);
                        errors++;
                    } else {
                        console.log(`✅ Ordre migré: ${order.item.name}`);
                        migrated++;
                    }
                } catch (error) {
                    console.error('❌ Erreur migration ordre:', order.id, error);
                    errors++;
                }
            }

            console.log(`📊 Migration terminée: ${migrated} réussies, ${errors} erreurs`);

            // Proposer de supprimer les données locales
            if (migrated > 0) {
                const shouldClear = confirm(`✅ Migration réussie ! ${migrated} ordres migrés vers Supabase.\n\nVoulez-vous supprimer les données locales maintenant ?`);
                if (shouldClear) {
                    localStorage.removeItem('hdv_orders');
                    localStorage.removeItem('hdv_my_orders');
                    console.log('🗑️ Données locales supprimées');
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur migration:', error);
            return false;
        }
    }

    // Fonction pour vérifier s'il y a des données à migrer
    hasLocalData() {
        const localOrders = localStorage.getItem('hdv_orders');
        const localMyOrders = localStorage.getItem('hdv_my_orders');
        return !!(localOrders || localMyOrders);
    }

    // Fonction pour proposer la migration automatiquement
    async checkAndOfferMigration() {
        if (!this.hasLocalData()) {
            return;
        }

        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
            return;
        }

        // Vérifier si l'utilisateur a déjà des données dans Supabase
        const { data: existingOrders } = await this.supabase
            .from('market_orders')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        if (existingOrders && existingOrders.length > 0) {
            console.log('ℹ️ Utilisateur a déjà des données dans Supabase, migration non proposée');
            return;
        }

        // Proposer la migration
        const shouldMigrate = confirm('📦 Des données HDV locales ont été détectées.\n\nVoulez-vous les migrer vers Supabase pour les partager avec les autres joueurs ?');
        if (shouldMigrate) {
            await this.migrateLocalDataToSupabase();
        }
    }
}

// Créer l'instance globale
window.hdvMigration = new HDVMigration();

// Auto-vérification au chargement (avec délai pour laisser l'auth se charger)
setTimeout(() => {
    if (window.hdvMigration && window.supabase) {
        window.hdvMigration.checkAndOfferMigration();
    }
}, 2000);