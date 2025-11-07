// Mailbox.js - Système de messagerie interne pour Iron Oath
class MailboxSystem {
    constructor() {
        this.messages = [];
        this.currentUser = null;
        this.loadMessages();
        this.initializeEventListeners();
        this.startAutoRefresh();
    }

    // Démarrer l'auto-actualisation
    startAutoRefresh() {
        console.log('📬 Démarrage auto-actualisation boîte mail (15s)');
        
        // Actualiser toutes les 15 secondes
        this.refreshInterval = setInterval(() => {
            console.log('📬 Auto-actualisation boîte mail...');
            this.loadMessages();
            this.updateUnreadCount();
        }, 15000);
        
        // Nettoyer l'intervalle si on quitte la page
        window.addEventListener('beforeunload', () => {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        });
    }

    // Actualisation manuelle
    refreshMessages() {
        console.log('🔄 Actualisation manuelle de la boîte mail...');
        this.loadMessages();
        this.updateUnreadCount();
        
        // Mettre à jour l'affichage si la boîte mail est ouverte
        const modal = document.querySelector('.mailbox-modal');
        if (modal) {
            this.refreshMailboxDisplay(modal);
        }
        
        // Feedback visuel
        this.showNotification('🔄 Boîte mail actualisée', 'info');
    }

    // Rafraîchir l'affichage de la boîte mail
    refreshMailboxDisplay(modal) {
        const receivedPanel = modal.querySelector('#received .messages-list');
        const sentPanel = modal.querySelector('#sent .messages-list');
        
        if (receivedPanel) {
            const receivedMessages = this.getReceivedMessages();
            receivedPanel.innerHTML = receivedMessages.length > 0 ? 
                receivedMessages.map(msg => this.renderMessage(msg, 'received')).join('') :
                '<div class="no-messages">📭 Aucun message reçu</div>';
        }
        
        if (sentPanel) {
            const sentMessages = this.getSentMessages();
            sentPanel.innerHTML = sentMessages.length > 0 ?
                sentMessages.map(msg => this.renderMessage(msg, 'sent')).join('') :
                '<div class="no-messages">📭 Aucun message envoyé</div>';
        }
    }

    // Récupérer l'utilisateur connecté
    getCurrentUser() {
        try {
            console.log('📬 Mailbox - Vérification utilisateur...');
            
            // Essayer d'abord avec le profil Supabase (contient le username)
            if (window.getUserProfile) {
                const profile = window.getUserProfile();
                console.log('📬 Supabase profile:', profile);
                if (profile && profile.username) {
                    console.log('✅ Profil Supabase trouvé:', profile.username);
                    return {
                        id: profile.id,
                        username: profile.username,
                        email: profile.email || ''
                    };
                }
            }
            
            // Essayer avec getCurrentUser (objet Supabase brut)
            if (window.getCurrentUser) {
                const user = window.getCurrentUser();
                console.log('📬 Supabase user:', user);
                if (user) {
                    // Chercher username dans différentes propriétés possibles
                    const username = user.username || 
                                   user.user_metadata?.username || 
                                   user.user_metadata?.name ||
                                   user.email?.split('@')[0];
                    
                    if (username) {
                        console.log('✅ Utilisateur Supabase trouvé:', username);
                        return {
                            id: user.id,
                            username: username,
                            email: user.email || ''
                        };
                    }
                }
            }
            
            // Vérifier window.currentUserProfile si c'est différent
            if (window.currentUserProfile && window.currentUserProfile.username) {
                console.log('📬 CurrentUserProfile trouvé:', window.currentUserProfile.username);
                return {
                    id: window.currentUserProfile.id || 'profile_' + Date.now(),
                    username: window.currentUserProfile.username,
                    email: window.currentUserProfile.email || ''
                };
            }
            
            // Fallback vers localStorage
            const currentUserJSON = localStorage.getItem('currentUser');
            console.log('📬 localStorage currentUser:', currentUserJSON);
            
            if (currentUserJSON) {
                const currentUser = JSON.parse(currentUserJSON);
                if (currentUser && (currentUser.username || currentUser.email)) {
                    return {
                        id: currentUser.id || 'local_' + Date.now(),
                        username: currentUser.username || currentUser.email,
                        email: currentUser.email || ''
                    };
                }
            }
            
            // Essayer avec le système d'authentification global
            if (window.currentUser && (window.currentUser.username || window.currentUser.email)) {
                return {
                    id: window.currentUser.id || 'global_' + Date.now(),
                    username: window.currentUser.username || window.currentUser.email,
                    email: window.currentUser.email || ''
                };
            }
            
            // Si on a un profil actif (d'après les logs on voit "Elessarh" quelque part)
            // Essayons de chercher dans d'autres variables globales
            if (window.userProfile && window.userProfile.username) {
                console.log('📬 UserProfile trouvé:', window.userProfile.username);
                return {
                    id: window.userProfile.id || 'userprofile_' + Date.now(),
                    username: window.userProfile.username,
                    email: window.userProfile.email || ''
                };
            }
            
            // Vérifier s'il y a un token d'authentification
            const authToken = localStorage.getItem('supabase.auth.token') || 
                            localStorage.getItem('authToken') || 
                            localStorage.getItem('token');
            
            if (authToken) {
                // Si on a un token mais pas d'info utilisateur, créer un utilisateur temporaire
                return {
                    id: 'token_user_' + Date.now(),
                    username: 'Utilisateur Connecté',
                    email: ''
                };
            }
            
            // Utilisateur non connecté
            return null;
        } catch (error) {
            console.error('📬 Erreur récupération utilisateur:', error);
            return null;
        }
    }

    // Charger les messages depuis localStorage
    loadMessages() {
        try {
            const saved = localStorage.getItem('ironOath_mailbox');
            this.messages = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Erreur lors du chargement des messages:', error);
            this.messages = [];
        }
    }

    // Sauvegarder les messages
    saveMessages() {
        try {
            localStorage.setItem('ironOath_mailbox', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des messages:', error);
        }
    }

    // Sauvegarder un utilisateur pour l'autocomplétion
    saveUserForAutocomplete(username) {
        try {
            const savedUsers = localStorage.getItem('ironOath_users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];
            
            // Ajouter l'utilisateur s'il n'existe pas déjà
            if (!users.includes(username)) {
                users.push(username);
                localStorage.setItem('ironOath_users', JSON.stringify(users));
            }
        } catch (error) {
            console.warn('Erreur sauvegarde utilisateur:', error);
        }
    }

    // Envoyer un message
    sendMessage(to, subject, content, orderItem = null) {
        const currentUser = this.getCurrentUser();
        
        const message = {
            id: Date.now() + Math.random(),
            from: currentUser.username,
            fromId: currentUser.id,
            to: to,
            subject: subject,
            content: content,
            timestamp: new Date().toISOString(),
            read: false,
            orderItem: orderItem, // Information sur l'item si c'est lié à un ordre
            type: orderItem ? 'trade' : 'general'
        };

        this.messages.push(message);
        this.saveMessages();
        
        // Sauvegarder l'utilisateur pour l'autocomplétion
        this.saveUserForAutocomplete(to);
        
        // Notification pour l'expéditeur
        this.showNotification(`✅ Message envoyé à ${to}`, 'success');
        
        // Notification push pour le destinataire (si c'est dans la même session)
        this.showContactNotification(currentUser.username, to, subject, orderItem);
        
        return message;
    }

    // Afficher une notification quand quelqu'un vous contacte
    showContactNotification(from, to, subject, orderItem = null) {
        // Vérifier si le destinataire est l'utilisateur actuel
        const currentUser = this.getCurrentUser();
        
        // Si c'est pour nous, afficher la notification
        if (to === currentUser.username && from !== currentUser.username) {
            const notificationContent = orderItem ? 
                `💎 ${from} vous contacte pour "${orderItem.name}"` :
                `💬 Nouveau message de ${from}: ${subject}`;
                
            this.showPushNotification(notificationContent, 'contact');
            
            // Son de notification (optionnel)
            this.playNotificationSound();
        }
    }

    // Afficher une notification push
    showPushNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `push-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${type === 'contact' ? '👥' : 'ℹ️'}</div>
                <div class="notification-text">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">❌</button>
            </div>
        `;
        
        // Style de la notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, rgba(0, 168, 255, 0.95), rgba(138, 43, 226, 0.95));
            color: white;
            padding: 1rem;
            border-radius: 10px;
            z-index: 10001;
            box-shadow: 0 5px 25px rgba(0, 168, 255, 0.4);
            border: 2px solid rgba(0, 168, 255, 0.6);
            max-width: 350px;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }

    // Jouer un son de notification
    playNotificationSound() {
        // Son simple avec Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // Son de notification non disponible
        }
    }

    // Récupérer les messages d'un utilisateur
    getMessagesForUser(username) {
        return this.messages.filter(msg => 
            msg.to === username || msg.from === username
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Marquer un message comme lu
    markAsRead(messageId) {
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
            message.read = true;
            this.saveMessages();
        }
    }

    // Supprimer un message
    deleteMessage(messageId) {
        this.messages = this.messages.filter(msg => msg.id !== messageId);
        this.saveMessages();
        this.showNotification('🗑️ Message supprimé', 'info');
    }

    // Ouvrir la boîte mail
    openMailbox() {
        const currentUser = this.getCurrentUser();
        
        // Vérification obligatoire de l'authentification
        if (!currentUser) {
            this.showNotification('❌ Vous devez être connecté pour accéder à la boîte mail', 'error');
            const loginUrl = '../pages/connexion.html';
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 2000);
            return;
        }
        
        const userMessages = this.getMessagesForUser(currentUser.username);
        
        // Séparer les messages reçus et envoyés
        const received = userMessages.filter(msg => msg.to === currentUser.username);
        const sent = userMessages.filter(msg => msg.from === currentUser.username);

        const modal = document.createElement('div');
        modal.className = 'mailbox-modal';
        modal.innerHTML = `
            <div class="mailbox-content">
                <div class="mailbox-header">
                    <h2>📬 Boîte Mail - ${currentUser.username}</h2>
                    <div class="mailbox-header-actions">
                        <button class="refresh-mailbox" onclick="mailboxSystem.refreshMessages()">🔄 Actualiser</button>
                        <button class="close-mailbox" onclick="this.closest('.mailbox-modal').remove()">❌</button>
                    </div>
                </div>
                
                <div class="mailbox-tabs">
                    <button class="mailbox-tab active" data-tab="received">
                        📥 Reçus (${received.length})
                    </button>
                    <button class="mailbox-tab" data-tab="sent">
                        📤 Envoyés (${sent.length})
                    </button>
                    <button class="mailbox-tab" data-tab="compose">
                        ✍️ Écrire
                    </button>
                </div>
                
                <div class="mailbox-panels">
                    <!-- Messages reçus -->
                    <div id="received" class="mailbox-panel active">
                        ${received.length === 0 ? 
                            '<div class="empty-mailbox"><p>📭 Aucun message reçu</p></div>' :
                            received.map(msg => this.renderMessage(msg, 'received')).join('')
                        }
                    </div>
                    
                    <!-- Messages envoyés -->
                    <div id="sent" class="mailbox-panel">
                        ${sent.length === 0 ? 
                            '<div class="empty-mailbox"><p>📤 Aucun message envoyé</p></div>' :
                            sent.map(msg => this.renderMessage(msg, 'sent')).join('')
                        }
                    </div>
                    
                    <!-- Composer un message -->
                    <div id="compose" class="mailbox-panel">
                        <div class="compose-form">
                            <h3>✍️ Nouveau Message</h3>
                            <form id="compose-message-form">
                                <div class="form-group">
                                    <label>À :</label>
                                    <input type="text" id="message-to" placeholder="Nom de l'aventurier" required>
                                </div>
                                <div class="form-group">
                                    <label>Sujet :</label>
                                    <input type="text" id="message-subject" placeholder="Sujet du message" required>
                                </div>
                                <div class="form-group">
                                    <label>Message :</label>
                                    <textarea id="message-content" placeholder="Votre message..." rows="6" required></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">📤 Envoyer</button>
                                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">🔄 Effacer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.initializeMailboxEvents(modal);
    }

    // Rendu d'un message
    renderMessage(message, type) {
        const isUnread = !message.read && type === 'received';
        const otherUser = type === 'received' ? message.from : message.to;
        
        return `
            <div class="message-item ${isUnread ? 'unread' : ''}" data-id="${message.id}">
                <div class="message-header">
                    <div class="message-info">
                        <span class="message-user">${type === 'received' ? '👤 De' : '👤 À'}: <strong>${otherUser}</strong></span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                        ${message.type === 'trade' ? '<span class="trade-badge">💎 Commerce</span>' : ''}
                        ${isUnread ? '<span class="unread-badge">🔴 Non lu</span>' : ''}
                    </div>
                    <div class="message-actions">
                        ${type === 'received' && message.type === 'trade' ? `
                            <button class="btn btn-small reply-btn" onclick="mailboxSystem.replyToTrade('${message.from}', '${message.orderItem?.name || 'Article'}')">
                                💬 Répondre
                            </button>
                        ` : ''}
                        <button class="btn btn-small delete-btn" onclick="mailboxSystem.deleteMessage(${message.id}); this.closest('.message-item').remove()">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="message-content">
                    <h4>${message.subject}</h4>
                    <p>${message.content}</p>
                    ${message.orderItem ? `
                        <div class="order-info">
                            <strong>📦 Article concerné:</strong> ${message.orderItem.name}
                            ${message.orderItem.price ? `<br><strong>💰 Prix:</strong> ${message.orderItem.price} cols` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Initialiser les événements de la boîte mail
    initializeMailboxEvents(modal) {
        // Onglets
        modal.querySelectorAll('.mailbox-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Mise à jour des onglets
                modal.querySelectorAll('.mailbox-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mise à jour des panneaux
                modal.querySelectorAll('.mailbox-panel').forEach(p => p.classList.remove('active'));
                modal.querySelector(`#${targetTab}`).classList.add('active');
                
                // Initialiser l'autocomplétion si on ouvre l'onglet composer
                if (targetTab === 'compose') {
                    setTimeout(() => this.initializeUserAutocomplete(), 100);
                }
            });
        });

        // Formulaire de composition
        const composeForm = modal.querySelector('#compose-message-form');
        if (composeForm) {
            composeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const to = modal.querySelector('#message-to').value.trim();
                const subject = modal.querySelector('#message-subject').value.trim();
                const content = modal.querySelector('#message-content').value.trim();
                
                if (to && subject && content) {
                    this.sendMessage(to, subject, content);
                    composeForm.reset();
                    
                    // Retourner à l'onglet "reçus"
                    modal.querySelector('[data-tab="received"]').click();
                }
            });
        }

        // Marquer les messages comme lus quand on clique dessus
        modal.querySelectorAll('.message-item.unread').forEach(item => {
            item.addEventListener('click', () => {
                const messageId = parseInt(item.dataset.id);
                this.markAsRead(messageId);
                item.classList.remove('unread');
            });
        });
        
        // Initialiser l'autocomplétion immédiatement si on est déjà sur l'onglet composer
        const composeTab = modal.querySelector('[data-tab="compose"]');
        if (composeTab && composeTab.classList.contains('active')) {
            setTimeout(() => this.initializeUserAutocomplete(), 100);
        }
    }

    // Répondre à un message de commerce
    replyToTrade(originalSender, itemName) {
        const modal = document.querySelector('.mailbox-modal');
        if (!modal) return;

        // Aller à l'onglet composer
        modal.querySelector('[data-tab="compose"]').click();
        
        // Pré-remplir le formulaire
        modal.querySelector('#message-to').value = originalSender;
        modal.querySelector('#message-subject').value = `Re: ${itemName}`;
        modal.querySelector('#message-content').focus();
    }

    // Envoyer un message de contact commercial depuis HDV
    sendTradeMessage(trader, itemName, orderType, price) {
        console.log('📬 sendTradeMessage appelée avec:', {
            trader, itemName, orderType, price
        });
        
        const currentUser = this.getCurrentUser();
        console.log('📬 Utilisateur actuel dans mailbox:', currentUser);
        
        if (!currentUser) {
            console.error('❌ Pas d\'utilisateur connecté dans sendTradeMessage');
            return false;
        }
        
        const subject = `${orderType === 'sell' ? 'Intérêt pour votre vente' : 'Proposition d\'achat'}: ${itemName}`;
        
        let content = '';
        if (orderType === 'sell') {
            content = `Salut ${trader} !\n\nJe suis intéressé(e) par votre ${itemName} au prix de ${price} cols.\n\nPouvez-vous me confirmer sa disponibilité ?\n\nCordialement,\n${currentUser.username}`;
        } else {
            content = `Salut ${trader} !\n\nJ'ai vu que vous cherchez ${itemName} pour ${price} cols.\n\nJe pense avoir ce que vous cherchez. Contactez-moi !\n\nCordialement,\n${currentUser.username}`;
        }

        console.log('📬 Message préparé:', { to: trader, subject, content });

        try {
            this.sendMessage(trader, subject, content, {
                name: itemName,
                price: price
            });
            console.log('✅ Message de commerce envoyé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur sendTradeMessage:', error);
            return false;
        }
    }

    // Initialiser les événements
    initializeEventListeners() {
        // Rien de spécial pour l'instant
    }

    // Récupérer la liste des utilisateurs uniques pour l'autocomplétion
    getAllUsers() {
        const users = new Set();
        
        // Ajouter les utilisateurs des messages existants
        this.messages.forEach(message => {
            if (message.from) users.add(message.from);
            if (message.to) users.add(message.to);
        });
        
        // Récupérer les utilisateurs depuis le HDV si disponible
        if (window.hdvSystem && window.hdvSystem.orders) {
            window.hdvSystem.orders.forEach(order => {
                if (order.trader) users.add(order.trader);
            });
        }
        
        // Récupérer les utilisateurs depuis localStorage (autres systèmes)
        try {
            const savedUsers = localStorage.getItem('ironOath_users');
            if (savedUsers) {
                const userList = JSON.parse(savedUsers);
                userList.forEach(user => users.add(user));
            }
        } catch (error) {
            console.warn('Erreur récupération utilisateurs:', error);
        }
        
        // Retirer l'utilisateur actuel de la liste
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            users.delete(currentUser.username);
        }
        
        return Array.from(users).sort();
    }

    // Initialiser l'autocomplétion pour le champ destinataire
    initializeUserAutocomplete() {
        const messageToInput = document.getElementById('message-to');
        if (!messageToInput) return;
        
        // Créer le conteneur de suggestions si il n'existe pas
        let autocompleteContainer = document.getElementById('autocomplete-suggestions');
        if (!autocompleteContainer) {
            autocompleteContainer = document.createElement('div');
            autocompleteContainer.id = 'autocomplete-suggestions';
            autocompleteContainer.className = 'autocomplete-suggestions';
            messageToInput.parentNode.appendChild(autocompleteContainer);
        }
        
        // Gestionnaire d'événements pour l'autocomplétion
        messageToInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase().trim();
            autocompleteContainer.innerHTML = '';
            
            if (value.length < 1) {
                autocompleteContainer.style.display = 'none';
                return;
            }
            
            const users = this.getAllUsers();
            const matches = users.filter(user => 
                user.toLowerCase().includes(value)
            ).slice(0, 5); // Limiter à 5 suggestions
            
            if (matches.length === 0) {
                autocompleteContainer.style.display = 'none';
                return;
            }
            
            autocompleteContainer.style.display = 'block';
            
            matches.forEach(user => {
                const suggestion = document.createElement('div');
                suggestion.className = 'autocomplete-suggestion';
                suggestion.textContent = user;
                
                suggestion.addEventListener('click', () => {
                    messageToInput.value = user;
                    autocompleteContainer.style.display = 'none';
                });
                
                autocompleteContainer.appendChild(suggestion);
            });
        });
        
        // Cacher les suggestions quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!messageToInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
                autocompleteContainer.style.display = 'none';
            }
        });
        
        // Navigation au clavier
        messageToInput.addEventListener('keydown', (e) => {
            const suggestions = autocompleteContainer.querySelectorAll('.autocomplete-suggestion');
            let selectedIndex = Array.from(suggestions).findIndex(s => s.classList.contains('selected'));
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex < suggestions.length - 1) {
                    if (selectedIndex >= 0) suggestions[selectedIndex].classList.remove('selected');
                    suggestions[selectedIndex + 1].classList.add('selected');
                } else if (suggestions.length > 0) {
                    if (selectedIndex >= 0) suggestions[selectedIndex].classList.remove('selected');
                    suggestions[0].classList.add('selected');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex > 0) {
                    suggestions[selectedIndex].classList.remove('selected');
                    suggestions[selectedIndex - 1].classList.add('selected');
                } else if (suggestions.length > 0 && selectedIndex === 0) {
                    suggestions[selectedIndex].classList.remove('selected');
                    suggestions[suggestions.length - 1].classList.add('selected');
                }
            } else if (e.key === 'Enter') {
                const selected = autocompleteContainer.querySelector('.autocomplete-suggestion.selected');
                if (selected) {
                    e.preventDefault();
                    messageToInput.value = selected.textContent;
                    autocompleteContainer.style.display = 'none';
                }
            } else if (e.key === 'Escape') {
                autocompleteContainer.style.display = 'none';
            }
        });
    }

    // Formatter le temps
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
        
        return date.toLocaleDateString('fr-FR');
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style basique
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Obtenir le nombre de messages non lus
    getUnreadCount() {
        const currentUser = this.getCurrentUser();
        return this.messages.filter(msg => 
            msg.to === currentUser.username && !msg.read
        ).length;
    }
}

// Initialiser le système de boîte mail
const mailboxSystem = new MailboxSystem();