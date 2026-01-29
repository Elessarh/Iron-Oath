/* guild-chat.js - Gestion du chat de la guilde */

let chatOpen = false;
let replyingToMessage = null;
let lastMessageId = null;
let chatSubscription = null;
let selectedImage = null; // Image sélectionnée pour upload
let userRole = null; // Rôle de l'utilisateur (admin ou membre)
let guildMembers = []; // Liste des membres de la guilde pour les mentions

// Initialisation du chat
document.addEventListener('DOMContentLoaded', async function() {
    // console.log('[CHAT] Initialisation du chat de la guilde...');
    
    // Attendre que l'utilisateur soit connecté
    await waitForChatAuth();
    
    // Vérifier si l'utilisateur est membre
    if (await isGuildMember()) {
        initializeChat();
    }
});

// Attendre l'authentification
function waitForChatAuth() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            if (typeof supabase !== 'undefined' && window.currentUser) {
                clearInterval(checkAuth);
                // console.log('[CHAT] Auth prête');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                // console.log('[CHAT] Timeout auth');
                resolve();
            }
        }, 100);
    });
}

// Vérifier si l'utilisateur est membre de la guilde
async function isGuildMember() {
    try {
        if (!window.currentUser) return false;
        
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', window.currentUser.id)
            .single();
        
        const role = (profile?.role || '').trim();
        userRole = role; // Stocker le rôle
        return role === 'membre' || role === 'admin';
    } catch (error) {
        // console.error('[CHAT] Erreur vérification membre:', error);
        return false;
    }
}

// Initialiser le chat
function initializeChat() {
    // console.log('[CHAT] Initialisation des événements...');
    
    // Afficher le bouton flottant
    const chatBtn = document.getElementById('chat-toggle-btn');
    chatBtn.style.display = 'flex';
    
    // Event listeners pour les onglets
    document.getElementById('tab-general-btn').addEventListener('click', () => switchChatTab('general'));
    document.getElementById('tab-private-btn').addEventListener('click', () => switchChatTab('private'));
    
    // Event listeners du chat général
    document.getElementById('chat-toggle-btn').addEventListener('click', toggleChat);
    document.getElementById('chat-close-btn').addEventListener('click', closeChat);
    document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    document.getElementById('cancel-reply-btn').addEventListener('click', cancelReply);
    
    // Event listeners pour les images
    document.getElementById('chat-image-btn').addEventListener('click', function() {
        document.getElementById('chat-image-input').click();
    });
    document.getElementById('chat-image-input').addEventListener('change', handleImageSelect);
    
    // Charger les messages initiaux
    loadMessages();
    
    // S'abonner aux nouveaux messages en temps réel
    subscribeToMessages();
    
    // Charger les membres de la guilde pour les mentions
    loadGuildMembers();
    
    // Initialiser l'autocomplete pour les mentions
    initializeMentions();
}

// Changer d'onglet
function switchChatTab(tabName) {
    // console.log('[CHAT] Changement d\'onglet:', tabName);
    
    // Retirer active de tous les boutons et contenus
    document.querySelectorAll('.chat-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.chat-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activer le bon onglet
    document.querySelector(`.chat-tab-btn[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`chat-${tabName}-content`).classList.add('active');
    
    // Si on ouvre les DMs, charger les membres
    if (tabName === 'private' && typeof loadDmMembers === 'function') {
        loadDmMembers();
    }
}
window.switchChatTab = switchChatTab;

// Basculer l'ouverture/fermeture du chat
function toggleChat() {
    const chatContainer = document.getElementById('guild-chat');
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatContainer.classList.add('open');
        loadMessages(); // Recharger les messages à l'ouverture
        scrollToBottom();
        
        // Marquer les messages comme lus
        markMessagesAsRead();
    } else {
        chatContainer.classList.remove('open');
    }
}

// Fermer le chat
function closeChat() {
    chatOpen = false;
    document.getElementById('guild-chat').classList.remove('open');
}

// Charger les messages
async function loadMessages() {
    try {
        // console.log('[CHAT] Chargement des messages...');
        
        // Uniquement les messages publics
        const { data: messages, error } = await supabase
            .from('guild_chat')
            .select('*')
            .eq('is_private', false)
            .order('created_at', { ascending: true })
            .limit(100);
        
        if (error) {
            // console.error('[CHAT] Erreur chargement messages:', error);
            displayError();
            return;
        }
        
        if (!messages || messages.length === 0) {
            displayNoMessages();
            return;
        }
        
        // Récupérer les profils des auteurs
        const userIds = [...new Set(messages.map(m => m.user_id))];
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('id', userIds);
        
        const profileMap = {};
        (profiles || []).forEach(p => {
            profileMap[p.id] = p.username;
        });
        
        displayMessages(messages, profileMap);
        // console.log('[CHAT] Messages chargés:', messages.length);
        
        // Stocker le dernier ID de message
        if (messages.length > 0) {
            lastMessageId = messages[messages.length - 1].id;
        }
        
    } catch (error) {
        // console.error('[CHAT] Erreur:', error);
        displayError();
    }
}

// Afficher les messages
function displayMessages(messages, profileMap) {
    const container = document.getElementById('chat-messages');
    
    container.innerHTML = messages.map(msg => {
        const isOwnMessage = msg.user_id === window.currentUser.id;
        const author = profileMap[msg.user_id] || 'Inconnu';
        const time = formatChatTime(msg.created_at);
        
        let replyHtml = '';
        if (msg.reply_to_message_id) {
            const replyMsg = messages.find(m => m.id === msg.reply_to_message_id);
            if (replyMsg) {
                const replyAuthor = profileMap[replyMsg.user_id] || 'Inconnu';
                replyHtml = `
                    <div class="message-reply-to">
                        <div class="reply-to-author">↩️ ${escapeHtml(replyAuthor)}</div>
                        <div class="reply-to-content">${escapeHtml(replyMsg.content.substring(0, 50))}${replyMsg.content.length > 50 ? '...' : ''}</div>
                    </div>
                `;
            }
        }
        
        let imageHtml = '';
        if (msg.image_url) {
            imageHtml = `<img src="${escapeHtml(msg.image_url)}" alt="Image" class="message-image" onclick="window.open('${escapeHtml(msg.image_url)}', '_blank')">`;
        }
        
        // Bouton de suppression pour les admins
        const deleteBtn = userRole === 'admin' ? `
            <button class="action-btn delete-btn" onclick="deleteMessage('${msg.id}')" title="Supprimer le message">
                🗑️ Supprimer
            </button>
        ` : '';
        
        // Parser les mentions dans le contenu
        const parsedContent = msg.content ? parseMentions(msg.content) : '';
        
        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : ''} ${msg.reply_to_message_id ? 'reply-message' : ''}" data-message-id="${msg.id}">
                <div class="message-header">
                    <span class="message-author">${escapeHtml(author)}</span>
                    <span class="message-time">${time}</span>
                </div>
                ${replyHtml}
                ${parsedContent ? `<div class="message-content">${parsedContent}</div>` : ''}
                ${imageHtml}
                <div class="message-actions">
                    ${!isOwnMessage ? `
                        <button class="action-btn" onclick="replyToMessage('${msg.id}', '${escapeHtml(author)}', '${escapeHtml(msg.content)}')">
                            ↩️ Répondre
                        </button>
                    ` : ''}
                    ${deleteBtn}
                </div>
            </div>
        `;
    }).join('');
    
    scrollToBottom();
}

// Afficher "Aucun message"
function displayNoMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="chat-no-messages">
            <div class="chat-no-messages-icon">💬</div>
            <p class="chat-no-messages-text">Aucun message pour le moment.<br>Soyez le premier à écrire !</p>
        </div>
    `;
}

// Afficher une erreur
function displayError() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="chat-no-messages">
            <div class="chat-no-messages-icon">⚠️</div>
            <p class="chat-no-messages-text">Erreur de chargement des messages.</p>
        </div>
    `;
}

// Envoyer un message
async function sendMessage() {
    try {
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        
        if (!content && !selectedImage) return;
        
        const sendBtn = document.getElementById('chat-send-btn');
        sendBtn.disabled = true;
        
        let imageUrl = null;
        
        // Upload de l'image si sélectionnée
        if (selectedImage) {
            imageUrl = await uploadChatImage(selectedImage);
            if (!imageUrl) {
                alert('Erreur lors de l\'upload de l\'image.');
                sendBtn.disabled = false;
                return;
            }
        }
        
        const messageData = {
            user_id: window.currentUser.id,
            content: content || '',
            reply_to_message_id: replyingToMessage,
            image_url: imageUrl,
            is_private: false,
            recipient_id: null
        };
        
        const { error } = await supabase
            .from('guild_chat')
            .insert([messageData]);
        
        if (error) {
            // console.error('[CHAT] Erreur envoi message:', error);
            alert('Erreur lors de l\'envoi du message.');
            sendBtn.disabled = false;
            return;
        }
        
        // Réinitialiser
        input.value = '';
        sendBtn.disabled = false;
        cancelReply();
        clearImagePreview();
        
        // console.log('[CHAT] Message envoyé');
        
    } catch (error) {
        // console.error('[CHAT] Erreur:', error);
        document.getElementById('chat-send-btn').disabled = false;
    }
}

// Répondre à un message
window.replyToMessage = function(messageId, author, content) {
    replyingToMessage = messageId;
    
    document.getElementById('reply-to-author').textContent = author;
    document.getElementById('reply-to-preview').textContent = content.substring(0, 80) + (content.length > 80 ? '...' : '');
    document.getElementById('chat-replying-to').classList.add('active');
    
    // Focus sur l'input
    document.getElementById('chat-input').focus();
};

// Annuler la réponse
function cancelReply() {
    replyingToMessage = null;
    document.getElementById('chat-replying-to').classList.remove('active');
}

// S'abonner aux nouveaux messages en temps réel
function subscribeToMessages() {
    // console.log('[CHAT] Abonnement aux nouveaux messages...');
    
    chatSubscription = supabase
        .channel('guild-chat')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'guild_chat'
        }, (payload) => {
            // console.log('[CHAT] Nouveau message reçu:', payload.new);
            
            // Recharger les messages si le chat est ouvert
            if (chatOpen) {
                loadMessages();
            } else {
                // Afficher un badge de nouveau message
                updateChatBadge();
            }
        })
        .subscribe();
}

// Mettre à jour le badge de nouveaux messages
async function updateChatBadge() {
    try {
        const { count } = await supabase
            .from('guild_chat')
            .select('*', { count: 'exact', head: true })
            .gt('id', lastMessageId || 0);
        
        const badge = document.getElementById('chat-badge');
        const chatBtn = document.getElementById('chat-toggle-btn');
        
        if (count && count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
            chatBtn.classList.add('has-new-messages');
        }
    } catch (error) {
        // console.error('[CHAT] Erreur badge:', error);
    }
}

// Marquer les messages comme lus
function markMessagesAsRead() {
    const badge = document.getElementById('chat-badge');
    const chatBtn = document.getElementById('chat-toggle-btn');
    
    badge.style.display = 'none';
    chatBtn.classList.remove('has-new-messages');
}

// Scroller vers le bas
function scrollToBottom() {
    setTimeout(() => {
        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// Formater l'heure
function formatChatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
}

// Échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Gérer la sélection d'image
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 5MB)');
        event.target.value = '';
        return;
    }
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
        alert('Seules les images sont autorisées');
        event.target.value = '';
        return;
    }
    
    selectedImage = file;
    
    // Afficher l'aperçu
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('chat-image-preview');
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-image-btn" onclick="clearImagePreview()">✕</button>
        `;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Effacer l'aperçu de l'image
function clearImagePreview() {
    selectedImage = null;
    document.getElementById('chat-image-input').value = '';
    const preview = document.getElementById('chat-image-preview');
    preview.innerHTML = '';
    preview.style.display = 'none';
}
window.clearImagePreview = clearImagePreview; // Rendre accessible globalement

// Upload de l'image
async function uploadChatImage(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `chat-images/${fileName}`;
        
        const { data, error } = await supabase.storage
            .from('iron-oath-storage')
            .upload(filePath, file);
        
        if (error) {
            // console.error('[CHAT] Erreur upload image:', error);
            return null;
        }
        
        const { data: urlData } = supabase.storage
            .from('iron-oath-storage')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    } catch (error) {
        // console.error('[CHAT] Erreur upload:', error);
        return null;
    }
}

// Charger les membres de la guilde
async function loadGuildMembers() {
    try {
        const { data: members, error } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('role', ['membre', 'admin'])
            .order('username');
        
        if (error) throw error;
        
        guildMembers = members || [];
        // console.log('[CHAT] Membres chargés:', guildMembers.length);
    } catch (error) {
        // console.error('[CHAT] Erreur chargement membres:', error);
    }
}

// Initialiser l'autocomplete pour les mentions
function initializeMentions() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages-container');
    
    // Créer le conteneur d'autocomplete s'il n'existe pas
    let autocompleteDiv = document.getElementById('mention-autocomplete');
    if (!autocompleteDiv) {
        autocompleteDiv = document.createElement('div');
        autocompleteDiv.id = 'mention-autocomplete';
        autocompleteDiv.className = 'mention-autocomplete';
        container.appendChild(autocompleteDiv);
    }
    
    input.addEventListener('input', function(e) {
        const text = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        // Chercher un @ avant le curseur
        const beforeCursor = text.substring(0, cursorPos);
        const match = beforeCursor.match(/@(\w*)$/);
        
        if (match) {
            const search = match[1].toLowerCase();
            const filtered = guildMembers.filter(m => 
                m.username.toLowerCase().startsWith(search)
            ).slice(0, 5);
            
            if (filtered.length > 0) {
                showMentionSuggestions(filtered, match.index);
            } else {
                hideMentionSuggestions();
            }
        } else {
            hideMentionSuggestions();
        }
    });
    
    // Gérer les touches fléchées et entrée pour l'autocomplete
    input.addEventListener('keydown', function(e) {
        const autocomplete = document.getElementById('mention-autocomplete');
        if (!autocomplete || autocomplete.style.display === 'none') return;
        
        const items = autocomplete.querySelectorAll('.mention-item');
        const selected = autocomplete.querySelector('.mention-item.selected');
        let selectedIndex = -1;
        
        if (selected) {
            selectedIndex = Array.from(items).indexOf(selected);
        }
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = Math.min(selectedIndex + 1, items.length - 1);
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === nextIndex);
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = Math.max(selectedIndex - 1, 0);
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === prevIndex);
            });
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (selected) {
                e.preventDefault();
                selected.click();
            }
        } else if (e.key === 'Escape') {
            hideMentionSuggestions();
        }
    });
}

// Afficher les suggestions de mention
function showMentionSuggestions(members, atPosition) {
    const autocomplete = document.getElementById('mention-autocomplete');
    
    autocomplete.innerHTML = members.map((member, index) => `
        <div class="mention-item ${index === 0 ? 'selected' : ''}" onclick="insertMention('${escapeHtml(member.username)}')">
            👤 ${escapeHtml(member.username)}
        </div>
    `).join('');
    
    autocomplete.style.display = 'block';
}

// Masquer les suggestions
function hideMentionSuggestions() {
    const autocomplete = document.getElementById('mention-autocomplete');
    if (autocomplete) {
        autocomplete.style.display = 'none';
    }
}

// Insérer une mention
window.insertMention = function(username) {
    const input = document.getElementById('chat-input');
    const text = input.value;
    const cursorPos = input.selectionStart;
    
    // Trouver le @ avant le curseur
    const beforeCursor = text.substring(0, cursorPos);
    const match = beforeCursor.match(/@\w*$/);
    
    if (match) {
        const start = match.index;
        const newText = text.substring(0, start) + '@' + username + ' ' + text.substring(cursorPos);
        input.value = newText;
        input.focus();
        input.setSelectionRange(start + username.length + 2, start + username.length + 2);
    }
    
    hideMentionSuggestions();
};

// Parser les mentions dans le texte
function parseMentions(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

// Supprimer un message (admin uniquement)
window.deleteMessage = async function(messageId) {
    if (userRole !== 'admin') {
        alert('Vous n\'avez pas les droits pour supprimer ce message.');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_chat')
            .delete()
            .eq('id', messageId);
        
        if (error) throw error;
        
        // Recharger les messages
        loadMessages();
        
        // console.log('[CHAT] Message supprimé:', messageId);
    } catch (error) {
        // console.error('[CHAT] Erreur suppression message:', error);
        alert('Erreur lors de la suppression du message.');
    }
};

// console.log('✅ Module guild-chat.js chargé');
