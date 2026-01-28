/* admin-dashboard.js - Gestion du dashboard administrateur */

// Variables locales (currentUser est global depuis auth-supabase.js)
let localCurrentUser = null;
let currentUserProfile = null;
let allUsers = [];
let filteredUsers = [];
let editingUserId = null;

// Variables de pagination et tri
let currentPage = 1;
let usersPerPage = 15;
let currentSortField = 'created_at';
let currentSortDirection = 'desc'; // 'asc' ou 'desc'

// Fonction de gestion des onglets du dashboard
function switchDashboardTab(tabName) {
    
    // Retirer la classe active de tous les boutons et contenus
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Ajouter la classe active au bouton et contenu correspondants
    const activeButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.querySelector(`.tab-content[data-tab-content="${tabName}"]`);
    
    if (activeButton) activeButton.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // Charger les données spécifiques à l'onglet
    if (tabName === 'activity') {
        loadAdminActivities();
    }
    
    // Sauvegarder l'onglet actif dans localStorage
    localStorage.setItem('dashboardActiveTab', tabName);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    
    // Attendre que auth-supabase.js soit chargé ET que l'utilisateur soit connecté
    await waitForAuthAndUser();
    
    // Vérifier les droits admin
    await checkAdminAccess();
});

// Attendre que l'authentification soit prête ET que l'utilisateur soit connecté
function waitForAuthAndUser() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 secondes max
        
        const checkAuth = setInterval(() => {
            attempts++;
            
            // Vérifier que Supabase ET window.currentUser sont prêts
            if (typeof supabase !== 'undefined' && supabase !== null && window.currentUser !== null && window.currentUser !== undefined) {
                clearInterval(checkAuth);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAuth);
                showError('Vous devez être connecté pour accéder au dashboard.');
                setTimeout(() => {
                    window.location.href = 'connexion.html';
                }, 2000);
                resolve();
            }
        }, 100);
    });
}

// Vérifier que l'utilisateur est admin
async function checkAdminAccess() {
    try {
        // Utiliser la session globale depuis auth-supabase.js
        if (!window.currentUser) {
            showError('Vous devez être connecté pour accéder au dashboard.');
            setTimeout(() => {
                window.location.href = 'connexion.html';
            }, 2000);
            return;
        }        localCurrentUser = window.currentUser;
        
        // Récupérer le profil et vérifier le rôle
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', localCurrentUser.id)
            .single();
            
        if (error || !profile) {
            showError('Impossible de vérifier vos droits d\'accès.');
            return;
        }
        
        currentUserProfile = profile;
        
        // Vérifier si l'utilisateur est admin
        if (profile.role !== 'admin') {
            showError('Vous devez être administrateur pour accéder à cette page.');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
            return;
        }
        
        
        // Charger les utilisateurs
        await loadUsers();
        
        // Afficher le dashboard
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
        // Charger les données
        await loadUsers();
        await loadPresences();
        await loadMembersForPresence(); // Charger la liste des membres pour le formulaire de présence
        
        // Initialiser les event listeners
        initializeEventListeners();
        
        // Charger les activités si l'onglet est actif ou pré-charger
        const savedTab = localStorage.getItem('dashboardActiveTab');
        if (savedTab === 'activity') {
            await loadAdminActivities();
        }
        
        // Restaurer l'onglet actif depuis localStorage
        if (savedTab) {
            switchDashboardTab(savedTab);
        }
        
    } catch (error) {
        showError('Une erreur technique est survenue.');
    }
}

// Charger tous les utilisateurs
async function loadUsers() {
    try {
        // Utiliser le cache pour éviter les requêtes multiples
        const cachedUsers = window.cacheManager?.get('all_users');
        if (cachedUsers) {
            allUsers = cachedUsers;
            filteredUsers = allUsers;
            updateStats();
            displayUsers();
            return;
        }

        const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            showError('Impossible de charger les utilisateurs.');
            return;
        }
        
        allUsers = users || [];
        filteredUsers = allUsers;
        
        // Mettre en cache pour 3 minutes
        if (window.cacheManager) {
            window.cacheManager.set('all_users', allUsers);
        }
        
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Afficher les utilisateurs
        displayUsers();
        
    } catch (error) {
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const totalUsers = allUsers.length;
    const admins = allUsers.filter(u => u.role === 'admin').length;
    const membres = allUsers.filter(u => u.role === 'membre').length;
    const joueurs = allUsers.filter(u => u.role === 'joueur' || !u.role).length;
    
    document.getElementById('stat-total-users').textContent = totalUsers;
    document.getElementById('stat-admins').textContent = admins;
    document.getElementById('stat-membres').textContent = membres;
    document.getElementById('stat-utilisateurs').textContent = joueurs;
}

// Afficher les utilisateurs dans le tableau (avec pagination)
function displayUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888; padding: 30px;">Aucun utilisateur trouvé</td></tr>';
        updatePagination();
        return;
    }
    
    // Calculer les indices pour la pagination
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
    
    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');
        
        // Pseudo
        const tdUsername = document.createElement('td');
        tdUsername.textContent = user.username || 'Inconnu';
        tr.appendChild(tdUsername);
        
        // Classe
        const tdClasse = document.createElement('td');
        tdClasse.textContent = user.classe || 'Guerrier';
        tdClasse.style.fontWeight = '600';
        tdClasse.style.color = getClasseColor(user.classe);
        tr.appendChild(tdClasse);
        
        // Niveau
        const tdNiveau = document.createElement('td');
        tdNiveau.textContent = user.niveau || '1';
        tdNiveau.style.fontWeight = '700';
        tdNiveau.style.textAlign = 'center';
        tr.appendChild(tdNiveau);
        
        // Rôle
        const tdRole = document.createElement('td');
        const roleBadge = document.createElement('span');
        roleBadge.className = `role-badge role-${user.role || 'joueur'}`;
        roleBadge.textContent = getRoleLabel(user.role);
        tdRole.appendChild(roleBadge);
        tr.appendChild(tdRole);
        
        // Date de création
        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(user.created_at);
        tr.appendChild(tdDate);
        
        // Actions
        const tdActions = document.createElement('td');
        
        // Bouton Modifier
        const btnEdit = document.createElement('button');
        btnEdit.className = 'action-btn btn-edit';
        btnEdit.textContent = 'Modifier rôle';
        btnEdit.onclick = () => openRoleModal(user);
        tdActions.appendChild(btnEdit);
        
        // Bouton Supprimer (désactivé pour le compte actuel)
        if (user.id !== localCurrentUser.id) {
            const btnDelete = document.createElement('button');
            btnDelete.className = 'action-btn btn-delete';
            btnDelete.textContent = 'Supprimer';
            btnDelete.onclick = () => confirmDeleteUser(user);
            tdActions.appendChild(btnDelete);
        }
        
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

// Obtenir le label du rôle
function getRoleLabel(role) {
    const labels = {
        'joueur': 'Joueur',
        'membre': 'Membre',
        'admin': 'Administrateur'
    };
    return labels[role] || 'Joueur';
}

// Obtenir la couleur de la classe
function getClasseColor(classe) {
    const colors = {
        'Shaman': '#4ecdc4',
        'Mage': '#667eea',
        'Assassin': '#f5576c',
        'Guerrier': '#ff6b35',
        'Archer': '#45b7aa'
    };
    return colors[classe] || '#4ecdc4';
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    // Afficher les informations de page
    pageInfo.textContent = `Page ${currentPage} / ${totalPages || 1} (${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''})`;
    
    // Activer/désactiver les boutons
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
}

// Trier les utilisateurs
function sortUsers() {
    filteredUsers.sort((a, b) => {
        let aValue = a[currentSortField];
        let bValue = b[currentSortField];
        
        // Gestion des valeurs null/undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Conversion en minuscules pour les strings
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Tri numérique pour le niveau
        if (currentSortField === 'niveau') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        }
        
        // Tri pour les dates
        if (currentSortField === 'created_at') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }
        
        // Comparaison
        if (aValue < bValue) {
            return currentSortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return 'Inconnue';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Initialiser les event listeners
function initializeEventListeners() {
    // Recherche
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        currentPage = 1; // Reset à la page 1 lors d'une recherche
        filterUsers();
    });
    
    // Filtre par rôle
    const roleFilter = document.getElementById('role-filter');
    roleFilter.addEventListener('change', (e) => {
        currentPage = 1;
        filterUsers();
    });
    
    // Filtre par classe
    const classeFilter = document.getElementById('classe-filter');
    classeFilter.addEventListener('change', (e) => {
        currentPage = 1;
        filterUsers();
    });
    
    // Filtre par niveau
    const niveauFilter = document.getElementById('niveau-filter');
    niveauFilter.addEventListener('change', (e) => {
        currentPage = 1;
        filterUsers();
    });
    
    // Items per page
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            usersPerPage = parseInt(e.target.value);
            currentPage = 1;
            displayUsers();
            updatePagination();
        });
    }
    
    // Event listeners pour les onglets du dashboard
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchDashboardTab(tabName);
        });
    });
    
    // Tri par colonnes
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortField = header.getAttribute('data-sort');
            
            // Si on clique sur la même colonne, inverser la direction
            if (currentSortField === sortField) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = sortField;
                currentSortDirection = 'asc';
            }
            
            // Mettre à jour les classes CSS
            sortableHeaders.forEach(h => {
                h.classList.remove('sorted-asc', 'sorted-desc');
            });
            header.classList.add(currentSortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            
            // Trier et afficher
            sortUsers();
            displayUsers();
        });
    });
    
    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
            updatePagination();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
            updatePagination();
        }
    });
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const classeFilter = document.getElementById('classe-filter').value;
    const niveauFilter = document.getElementById('niveau-filter').value;
    
    filteredUsers = allUsers.filter(user => {
        // Filtre de recherche
        const matchesSearch = 
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));
        
        // Filtre de rôle
        const matchesRole = roleFilter === 'all' || user.role === roleFilter || (!user.role && roleFilter === 'joueur');
        
        // Filtre de classe
        const matchesClasse = classeFilter === 'all' || user.classe === classeFilter;
        
        // Filtre de niveau
        let matchesNiveau = true;
        if (niveauFilter !== 'all') {
            const niveau = user.niveau || 1;
            const [min, max] = niveauFilter.split('-').map(Number);
            matchesNiveau = niveau >= min && niveau <= max;
        }
        
        return matchesSearch && matchesRole && matchesClasse && matchesNiveau;
    });
    
    // Trier les utilisateurs après filtrage
    sortUsers();
    
    currentPage = 1; // Reset à la page 1
    displayUsers();
    updatePagination();
}

// Ouvrir le modal de modification de rôle
function openRoleModal(user) {
    editingUserId = user.id;
    document.getElementById('modal-username').textContent = user.username || user.email;
    document.getElementById('modal-role-select').value = user.role || 'joueur';
    document.getElementById('role-modal').classList.add('active');
}

// Fermer le modal de modification de rôle
function closeRoleModal() {
    editingUserId = null;
    document.getElementById('role-modal').classList.remove('active');
}

// Confirmer le changement de rôle
async function confirmRoleChange() {
    if (!editingUserId) return;
    
    const newRole = document.getElementById('modal-role-select').value;
    
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', editingUserId);
            
        if (error) {
            alert('Erreur lors de la modification du rôle.');
            return;
        }
        
        alert('Rôle modifié avec succès !');
        
        // Invalider le cache des utilisateurs
        if (window.cacheManager) {
            window.cacheManager.invalidate('all_users');
        }
        
        // Recharger les utilisateurs
        await loadUsers();
        
        // Fermer le modal
        closeRoleModal();
        
    } catch (error) {
        alert('Une erreur technique est survenue.');
    }
}

// Confirmer la suppression d'un utilisateur
function confirmDeleteUser(user) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username || user.email}" ?\n\nCette action est irréversible.`)) {
        deleteUser(user.id);
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    try {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ? Cette action est irréversible.')) {
            return;
        }
        
        // Utiliser la fonction PostgreSQL pour suppression complète
        const { data, error } = await supabase.rpc('delete_user_completely', {
            user_id: userId
        });
            
        if (error) {
            alert('Erreur lors de la suppression de l\'utilisateur : ' + error.message);
            return;
        }
        
        alert('Utilisateur supprimé avec succès !');
        
        // Recharger les utilisateurs
        await loadUsers();
        
    } catch (error) {
        alert('Une erreur technique est survenue : ' + error.message);
    }
}

// Afficher un message d'erreur
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'none';
    
    const errorDiv = document.getElementById('error-content');
    errorDiv.style.display = 'block';
    document.getElementById('error-text').textContent = message;
}

// ========== GESTION DE LA GUILDE ==========

// Basculer entre les onglets de gestion de guilde
function switchGuildTab(tabName) {
    // Masquer tous les contenus
    document.querySelectorAll('.guild-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Retirer la classe active de tous les onglets
    document.querySelectorAll('.guild-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher le contenu sélectionné
    document.getElementById(`guild-${tabName}-tab`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Charger les données de l'onglet
    if (tabName === 'planning') {
        loadAdminPlanning();
    } else if (tabName === 'objectives') {
        loadAdminObjectives();
    } else if (tabName === 'presence') {
        loadAdminPresence();
        loadMembersForPresence();
    }
}

// Charger les événements du planning (admin)
async function loadAdminPlanning() {
    try {
        const { data, error } = await supabase
            .from('guild_planning')
            .select('*')
            .order('date_event', { ascending: true });
        
        if (error) throw error;
        
        const container = document.getElementById('admin-planning-list');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Aucun événement planifié</p>';
            return;
        }
        
        container.innerHTML = data.map(event => `
            <div class="guild-item">
                <div class="guild-item-header">
                    <div class="guild-item-title">${escapeHtml(event.titre)}</div>
                    <div class="guild-item-actions">
                        <button class="btn-delete" onclick="deleteGuildItem('guild_planning', '${event.id}', 'planning')">🗑️ Supprimer</button>
                    </div>
                </div>
                <div style="color: #ff6b35; margin: 5px 0;">📅 ${formatDate(event.date_event)} | ${formatEventType(event.type_event)}</div>
                ${event.description ? `<div style="color: #ccc;">${escapeHtml(event.description)}</div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
    }
}

// Charger les objectifs (admin)
async function loadAdminObjectives() {
    try {
        const { data, error } = await supabase
            .from('guild_objectives')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('admin-objectives-list');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Aucun objectif défini</p>';
            return;
        }
        
        container.innerHTML = data.map(obj => `
            <div class="guild-item">
                <div class="guild-item-header">
                    <div class="guild-item-title">${escapeHtml(obj.titre)}</div>
                    <div class="guild-item-actions">
                        <button class="btn-delete" onclick="deleteGuildItem('guild_objectives', '${obj.id}', 'objectives')">🗑️ Supprimer</button>
                    </div>
                </div>
                <div style="color: #ccc; margin: 10px 0;">${escapeHtml(obj.description || '')}</div>
                <div style="color: #888; font-size: 0.9rem;">Semaine ${obj.semaine_numero}/${obj.annee} | Statut: ${formatStatus(obj.statut)}</div>
                <div style="margin-top: 10px;">
                    <div style="background: rgba(0,0,0,0.3); border-radius: 10px; height: 20px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #ff6b35, #f7931e); height: 100%; width: ${obj.progression}%; text-align: center; color: white; font-size: 0.8rem; line-height: 20px;">
                            ${obj.progression}%
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
    }
}

// Charger les présences (admin)
async function loadAdminPresence() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('guild_presence')
            .select(`
                *,
                user_profiles!inner(username)
            `)
            .eq('date_presence', today)
            .order('statut', { ascending: true });
        
        if (error) throw error;
        
        const container = document.getElementById('admin-presence-list');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Aucune présence enregistrée aujourd\'hui</p>';
            return;
        }
        
        container.innerHTML = data.map(presence => `
            <div class="guild-item">
                <div class="guild-item-header">
                    <div class="guild-item-title">${escapeHtml(presence.user_profiles.username)}</div>
                    <div class="guild-item-actions">
                        <button class="btn-delete" onclick="deleteGuildItem('guild_presence', '${presence.id}', 'presence')">🗑️ Supprimer</button>
                    </div>
                </div>
                <div style="color: ${getStatusColor(presence.statut)}; font-weight: bold;">
                    ${formatPresenceStatus(presence.statut)}
                </div>
                ${presence.commentaire ? `<div style="color: #ccc; margin-top: 5px;">${escapeHtml(presence.commentaire)}</div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
    }
}

// Charger la liste des membres pour le formulaire de présence
async function loadMembersForPresence() {
    try {
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id, username')
            .in('role', ['membre', 'admin'])
            .order('username', { ascending: true });
        
        if (error) throw error;
        
        
        const select = document.getElementById('presence-user');
        if (!select) {
            return;
        }
        
        select.innerHTML = '<option value="">Sélectionner un membre</option>' +
            data.map(user => `<option value="${user.id}">${escapeHtml(user.username)}</option>`).join('');
        
        
    } catch (error) {
    }
}

// Supprimer un élément de guilde
async function deleteGuildItem(table, id, type) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert('✅ Élément supprimé avec succès !');
        
        // Recharger la liste appropriée
        if (type === 'planning') loadAdminPlanning();
        else if (type === 'objectives') loadAdminObjectives();
        else if (type === 'presence') loadAdminPresence();
        
    } catch (error) {
        alert('❌ Erreur lors de la suppression');
    }
}

// Event listeners pour les formulaires de guilde
document.addEventListener('DOMContentLoaded', function() {
    // Formulaire planning
    const planningForm = document.getElementById('add-planning-form');
    if (planningForm) {
        planningForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const { error } = await supabase
                    .from('guild_planning')
                    .insert({
                        titre: document.getElementById('planning-titre').value,
                        description: document.getElementById('planning-description').value || null,
                        date_event: document.getElementById('planning-date').value,
                        type_event: document.getElementById('planning-type').value,
                        created_by: window.currentUser.id
                    });
                
                if (error) throw error;
                
                alert('✅ Événement ajouté au planning !');
                planningForm.reset();
                loadAdminPlanning();
                
            } catch (error) {
                alert('❌ Erreur lors de l\'ajout');
            }
        });
    }
    
    // Formulaire objectifs
    const objectiveForm = document.getElementById('add-objective-form');
    if (objectiveForm) {
        objectiveForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const { error } = await supabase
                    .from('guild_objectives')
                    .insert({
                        titre: document.getElementById('objective-titre').value,
                        description: document.getElementById('objective-description').value,
                        semaine_numero: parseInt(document.getElementById('objective-semaine').value),
                        annee: parseInt(document.getElementById('objective-annee').value),
                        statut: document.getElementById('objective-statut').value,
                        progression: parseInt(document.getElementById('objective-progression').value),
                        created_by: window.currentUser.id
                    });
                
                if (error) throw error;
                
                alert('✅ Objectif créé !');
                objectiveForm.reset();
                loadAdminObjectives();
                
            } catch (error) {
                alert('❌ Erreur lors de la création');
            }
        });
    }
    
    // Formulaire présence
    const presenceForm = document.getElementById('add-presence-form');
    if (presenceForm) {
        presenceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const userId = document.getElementById('presence-user').value;
                const datePresence = document.getElementById('presence-date').value;
                
                // Vérifier si déjà existant
                const { data: existing } = await supabase
                    .from('guild_presence')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('date_presence', datePresence)
                    .single();
                
                if (existing) {
                    // Update
                    const { error } = await supabase
                        .from('guild_presence')
                        .update({
                            statut: document.getElementById('presence-statut').value,
                            commentaire: document.getElementById('presence-commentaire').value || null
                        })
                        .eq('id', existing.id);
                    
                    if (error) throw error;
                    alert('✅ Présence mise à jour !');
                } else {
                    // Insert
                    const { error } = await supabase
                        .from('guild_presence')
                        .insert({
                            user_id: userId,
                            date_presence: datePresence,
                            statut: document.getElementById('presence-statut').value,
                            commentaire: document.getElementById('presence-commentaire').value || null
                        });
                    
                    if (error) throw error;
                    alert('✅ Présence enregistrée !');
                }
                
                presenceForm.reset();
                loadAdminPresence();
                
            } catch (error) {
                alert('❌ Erreur lors de l\'enregistrement');
            }
        });
    }
});

// Fonctions utilitaires pour la guilde
function formatEventType(type) {
    const types = {
        'reunion': '🗣️ Réunion',
        'raid': '⚔️ Raid',
        'event': '🎉 Événement',
        'pvp': '🗡️ PvP',
        'construction': '🏗️ Construction',
        'autre': '📌 Autre'
    };
    return types[type] || type;
}

function formatStatus(status) {
    const statuses = {
        'en_cours': '⏳ En cours',
        'termine': '✅ Terminé',
        'abandonne': '❌ Abandonné'
    };
    return statuses[status] || status;
}

function formatPresenceStatus(status) {
    const statuses = {
        'present': '✅ Présent',
        'absent': '❌ Absent',
        'en_mission': '🎯 En mission'
    };
    return statuses[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'present': '#4caf50',
        'absent': '#f44336',
        'en_mission': '#ff9800'
    };
    return colors[status] || '#888';
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== GESTION DES PRÉSENCES ==========

async function loadPresences() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Récupérer tous les membres et admins
        const { data: members, error: membersError } = await supabase
            .from('user_profiles')
            .select('*')
            .in('role', ['membre', 'admin']);
        
        if (membersError) {
            return;
        }
        
        // Récupérer les présences du jour
        const { data: presences, error: presencesError } = await supabase
            .from('guild_presence')
            .select('*')
            .eq('date_presence', today);
        
        if (presencesError) {
            return;
        }
        
        // Créer un map des présences par user_id
        const presenceMap = {};
        (presences || []).forEach(p => {
            presenceMap[p.user_id] = p;
        });
        
        // Compter les statistiques
        let presents = 0;
        let absents = 0;
        let enMission = 0;
        
        // Créer le HTML du tableau
        const tbody = document.getElementById('presence-tbody');
        if (!tbody) return;
        
        if (!members || members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">Aucun membre dans la guilde</td></tr>';
            return;
        }
        
        tbody.innerHTML = members.map(member => {
            const presence = presenceMap[member.id];
            const statut = presence ? presence.statut : 'non-marque';
            const heure = presence ? new Date(presence.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
            
            // Compter les stats
            if (statut === 'present') presents++;
            else if (statut === 'absent') absents++;
            else if (statut === 'en_mission') enMission++;
            
            return `
                <tr>
                    <td><strong>${escapeHtml(member.username || 'Inconnu')}</strong></td>
                    <td>${escapeHtml(member.classe || '-')}</td>
                    <td>Niv. ${member.niveau || 1}</td>
                    <td>
                        <span class="presence-badge ${statut}">
                            ${getPresenceLabel(statut)}
                        </span>
                    </td>
                    <td>${heure}</td>
                </tr>
            `;
        }).join('');
        
        // Mettre à jour les statistiques
        document.getElementById('stat-presents').textContent = presents;
        document.getElementById('stat-absents').textContent = absents;
        document.getElementById('stat-missions').textContent = enMission;
        
        
    } catch (error) {
    }
}

function getPresenceLabel(statut) {
    const labels = {
        'present': 'Present',
        'absent': 'Absent',
        'en_mission': 'En mission',
        'non-marque': 'Non marque'
    };
    return labels[statut] || statut;
}

// ========== GESTION DU MUR D'ACTIVITÉ ==========

let editingActivityId = null;

// Charger les activités dans l'admin
async function loadAdminActivities() {
    try {
        
        const { data, error } = await supabase
            .from('guild_activity_wall')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            document.getElementById('admin-activities-list').innerHTML = 
                '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erreur de chargement</div>';
            return;
        }
        
        displayAdminActivities(data || []);
        
    } catch (error) {
    }
}

function displayAdminActivities(activities) {
    const container = document.getElementById('admin-activities-list');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #888;">
                Aucune publication. Créez votre première publication ci-dessus !
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="admin-activity-item" data-id="${activity.id}">
            <div class="admin-activity-header">
                <h4 class="admin-activity-title">${escapeHtml(activity.titre)}</h4>
                <div class="admin-activity-actions">
                    <button class="btn-edit-activity" onclick="editActivity('${activity.id}')">
                        ✏️ Modifier
                    </button>
                    <button class="btn-delete-activity" onclick="deleteActivity('${activity.id}')">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
            <p class="admin-activity-content">${escapeHtml(activity.contenu)}</p>
            ${activity.image_url ? `<img src="${activity.image_url}" alt="Image" class="admin-activity-image">` : ''}
            <div class="admin-activity-meta">
                <span>📌 Type: ${formatActivityTypeAdmin(activity.type)}</span>
                <span>👤 Par: ${escapeHtml(activity.author_name || 'Admin')}</span>
                <span>📅 ${formatDateAdmin(activity.created_at)}</span>
            </div>
        </div>
    `).join('');
}

function formatActivityTypeAdmin(type) {
    const types = {
        'annonce': 'Annonce',
        'evenement': 'Événement',
        'info': 'Information',
        'victoire': 'Victoire'
    };
    return types[type] || 'Annonce';
}

function formatDateAdmin(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
}

// Prévisualiser l'image
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('activity-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('image-preview');
                    const container = document.getElementById('image-preview-container');
                    preview.src = e.target.result;
                    container.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Attacher les event listeners aux boutons
    const submitBtn = document.getElementById('submit-activity-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.submitActivity();
        });
    }
    
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
});

// Soumettre une activité (créer ou modifier)
window.submitActivity = async function() {
    try {
        const title = document.getElementById('activity-title').value.trim();
        const type = document.getElementById('activity-type').value;
        const content = document.getElementById('activity-content').value.trim();
        const imageInput = document.getElementById('activity-image');
        
        if (!title || !content) {
            alert('Veuillez remplir le titre et le contenu.');
            return;
        }
        
        const submitBtn = document.getElementById('submit-activity-btn');
        submitBtn.disabled = true;
        submitBtn.querySelector('#submit-btn-text').textContent = 'Publication en cours...';
        
        let imageUrl = null;
        
        // Upload de l'image si présente
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `guild-activities/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('iron-oath-storage')
                .upload(filePath, file);
            
            if (uploadError) {
                alert('Erreur lors de l\'upload de l\'image. La publication sera créée sans image.');
            } else {
                const { data: urlData } = supabase.storage
                    .from('iron-oath-storage')
                    .getPublicUrl(filePath);
                imageUrl = urlData.publicUrl;
            }
        }
        
        const activityData = {
            titre: title,
            type: type,
            contenu: content,
            image_url: imageUrl,
            author_name: currentUserProfile?.username || localCurrentUser?.email || 'Admin'
        };
        
        
        if (editingActivityId) {
            // Mode édition
            const { data, error } = await supabase
                .from('guild_activity_wall')
                .update(activityData)
                .eq('id', editingActivityId)
                .select();
            
            if (error) {
                alert(`Erreur lors de la modification: ${error.message}`);
                submitBtn.disabled = false;
                submitBtn.querySelector('#submit-btn-text').textContent = 'Modifier';
                return;
            }
            
            alert('Publication modifiée avec succès !');
        } else {
            // Mode création
            const { data, error } = await supabase
                .from('guild_activity_wall')
                .insert([activityData])
                .select();
            
            if (error) {
                alert(`Erreur lors de la création: ${error.message}`);
                submitBtn.disabled = false;
                submitBtn.querySelector('#submit-btn-text').textContent = 'Publier';
                return;
            }
            
            
            alert('Publication créée avec succès !');
        }
        
        // Réinitialiser le formulaire
        resetActivityForm();
        
        // Recharger la liste
        await loadAdminActivities();
        
    } catch (error) {
        alert('Une erreur est survenue.');
        const submitBtn = document.getElementById('submit-activity-btn');
        submitBtn.disabled = false;
    }
}

// Éditer une activité
async function editActivity(activityId) {
    try {
        const { data, error } = await supabase
            .from('guild_activity_wall')
            .select('*')
            .eq('id', activityId)
            .single();
        
        if (error || !data) {
            alert('Impossible de charger l\'activité.');
            return;
        }
        
        // Remplir le formulaire
        document.getElementById('activity-title').value = data.titre;
        document.getElementById('activity-type').value = data.type;
        document.getElementById('activity-content').value = data.contenu;
        
        // Afficher l'aperçu de l'image si elle existe
        if (data.image_url) {
            const preview = document.getElementById('image-preview');
            const container = document.getElementById('image-preview-container');
            preview.src = data.image_url;
            container.style.display = 'block';
        }
        
        // Passer en mode édition
        editingActivityId = activityId;
        document.getElementById('form-mode-title').textContent = 'Modifier la Publication';
        document.getElementById('submit-btn-text').textContent = 'Modifier';
        document.getElementById('cancel-edit-btn').style.display = 'block';
        
        // Scroller vers le formulaire
        document.querySelector('.activity-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Une erreur est survenue.');
    }
}

// Annuler l'édition
function cancelEdit() {
    resetActivityForm();
}

// Réinitialiser le formulaire
function resetActivityForm() {
    document.getElementById('activity-title').value = '';
    document.getElementById('activity-type').value = 'annonce';
    document.getElementById('activity-content').value = '';
    document.getElementById('activity-image').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
    
    editingActivityId = null;
    document.getElementById('form-mode-title').textContent = 'Nouvelle Publication';
    document.getElementById('submit-btn-text').textContent = 'Publier';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    
    const submitBtn = document.getElementById('submit-activity-btn');
    submitBtn.disabled = false;
}

// Supprimer une activité
async function deleteActivity(activityId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
        return;
    }
    
    try {
        // Récupérer l'activité pour supprimer l'image si elle existe
        const { data: activity } = await supabase
            .from('guild_activity_wall')
            .select('image_url')
            .eq('id', activityId)
            .single();
        
        // Supprimer l'image du storage si elle existe
        if (activity?.image_url) {
            const imagePath = activity.image_url.split('/').pop();
            await supabase.storage
                .from('iron-oath-storage')
                .remove([`guild-activities/${imagePath}`]);
        }
        
        // Supprimer l'activité
        const { error } = await supabase
            .from('guild_activity_wall')
            .delete()
            .eq('id', activityId);
        
        if (error) {
            alert('Erreur lors de la suppression.');
            return;
        }
        
        alert('Publication supprimée avec succès !');
        await loadAdminActivities();
        
    } catch (error) {
        alert('Une erreur est survenue.');
    }
}

// Rendre les fonctions accessibles globalement pour les appels dynamiques depuis le HTML généré
window.editActivity = editActivity;
window.deleteActivity = deleteActivity;



