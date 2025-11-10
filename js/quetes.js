// quetes.js - Système de gestion des quêtes avec pagination optimisée
class QuestSystem {
    constructor() {
        this.currentPage = 1;
        this.questsPerPage = 10; // Nombre de quêtes par page
        this.currentFilter = 'all';
        this.currentTier = '1';
        this.allQuests = [];
        this.filteredQuests = [];
        
        this.init();
    }

    init() {
        console.log('🎯 Initialisation du système de quêtes');
        
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Charger toutes les quêtes depuis le HTML
        this.loadQuestsFromDOM();
        
        // Initialiser les événements
        this.initializeEventListeners();
        
        // Afficher la première page
        this.displayCurrentPage();
    }

    loadQuestsFromDOM() {
        console.log('📥 Chargement des quêtes depuis le DOM...');
        
        const questSections = document.querySelectorAll('.quest-section');
        
        questSections.forEach(section => {
            const category = section.getAttribute('data-category');
            const tier = section.getAttribute('data-tier');
            
            const questSteps = section.querySelectorAll('.quest-step');
            
            questSteps.forEach((step, index) => {
                this.allQuests.push({
                    element: step,
                    category: category,
                    tier: tier,
                    index: index,
                    section: section
                });
            });
        });
        
        console.log(`✅ ${this.allQuests.length} quêtes chargées`);
        this.filteredQuests = [...this.allQuests];
    }

    initializeEventListeners() {
        // Filtres de catégorie
        const filterBtns = document.querySelectorAll('.quest-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
                
                // Mise à jour visuelle
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Sélecteur de palier
        const tierSelect = document.getElementById('tier-select');
        if (tierSelect) {
            tierSelect.addEventListener('change', (e) => {
                this.setTier(e.target.value);
            });
        }
    }

    setFilter(filter) {
        console.log('🔍 Filtre appliqué:', filter);
        this.currentFilter = filter;
        this.currentPage = 1;
        this.applyFilters();
        this.displayCurrentPage();
    }

    setTier(tier) {
        console.log('🎚️ Palier sélectionné:', tier);
        this.currentTier = tier;
        this.currentPage = 1;
        this.applyFilters();
        this.displayCurrentPage();
    }

    applyFilters() {
        this.filteredQuests = this.allQuests.filter(quest => {
            const matchCategory = this.currentFilter === 'all' || quest.category === this.currentFilter;
            const matchTier = quest.tier === this.currentTier || !quest.tier;
            return matchCategory && matchTier;
        });
        
        console.log(`📊 ${this.filteredQuests.length} quêtes après filtrage`);
    }

    displayCurrentPage() {
        console.log(`📄 Affichage page ${this.currentPage}`);
        
        // Masquer toutes les sections d'abord pour optimiser
        const allSections = document.querySelectorAll('.quest-section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });

        // Calculer les indices de début et fin
        const startIndex = (this.currentPage - 1) * this.questsPerPage;
        const endIndex = startIndex + this.questsPerPage;
        
        // Afficher uniquement les quêtes de la page actuelle
        const questsToShow = this.filteredQuests.slice(startIndex, endIndex);
        
        // Garder une trace des sections à afficher
        const sectionsToShow = new Set();
        
        questsToShow.forEach(quest => {
            quest.element.style.display = 'block';
            sectionsToShow.add(quest.section);
        });
        
        // Afficher les sections nécessaires
        sectionsToShow.forEach(section => {
            section.style.display = 'block';
        });

        // Masquer les quêtes non affichées
        this.filteredQuests.forEach((quest, index) => {
            if (index < startIndex || index >= endIndex) {
                quest.element.style.display = 'none';
            }
        });

        // Mettre à jour la pagination
        this.renderPagination();

        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredQuests.length / this.questsPerPage);
        
        // Chercher ou créer le conteneur de pagination
        let paginationContainer = document.querySelector('.quest-pagination');
        
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'quest-pagination';
            
            // Insérer après les filtres
            const filters = document.querySelector('.quest-filters');
            if (filters) {
                filters.after(paginationContainer);
            }
        }

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="pagination-info">
                Page ${this.currentPage} sur ${totalPages} 
                (${this.filteredQuests.length} quête${this.filteredQuests.length > 1 ? 's' : ''})
            </div>
            <div class="pagination-controls">
        `;

        // Bouton Précédent
        paginationHTML += `
            <button 
                class="pagination-btn" 
                onclick="questSystem.previousPage()" 
                ${this.currentPage === 1 ? 'disabled' : ''}>
                ◀ Précédent
            </button>
        `;

        // Numéros de pages (afficher jusqu'à 7 pages à la fois)
        const maxPagesToShow = 7;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Ajuster si on est proche de la fin
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Première page
        if (startPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" onclick="questSystem.goToPage(1)">1</button>
            `;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Pages du milieu
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button 
                    class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                    onclick="questSystem.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Dernière page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `
                <button class="pagination-btn" onclick="questSystem.goToPage(${totalPages})">${totalPages}</button>
            `;
        }

        // Bouton Suivant
        paginationHTML += `
            <button 
                class="pagination-btn" 
                onclick="questSystem.nextPage()" 
                ${this.currentPage === totalPages ? 'disabled' : ''}>
                Suivant ▶
            </button>
        `;

        paginationHTML += `</div>`;

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredQuests.length / this.questsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.displayCurrentPage();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayCurrentPage();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredQuests.length / this.questsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayCurrentPage();
        }
    }
}

// Fonction globale pour changer de palier (utilisée dans le HTML)
function changeTier(tier) {
    if (window.questSystem) {
        window.questSystem.setTier(tier);
    }
}

// Initialiser le système de quêtes
window.questSystem = new QuestSystem();
