/* guild-dm.js - Gestion des messages privés de la guilde */

console.log('✅ Module guild-dm.js chargé');

let dmOpen = false;
let currentRecipient = null;
let selectedDmImage = null;
let dmSubscription = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[DM] Initialisation des messages privés...');
    
    await waitForDmAuth();
    
    if (await isGuildMember()) {
        initializeDM();
    }
});

// Attendre l'authentification
function waitForDmAuth() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            if (typeof supabase !== 'undefined' && window.currentUser) {
                clearInterval(checkAuth);
                console.log('[DM] Auth prête');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                console.log('[DM] Timeout auth');
                resolve();
            }
        }, 100);
    });
}

// Vérifier si membre
async function isGuildMember() {
    try {
        if (!window.currentUser) return false;
        
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', window.currentUser.id)
            .single();
        
        const role = (profile?.role || '').trim();
        return role === 'membre' || role === 'admin';
    } catch (error) {
        console.error('[DM] Erreur vérification membre:', error);
        return false;
    }
}

// Initialiser les DMs
function initializeDM() {
    console.log('[DM] Initialisation des événements DM...');
    
    // Event listeners
    document.getElementById('dm-back-btn').addEventListener('click', closeDMChat);
    document.getElementById('dm-send-btn').addEventListener('click', sendDM);
    document.getElementById('dm-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendDM();
        }
    });
    
    // Event listeners pour les images
    document.getElementById('dm-image-btn').addEventListener('click', function() {
        document.getElementById('dm-image-input').click();
    });
    document.getElementById('dm-image-input').addEventListener('change', handleDmImageSelect);
    
    // Event listener pour la recherche
    document.getElementById('dm-search-input').addEventListener('input', filterDmMembers);
    
    // Charger la liste des membres
    loadDmMembers();
    
    // S'abonner aux nouveaux messages
    subscribeToDMs();
}

// Filtrer les membres selon la recherche
function filterDmMembers() {
    const searchTerm = document.getElementById('dm-search-input').value.toLowerCase();
    const memberItems = document.querySelectorAll('.dm-member-item');
    
    memberItems.forEach(item => {
        const memberName = item.querySelector('.dm-member-name').textContent.toLowerCase();
        if (memberName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
window.filterDmMembers = filterDmMembers;

// Basculer l'ouverture/fermeture - SUPPRIMÉ (intégré dans le chat)
// Fermer les DMs - SUPPRIMÉ (intégré dans le chat)

// Fermer le chat actif
function closeDMChat() {
    currentRecipient = null;
    document.getElementById('dm-active-chat').style.display = 'none';
    document.getElementById('dm-placeholder').style.display = 'flex';
    document.querySelectorAll('.dm-member-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Charger la liste des membres
async function loadDmMembers() {
    try {
        console.log('[DM] Chargement de la liste des membres...');
        
        const list = document.getElementById('dm-members-list');
        if (!list) {
            console.error('[DM] ERREUR: Élément dm-members-list non trouvé!');
            return;
        }
        
        console.log('[DM] Élément dm-members-list trouvé, requête Supabase...');
        
        const { data: members, error } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('role', ['membre', 'admin'])
            .neq('id', window.currentUser.id)
            .order('username');
        
        if (error) {
            console.error('[DM] Erreur chargement membres:', error);
            list.innerHTML = '<div class="dm-loading" style="color: #e74c3c;">Erreur de chargement</div>';
            return;
        }
        
        console.log('[DM] Membres récupérés:', members);
        
        if (!members || members.length === 0) {
            list.innerHTML = '<div class="dm-loading">Aucun membre disponible</div>';
            return;
        }
        
        const html = members.map(member => `
            <div class="dm-member-item" data-member-id="${member.id}" onclick="openDMChat('${member.id}', '${escapeHtml(member.username)}')">
                <div class="dm-member-avatar">👤</div>
                <div class="dm-member-info">
                    <span class="dm-member-name">${escapeHtml(member.username)}</span>
                    <span class="dm-member-preview">Cliquez pour discuter</span>
                </div>
            </div>
        `).join('');
        
        list.innerHTML = html;
        
        console.log('[DM] HTML injecté, membres chargés:', members.length);
        console.log('[DM] Premier élément injecté:', list.firstElementChild);
    } catch (error) {
        console.error('[DM] Erreur:', error);
        const list = document.getElementById('dm-members-list');
        if (list) {
            list.innerHTML = '<div class="dm-loading" style="color: #e74c3c;">Erreur: ' + error.message + '</div>';
        }
    }
}
window.loadDmMembers = loadDmMembers;

// Ouvrir un chat privé
window.openDMChat = async function(recipientId, recipientName) {
    currentRecipient = recipientId;
    
    // Mettre à jour l'interface
    document.getElementById('dm-placeholder').style.display = 'none';
    document.getElementById('dm-active-chat').style.display = 'flex';
    document.getElementById('dm-recipient-name').textContent = recipientName;
    
    // Marquer comme actif
    document.querySelectorAll('.dm-member-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.dm-member-item[data-member-id="${recipientId}"]`)?.classList.add('active');
    
    // Charger les messages
    await loadDmMessages(recipientId);
    
    // Focus sur l'input
    document.getElementById('dm-input').focus();
};

// Charger les messages privés
async function loadDmMessages(recipientId) {
    try {
        console.log('[DM] Chargement messages avec:', recipientId);
        
        const { data: messages, error } = await supabase
            .from('guild_chat')
            .select('*')
            .eq('is_private', true)
            .or(`and(user_id.eq.${window.currentUser.id},recipient_id.eq.${recipientId}),and(user_id.eq.${recipientId},recipient_id.eq.${window.currentUser.id})`)
            .order('created_at', { ascending: true })
            .limit(100);
        
        if (error) {
            console.error('[DM] Erreur chargement messages:', error);
            displayDmError();
            return;
        }
        
        if (!messages || messages.length === 0) {
            displayNoDmMessages();
            return;
        }
        
        // Récupérer les profils
        const userIds = [...new Set(messages.map(m => m.user_id))];
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('id', userIds);
        
        const profileMap = {};
        (profiles || []).forEach(p => {
            profileMap[p.id] = p.username;
        });
        
        displayDmMessages(messages, profileMap);
        console.log('[DM] Messages chargés:', messages.length);
        
    } catch (error) {
        console.error('[DM] Erreur:', error);
        displayDmError();
    }
}

// Afficher les messages
function displayDmMessages(messages, profileMap) {
    const container = document.getElementById('dm-messages');
    
    container.innerHTML = messages.map(msg => {
        const isOwnMessage = msg.user_id === window.currentUser.id;
        const author = profileMap[msg.user_id] || 'Inconnu';
        const time = formatChatTime(msg.created_at);
        
        let imageHtml = '';
        if (msg.image_url) {
            imageHtml = `<img src="${escapeHtml(msg.image_url)}" alt="Image" class="dm-message-image" onclick="window.open('${escapeHtml(msg.image_url)}', '_blank')">`;
        }
        
        return `
            <div class="dm-message ${isOwnMessage ? 'own-message' : ''}">
                <div class="dm-message-avatar">👤</div>
                <div class="dm-message-content-wrapper">
                    <div class="dm-message-header">
                        <span class="dm-message-author">${escapeHtml(author)}</span>
                        <span class="dm-message-time">${time}</span>
                    </div>
                    ${msg.content ? `<div class="dm-message-bubble">${escapeHtml(msg.content)}</div>` : ''}
                    ${imageHtml}
                </div>
            </div>
        `;
    }).join('');
    
    scrollDmToBottom();
}

// Afficher "Aucun message"
function displayNoDmMessages() {
    document.getElementById('dm-messages').innerHTML = `
        <div class="dm-messages-loading">
            <p style="color: #888; font-style: italic;">Aucun message. Soyez le premier à écrire !</p>
        </div>
    `;
}

// Afficher une erreur
function displayDmError() {
    document.getElementById('dm-messages').innerHTML = `
        <div class="dm-messages-loading">
            <p style="color: #e74c3c;">Erreur de chargement des messages.</p>
        </div>
    `;
}

// Envoyer un message privé
async function sendDM() {
    try {
        if (!currentRecipient) {
            alert('Aucun destinataire sélectionné');
            return;
        }
        
        const input = document.getElementById('dm-input');
        const content = input.value.trim();
        
        if (!content && !selectedDmImage) return;
        
        const sendBtn = document.getElementById('dm-send-btn');
        sendBtn.disabled = true;
        
        let imageUrl = null;
        
        // Upload de l'image
        if (selectedDmImage) {
            imageUrl = await uploadChatImage(selectedDmImage);
            if (!imageUrl) {
                alert('Erreur lors de l\'upload de l\'image.');
                sendBtn.disabled = false;
                return;
            }
        }
        
        const messageData = {
            user_id: window.currentUser.id,
            content: content || '',
            image_url: imageUrl,
            is_private: true,
            recipient_id: currentRecipient,
            reply_to_message_id: null
        };
        
        const { error } = await supabase
            .from('guild_chat')
            .insert([messageData]);
        
        if (error) {
            console.error('[DM] Erreur envoi:', error);
            alert(`Erreur: ${error.message}`);
            sendBtn.disabled = false;
            return;
        }
        
        // Réinitialiser
        input.value = '';
        sendBtn.disabled = false;
        clearDmImagePreview();
        
        // Recharger les messages
        await loadDmMessages(currentRecipient);
        
        console.log('[DM] Message envoyé');
        
    } catch (error) {
        console.error('[DM] Erreur:', error);
        document.getElementById('dm-send-btn').disabled = false;
    }
}

// Gérer la sélection d'image
function handleDmImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Image trop volumineuse (max 5MB)');
        event.target.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Seules les images sont autorisées');
        event.target.value = '';
        return;
    }
    
    selectedDmImage = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('dm-image-preview');
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-image-btn" onclick="clearDmImagePreview()" style="position: absolute; top: 15px; right: 25px;">✕</button>
        `;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Effacer l'aperçu
function clearDmImagePreview() {
    selectedDmImage = null;
    document.getElementById('dm-image-input').value = '';
    const preview = document.getElementById('dm-image-preview');
    preview.innerHTML = '';
    preview.style.display = 'none';
}
window.clearDmImagePreview = clearDmImagePreview;

// Upload image (réutilise la fonction du chat général)
async function uploadChatImage(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `chat-images/${fileName}`;
        
        const { data, error } = await supabase.storage
            .from('iron-oath-storage')
            .upload(filePath, file);
        
        if (error) {
            console.error('[DM] Erreur upload:', error);
            return null;
        }
        
        const { data: urlData } = supabase.storage
            .from('iron-oath-storage')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    } catch (error) {
        console.error('[DM] Erreur:', error);
        return null;
    }
}

// S'abonner aux nouveaux messages privés
function subscribeToDMs() {
    console.log('[DM] Abonnement aux messages privés...');
    
    dmSubscription = supabase
        .channel('guild-dm')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'guild_chat',
            filter: `is_private=eq.true`
        }, (payload) => {
            console.log('[DM] Nouveau message privé:', payload.new);
            
            const msg = payload.new;
            
            // Si c'est pour moi
            if (msg.recipient_id === window.currentUser.id || msg.user_id === window.currentUser.id) {
                // Si le chat est ouvert avec cette personne
                if (currentRecipient && 
                    (currentRecipient === msg.user_id || currentRecipient === msg.recipient_id)) {
                    const otherUserId = msg.user_id === window.currentUser.id ? msg.recipient_id : msg.user_id;
                    loadDmMessages(otherUserId);
                } else {
                    // Sinon, mettre à jour le badge
                    updateDmBadge();
                }
            }
        })
        .subscribe();
}

// Mettre à jour le badge de notifications
async function updateDmBadge() {
    try {
        const { count } = await supabase
            .from('guild_chat')
            .select('*', { count: 'exact', head: true })
            .eq('is_private', true)
            .eq('recipient_id', window.currentUser.id);
        
        const badge = document.getElementById('tab-private-badge');
        const tabBtn = document.getElementById('tab-private-btn');
        
        if (count && count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
            tabBtn.classList.add('has-unread');
        } else {
            badge.style.display = 'none';
            tabBtn.classList.remove('has-unread');
        }
    } catch (error) {
        console.error('[DM] Erreur badge:', error);
    }
}

// Scroller vers le bas
function scrollDmToBottom() {
    setTimeout(() => {
        const container = document.getElementById('dm-messages');
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// Formater l'heure (réutilise la fonction du chat)
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

console.log('✅ Module guild-dm.js chargé');
