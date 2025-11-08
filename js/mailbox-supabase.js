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
            const targetUserId = userId || (await this.getCurrentUser())?.id;
            if (!targetUserId) return null;

            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (error) {
                console.error('❌ Erreur profil utilisateur:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('❌ Erreur récupération profil:', error);
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
            const { data: recipientData, error: recipientError } = await this.supabase
                .from('profiles')
                .select('id, username')
                .eq('username', recipientUsername)
                .single();

            if (recipientError || !recipientData) {
                throw new Error(`Destinataire "${recipientUsername}" non trouvé`);
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
}

// Instance globale
window.mailboxSupabaseManager = new MailboxSupabaseManager();