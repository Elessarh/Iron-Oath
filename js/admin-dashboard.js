/* admin-dashboard.js - Gestion du dashboard administrateur */

let currentUser = null;
let currentUserProfile = null;
let allUsers = [];
let filteredUsers = [];
let editingUserId = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Initialisation du dashboard admin...');
    
    // Attendre que auth-supabase.js soit chargé
    await waitForAuth();
    
    // Vérifier les droits admin
    await checkAdminAccess();
});

// Attendre que l'authentification soit prête
function waitForAuth() {
    return new Promise((resolve) => {
        const checkAuth = setInterval(() => {
            if (typeof supabase !== 'undefined' && supabase !== null) {
                clearInterval(checkAuth);
                resolve();
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkAuth);
            resolve();
        }, 10000);
    });
}

// Vérifier que l'utilisateur est admin
async function checkAdminAccess() {
    try {
        // Vérifier la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error('❌ Pas de session active');
            showError('Vous devez être connecté pour accéder au dashboard.');
            setTimeout(() => {
                window.location.href = 'connexion.html';
            }, 2000);
            return;
        }
        
        currentUser = session.user;
        console.log('✅ Utilisateur connecté:', currentUser.email);
        
        // Récupérer le profil et vérifier le rôle
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error || !profile) {
            console.error('❌ Erreur chargement profil:', error);
            showError('Impossible de vérifier vos droits d\'accès.');
            return;
        }
        
        currentUserProfile = profile;
        
        // Vérifier si l'utilisateur est admin
        if (profile.role !== 'admin') {
            console.error('❌ Accès refusé: utilisateur non admin');
            showError('Vous devez être administrateur pour accéder à cette page.');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
            return;
        }
        
        console.log('✅ Accès admin confirmé');
        
        // Charger les utilisateurs
        await loadUsers();
        
        // Afficher le dashboard
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
        // Initialiser les event listeners
        initializeEventListeners();
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification admin:', error);
        showError('Une erreur technique est survenue.');
    }
}

// Charger tous les utilisateurs
async function loadUsers() {
    try {
        const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
            showError('Impossible de charger les utilisateurs.');
            return;
        }
        
        allUsers = users || [];
        filteredUsers = allUsers;
        
        console.log(`✅ ${allUsers.length} utilisateurs chargés`);
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Afficher les utilisateurs
        displayUsers();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const totalUsers = allUsers.length;
    const admins = allUsers.filter(u => u.role === 'admin').length;
    const membres = allUsers.filter(u => u.role === 'membre').length;
    const utilisateurs = allUsers.filter(u => u.role === 'utilisateur' || !u.role).length;
    
    document.getElementById('stat-total-users').textContent = totalUsers;
    document.getElementById('stat-admins').textContent = admins;
    document.getElementById('stat-membres').textContent = membres;
    document.getElementById('stat-utilisateurs').textContent = utilisateurs;
}

// Afficher les utilisateurs dans le tableau
function displayUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888; padding: 30px;">Aucun utilisateur trouvé</td></tr>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const tr = document.createElement('tr');
        
        // Pseudo
        const tdUsername = document.createElement('td');
        tdUsername.textContent = user.username || 'Inconnu';
        tr.appendChild(tdUsername);
        
        // Email
        const tdEmail = document.createElement('td');
        tdEmail.textContent = user.email || '-';
        tr.appendChild(tdEmail);
        
        // Rôle
        const tdRole = document.createElement('td');
        const roleBadge = document.createElement('span');
        roleBadge.className = `role-badge role-${user.role || 'utilisateur'}`;
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
        if (user.id !== currentUser.id) {
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
        'utilisateur': 'Utilisateur',
        'membre': 'Membre',
        'admin': 'Administrateur'
    };
    return labels[role] || 'Utilisateur';
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
        filterUsers();
    });
    
    // Filtre par rôle
    const roleFilter = document.getElementById('role-filter');
    roleFilter.addEventListener('change', (e) => {
        filterUsers();
    });
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    
    filteredUsers = allUsers.filter(user => {
        // Filtre de recherche
        const matchesSearch = 
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));
        
        // Filtre de rôle
        const matchesRole = roleFilter === 'all' || user.role === roleFilter || (!user.role && roleFilter === 'utilisateur');
        
        return matchesSearch && matchesRole;
    });
    
    displayUsers();
}

// Ouvrir le modal de modification de rôle
function openRoleModal(user) {
    editingUserId = user.id;
    document.getElementById('modal-username').textContent = user.username || user.email;
    document.getElementById('modal-role-select').value = user.role || 'utilisateur';
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
            console.error('❌ Erreur modification rôle:', error);
            alert('Erreur lors de la modification du rôle.');
            return;
        }
        
        console.log('✅ Rôle modifié avec succès');
        alert('Rôle modifié avec succès !');
        
        // Recharger les utilisateurs
        await loadUsers();
        
        // Fermer le modal
        closeRoleModal();
        
    } catch (error) {
        console.error('❌ Erreur lors de la modification du rôle:', error);
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
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', userId);
            
        if (error) {
            console.error('❌ Erreur suppression utilisateur:', error);
            alert('Erreur lors de la suppression de l\'utilisateur.');
            return;
        }
        
        console.log('✅ Utilisateur supprimé avec succès');
        alert('Utilisateur supprimé avec succès !');
        
        // Recharger les utilisateurs
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Une erreur technique est survenue.');
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

console.log('✅ Module admin-dashboard.js chargé');
