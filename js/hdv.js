// HDV.js - Système complet de marketplace pour Iron Oath
class HDVSystem {
    constructor() {
        // Attendre un peu que le système d'auth soit chargé
        setTimeout(async () => {
            // Vérification de l'authentification
            const userInfo = this.getCurrentUserInfo();
            if (!userInfo) {
                console.log('❌ Utilisateur non connecté, redirection...');
                this.redirectToLogin();
                return;
            }
            
            console.log('✅ Utilisateur connecté:', userInfo.username);
            await this.initializeHDV();
        }, 500);
    }

    // Initialiser le système HDV
    async initializeHDV() {
        this.currentTab = 'marketplace';
        this.selectedItem = null;
        this.orderType = null;
        this.filters = {
            category: 'all',
            type: 'all'
        };
        this.orders = [];
        this.myOrders = [];
        
        // Charger les données sauvegardées (asynchrone)
        await this.loadOrdersFromStorage();
        
        this.initializeEventListeners();
        await this.loadMarketplace();
        
        // Démarrer l'auto-actualisation
        this.startAutoRefresh();
    }

    // Système d'auto-actualisation
    startAutoRefresh() {
        console.log('🔄 Démarrage auto-actualisation HDV (30s)');
        
        // Actualiser toutes les 30 secondes
        this.refreshInterval = setInterval(async () => {
            console.log('🔄 Auto-actualisation HDV...');
            await this.loadOrdersFromStorage();
            await this.displayOrders(this.orders);
        }, 30000);
        
        // Nettoyer l'intervalle si on quitte la page
        window.addEventListener('beforeunload', () => {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        });
    }

    // Rediriger vers la page de connexion si non connecté
    redirectToLogin() {
        const loginUrl = '../pages/connexion.html';
        const currentUrl = window.location.href;
        
        // Éviter la boucle de redirection si on est déjà sur la page de connexion
        if (!currentUrl.includes('connexion.html')) {
            this.showAuthError();
            setTimeout(() => {
                window.location.href = loginUrl;
            }, 3000);
        }
    }

    // DEBUG: Méthode pour forcer l'accès (temporaire)
    forceAccess(username = 'TestUser') {
        console.log('🔧 Force access pour:', username);
        const fakeUser = {
            id: 'force_' + Date.now(),
            username: username,
            email: username + '@test.com'
        };
        localStorage.setItem('currentUser', JSON.stringify(fakeUser));
        location.reload();
    }

    // DEBUG: Méthode pour vérifier l'état d'authentification
    checkAuthStatus() {
        console.log('=== ÉTAT AUTHENTIFICATION ===');
        console.log('window.getCurrentUser:', typeof window.getCurrentUser);
        console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
        console.log('window.currentUser:', window.currentUser);
        console.log('Tokens:', {
            supabase: localStorage.getItem('supabase.auth.token'),
            authToken: localStorage.getItem('authToken'),
            token: localStorage.getItem('token')
        });
        console.log('getCurrentUserInfo():', this.getCurrentUserInfo());
    }

    // Afficher un message d'erreur d'authentification
    showAuthError() {
        const authError = document.createElement('div');
        authError.className = 'auth-error-overlay';
        authError.innerHTML = `
            <div class="auth-error-content">
                <h2>🔒 Accès Restreint</h2>
                <p>Vous devez être connecté pour accéder à l'Hôtel des Ventes.</p>
                <p>Redirection vers la page de connexion...</p>
                <div class="auth-error-loader"></div>
            </div>
        `;
        
        // Styles inline pour l'erreur d'authentification
        authError.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Exo 2', sans-serif;
        `;
        
        document.body.appendChild(authError);
    }

    // Méthode helper pour récupérer l'utilisateur connecté
    getCurrentUserInfo() {
        try {
            // DEBUG temporaire - à supprimer après correction
            console.log('🔍 HDV - Vérification utilisateur...');
            
            // Essayer d'abord avec le profil Supabase (contient le username)
            if (window.getUserProfile) {
                const profile = window.getUserProfile();
                console.log('🟣 Supabase profile:', profile);
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
                console.log('🔵 Supabase user:', user);
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
                console.log('🟣 CurrentUserProfile trouvé:', window.currentUserProfile.username);
                return {
                    id: window.currentUserProfile.id || 'profile_' + Date.now(),
                    username: window.currentUserProfile.username,
                    email: window.currentUserProfile.email || ''
                };
            }
            
            // Fallback vers localStorage
            const currentUserJSON = localStorage.getItem('currentUser');
            console.log('💾 localStorage currentUser:', currentUserJSON);
            
            if (currentUserJSON) {
                const currentUser = JSON.parse(currentUserJSON);
                console.log('🟡 localStorage user:', currentUser);
                if (currentUser && (currentUser.username || currentUser.email)) {
                    console.log('✅ Utilisateur localStorage trouvé:', currentUser.username || currentUser.email);
                    return {
                        id: currentUser.id || 'local_' + Date.now(),
                        username: currentUser.username || currentUser.email,
                        email: currentUser.email || ''
                    };
                }
            }
            
            // Essayer avec le système d'authentification global
            if (window.currentUser && (window.currentUser.username || window.currentUser.email)) {
                console.log('🟢 Global currentUser trouvé:', window.currentUser);
                return {
                    id: window.currentUser.id || 'global_' + Date.now(),
                    username: window.currentUser.username || window.currentUser.email,
                    email: window.currentUser.email || ''
                };
            }
            
            // Si on a un profil actif (d'après les logs on voit "Elessarh" quelque part)
            // Essayons de chercher dans d'autres variables globales
            if (window.userProfile && window.userProfile.username) {
                console.log('🟦 UserProfile trouvé:', window.userProfile.username);
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
                console.log('🔑 Token trouvé, création utilisateur temporaire');
                // Si on a un token mais pas d'info utilisateur, créer un utilisateur temporaire
                return {
                    id: 'token_user_' + Date.now(),
                    username: 'Utilisateur Connecté',
                    email: ''
                };
            }
            
            console.log('❌ Aucun utilisateur trouvé');
            console.log('Variables disponibles:', {
                getCurrentUser: typeof window.getCurrentUser,
                getUserProfile: typeof window.getUserProfile,
                currentUser: window.currentUser,
                currentUserProfile: window.currentUserProfile,
                userProfile: window.userProfile
            });
            
            // Utilisateur non connecté - rediriger vers la connexion
            return null;
        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }

    initializeEventListeners() {
        // Onglets
        document.querySelectorAll('.hdv-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Filtres
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('type-filter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });

        // Types d'ordre (vente/achat)
        document.querySelectorAll('.order-type-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectOrderType(e.currentTarget.dataset.type);
            });
        });

        // Initialisation du sélecteur d'items
        this.itemSelector = new ItemSelector();
        
        // Bouton pour ouvrir le sélecteur d'items
        const openSelectorBtn = document.getElementById('open-item-selector');
        if (openSelectorBtn) {
            openSelectorBtn.addEventListener('click', () => {
                this.openItemSelector();
            });
        }

        // Bouton pour changer l'item sélectionné
        const changeItemBtn = document.getElementById('change-item');
        if (changeItemBtn) {
            changeItemBtn.addEventListener('click', () => {
                this.openItemSelector();
            });
        }

        // Bouton refresh du marketplace
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadMarketplace();
                this.showNotification('🔄 Marché actualisé', 'info');
            });
        }

        // Soumission de formulaire
        document.getElementById('create-order-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createOrder();
        });

        // Bouton annuler
        document.querySelector('.cancel-btn')?.addEventListener('click', () => {
            this.resetCreateOrderForm();
        });
    }

    async switchTab(tabName) {
        // Mise à jour des onglets
        document.querySelectorAll('.hdv-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Mise à jour des panneaux
        document.querySelectorAll('.hdv-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(tabName);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        this.currentTab = tabName;

        // Chargement spécifique selon l'onglet (maintenant asynchrone)
        switch (tabName) {
            case 'marketplace':
                await this.loadMarketplace();
                break;
            case 'my-orders':
                await this.loadMyOrders();
                break;
            case 'create-order':
                this.resetCreateOrderForm();
                break;
        }
    }

    async loadMarketplace() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        // Charger les ordres depuis le stockage (maintenant asynchrone)
        await this.loadOrdersFromStorage();
        
        // Mettre à jour le compteur d'ordres
        this.updateOrdersCount(this.orders.length);
        
        // Afficher tous les ordres dans le marketplace
        this.displayOrders(this.orders);
    }

    // Mettre à jour le compteur d'ordres
    updateOrdersCount(count) {
        const ordersCountEl = document.getElementById('orders-count');
        if (ordersCountEl) {
            ordersCountEl.textContent = `${count} ordre${count !== 1 ? 's' : ''}`;
        }
    }

    async loadMyOrders() {
        const myOrdersList = document.getElementById('my-orders-list');
        if (!myOrdersList) return;

        // Charger les ordres depuis le stockage (maintenant asynchrone)
        await this.loadOrdersFromStorage();

        const userInfo = this.getCurrentUserInfo();

        // Filtrer les ordres de l'utilisateur actuel
        const userOrders = this.myOrders.filter(order => 
            order.creator === userInfo.username || order.creatorId === userInfo.id
        );

        if (userOrders.length === 0) {
            myOrdersList.innerHTML = `
                <div class="empty-state">
                    <h3>📋 Vos Ordres</h3>
                    <p>Vous n'avez pas encore créé d'ordres.</p>
                    <button class="btn btn-primary" onclick="hdvSystem.switchTab('create-order')">
                        ➕ Créer votre premier ordre
                    </button>
                </div>
            `;
            return;
        }

        myOrdersList.innerHTML = `
            <div class="my-orders-header">
                <h3>📋 Mes Ordres (${userOrders.length})</h3>
                <button class="refresh-btn" onclick="hdvSystem.loadMyOrders()">
                    🔄 Actualiser
                </button>
            </div>
            <div class="orders-container">
                ${userOrders.map(order => `
                    <div class="order-card ${order.type} my-order">
                        <div class="order-header">
                            <span class="order-type ${order.type}">
                                ${order.type === 'sell' ? '🔴 VENTE' : '🔵 ACHAT'}
                                <span class="order-date">${this.formatOrderDate(order)}</span>
                            </span>
                            <span class="order-time">${this.formatTime(order.timestamp)}</span>
                            <button class="delete-order-btn" onclick="hdvSystem.deleteOrder(${order.id})" title="Supprimer cet ordre">
                                🗑️
                            </button>
                        </div>
                        
                        <div class="order-content">
                            <div class="order-item">
                                <img src="../assets/items/${order.item.image}" alt="${order.item.name}" onerror="this.src='../assets/items/default.png'">
                                <div class="order-item-info">
                                    <h5>${order.item.name}</h5>
                                    <span class="item-category">${order.item.category || 'Catégorie inconnue'}</span>
                                </div>
                            </div>
                            
                            <div class="order-details">
                                <div class="order-quantity">
                                    <span>Quantité: <strong>${order.quantity}</strong></span>
                                </div>
                                <div class="order-price">
                                    <span>Prix: <strong>${order.price} cols</strong></span>
                                </div>
                                <div class="order-status">
                                    <span class="status-active">🟢 Actif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async deleteOrder(orderId) {
        if (!confirm('❓ Êtes-vous sûr de vouloir supprimer cet ordre ?')) return;

        try {
            // Supprimer de Supabase
            if (window.hdvSupabaseManager && window.hdvSupabaseManager.isSupabaseAvailable()) {
                console.log('🗑️ Suppression ordre de Supabase...');
                const success = await window.hdvSupabaseManager.deleteOrderFromSupabase(orderId);
                if (!success) {
                    throw new Error('Échec de la suppression dans Supabase');
                }
                console.log('✅ Ordre supprimé de Supabase');
            }

            // Supprimer des listes locales
            this.orders = this.orders.filter(order => order.id !== orderId);
            this.myOrders = this.myOrders.filter(order => order.id !== orderId);

            // Sauvegarder en local en fallback
            localStorage.setItem('hdv_orders', JSON.stringify(this.orders));
            localStorage.setItem('hdv_my_orders', JSON.stringify(this.myOrders));

            // Recharger l'affichage
            this.loadMyOrders();
            
            this.showNotification('✅ Ordre supprimé avec succès', 'success');
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            this.showNotification('❌ Erreur lors de la suppression: ' + error.message, 'error');
        }
    }

    // Vérifier si un ordre appartient à l'utilisateur connecté
    isMyOrder(order) {
        const userInfo = this.getCurrentUserInfo();
        return order.creator === userInfo.username || order.creatorId === userInfo.id;
    }

    // Supprimer un ordre depuis le marketplace
    async deleteOrderFromMarketplace(orderId) {
        if (!confirm('❓ Êtes-vous sûr de vouloir supprimer cet ordre ?')) return;

        try {
            // Supprimer de Supabase
            if (window.hdvSupabaseManager && window.hdvSupabaseManager.isSupabaseAvailable()) {
                console.log('🗑️ Suppression ordre de Supabase...');
                const success = await window.hdvSupabaseManager.deleteOrderFromSupabase(orderId);
                if (!success) {
                    throw new Error('Échec de la suppression dans Supabase');
                }
                console.log('✅ Ordre supprimé de Supabase');
            }

            // Supprimer des listes locales
            this.orders = this.orders.filter(order => order.id !== orderId);
            this.myOrders = this.myOrders.filter(order => order.id !== orderId);

            // Sauvegarder en local en fallback
            localStorage.setItem('hdv_orders', JSON.stringify(this.orders));
            localStorage.setItem('hdv_my_orders', JSON.stringify(this.myOrders));

            // Recharger l'affichage du marketplace
            this.loadMarketplace();
            
            this.showNotification('✅ Ordre supprimé avec succès', 'success');
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            this.showNotification('❌ Erreur lors de la suppression: ' + error.message, 'error');
        }
    }

    displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        // Vérifier que orders est défini et est un tableau
        if (!orders || !Array.isArray(orders)) {
            console.warn('⚠️ displayOrders: orders non défini ou pas un tableau:', orders);
            orders = [];
        }

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <h3>🏪 Place du Marché</h3>
                    <p>Aucun ordre disponible pour le moment.</p>
                    <p>Soyez le premier à créer un ordre d'achat ou de vente !</p>
                    <button class="btn btn-primary" onclick="hdvSystem.switchTab('create-order')">
                        ➕ Créer un ordre
                    </button>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = `
            <div class="marketplace-header">
                <h3>🏪 Place du Marché (${orders.length} ordre${orders.length > 1 ? 's' : ''})</h3>
                <p>💡 <strong>Astuce:</strong> Vous pouvez supprimer vos propres ordres en cliquant sur le bouton "🗑️ Supprimer"</p>
            </div>
            <div class="orders-grid">
                ${orders.map(order => `
                    <div class="order-card ${order.type}">
                        <div class="order-header">
                            <span class="order-type ${order.type}">
                                ${order.type === 'sell' ? '🔴 VENTE' : '🔵 ACHAT'}
                                <span class="order-date">${this.formatOrderDate(order)}</span>
                            </span>
                        </div>
                
                <div class="order-content">
                    <div class="order-item">
                        <img src="../assets/items/${order.item.image}" alt="${order.item.name}" onerror="this.src='../assets/items/default.png'">
                        <div class="order-item-info">
                            <h5>${order.item.name}</h5>
                            <span class="item-category">${order.item.category || 'Catégorie inconnue'}</span>
                        </div>
                    </div>
                    
                    <div class="order-details">
                        <div class="order-quantity">
                            <span>Quantité: <strong>${order.quantity}</strong></span>
                        </div>
                        <div class="order-price">
                            <span>Prix: <strong>${order.price} cols</strong></span>
                        </div>
                        <div class="order-trader">
                            <span>${order.type === 'sell' ? 'Vendeur' : 'Acheteur'}: <strong>${order.creator || order.seller || order.buyer || 'Aventurier Anonyme'}</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="hdvSystem.contactTrader('${order.creator || order.seller || order.buyer}', '${order.item.name}')">
                        💬 Contacter
                    </button>
                    ${this.isMyOrder(order) ? `
                        <button class="btn btn-danger" onclick="hdvSystem.deleteOrderFromMarketplace(${order.id})">
                            🗑️ Supprimer
                        </button>
                    ` : ''}
                </div>
            </div>
                `).join('')}
            </div>
        `;
    }

    // Ouvrir le sélecteur d'items avec images
    openItemSelector() {
        this.itemSelector.open((selectedItem) => {
            this.selectItem(selectedItem);
        });
    }

    // Sélectionner un item depuis le sélecteur
    selectItem(item) {
        this.selectedItem = item;

        // Mise à jour de l'affichage
        const selectedItemContainer = document.getElementById('selected-item');
        const openSelectorBtn = document.getElementById('open-item-selector');
        
        if (selectedItemContainer && item) {
            selectedItemContainer.style.display = 'block';
            
            const itemImg = document.getElementById('selected-item-img');
            const itemName = document.getElementById('selected-item-name');
            
            if (itemImg) {
                itemImg.src = `../assets/items/${item.image}`;
                itemImg.alt = item.name;
                itemImg.onerror = function() { this.src = '../assets/items/default.png'; };
            }
            
            if (itemName) {
                itemName.textContent = item.name;
            }
        }

        if (openSelectorBtn) {
            openSelectorBtn.style.display = 'none';
        }

        console.log('Item sélectionné:', item);
    }

    // Effacer la sélection d'item
    clearSelectedItem() {
        this.selectedItem = null;
        
        const selectedItemContainer = document.getElementById('selected-item');
        const openSelectorBtn = document.getElementById('open-item-selector');
        
        if (selectedItemContainer) {
            selectedItemContainer.style.display = 'none';
        }
        
        if (openSelectorBtn) {
            openSelectorBtn.style.display = 'block';
        }
    }

    clearSelectedItem() {
        this.selectedItem = null;
        
        const selectedItemContainer = document.getElementById('selected-item');
        const openSelectorBtn = document.getElementById('open-item-selector');
        
        if (selectedItemContainer) {
            selectedItemContainer.style.display = 'none';
        }
        
        if (openSelectorBtn) {
            openSelectorBtn.style.display = 'block';
        }
    }

    selectOrderType(type) {
        this.orderType = type;
        
        // Mise à jour visuelle des cartes
        document.querySelectorAll('.order-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('selected');
        
        // Afficher le formulaire
        const form = document.getElementById('create-order-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Mise à jour du label
        const orderTypeLabel = document.getElementById('order-type-label');
        if (orderTypeLabel) {
            orderTypeLabel.textContent = type === 'sell' ? '🔴 VENTE' : '🔵 ACHAT';
            orderTypeLabel.className = `order-type-label ${type}`;
        }

        // Notification supprimée pour éviter le spam
    }

    async createOrder() {
        // Vérification obligatoire de l'authentification
        const userInfo = this.getCurrentUserInfo();
        if (!userInfo) {
            this.showNotification('❌ Vous devez être connecté pour créer un ordre', 'error');
            this.redirectToLogin();
            return;
        }

        if (!this.selectedItem) {
            this.showNotification('❌ Veuillez sélectionner un item', 'error');
            return;
        }

        if (!this.orderType) {
            this.showNotification('❌ Veuillez sélectionner le type d\'ordre (vente/achat)', 'error');
            return;
        }

        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseInt(document.getElementById('price').value);

        if (!quantity || quantity <= 0) {
            this.showNotification('❌ Quantité invalide', 'error');
            return;
        }

        if (!price || price <= 0) {
            this.showNotification('❌ Prix invalide', 'error');
            return;
        }

        // Création de l'ordre
        const newOrder = {
            id: Date.now(),
            type: this.orderType,
            item: this.selectedItem,
            quantity: quantity,
            price: price,
            total: quantity * price,
            seller: this.orderType === 'sell' ? userInfo.username : null,
            buyer: this.orderType === 'buy' ? userInfo.username : null,
            sellerId: this.orderType === 'sell' ? userInfo.id : null,
            buyerId: this.orderType === 'buy' ? userInfo.id : null,
            timestamp: new Date(),
            creator: userInfo.username,
            creatorId: userInfo.id,
            username: userInfo.username
        };

        try {
            // Sauvegarder dans Supabase
            if (window.hdvSupabaseManager && window.hdvSupabaseManager.isSupabaseAvailable()) {
                console.log('💾 Sauvegarde ordre dans Supabase...');
                const savedOrder = await window.hdvSupabaseManager.saveOrderToSupabase(newOrder);
                newOrder.id = savedOrder.id; // Utiliser l'ID généré par Supabase
                console.log('✅ Ordre sauvegardé dans Supabase avec ID:', savedOrder.id);
            } else {
                console.warn('⚠️ Supabase non disponible, sauvegarde locale uniquement');
                // Fallback vers localStorage
                this.orders.push(newOrder);
                this.myOrders.push(newOrder);
                localStorage.setItem('hdv_orders', JSON.stringify(this.orders));
                localStorage.setItem('hdv_my_orders', JSON.stringify(this.myOrders));
            }

            this.showNotification('✅ Ordre créé avec succès !', 'success');
            this.resetCreateOrderForm();
            
            // Retour à l'onglet marketplace pour voir l'ordre créé
            await this.switchTab('marketplace');
            
            // Recharger les données depuis Supabase pour inclure le nouvel ordre
            setTimeout(async () => {
                await this.loadOrdersFromStorage();
                await this.loadMarketplace();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'ordre:', error);
            this.showNotification('❌ Erreur lors de la création de l\'ordre: ' + error.message, 'error');
        }
    }

    async saveOrdersToStorage() {
        // Nouvelle version avec Supabase - ne fait plus rien en local
        // Les ordres sont maintenant sauvegardés directement dans Supabase lors de leur création
        console.log('ℹ️ saveOrdersToStorage: Les ordres sont maintenant gérés par Supabase');
    }

    async loadOrdersFromStorage() {
        try {
            console.log('📥 Chargement des ordres depuis Supabase...');
            
            if (!window.hdvSupabaseManager || !window.hdvSupabaseManager.isSupabaseAvailable()) {
                console.error('❌ HDV Supabase Manager non disponible');
                // Fallback vers localStorage en cas de problème
                this.loadOrdersFromLocalStorage();
                return;
            }

            const { orders, myOrders } = await window.hdvSupabaseManager.loadOrdersFromSupabase();
            this.orders = orders;
            this.myOrders = myOrders;
            
            console.log(`✅ Chargés depuis Supabase: ${orders.length} ordres, ${myOrders.length} mes ordres`);
        } catch (error) {
            console.error('❌ Erreur chargement Supabase, fallback localStorage:', error);
            this.loadOrdersFromLocalStorage();
        }
    }

    // Fonction de fallback pour localStorage
    loadOrdersFromLocalStorage() {
        const savedOrders = localStorage.getItem('hdv_orders');
        const savedMyOrders = localStorage.getItem('hdv_my_orders');
        
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
        
        if (savedMyOrders) {
            this.myOrders = JSON.parse(savedMyOrders);
        }
        
        console.log('📦 Données chargées depuis localStorage (fallback)');
    }

    resetCreateOrderForm() {
        this.selectedItem = null;
        this.orderType = null;
        
        // Réinitialiser le sélecteur d'items
        this.clearSelectedItem();
        
        // Réinitialiser les autres champs
        document.getElementById('quantity').value = '1';
        document.getElementById('price').value = '';
        document.getElementById('notes').value = '';
        
        // Réinitialiser les cartes de type d'ordre
        document.querySelectorAll('.order-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Réinitialiser le label du type d'ordre
        const orderTypeLabel = document.getElementById('order-type-label');
        if (orderTypeLabel) {
            orderTypeLabel.textContent = 'Sélectionnez le type d\'ordre';
            orderTypeLabel.className = 'order-type-label';
        }
        
        // Masquer le formulaire
        const form = document.getElementById('order-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    applyFilters() {
        let filteredOrders = [...this.orders];

        if (this.filters.type !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.type === this.filters.type);
        }

        if (this.filters.category !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.item.category === this.filters.category);
        }

        this.displayOrders(filteredOrders);
    }

    contactTrader(traderName, itemName) {
        const currentUser = this.getCurrentUserInfo();
        
        console.log('📞 Contact trader - Informations:', {
            trader: traderName,
            item: itemName,
            currentUser: currentUser,
            mailboxSystemAvailable: !!window.mailboxSystem
        });
        
        // Vérifier l'authentification
        if (!currentUser) {
            this.showNotification('❌ Vous devez être connecté pour contacter un vendeur !', 'error');
            this.redirectToLogin();
            return;
        }
        
        // Comparaison des utilisateurs
        if (traderName === currentUser.username) {
            this.showNotification('❌ Vous ne pouvez pas vous contacter vous-même !', 'error');
            return;
        }

        // Vérifier si le système de boîte mail est disponible
        if (window.mailboxSystem && window.mailboxSystem.sendTradeMessage) {
            console.log('📬 Utilisation du système de boîte mail');
            
            // Trouver l'ordre correspondant pour obtenir plus d'infos
            const order = this.orders.find(o => 
                (o.seller === traderName || o.buyer === traderName || o.creator === traderName) && 
                o.item.name === itemName
            );
            
            console.log('🔍 Ordre trouvé:', order);
            
            if (order) {
                // Utiliser la méthode async correcte
                mailboxSystem.sendTradeMessage(
                    traderName,
                    itemName, 
                    order.type,
                    order.price
                ).then(success => {
                    if (success) {
                        this.showNotification(`✅ Message envoyé à ${traderName} via la boîte mail`, 'success');
                        console.log('✅ Message envoyé avec succès');
                    }
                }).catch(error => {
                    console.error('❌ Erreur envoi message:', error);
                    this.showNotification('❌ Erreur lors de l\'envoi du message', 'error');
                });
            } else {
                console.warn('❌ Ordre non trouvé pour le contact');
                this.showNotification('❌ Impossible de trouver les détails de l\'ordre', 'error');
            }
        } else {
            console.warn('❌ Système de boîte mail non disponible ou méthode manquante');
            this.showNotification('❌ Système de messagerie non disponible', 'error');
            
            // Fallback vers l'ancien système
            console.log('💬 Utilisation du système de chat modal (fallback)');
            this.openChatModal(traderName, itemName);
        }
    }

    openChatModal(traderName, itemName) {
        const modal = document.createElement('div');
        modal.className = 'chat-modal-overlay';
        modal.innerHTML = `
            <div class="chat-modal">
                <div class="chat-header">
                    <h3>💬 Contacter ${traderName}</h3>
                    <p>Concernant: <strong>${itemName}</strong></p>
                    <button class="close-modal" onclick="this.closest('.chat-modal-overlay').remove()">❌</button>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <div class="system-message">
                        <p>📝 Conversation avec ${traderName} concernant "${itemName}"</p>
                        <p>🔒 Les messages sont sécurisés et privés</p>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <div class="quick-messages">
                        <button class="quick-msg" onclick="hdvSystem.sendQuickMessage('Bonjour, je suis intéressé par votre ${itemName}')">
                            💰 Je suis intéressé par ${itemName}
                        </button>
                        <button class="quick-msg" onclick="hdvSystem.sendQuickMessage('Quel est votre meilleur prix pour ${itemName} ?')">
                            💸 Négocier le prix
                        </button>
                        <button class="quick-msg" onclick="hdvSystem.sendQuickMessage('Pouvez-vous me contacter en jeu ?')">
                            🎮 Contact en jeu
                        </button>
                    </div>
                    
                    <div class="message-compose">
                        <textarea 
                            id="message-input" 
                            placeholder="Écrivez votre message..."
                            rows="3"
                            maxlength="500"
                        ></textarea>
                        <div class="message-actions">
                            <span class="char-count">0/500</span>
                            <button class="send-message" onclick="hdvSystem.sendMessage()">
                                📤 Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gestion du compteur de caractères
        const messageInput = document.getElementById('message-input');
        const charCount = modal.querySelector('.char-count');
        
        messageInput.addEventListener('input', () => {
            const length = messageInput.value.length;
            charCount.textContent = `${length}/500`;
            charCount.style.color = length > 450 ? '#ff6b6b' : '#888';
        });

        // Focus sur le textarea
        messageInput.focus();
    }

    sendQuickMessage(message) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.value = message;
            messageInput.focus();
            
            // Trigger input event pour le compteur
            messageInput.dispatchEvent(new Event('input'));
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!messageInput || !chatMessages) return;
        
        const message = messageInput.value.trim();
        if (!message) {
            this.showNotification('❌ Veuillez écrire un message', 'error');
            return;
        }

        // Ajouter le message à la conversation
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Vider le champ
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input'));

        // Simulation de réponse automatique
        setTimeout(() => {
            const responseElement = document.createElement('div');
            responseElement.className = 'trader-message';
            responseElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">Merci pour votre message ! Je vous répondrai dès que possible. 🎮</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            chatMessages.appendChild(responseElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);

        this.showNotification('✅ Message envoyé !', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'À l\'instant';
    }

    // Formater la date/heure complète de création d'un ordre
    formatOrderDate(order) {
        try {
            let date;
            
            // Utiliser created_at de Supabase en priorité
            if (order.created_at) {
                date = new Date(order.created_at);
            } else if (order.timestamp) {
                date = new Date(order.timestamp);
            } else {
                return 'Date inconnue';
            }

            // Vérifier que la date est valide
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }

            // Format: "le 08/11/2025 à 14:30"
            const options = {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            
            const formatted = date.toLocaleDateString('fr-FR', options);
            return `le ${formatted.replace(',', ' à')}`;
            
        } catch (error) {
            console.error('❌ Erreur formatage date ordre:', error);
            return 'Date inconnue';
        }
    }
}

// Initialisation globale pour éviter les conflits
window.HDVSystem = HDVSystem;