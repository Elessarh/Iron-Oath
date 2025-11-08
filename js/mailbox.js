// Mailbox.js - Système de messagerie avec Supabase pour Iron Oath
class MailboxSystem {
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.supabaseManager = null;
        this.initializeSupabase();
        this.initializeEventListeners();
        this.startAutoRefresh();
    }

    // Initialiser Supabase
    async initializeSupabase() {
        // Attendre que le gestionnaire Supabase soit disponible
        while (!window.mailboxSupabaseManager) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.supabaseManager = window.mailboxSupabaseManager;
        console.log('✅ Mailbox Supabase Manager connecté');
        
        // Charger les messages initiaux
        await this.loadMessages();
    }

    // Démarrer l'auto-actualisation
    startAutoRefresh() {
        console.log('📬 Démarrage auto-actualisation boîte mail (15s)');
        
        // Actualiser toutes les 15 secondes
        this.refreshInterval = setInterval(async () => {
            console.log('📬 Auto-actualisation boîte mail...');
            await this.loadMessages();
            await this.updateUnreadCount();
        }, 15000);
        
        // Nettoyer l'intervalle si on quitte la page
        window.addEventListener('beforeunload', () => {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        });
    }

    // Actualisation manuelle
    async refreshMessages() {
        console.log('🔄 Actualisation manuelle de la boîte mail...');
        await this.loadMessages();
        await this.updateUnreadCount();
        
        // Mettre à jour l'affichage si la boîte mail est ouverte
        const modal = document.querySelector('.mailbox-modal');
        if (modal) {
            await this.refreshMailboxDisplay(modal);
        }
        
        // Feedback visuel
        this.showNotification('🔄 Boîte mail actualisée', 'info');
    }

    // Rafraîchir l'affichage de la boîte mail
    async refreshMailboxDisplay(modal) {
        if (!this.supabaseManager) return;

        const receivedPanel = modal.querySelector('#received .messages-list');
        const sentPanel = modal.querySelector('#sent .messages-list');
        
        if (receivedPanel) {
            const receivedMessages = await this.supabaseManager.loadReceivedMessages();
            receivedPanel.innerHTML = receivedMessages.length > 0 ? 
                receivedMessages.map(msg => this.renderMessage(msg, 'received')).join('') :
                '<div class="no-messages">📭 Aucun message reçu</div>';
        }
        
        if (sentPanel) {
            const sentMessages = await this.supabaseManager.loadSentMessages();
            sentPanel.innerHTML = sentMessages.length > 0 ?
                sentMessages.map(msg => this.renderMessage(msg, 'sent')).join('') :
                '<div class="no-messages">📭 Aucun message envoyé</div>';
        }
    }

    // Charger les messages depuis Supabase
    async loadMessages() {
        if (!this.supabaseManager) {
            console.log('⏳ Attente Supabase Manager...');
            return;
        }

        try {
            console.log('📥 Chargement messages depuis Supabase...');
            
            // Charger tous les messages (reçus et envoyés)
            const [receivedMessages, sentMessages] = await Promise.all([
                this.supabaseManager.loadReceivedMessages(),
                this.supabaseManager.loadSentMessages()
            ]);
            
            // Combiner et trier par date
            this.messages = [...receivedMessages, ...sentMessages]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            console.log(`✅ ${this.messages.length} messages chargés depuis Supabase`);
            
        } catch (error) {
            console.error('❌ Erreur chargement messages:', error);
            this.messages = [];
        }
    }

    // Obtenir l'utilisateur connecté via Supabase
    async getCurrentUser() {
        if (!this.supabaseManager) return null;
        
        try {
            const profile = await this.supabaseManager.getUserProfile();
            if (profile) {
                return {
                    id: profile.id,
                    username: profile.username,
                    email: profile.email || ''
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }

    // Sauvegarder les messages (non utilisé avec Supabase)
    saveMessages() {
        // Méthode conservée pour compatibilité mais non utilisée avec Supabase
        console.log('💾 Méthode saveMessages() non utilisée avec Supabase');
    }

    // Sauvegarder utilisateur pour autocomplétion
    saveUserForAutocomplete(username) {
        if (!username) return;
        
        const savedUsers = JSON.parse(localStorage.getItem('knownUsers') || '[]');
        if (!savedUsers.includes(username)) {
            savedUsers.push(username);
            localStorage.setItem('knownUsers', JSON.stringify(savedUsers));
        }
    }

    // Envoyer un message via Supabase
    async sendMessage(to, subject, content, orderItem = null) {
        if (!this.supabaseManager) {
            this.showNotification('❌ Système de messagerie non disponible', 'error');
            return false;
        }

        try {
            const messageType = orderItem ? 'order' : 'user';
            const orderId = orderItem ? orderItem.orderId : null;
            
            await this.supabaseManager.sendMessage(to, subject, content, messageType, orderId);
            
            // Actualiser les messages après envoi
            await this.loadMessages();
            
            // Sauvegarder pour autocomplétion
            this.saveUserForAutocomplete(to);
            
            this.showNotification(`✅ Message envoyé à ${to}`, 'success');
            this.showContactNotification(this.currentUser?.username || 'Vous', to, subject, orderItem);
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            this.showNotification('❌ Erreur lors de l\'envoi du message', 'error');
            return false;
        }
    }

    // Envoyer un message de trading spécifique
    async sendTradeMessage(recipientUsername, itemName, orderType, price) {
        try {
            console.log('📤 Envoi message de trading:', { recipientUsername, itemName, orderType, price });
            
            // S'assurer que l'utilisateur actuel est récupéré
            this.currentUser = await this.getCurrentUser();
            if (!this.currentUser) {
                throw new Error('Utilisateur non connecté');
            }
            
            const subject = `${orderType === 'sell' ? '🔴 Intérêt pour votre vente' : '🔵 Proposition pour votre achat'} - ${itemName}`;
            const content = `Bonjour ${recipientUsername},

Je suis intéressé(e) par votre ${orderType === 'sell' ? 'offre de vente' : 'demande d\'achat'} pour ${itemName} au prix de ${price} cols.

Pouvez-vous me confirmer si l'item est toujours disponible ?

Cordialement,
${this.currentUser.username || 'Un aventurier'}`;

            const success = await this.sendMessage(recipientUsername, subject, content);
            
            if (success) {
                console.log('✅ Message de trading envoyé avec succès');
            }
            
            return success;
            
        } catch (error) {
            console.error('❌ Erreur envoi message trading:', error);
            this.showNotification('❌ Erreur lors de l\'envoi du message de trading', 'error');
            return false;
        }
    }

    // Afficher notification de contact
    showContactNotification(from, to, subject, orderItem = null) {
        const notification = document.createElement('div');
        notification.className = 'contact-notification';
        
        let itemInfo = '';
        if (orderItem) {
            itemInfo = `<div class="order-info">
                <img src="${orderItem.image}" alt="${orderItem.name}" class="item-icon">
                <span>${orderItem.name}</span>
            </div>`;
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <h4>💬 Message envoyé</h4>
                <p><strong>De:</strong> ${from}</p>
                <p><strong>À:</strong> ${to}</p>
                <p><strong>Sujet:</strong> ${subject}</p>
                ${itemInfo}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Afficher notification push
    showPushNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `push-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Notification générale
    showNotification(message, type = 'info') {
        console.log(`📢 ${message}`);
        
        // Essayer d'afficher dans l'interface si disponible
        const notificationArea = document.querySelector('.notification-area');
        if (notificationArea) {
            const notif = document.createElement('div');
            notif.className = `notification ${type}`;
            notif.textContent = message;
            notificationArea.appendChild(notif);
            
            setTimeout(() => {
                notif.remove();
            }, 3000);
        }
        
        // Jouer un son pour certains types
        if (type === 'success' || type === 'message') {
            this.playNotificationSound();
        }
    }

    // Jouer son de notification
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+L0vGUYBDuN1/LKdCYFJHbE7+CUQQsOWrnn769XFAo+n+X0vGUYBjyN1/LJciYFJHfE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyM1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo+n+X0vWUYBjyN1/LJciYFJHbE7+CUQQsOWrnn769XFAo=');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignorer les erreurs de lecture
        } catch (error) {
            // Ignorer les erreurs audio
        }
    }

    // Obtenir messages pour un utilisateur
    getMessagesForUser(username) {
        if (!this.currentUser) return [];
        
        return this.messages.filter(msg => 
            (msg.sender_username === this.currentUser.username && msg.recipient_username === username) ||
            (msg.sender_username === username && msg.recipient_username === this.currentUser.username)
        );
    }

    // Marquer un message comme lu
    async markAsRead(messageId) {
        if (!this.supabaseManager) return;
        
        try {
            await this.supabaseManager.markAsRead(messageId);
            await this.updateUnreadCount();
        } catch (error) {
            console.error('❌ Erreur marquage lecture:', error);
        }
    }

    // Supprimer un message
    async deleteMessage(messageId) {
        if (!this.supabaseManager) return;
        
        try {
            await this.supabaseManager.deleteMessage(messageId);
            await this.loadMessages();
            this.showNotification('✅ Message supprimé', 'success');
        } catch (error) {
            console.error('❌ Erreur suppression message:', error);
            this.showNotification('❌ Erreur lors de la suppression', 'error');
        }
    }

    // Ouvrir la boîte mail
    async openMailbox() {
        this.currentUser = await this.getCurrentUser();
        if (!this.currentUser) {
            this.showNotification('❌ Vous devez être connecté pour accéder à la boîte mail', 'error');
            return;
        }

        await this.loadMessages();

        const modal = document.createElement('div');
        modal.className = 'mailbox-modal';
        modal.innerHTML = this.getMailboxHTML();
        
        document.body.appendChild(modal);
        
        // Ajouter les écouteurs d'événements
        this.setupMailboxEventListeners(modal);
        
        // Afficher les messages reçus par défaut
        this.showTab('received', modal);
        
        // Mettre à jour le compteur
        await this.updateUnreadCount();
    }

    // Configuration des écouteurs d'événements
    setupMailboxEventListeners(modal) {
        // Fermer la modal
        modal.querySelector('.close-mailbox').addEventListener('click', () => {
            modal.remove();
        });

        // Onglets
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab, modal);
            });
        });

        // Bouton composer
        modal.querySelector('.compose-btn').addEventListener('click', () => {
            this.showComposeForm(modal);
        });

        // Bouton actualiser
        modal.querySelector('.refresh-btn').addEventListener('click', async () => {
            await this.refreshMessages();
            await this.refreshMailboxDisplay(modal);
        });

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Afficher un onglet
    async showTab(tabName, modal) {
        // Activer l'onglet
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Afficher le contenu
        modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        modal.querySelector(`#${tabName}`).classList.add('active');

        // Charger les messages selon l'onglet
        let messages = [];
        if (tabName === 'received') {
            messages = await this.supabaseManager.loadReceivedMessages();
        } else if (tabName === 'sent') {
            messages = await this.supabaseManager.loadSentMessages();
        }

        const messagesList = modal.querySelector(`#${tabName} .messages-list`);
        messagesList.innerHTML = messages.length > 0 ? 
            messages.map(msg => this.renderMessage(msg, tabName)).join('') :
            '<div class="no-messages">📭 Aucun message</div>';
    }

    // Rendu d'un message
    renderMessage(message, type) {
        const isUnread = !message.read_at && type === 'received';
        const date = new Date(message.created_at).toLocaleString('fr-FR');
        
        return `
            <div class="message-item ${isUnread ? 'unread' : ''}" data-message-id="${message.id}">
                <div class="message-header">
                    <div class="message-info">
                        <span class="message-from">
                            ${type === 'received' ? 'De' : 'À'}: <strong>${type === 'received' ? message.sender_username : message.recipient_username}</strong>
                        </span>
                        <span class="message-date">${date}</span>
                    </div>
                    <div class="message-actions">
                        ${isUnread ? '<button class="btn-read" onclick="mailboxSystem.markAsRead(' + message.id + ')">✓</button>' : ''}
                        <button class="btn-delete" onclick="mailboxSystem.deleteMessage(${message.id})">🗑️</button>
                    </div>
                </div>
                <div class="message-subject">
                    <strong>${message.subject}</strong>
                    ${message.message_type === 'order' ? '<span class="order-badge">📦 Commande</span>' : ''}
                </div>
                <div class="message-content">
                    ${message.content}
                </div>
            </div>
        `;
    }

    // Afficher le formulaire de composition
    showComposeForm(modal) {
        const composeArea = modal.querySelector('.compose-area');
        const knownUsers = JSON.parse(localStorage.getItem('knownUsers') || '[]');
        
        composeArea.innerHTML = `
            <div class="compose-form">
                <h3>✉️ Nouveau message</h3>
                <div class="form-group">
                    <label>Destinataire:</label>
                    <input type="text" id="compose-to" list="users-list" placeholder="Nom d'utilisateur">
                    <datalist id="users-list">
                        ${knownUsers.map(user => `<option value="${user}">`).join('')}
                    </datalist>
                </div>
                <div class="form-group">
                    <label>Sujet:</label>
                    <input type="text" id="compose-subject" placeholder="Sujet du message">
                </div>
                <div class="form-group">
                    <label>Message:</label>
                    <textarea id="compose-content" rows="5" placeholder="Votre message..."></textarea>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="mailboxSystem.sendComposeMessage()">📤 Envoyer</button>
                    <button class="btn btn-secondary" onclick="mailboxSystem.hideComposeForm()">❌ Annuler</button>
                </div>
            </div>
        `;
        
        composeArea.style.display = 'block';
    }

    // Masquer le formulaire de composition
    hideComposeForm() {
        const composeArea = document.querySelector('.compose-area');
        if (composeArea) {
            composeArea.style.display = 'none';
        }
    }

    // Envoyer le message composé
    async sendComposeMessage() {
        const to = document.getElementById('compose-to').value.trim();
        const subject = document.getElementById('compose-subject').value.trim();
        const content = document.getElementById('compose-content').value.trim();
        
        if (!to || !subject || !content) {
            this.showNotification('❌ Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const success = await this.sendMessage(to, subject, content);
        if (success) {
            this.hideComposeForm();
            // Actualiser l'affichage
            const modal = document.querySelector('.mailbox-modal');
            if (modal) {
                await this.refreshMailboxDisplay(modal);
            }
        }
    }

    // Mettre à jour le compteur de messages non lus
    async updateUnreadCount() {
        if (!this.supabaseManager) return;
        
        try {
            const count = await this.supabaseManager.getUnreadCount();
            
            // Mettre à jour l'affichage du compteur
            const counters = document.querySelectorAll('.unread-count, .mail-count');
            counters.forEach(counter => {
                counter.textContent = count > 0 ? count : '';
                counter.style.display = count > 0 ? 'inline' : 'none';
            });
            
            // Mettre à jour l'icône de la boîte mail
            const mailIcons = document.querySelectorAll('.mail-icon');
            mailIcons.forEach(icon => {
                if (count > 0) {
                    icon.classList.add('has-unread');
                } else {
                    icon.classList.remove('has-unread');
                }
            });
            
        } catch (error) {
            console.error('❌ Erreur mise à jour compteur:', error);
        }
    }

    // Version synchrone pour compatibilité (retourne 0 par défaut)
    getUnreadCount() {
        // Cette méthode est gardée pour compatibilité avec l'ancien code
        // La vraie logique est dans updateUnreadCount() qui est async
        console.log('📬 getUnreadCount() appelée (compatibilité)');
        return 0; // Retourne 0 par défaut, la vraie valeur sera mise à jour par updateUnreadCount()
    }

    // Obtenir le HTML de la boîte mail
    getMailboxHTML() {
        return `
            <div class="mailbox-content">
                <div class="mailbox-header">
                    <h2>📬 Boîte Mail - ${this.currentUser.username}</h2>
                    <button class="close-mailbox">✖</button>
                </div>
                
                <div class="mailbox-toolbar">
                    <button class="compose-btn btn btn-primary">✉️ Composer</button>
                    <button class="refresh-btn btn btn-secondary">🔄 Actualiser</button>
                </div>
                
                <div class="mailbox-tabs">
                    <button class="tab-btn active" data-tab="received">📥 Reçus</button>
                    <button class="tab-btn" data-tab="sent">📤 Envoyés</button>
                </div>
                
                <div class="compose-area" style="display: none;"></div>
                
                <div class="mailbox-body">
                    <div id="received" class="tab-content active">
                        <div class="messages-list">
                            <div class="loading">📥 Chargement des messages reçus...</div>
                        </div>
                    </div>
                    
                    <div id="sent" class="tab-content">
                        <div class="messages-list">
                            <div class="loading">📤 Chargement des messages envoyés...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialiser les écouteurs d'événements
    initializeEventListeners() {
        // Écouter les clics sur l'icône de boîte mail
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mail-icon, .mailbox-btn')) {
                e.preventDefault();
                this.openMailbox();
            }
        });
        
        // Écouter les touches de raccourci
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.openMailbox();
            }
        });
    }
}

// Initialiser le système de messagerie
document.addEventListener('DOMContentLoaded', () => {
    window.mailboxSystem = new MailboxSystem();
});