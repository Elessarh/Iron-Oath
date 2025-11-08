// mailbox-supabase.js - Gestionnaire de messagerie avec Supabase
class MailboxSupabaseManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        console.log('📬 Initialisation MailboxSupabaseManager...');
        this.ensureInitialized();
    }

    // S'assurer que Supabase est initialisé
    async ensureInitialized() {
        if (this.initialized && this.supabase) {
            return true;
        }

        console.log('⏳ Attente de Supabase pour messagerie...');
        
        // Attendre que Supabase soit disponible
        let attempts = 0;
        while (!window.supabase && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.supabase) {
            console.error('❌ Supabase non disponible pour la messagerie');
            return false;
        }

        this.supabase = window.supabase;
        this.initialized = true;
        console.log('✅ Supabase connecté au Mailbox Manager');
        return true;
    }

    // Obtenir l'utilisateur actuel
    async getCurrentUser() {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }

    // Obtenir le profil utilisateur avec username
    async getUserProfile(userId = null) {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            let targetUserId = userId;
            
            // Si pas d'userId fourni, récupérer l'utilisateur actuel
            if (!targetUserId) {
                const { data: { user }, error: userError } = await this.supabase.auth.getUser();
                if (userError || !user) {
                    console.error('❌ Erreur récupération utilisateur actuel:', userError);
                    return null;
                }
                targetUserId = user.id;
            }
            
            console.log('🔍 Recherche profil utilisateur ID:', targetUserId);
            
            // Utiliser EXPLICITEMENT la table user_profiles
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (error) {
                console.error('❌ Erreur profil utilisateur (user_profiles):', error);
                return null;
            }

            console.log('✅ Profil utilisateur trouvé:', data);
            return data;
        } catch (error) {
            console.error('❌ Erreur dans getUserProfile:', error);
            return null;
        }
    }

    // Envoyer un message
    async sendMessage(recipientUsername, subject, content, messageType = 'user', orderId = null) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) {
                throw new Error('Supabase non disponible');
            }

            console.log('📤 Envoi message:', { recipientUsername, subject, messageType });

            // Obtenir l'expéditeur
            const senderProfile = await this.getUserProfile();
            if (!senderProfile) {
                throw new Error('Profil expéditeur non trouvé');
            }

            // Trouver le destinataire
            console.log('🔍 Recherche destinataire:', recipientUsername);
            let { data: recipientData, error: recipientError } = await this.supabase
                .from('user_profiles')
                .select('id, username')
                .eq('username', recipientUsername)
                .single();

            console.log('👤 Résultat recherche destinataire:', { recipientData, recipientError });

            if (recipientError || !recipientData) {
                // Essayer de créer automatiquement le profil utilisateur si non trouvé
                console.log('⚠️ Destinataire non trouvé, tentative de création automatique...');
                
                try {
                    const { data: newUser, error: createError } = await this.supabase
                        .from('user_profiles')
                        .insert([{
                            username: recipientUsername,
                            role: 'joueur'
                        }])
                        .select()
                        .single();
                        
                    if (createError) {
                        throw new Error(`Impossible de créer le profil pour "${recipientUsername}": ${createError.message}`);
                    }
                    
                    console.log('✅ Profil créé automatiquement:', newUser);
                    recipientData = newUser;
                } catch (createErr) {
                    throw new Error(`Destinataire "${recipientUsername}" non trouvé et création automatique échouée: ${createErr.message}`);
                }
            } else {
                console.log('✅ Destinataire trouvé:', recipientData);
            }

            // Préparer les données du message
            const messageData = {
                sender_id: senderProfile.id,
                sender_username: senderProfile.username,
                recipient_id: recipientData.id,
                recipient_username: recipientData.username,
                subject: subject,
                content: content,
                message_type: messageType,
                order_id: orderId
            };

            // Insérer le message
            const { data, error } = await this.supabase
                .from('messages')
                .insert([messageData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur envoi message:', error);
                throw error;
            }

            console.log('✅ Message envoyé avec succès:', data.id);
            return data;

        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            throw error;
        }
    }

    // Charger les messages reçus
    async loadReceivedMessages() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const user = await this.getCurrentUser();
            if (!user) return [];

            console.log('📥 Chargement messages reçus...');

            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur chargement messages reçus:', error);
                return [];
            }

            console.log(`✅ ${data.length} messages reçus chargés`);
            return data;

        } catch (error) {
            console.error('❌ Erreur chargement messages reçus:', error);
            return [];
        }
    }

    // Charger les messages envoyés
    async loadSentMessages() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const user = await this.getCurrentUser();
            if (!user) return [];

            console.log('📤 Chargement messages envoyés...');

            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .eq('sender_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erreur chargement messages envoyés:', error);
                return [];
            }

            console.log(`✅ ${data.length} messages envoyés chargés`);
            return data;

        } catch (error) {
            console.error('❌ Erreur chargement messages envoyés:', error);
            return [];
        }
    }

    // Marquer un message comme lu
    async markAsRead(messageId) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return false;

            const { error } = await this.supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', messageId);

            if (error) {
                console.error('❌ Erreur marquage lecture:', error);
                return false;
            }

            console.log('✅ Message marqué comme lu:', messageId);
            return true;

        } catch (error) {
            console.error('❌ Erreur marquage lecture:', error);
            return false;
        }
    }

    // Obtenir le nombre de messages non lus
    async getUnreadCount() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return 0;

            const user = await this.getCurrentUser();
            if (!user) return 0;

            const { data, error } = await this.supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('recipient_id', user.id)
                .is('read_at', null);

            if (error) {
                console.error('❌ Erreur comptage non lus:', error);
                return 0;
            }

            return data.length;

        } catch (error) {
            console.error('❌ Erreur comptage non lus:', error);
            return 0;
        }
    }

    // Supprimer un message
    async deleteMessage(messageId) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return false;

            const { error } = await this.supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error('❌ Erreur suppression message:', error);
                return false;
            }

            console.log('✅ Message supprimé:', messageId);
            return true;

        } catch (error) {
            console.error('❌ Erreur suppression message:', error);
            return false;
        }
    }

    // Envoyer un message automatique pour une transaction HDV
    async sendOrderMessage(recipientUsername, orderType, itemName, message) {
        const subject = `${orderType === 'sell' ? '🔴 Vente' : '🔵 Achat'} - ${itemName}`;
        const content = `Transaction HDV: ${message}`;
        
        return await this.sendMessage(recipientUsername, subject, content, 'order');
    }

    // Obtenir la liste de tous les utilisateurs (pour autocomplétion)
    async getAllUsers() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('username')
                .order('username');

            if (error) {
                console.error('❌ Erreur récupération utilisateurs:', error);
                return [];
            }

            return data.map(user => user.username);

        } catch (error) {
            console.error('❌ Erreur getAllUsers:', error);
            return [];
        }
    }

    // Vérifier qu'un utilisateur existe
    async userExists(username) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return false;

            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('username')
                .eq('username', username)
                .single();

            return !error && !!data;

        } catch (error) {
            console.error('❌ Erreur vérification utilisateur:', error);
            return false;
        }
    }

    // Test de la connectivité et des fonctions
    async testConnectivity() {
        try {
            console.log('🧪 Test de connectivité mailbox...');
            
            const ready = await this.ensureInitialized();
            if (!ready) {
                throw new Error('Supabase non initialisé');
            }

            // Test 1: Récupérer l'utilisateur actuel
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Utilisateur non connecté');
            }
            console.log('✅ Test 1: Utilisateur connecté -', user.email);

            // Test 2: Récupérer le profil
            const profile = await this.getUserProfile();
            if (!profile) {
                throw new Error('Profil utilisateur non trouvé');
            }
            console.log('✅ Test 2: Profil utilisateur -', profile.username);

            // Test 3: Charger les messages reçus
            const receivedMessages = await this.loadReceivedMessages();
            console.log(`✅ Test 3: ${receivedMessages.length} messages reçus chargés`);

            // Test 4: Charger les messages envoyés
            const sentMessages = await this.loadSentMessages();
            console.log(`✅ Test 4: ${sentMessages.length} messages envoyés chargés`);

            // Test 5: Compter les messages non lus
            const unreadCount = await this.getUnreadCount();
            console.log(`✅ Test 5: ${unreadCount} messages non lus`);

            // Test 6: Récupérer tous les utilisateurs
            const allUsers = await this.getAllUsers();
            console.log(`✅ Test 6: ${allUsers.length} utilisateurs dans la base`);

            console.log('🎉 Tous les tests de connectivité réussis !');
            return true;

        } catch (error) {
            console.error('❌ Échec test de connectivité:', error);
            return false;
        }
    }
}

// Instance globale
window.mailboxSupabaseManager = new MailboxSupabaseManager();