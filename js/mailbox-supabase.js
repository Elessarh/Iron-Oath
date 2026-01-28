// mailbox-supabase.js - Gestionnaire de messagerie avec Supabase
class MailboxSupabaseManager {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        debugLog('ðŸ“¬ Initialisation MailboxSupabaseManager...');
        this.ensureInitialized();
    }

    // S'assurer que Supabase est initialisÃ©
    async ensureInitialized() {
        if (this.initialized && this.supabase) {
            return true;
        }

        debugLog('â³ Attente de Supabase pour messagerie...');
        
        // Attendre que l'instance globale Supabase soit disponible
        let attempts = 0;
        while (!window.globalSupabase && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.globalSupabase) {
            console.error('âŒ Instance globale Supabase non disponible pour la messagerie');
            return false;
        }

        this.supabase = window.globalSupabase;
        this.initialized = true;
        debugLog('âœ… Supabase connectÃ© au Mailbox Manager');
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
            console.error('âŒ Erreur rÃ©cupÃ©ration utilisateur:', error);
            return null;
        }
    }

    // Obtenir le profil utilisateur avec username
    async getUserProfile(userId = null) {
        const ready = await this.ensureInitialized();
        if (!ready) return null;

        try {
            let targetUserId = userId;
            
            // Si pas d'userId fourni, rÃ©cupÃ©rer l'utilisateur actuel
            if (!targetUserId) {
                const { data: { user }, error: userError } = await this.supabase.auth.getUser();
                if (userError || !user) {
                    console.error('âŒ Erreur rÃ©cupÃ©ration utilisateur actuel:', userError);
                    return null;
                }
                targetUserId = user.id;
            }
            
            debugLog('ðŸ” Recherche profil utilisateur ID:', targetUserId);
            
            // Utiliser EXPLICITEMENT la table user_profiles
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (error) {
                console.error('âŒ Erreur profil utilisateur (user_profiles):', error);
                return null;
            }

            debugLog('âœ… Profil utilisateur trouvÃ©:', data);
            return data;
        } catch (error) {
            console.error('âŒ Erreur dans getUserProfile:', error);
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

            debugLog('ðŸ“¤ Envoi message:', { recipientUsername, subject, messageType });

            // Obtenir l'expÃ©diteur
            const senderProfile = await this.getUserProfile();
            if (!senderProfile) {
                throw new Error('Profil expÃ©diteur non trouvÃ©');
            }

            // Trouver le destinataire
            debugLog('ðŸ” Recherche destinataire:', recipientUsername);
            let { data: recipientData, error: recipientError } = await this.supabase
                .from('user_profiles')
                .select('id, username')
                .eq('username', recipientUsername)
                .single();

            debugLog('ðŸ‘¤ RÃ©sultat recherche destinataire:', { recipientData, recipientError });

            if (recipientError || !recipientData) {
                // Essayer de crÃ©er automatiquement le profil utilisateur si non trouvÃ©
                debugLog('âš ï¸ Destinataire non trouvÃ©, tentative de crÃ©ation automatique...');
                
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
                        throw new Error(`Impossible de crÃ©er le profil pour "${recipientUsername}": ${createError.message}`);
                    }
                    
                    debugLog('âœ… Profil crÃ©Ã© automatiquement:', newUser);
                    recipientData = newUser;
                } catch (createErr) {
                    throw new Error(`Destinataire "${recipientUsername}" non trouvÃ© et crÃ©ation automatique Ã©chouÃ©e: ${createErr.message}`);
                }
            } else {
                debugLog('âœ… Destinataire trouvÃ©:', recipientData);
            }

            // PrÃ©parer les donnÃ©es du message
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

            // InsÃ©rer le message
            const { data, error } = await this.supabase
                .from('messages')
                .insert([messageData])
                .select()
                .single();

            if (error) {
                console.error('âŒ Erreur envoi message:', error);
                throw error;
            }

            debugLog('âœ… Message envoyÃ© avec succÃ¨s:', data.id);
            return data;

        } catch (error) {
            console.error('âŒ Erreur envoi message:', error);
            throw error;
        }
    }

    // Charger les messages reÃ§us
    async loadReceivedMessages() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const user = await this.getCurrentUser();
            if (!user) return [];

            debugLog('ðŸ“¥ Chargement messages reÃ§us...');

            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('âŒ Erreur chargement messages reÃ§us:', error);
                return [];
            }

            debugLog(`âœ… ${data.length} messages reÃ§us chargÃ©s`);
            return data;

        } catch (error) {
            console.error('âŒ Erreur chargement messages reÃ§us:', error);
            return [];
        }
    }

    // Charger les messages envoyÃ©s
    async loadSentMessages() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const user = await this.getCurrentUser();
            if (!user) return [];

            debugLog('ðŸ“¤ Chargement messages envoyÃ©s...');

            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .eq('sender_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('âŒ Erreur chargement messages envoyÃ©s:', error);
                return [];
            }

            debugLog(`âœ… ${data.length} messages envoyÃ©s chargÃ©s`);
            return data;

        } catch (error) {
            console.error('âŒ Erreur chargement messages envoyÃ©s:', error);
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
                console.error('âŒ Erreur marquage lecture:', error);
                return false;
            }

            debugLog('âœ… Message marquÃ© comme lu:', messageId);
            return true;

        } catch (error) {
            console.error('âŒ Erreur marquage lecture:', error);
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
                console.error('âŒ Erreur comptage non lus:', error);
                return 0;
            }

            return data.length;

        } catch (error) {
            console.error('âŒ Erreur comptage non lus:', error);
            return 0;
        }
    }

    // Supprimer un message
    async deleteMessage(messageId) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) {
                console.error('âŒ Supabase non initialisÃ© pour suppression');
                return false;
            }

            const user = await this.getCurrentUser();
            if (!user) {
                console.error('âŒ Utilisateur non connectÃ© pour suppression');
                return false;
            }

            debugLog('ðŸ—‘ï¸ Tentative suppression message:', messageId, 'par utilisateur:', user.id);

            // VÃ©rifier que l'utilisateur a le droit de supprimer ce message
            const { data: messageToDelete, error: fetchError } = await this.supabase
                .from('messages')
                .select('*')
                .eq('id', messageId)
                .single();

            if (fetchError) {
                console.error('âŒ Erreur rÃ©cupÃ©ration message Ã  supprimer:', fetchError);
                return false;
            }

            if (!messageToDelete) {
                console.error('âŒ Message non trouvÃ©:', messageId);
                return false;
            }

            // VÃ©rifier que l'utilisateur est soit l'expÃ©diteur soit le destinataire
            if (messageToDelete.sender_id !== user.id && messageToDelete.recipient_id !== user.id) {
                console.error('âŒ Utilisateur non autorisÃ© Ã  supprimer ce message');
                return false;
            }

            debugLog('âœ… Autorisation de suppression confirmÃ©e pour:', messageToDelete);

            const { data: deleteResult, error } = await this.supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error('âŒ Erreur suppression message Supabase:', error);
                return false;
            }

            debugLog('ðŸ” RÃ©sultat suppression Supabase:', { deleteResult, error });
            debugLog('âœ… Message supprimÃ© avec succÃ¨s de Supabase:', messageId);
            
            // VÃ©rification supplÃ©mentaire - chercher le message pour s'assurer qu'il est supprimÃ©
            const { data: checkMessage, error: checkError } = await this.supabase
                .from('messages')
                .select('id')
                .eq('id', messageId)
                .maybeSingle();
                
            if (checkMessage) {
                console.error('âŒ PROBLÃˆME: Le message existe encore aprÃ¨s suppression!', checkMessage);
                return false;
            } else {
                debugLog('âœ… VÃ©rification: Message bien supprimÃ© de la base');
            }
            
            return true;

        } catch (error) {
            console.error('âŒ Exception lors suppression message:', error);
            return false;
        }
    }

    // Envoyer un message automatique pour une transaction HDV
    async sendOrderMessage(recipientUsername, orderType, itemName, message) {
        const subject = `${orderType === 'sell' ? 'ðŸ”´ Vente' : 'ðŸ”µ Achat'} - ${itemName}`;
        const content = `Transaction HDV: ${message}`;
        
        return await this.sendMessage(recipientUsername, subject, content, 'order');
    }

    // Obtenir la liste de tous les utilisateurs (pour autocomplÃ©tion)
    async getAllUsers() {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return [];

            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('username')
                .order('username');

            if (error) {
                console.error('âŒ Erreur rÃ©cupÃ©ration utilisateurs:', error);
                return [];
            }

            return data.map(user => user.username);

        } catch (error) {
            console.error('âŒ Erreur getAllUsers:', error);
            return [];
        }
    }

    // VÃ©rifier qu'un utilisateur existe
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
            console.error('âŒ Erreur vÃ©rification utilisateur:', error);
            return false;
        }
    }

    // Test de la connectivitÃ© et des fonctions
    async testConnectivity() {
        try {
            debugLog('ðŸ§ª Test de connectivitÃ© mailbox...');
            
            const ready = await this.ensureInitialized();
            if (!ready) {
                throw new Error('Supabase non initialisÃ©');
            }

            // Test 1: RÃ©cupÃ©rer l'utilisateur actuel
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('Utilisateur non connectÃ©');
            }
            debugLog('âœ… Test 1: Utilisateur connectÃ© -', user.email);

            // Test 2: RÃ©cupÃ©rer le profil
            const profile = await this.getUserProfile();
            if (!profile) {
                throw new Error('Profil utilisateur non trouvÃ©');
            }
            debugLog('âœ… Test 2: Profil utilisateur -', profile.username);

            // Test 3: Charger les messages reÃ§us
            const receivedMessages = await this.loadReceivedMessages();
            debugLog(`âœ… Test 3: ${receivedMessages.length} messages reÃ§us chargÃ©s`);

            // Test 4: Charger les messages envoyÃ©s
            const sentMessages = await this.loadSentMessages();
            debugLog(`âœ… Test 4: ${sentMessages.length} messages envoyÃ©s chargÃ©s`);

            // Test 5: Compter les messages non lus
            const unreadCount = await this.getUnreadCount();
            debugLog(`âœ… Test 5: ${unreadCount} messages non lus`);

            // Test 6: RÃ©cupÃ©rer tous les utilisateurs
            const allUsers = await this.getAllUsers();
            debugLog(`âœ… Test 6: ${allUsers.length} utilisateurs dans la base`);

            debugLog('ðŸŽ‰ Tous les tests de connectivitÃ© rÃ©ussis !');
            return true;

        } catch (error) {
            console.error('âŒ Ã‰chec test de connectivitÃ©:', error);
            return false;
        }
    }

    // Tester les permissions de suppression (debug)
    async testDeletePermissions(messageId) {
        try {
            const ready = await this.ensureInitialized();
            if (!ready) return false;

            const user = await this.getCurrentUser();
            debugLog('ðŸ” Test permissions pour utilisateur:', user?.id);

            // Essayer de rÃ©cupÃ©rer le message
            const { data: message, error: fetchError } = await this.supabase
                .from('messages')
                .select('*')
                .eq('id', messageId)
                .single();

            debugLog('ðŸ“§ Message trouvÃ©:', message);
            debugLog('âŒ Erreur fetch:', fetchError);

            if (message) {
                debugLog('ðŸ‘¤ ExpÃ©diteur:', message.sender_id);
                debugLog('ðŸ“¥ Destinataire:', message.recipient_id);
                debugLog('ðŸ” User peut supprimer:', 
                    message.sender_id === user?.id || message.recipient_id === user?.id);
            }

            return true;
        } catch (error) {
            console.error('âŒ Erreur test permissions:', error);
            return false;
        }
    }
}

// Instance globale
window.mailboxSupabaseManager = new MailboxSupabaseManager();