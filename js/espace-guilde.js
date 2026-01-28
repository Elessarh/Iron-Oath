/* espace-guilde.js - Gestion de l'espace guilde pour les membres */

// Fonction pour changer d'onglet
function switchGuildeTab(tabName) {
    // console.log('[GUILDE] Changement d\'onglet vers:', tabName);
    
    // Retirer la classe active de tous les boutons et contenus
    document.querySelectorAll('.guilde-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.guilde-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Ajouter la classe active au bouton et contenu correspondants
    const activeButton = document.querySelector(`.guilde-tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.querySelector(`.guilde-tab-content[data-tab-content="${tabName}"]`);
    
    if (activeButton) activeButton.classList.add('active');
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
    
    // Sauvegarder l'onglet actif dans localStorage
    localStorage.setItem('guildeActiveTab', tabName);
}

// Attendre que l'auth soit prête
document.addEventListener('DOMContentLoaded', async function() {
    // console.log('[GUILDE] Initialisation de l espace guilde...');
    
    // Cacher le lien "Guilde" du menu (on est déjà sur la page)
    hideGuildeLinkFromMenu();
    
    // Attendre que Supabase et l'utilisateur soient prêts
    await waitForAuthAndUser();
    
    // Vérifier que l'utilisateur est membre ou admin
    await checkMemberAccess();
});

// Cacher le lien Guilde du menu (on est déjà sur cette page)
function hideGuildeLinkFromMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        const guildeLink = navMenu.querySelector('a[href="espace-guilde.html"]');
        if (guildeLink && guildeLink.parentElement) {
            guildeLink.parentElement.style.display = 'none';
            // console.log('[OK] Lien Guilde cache du menu');
        }
    }
}

// Attendre que l'authentification soit prête
function waitForAuthAndUser() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100;
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            if (typeof supabase !== 'undefined' && supabase !== null && window.currentUser !== null && window.currentUser !== undefined) {
                clearInterval(checkAuth);
                // console.log('[OK] Auth prete et utilisateur connecte');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                console.error('[ERREUR] Timeout: utilisateur non connecte');
                showAccessDenied();
                resolve();
            }
        }, 100);
    });
}

// Vérifier l'accès membre/admin
async function checkMemberAccess() {
    try {
        if (!window.currentUser) {
            console.error('[ERREUR] Pas d utilisateur connecte');
            showAccessDenied();
            return;
        }
        
        // Récupérer le profil
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', window.currentUser.id)
            .single();
        
        if (error || !profile) {
            console.error('[ERREUR] Erreur profil:', error);
            showAccessDenied();
            return;
        }
        
        // Vérifier le rôle (nettoyer les espaces)
        const role = (profile.role || '').trim();
        
        if (role === 'membre' || role === 'admin') {
            // console.log('[OK] Acces autorise - Role:', role);
            await loadGuildeData();
            
            // Restaurer l'onglet actif depuis localStorage
            const savedTab = localStorage.getItem('guildeActiveTab');
            if (savedTab) {
                switchGuildeTab(savedTab);
            }
        } else {
            console.warn('[ATTENTION] Acces refuse - Role:', role);
            showAccessDenied();
        }
        
    } catch (error) {
        console.error('[ERREUR] Erreur verification acces:', error);
        showAccessDenied();
    }
}

// Afficher le message d'accès refusé
function showAccessDenied() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('guilde-content').style.display = 'none';
    document.getElementById('access-denied').style.display = 'block';
}

// Charger toutes les données de la guilde
async function loadGuildeData() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('guilde-content').style.display = 'block';
    
    // Charger les trois sections en parallèle
    await Promise.all([
        loadPlanning(),
        loadObjectives(),
        loadPresence(),
        loadActivityWall()
    ]);
    
    // Event listeners pour les boutons d'appel
    document.getElementById('mark-presence-btn').addEventListener('click', () => markPresence('present'));
    document.getElementById('mark-absence-btn').addEventListener('click', () => markPresence('absent'));
}

// ========== PLANNING ==========
async function loadPlanning() {
    try {
        // Utiliser le cache
        const cacheKey = 'guild_planning';
        const cached = window.cacheManager?.get(cacheKey);
        
        if (cached) {
            displayPlanning(cached);
            // console.log('[OK] Planning charge depuis cache');
            return;
        }
        
        // Récupérer les événements à venir
        const { data, error } = await supabase
            .from('guild_planning')
            .select('*')
            .gte('date_event', new Date().toISOString())
            .order('date_event', { ascending: true })
            .limit(10);
        
        if (error) {
            console.error('[ERREUR] Erreur chargement planning:', error);
            return;
        }
        
        // Mettre en cache pour 2 minutes
        if (window.cacheManager) {
            window.cacheManager.set(cacheKey, data || []);
        }
        
        displayPlanning(data || []);
        // console.log('[OK] Planning charge:', (data || []).length, 'evenements');
        
    } catch (error) {
        console.error('[ERREUR]:', error);
    }
}

function displayPlanning(data) {
    const container = document.getElementById('planning-list');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-data">Aucun evenement planifie</div>';
        return;
    }
    
    container.innerHTML = data.map(event => `
        <div class="planning-item">
            <div class="item-title">${escapeHtml(event.titre)}</div>
            <div class="item-date">${formatDate(event.date_event)} | Type: ${formatEventType(event.type_event)}</div>
            ${event.description ? `<div class="item-description">${escapeHtml(event.description)}</div>` : ''}
        </div>
    `).join('');
}// ========== OBJECTIFS ==========
async function loadObjectives() {
    try {
        // Obtenir le numéro de semaine actuel
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        const year = now.getFullYear();
        
        // Utiliser le cache
        const cacheKey = `guild_objectives_${year}_${weekNumber}`;
        const cached = window.cacheManager?.get(cacheKey);
        
        if (cached) {
            displayObjectives(cached);
            // console.log('[OK] Objectifs charges depuis cache');
            return;
        }
        
        // Récupérer les objectifs de la semaine
        const { data, error } = await supabase
            .from('guild_objectives')
            .select('*')
            .eq('semaine_numero', weekNumber)
            .eq('annee', year)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('[ERREUR] Erreur chargement objectifs:', error);
            return;
        }
        
        // Mettre en cache pour 5 minutes
        if (window.cacheManager) {
            window.cacheManager.set(cacheKey, data || []);
        }
        
        displayObjectives(data || []);
        // console.log('[OK] Objectifs charges:', (data || []).length);
        
    } catch (error) {
        console.error('[ERREUR]:', error);
    }
}

function displayObjectives(data) {
    const container = document.getElementById('objectives-list');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-data">Aucun objectif defini pour cette semaine</div>';
        return;
    }
    
    container.innerHTML = data.map(obj => `
        <div class="objective-item">
            <div class="item-title">${escapeHtml(obj.titre)}</div>
            <div class="item-description">${escapeHtml(obj.description || '')}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${obj.progression}%">
                    ${obj.progression}%
                </div>
            </div>
            <div style="color: #888; font-size: 0.85rem; margin-top: 5px;">
                Statut: ${formatStatus(obj.statut)}
            </div>
        </div>
    `).join('');
}

// ========== PRÉSENCE ==========
async function loadPresence() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // console.log('[DEBUG] Chargement presences pour:', today);
        
        // Récupérer toutes les présences du jour
        const { data: presences, error: presencesError } = await supabase
            .from('guild_presence')
            .select('*')
            .eq('date_presence', today)
            .order('statut', { ascending: true });
        
        if (presencesError) {
            console.error('[ERREUR] Erreur chargement presences:', presencesError);
            const container = document.getElementById('presence-list');
            container.innerHTML = '<div class="no-data">Erreur de chargement des presences</div>';
            return;
        }
        
        // console.log('[DEBUG] Presences recues:', presences);
        
        const container = document.getElementById('presence-list');
        
        if (!presences || presences.length === 0) {
            container.innerHTML = '<div class="no-data">Aucune presence enregistree aujourd hui</div>';
            return;
        }
        
        // Récupérer les profils des utilisateurs
        const userIds = presences.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, username, classe, niveau')
            .in('id', userIds);
        
        if (profilesError) {
            console.error('[ERREUR] Erreur chargement profils:', profilesError);
            const container = document.getElementById('presence-list');
            container.innerHTML = '<div class="no-data">Erreur de chargement des profils</div>';
            return;
        }
        
        // Créer un map des profils par ID
        const profileMap = {};
        (profiles || []).forEach(p => {
            profileMap[p.id] = p;
        });
        
        // console.log('[DEBUG] Profils recus:', profiles);
        
        container.innerHTML = presences.map(presence => {
            const profile = profileMap[presence.user_id];
            const username = profile ? profile.username : 'Inconnu';
            
            return `
                <div class="presence-card ${presence.statut}">
                    <div class="presence-username">${escapeHtml(username)}</div>
                    <span class="presence-status status-${presence.statut}">
                        ${formatPresenceStatus(presence.statut)}
                    </span>
                </div>
            `;
        }).join('');
        
        // console.log('[OK] Presences chargees:', presences.length);
        
    } catch (error) {
        console.error('[ERREUR]:', error);
        const container = document.getElementById('presence-list');
        if (container) {
            container.innerHTML = '<div class="no-data">Erreur technique lors du chargement</div>';
        }
    }
}

// Marquer sa présence ou absence
async function markPresence(statut = 'present') {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Vérifier si déjà marqué
        const { data: existing } = await supabase
            .from('guild_presence')
            .select('id, statut')
            .eq('user_id', window.currentUser.id)
            .eq('date_presence', today)
            .single();
        
        if (existing) {
            // Mettre à jour le statut si différent
            if (existing.statut !== statut) {
                const { error: updateError } = await supabase
                    .from('guild_presence')
                    .update({ statut: statut })
                    .eq('id', existing.id);
                
                if (updateError) {
                    console.error('[ERREUR] Erreur mise a jour statut:', updateError);
                    alert('Impossible de mettre a jour votre statut.');
                    return;
                }
                
                const message = statut === 'present' ? 'Presence enregistree !' : 'Absence enregistree.';
                alert(message);
                await loadPresence();
                return;
            } else {
                const message = statut === 'present' 
                    ? 'Votre presence a deja ete enregistree !' 
                    : 'Votre absence a deja ete enregistree.';
                alert(message);
                return;
            }
        }
        
        // Insérer la présence/absence
        const { error } = await supabase
            .from('guild_presence')
            .insert({
                user_id: window.currentUser.id,
                date_presence: today,
                statut: statut
            });
        
        if (error) {
            console.error('[ERREUR] Erreur marquage presence:', error);
            alert('Impossible de marquer votre statut. Reessayez.');
            return;
        }
        
        const message = statut === 'present' ? 'Presence enregistree avec succes !' : 'Absence enregistree.';
        alert(message);
        await loadPresence(); // Recharger la liste
        
    } catch (error) {
        console.error('[ERREUR]:', error);
        alert('Une erreur est survenue.');
    }
}

// ========== FONCTIONS UTILITAIRES ==========

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

function formatEventType(type) {
    const types = {
        'reunion': 'Reunion',
        'raid': 'Raid',
        'event': 'Evenement',
        'pvp': 'PvP',
        'construction': 'Construction',
        'autre': 'Autre'
    };
    return types[type] || type;
}

function formatStatus(status) {
    const statuses = {
        'en_cours': 'En cours',
        'termine': 'Termine',
        'abandonne': 'Abandonne'
    };
    return statuses[status] || status;
}

function formatPresenceStatus(status) {
    const statuses = {
        'present': 'Present',
        'absent': 'Absent',
        'en_mission': 'En mission'
    };
    return statuses[status] || status;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== MUR D'ACTIVITÉ ==========
async function loadActivityWall() {
    try {
        // console.log('[GUILDE] Chargement du mur d\'activité...');
        
        // Utiliser le cache
        const cacheKey = 'guild_activity_wall';
        const cached = window.cacheManager?.get(cacheKey);
        
        if (cached) {
            displayActivityWall(cached);
            // console.log('[OK] Mur d\'activité chargé depuis cache');
            return;
        }
        
        // Récupérer les activités (limitées aux 20 dernières)
        const { data, error } = await supabase
            .from('guild_activity_wall')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) {
            console.error('[ERREUR] Erreur chargement activités:', error);
            return;
        }
        
        // Mettre en cache pour 1 minute
        if (window.cacheManager) {
            window.cacheManager.set(cacheKey, data || [], 60000);
        }
        
        displayActivityWall(data || []);
        // console.log('[OK] Mur d\'activité chargé:', (data || []).length, 'publications');
        
    } catch (error) {
        console.error('[ERREUR] Erreur mur d\'activité:', error);
    }
}

function displayActivityWall(activities) {
    const container = document.getElementById('activity-wall-content');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="no-activities">
                <div class="no-activities-icon">📋</div>
                <p class="no-activities-text">Aucune activité pour le moment</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-post">
            <div class="activity-post-header">
                <div>
                    <h3 class="activity-post-title">${escapeHtml(activity.titre)}</h3>
                    <div class="activity-post-date">${formatActivityDate(activity.created_at)}</div>
                </div>
            </div>
            <div class="activity-post-content">${escapeHtml(activity.contenu)}</div>
            ${activity.image_url ? `<img src="${activity.image_url}" alt="Image" class="activity-post-image">` : ''}
            <div class="activity-post-footer">
                <span class="activity-post-author">Par ${escapeHtml(activity.author_name || 'Admin')}</span>
                <span class="activity-post-type type-${activity.type || 'annonce'}">${formatActivityType(activity.type)}</span>
            </div>
        </div>
    `).join('');
}

function formatActivityDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatActivityType(type) {
    const types = {
        'annonce': '📢 Annonce',
        'evenement': '📅 Événement',
        'info': 'ℹ️ Info',
        'victoire': '🏆 Victoire'
    };
    return types[type] || '📢 Annonce';
}

