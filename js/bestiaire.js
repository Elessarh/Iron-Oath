// Données du bestiaire - Catalogue complet avec toutes les images
const creaturesData = [
    // Palier 1 - Créatures de base
    {
        id: 1,
        name: "Gobelin Guerrier",
        level: 5,
        category: "creature",
        type: "Humanoïde",
        hp: 45,
        attack: 12,
        defense: 10,
        palier: 1,
        image: "../assets/mobs/Gorbel.png",
        description: "Un gobelin armé d'une épée rouillée et d'un bouclier en bois. Agressif mais peu résistant.",
        drops: ["Épée rouillée", "Cuir abîmé", "5-12 pièces d'or"],
        abilities: ["Attaque rapide", "Esquive"],
        location: "Plaines de Commencement"
    },
    {
        id: 2,
        name: "Petit Slime",
        level: 3,
        category: "creature",
        type: "Créature",
        hp: 25,
        attack: 8,
        defense: 6,
        palier: 1,
        image: "../assets/mobs/Petit Slime.png",
        description: "Une petite créature gélatineuse qui rebondit joyeusement. Inoffensive mais agaçante.",
        drops: ["Gelée de slime", "2-8 pièces d'or"],
        abilities: ["Rebond", "Division"],
        location: "Cavernes humides"
    },
    {
        id: 3,
        name: "Loup Sinistre Blanc",
        level: 8,
        category: "elite",
        type: "Bête",
        hp: 80,
        attack: 16,
        defense: 12,
        palier: 1,
        image: "../assets/mobs/Loup Sinistre Blanc.png",
        description: "Un loup au pelage blanc immaculé, chef de meute redoutable avec des yeux perçants.",
        drops: ["Croc de loup", "Fourrure blanche", "15-25 pièces d'or"],
        abilities: ["Hurlement", "Morsure sauvage", "Charge"],
        location: "Forêt Enneigée"
    },
    {
        id: 4,
        name: "Loup Sinistre Brun",
        level: 7,
        category: "creature",
        type: "Bête",
        hp: 65,
        attack: 14,
        defense: 11,
        palier: 1,
        image: "../assets/mobs/Loup Sinistre Brun.png",
        description: "Un loup au pelage brun, chasseur nocturne féroce des forêts sombres.",
        drops: ["Croc de loup", "Fourrure brune", "12-20 pièces d'or"],
        abilities: ["Morsure", "Furtivité", "Pistage"],
        location: "Forêt des Plaines"
    },
    {
        id: 5,
        name: "Loup Sinistre Noir",
        level: 10,
        category: "elite",
        type: "Bête",
        hp: 95,
        attack: 18,
        defense: 14,
        palier: 1,
        image: "../assets/mobs/Loup SInistre Noir.png",
        description: "Le plus redoutable des loups, son pelage noir comme la nuit cache une force terrible.",
        drops: ["Croc noir", "Fourrure sombre", "20-35 pièces d'or"],
        abilities: ["Morsure fatale", "Ombre", "Hurlement terrifiant"],
        location: "Forêt Maudite"
    },

    // Palier 1 - Boss et créatures spéciales
    {
        id: 6,
        name: "Bandit Assassin",
        level: 12,
        category: "elite",
        type: "Humanoïde",
        hp: 110,
        attack: 22,
        defense: 15,
        palier: 1,
        image: "../assets/mobs/Bandit Assassin.png",
        description: "Un assassin masqué aux lames empoisonnées, expert en combat furtif.",
        drops: ["Lame empoisonnée", "Cape d'assassin", "30-50 pièces d'or"],
        abilities: ["Attaque sournoise", "Poison", "Disparition"],
        location: "Repaire des Bandits"
    },
    {
        id: 7,
        name: "Guerrier Déchu",
        level: 15,
        category: "boss",
        type: "Mort-vivant",
        hp: 200,
        attack: 25,
        defense: 20,
        palier: 1,
        image: "../assets/mobs/Guerrier Déchu.png",
        description: "Un ancien chevalier corrompu par les ténèbres, condamné à errer éternellement.",
        drops: ["Épée maudite", "Armure corrompue", "Pierre d'âme", "75-150 pièces d'or"],
        abilities: ["Frappe maudite", "Régénération sombre", "Cri d'outre-tombe"],
        location: "Cimetière Abandonné"
    },
    {
        id: 8,
        name: "Gardien Colossal",
        level: 18,
        category: "boss",
        type: "Golem",
        hp: 350,
        attack: 30,
        defense: 25,
        palier: 1,
        image: "../assets/mobs/Gardien Colossal.avif",
        description: "Un golem de pierre ancien, gardien millénaire d'un temple oublié.",
        drops: ["Cœur de pierre", "Fragments runiques", "Gemme de gardien", "100-200 pièces d'or"],
        abilities: ["Charge dévastatrice", "Peau de pierre", "Tremblement"],
        location: "Temple Ancien"
    },

    // Palier 2 - Créatures intermédiaires
    {
        id: 9,
        name: "Gardien Déchu",
        level: 20,
        category: "elite",
        type: "Mort-vivant",
        hp: 150,
        attack: 28,
        defense: 22,
        palier: 2,
        image: "../assets/mobs/Gardien-Déchu.png",
        description: "Un gardien corrompu par une magie sombre, perdant lentement son humanité.",
        drops: ["Armure corrompue", "Essence sombre", "40-70 pièces d'or"],
        abilities: ["Corruption", "Résistance magique", "Drain de vie"],
        location: "Sanctuaire Corrompu"
    },
    {
        id: 10,
        name: "Guerrier Slime",
        level: 22,
        category: "elite",
        type: "Créature",
        hp: 180,
        attack: 24,
        defense: 18,
        palier: 2,
        image: "../assets/mobs/Guerrier Slime.avif",
        description: "Un slime qui a absorbé l'équipement d'un guerrier, devenant une menace redoutable.",
        drops: ["Gelée renforcée", "Équipement digéré", "35-60 pièces d'or"],
        abilities: ["Absorption", "Régénération", "Attaque acide"],
        location: "Marécages Toxiques"
    },
    {
        id: 11,
        name: "Guerrier Tréant",
        level: 25,
        category: "boss",
        type: "Plante",
        hp: 400,
        attack: 32,
        defense: 28,
        palier: 2,
        image: "../assets/mobs/Guerrier Tréant.avif",
        description: "Un ancien arbre animé par la magie, protecteur féroce de la forêt sacrée.",
        drops: ["Bois enchanté", "Sève magique", "Graine de tréant", "120-250 pièces d'or"],
        abilities: ["Racines entravantes", "Régénération naturelle", "Tempête de feuilles"],
        location: "Forêt Sacrée"
    },
    {
        id: 12,
        name: "Héraut Déchu",
        level: 28,
        category: "boss",
        type: "Démon",
        hp: 450,
        attack: 35,
        defense: 30,
        palier: 2,
        image: "../assets/mobs/Héraut-Déchu.png",
        description: "Un démon envoyé des abysses, héraut d'une invasion démoniaque imminente.",
        drops: ["Corne démoniaque", "Essence infernale", "Parchemin maudit", "150-300 pièces d'or"],
        abilities: ["Flammes infernales", "Invocation", "Terreur"], 
        location: "Portail Démoniaque"
    },

    // Palier 2 - Créatures spécialisées
    {
        id: 13,
        name: "Mage Sylvestre",
        level: 24,
        category: "elite",
        type: "Humanoïde",
        hp: 120,
        attack: 30,
        defense: 16,
        palier: 2,
        image: "../assets/mobs/Mage Sylvestre.avif",
        description: "Un mage elfe maîtrisant la magie de la nature, protecteur des bois anciens.",
        drops: ["Bâton sylvestre", "Tome de nature", "Cristal végétal", "60-100 pièces d'or"],
        abilities: ["Magie de nature", "Soins", "Invoquer racines"],
        location: "Bosquet Enchanté"
    },
    {
        id: 14,
        name: "Mini Tréant",
        level: 16,
        category: "creature",
        type: "Plante",
        hp: 90,
        attack: 18,
        defense: 20,
        palier: 2,
        image: "../assets/mobs/Mini Tréant.avif",
        description: "Une jeune pousse de tréant, encore petite mais déjà très résistante.",
        drops: ["Jeune bois", "Feuilles magiques", "25-45 pièces d'or"],
        abilities: ["Croissance rapide", "Photosynthèse", "Épines"],
        location: "Pépinière Magique"
    },

    // Palier 3 - Créatures avancées
    {
        id: 15,
        name: "Faucheuse Déchu",
        level: 35,
        category: "boss",
        type: "Mort-vivant",
        hp: 600,
        attack: 40,
        defense: 35,
        palier: 3,
        image: "../assets/mobs/Faucheuse-Déchu.png",
        description: "Une faucheuse corrompue, autrefois guide des âmes, maintenant leur geôlière.",
        drops: ["Faux de l'âme", "Essence de mort", "Sablier éternel", "200-400 pièces d'or"],
        abilities: ["Fauche mortelle", "Drain d'âme", "Passage dans l'ombre"],
        location: "Limbes Éternels"
    },
    {
        id: 16,
        name: "Soldat Déchu",
        level: 30,
        category: "elite",
        type: "Mort-vivant",
        hp: 250,
        attack: 32,
        defense: 28,
        palier: 3,
        image: "../assets/mobs/Soldat-Déchu.png",
        description: "Un soldat d'élite tombé au combat, animé par une volonté de vengeance.",
        drops: ["Armure de guerre", "Épée du soldat", "Médaille d'honneur", "80-150 pièces d'or"],
        abilities: ["Formation de combat", "Rage du tombé", "Résistance"],
        location: "Champ de Bataille Maudit"
    },
    {
        id: 17,
        name: "Slime Soigneur",
        level: 26,
        category: "creature",
        type: "Créature",
        hp: 150,
        attack: 15,
        defense: 25,
        palier: 3,
        image: "../assets/mobs/Slime Soigneur.png",
        description: "Un slime aux propriétés curatives étonnantes, très recherché par les alchimistes.",
        drops: ["Gelée curative", "Essence de vie", "50-85 pièces d'or"],
        abilities: ["Soins", "Régénération", "Purification"],
        location: "Source Sacrée"
    },
    {
        id: 18,
        name: "Slime Magicien",
        level: 28,
        category: "elite",
        type: "Créature",
        hp: 180,
        attack: 35,
        defense: 20,
        palier: 3,
        image: "../assets/mobs/Slime Magicien.png",
        description: "Un slime qui a absorbé un grimoire magique, maîtrisant maintenant plusieurs sorts.",
        drops: ["Gelée magique", "Parchemin de sort", "Cristal de mana", "70-120 pièces d'or"],
        abilities: ["Boule de feu", "Téléportation", "Barrière magique"],
        location: "Tour du Mage Fou"
    },

    // Créatures légendaires et uniques
    {
        id: 19,
        name: "Ika",
        level: 40,
        category: "boss",
        type: "Léviathan",
        hp: 800,
        attack: 45,
        defense: 40,
        palier: 3,
        image: "../assets/mobs/Ika.avif",
        description: "Un kraken ancestral des profondeurs, gardien des secrets abyssaux.",
        drops: ["Tentacule légendaire", "Perle des abysses", "Encre magique", "300-600 pièces d'or"],
        abilities: ["Étreinte tentaculaire", "Vague dévastatrice", "Camouflage aquatique"],
        location: "Abysses Marins"
    },
    {
        id: 20,
        name: "Narax",
        level: 42,
        category: "boss",
        type: "Démon",
        hp: 850,
        attack: 48,
        defense: 42,
        palier: 3,
        image: "../assets/mobs/Narax.png",
        description: "Un archidémon des flammes éternelles, seigneur d'un royaume infernal.",
        drops: ["Corne de Narak", "Flamme éternelle", "Grimoire infernal", "400-800 pièces d'or"],
        abilities: ["Pluie de météores", "Téléportation infernale", "Aura de terreur"],
        location: "Cœur des Enfers"
    },
    {
        id: 21,
        name: "Néphantes",
        level: 38,
        category: "boss",
        type: "Araignée Géante",
        hp: 650,
        attack: 42,
        defense: 35,
        palier: 3,
        image: "../assets/mobs/Nephantes.gif",
        description: "Une araignée titanesque tisseuse de destins, gardienne des fils du temps.",
        drops: ["Soie temporelle", "Venin de Néphantes", "Œuf d'araignée", "250-500 pièces d'or"],
        abilities: ["Toile temporelle", "Poison paralysant", "Invocation d'araignées"],
        location: "Labyrinthe de Soie"
    },
    {
        id: 22,
        name: "Ornstein",
        level: 45,
        category: "boss",
        type: "Chevalier Dragon",
        hp: 950,
        attack: 50,
        defense: 45,
        palier: 3,
        image: "../assets/mobs/Ornstein.avif",
        description: "Le légendaire tueur de dragons, chevalier au service du soleil, maître de la lance sacrée.",
        drops: ["Lance dracotueur", "Armure dorée", "Anneau solaire", "500-1000 pièces d'or"],
        abilities: ["Frappe foudroyante", "Charge divine", "Invocation d'éclairs"],
        location: "Cathédrale du Soleil"
    },

    // Créatures diverses
    {
        id: 23,
        name: "Plante Dévoreuse",
        level: 32,
        category: "elite",
        type: "Plante",
        hp: 280,
        attack: 38,
        defense: 25,
        palier: 3,
        image: "../assets/mobs/Plante Dévoreuse.avif",
        description: "Une plante carnivore géante qui attire ses proies avec des phéromones envoûtantes.",
        drops: ["Nectar toxique", "Épines acérées", "Bulbe précieux", "90-170 pièces d'or"],
        abilities: ["Phéromones", "Digestion acide", "Épines empoisonnées"],
        location: "Jungle Carnivore"
    },
    {
        id: 24,
        name: "Sangliers",
        level: 14,
        category: "creature",
        type: "Bête",
        hp: 85,
        attack: 20,
        defense: 16,
        palier: 2,
        image: "../assets/mobs/Sangliers.png",
        description: "Des sangliers sauvages au tempérament agressif, protecteurs farouches de leur territoire.",
        drops: ["Défense de sanglier", "Cuir épais", "Viande sauvage", "18-35 pièces d'or"],
        abilities: ["Charge furieuse", "Peau épaisse", "Rage"],
        location: "Forêt Sauvage"
    },
    {
        id: 25,
        name: "Smoug",
        level: 50,
        category: "boss",
        type: "Dragon",
        hp: 1200,
        attack: 55,
        defense: 50,
        palier: 3,
        image: "../assets/mobs/Smoug.png",
        description: "Le dragon ancien des montagnes, gardien d'un trésor légendaire accumulé sur des millénaires.",
        drops: ["Écaille de dragon", "Trésor de Smoug", "Souffle de dragon", "800-1500 pièces d'or"],
        abilities: ["Souffle de feu", "Vol majestueux", "Hypnose du trésor"],
        location: "Pic du Dragon"
    },
    {
        id: 26,
        name: "Spirite de Glace",
        level: 33,
        category: "elite",
        type: "Élémentaire",
        hp: 220,
        attack: 36,
        defense: 30,
        palier: 3,
        image: "../assets/mobs/Spirite de glace.png",
        description: "Des esprits élémentaires de glace, gardiens éternels des terres gelées du nord.",
        drops: ["Cristal de glace", "Essence de froid", "Sceptre gelé", "85-160 pièces d'or"],
        abilities: ["Blizzard", "Prison de glace", "Téléportation glaciale"],
        location: "Toundra Gelée"
    },
    {
        id: 27,
        name: "Tréant Elite",
        level: 36,
        category: "boss",
        type: "Plante",
        hp: 700,
        attack: 44,
        defense: 38,
        palier: 3,
        image: "../assets/mobs/Tréant Elite.avif",
        description: "Le plus ancien des tréants, sage millénaire et protecteur suprême de la forêt primordiale.",
        drops: ["Cœur d'arbre ancien", "Bois millénaire", "Couronne de feuilles", "300-550 pièces d'or"],
        abilities: ["Force de la nature", "Guérison forestière", "Armée d'arbres"],
        location: "Cœur de la Forêt Primordiale"
    }
];

// État de l'application
let filteredCreatures = [...creaturesData];
let selectedCreature = null;

// État de la pagination
let currentPage = 1;
let itemsPerPage = 12;
let totalPages = 1;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    calculatePagination();
    renderCreatures();
    setupEventListeners();
    setupPaginationListeners();
});

// Configuration des écouteurs d'événements de pagination
function setupPaginationListeners() {
    // Boutons précédent/suivant
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCreatures();
                updatePaginationUI();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCreatures();
                updatePaginationUI();
            }
        });
    }
    
    // Sélecteur d'éléments par page
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; // Reset à la première page
            calculatePagination();
            renderCreatures();
            updatePaginationUI();
        });
    }
}

// Calcul de la pagination
function calculatePagination() {
    totalPages = Math.ceil(filteredCreatures.length / itemsPerPage);
    
    // S'assurer que la page actuelle est valide
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
}

// Mise à jour de l'interface de pagination
function updatePaginationUI() {
    const paginationContainer = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const paginationInfo = document.getElementById('pagination-info-text');
    const paginationNumbers = document.getElementById('pagination-numbers');
    
    if (!paginationContainer) return;
    
    // Afficher/masquer la pagination selon le nombre d'éléments
    if (filteredCreatures.length <= itemsPerPage) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'block';
    }
    
    // Mise à jour des boutons précédent/suivant
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    // Mise à jour du texte informatif
    if (paginationInfo) {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredCreatures.length);
        paginationInfo.textContent = `Affichage de ${startItem}-${endItem} sur ${filteredCreatures.length} créatures`;
    }
    
    // Génération des numéros de pages
    if (paginationNumbers) {
        paginationNumbers.innerHTML = generatePageNumbers();
    }
}

// Génération des numéros de pages avec ellipses
function generatePageNumbers() {
    let pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
        // Afficher toutes les pages si peu nombreuses
        for (let i = 1; i <= totalPages; i++) {
            pages.push(createPageButton(i));
        }
    } else {
        // Logique d'ellipses pour beaucoup de pages
        pages.push(createPageButton(1));
        
        if (currentPage > 4) {
            pages.push('<span class="pagination-ellipsis">...</span>');
        }
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push(createPageButton(i));
        }
        
        if (currentPage < totalPages - 3) {
            pages.push('<span class="pagination-ellipsis">...</span>');
        }
        
        if (totalPages > 1) {
            pages.push(createPageButton(totalPages));
        }
    }
    
    return pages.join('');
}

// Création d'un bouton de page
function createPageButton(pageNumber) {
    const isActive = pageNumber === currentPage ? 'active' : '';
    return `
        <button class="pagination-number ${isActive}" onclick="goToPage(${pageNumber})">
            ${pageNumber}
        </button>
    `;
}

// Navigation vers une page spécifique
function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        renderCreatures();
        updatePaginationUI();
        
        // Scroll vers le haut de la grille
        const grid = document.getElementById('creatures-grid');
        if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', filterCreatures);
    }

    // Filtres
    const filters = ['palier-filter', 'category-filter', 'level-filter', 'type-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', filterCreatures);
        }
    });

    // Fermeture du modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('creature-modal') || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });

    // Échap pour fermer le modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Rendu des créatures avec images et pagination
function renderCreatures() {
    const grid = document.getElementById('creatures-grid');
    if (!grid) return;

    if (filteredCreatures.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
                <h3>🔍 Aucune créature trouvée</h3>
                <p>Essayez de modifier vos filtres de recherche</p>
            </div>
        `;
        updatePaginationUI();
        return;
    }

    // Calcul des créatures à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const creaturesToShow = filteredCreatures.slice(startIndex, endIndex);

    grid.innerHTML = creaturesToShow.map(creature => `
        <div class="creature-card ${creature.category}" onclick="openCreatureModal(${creature.id})">
            <div class="creature-image-container">
                <img src="${creature.image}" alt="${creature.name}" class="creature-image" 
                     onerror="this.src='../assets/Logo_3.png'; this.className='creature-image fallback';">
                <div class="creature-level-badge">Niv. ${creature.level}</div>
            </div>
            
            <div class="creature-header">
                <h3 class="creature-name">${creature.name}</h3>
                <div class="creature-badges">
                    <div class="floor-badge">PALIER ${creature.palier}</div>
                    <div class="type-badge ${creature.category}">${creature.category.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="creature-stats">
                <div class="stat-row">
                    <div class="stat-item">
                        <span class="stat-icon">❤️</span>
                        <span class="stat-value">${creature.hp}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⚔️</span>
                        <span class="stat-value">${creature.attack}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🛡️</span>
                        <span class="stat-value">${creature.defense}</span>
                    </div>
                </div>
            </div>
            
            <div class="creature-description">${creature.description}</div>
            
            <div class="creature-footer">
                <div class="creature-location">📍 ${creature.location}</div>
                <button class="view-details-btn">
                    <span>ℹ️</span>
                    DÉTAILS
                </button>
            </div>
        </div>
    `).join('');
    
    // Mettre à jour l'interface de pagination après le rendu
    updatePaginationUI();
}

// Filtrage des créatures
function filterCreatures() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const palierFilter = document.getElementById('palier-filter')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const levelFilter = document.getElementById('level-filter')?.value || '';
    const typeFilter = document.getElementById('type-filter')?.value || '';

    filteredCreatures = creaturesData.filter(creature => {
        const matchesSearch = creature.name.toLowerCase().includes(searchTerm) ||
                            creature.type.toLowerCase().includes(searchTerm) ||
                            creature.description.toLowerCase().includes(searchTerm);

        const matchesPalier = !palierFilter || creature.palier.toString() === palierFilter;
        const matchesCategory = !categoryFilter || creature.category === categoryFilter;
        const matchesType = !typeFilter || creature.type.toLowerCase() === typeFilter.toLowerCase();
        
        let matchesLevel = true;
        if (levelFilter) {
            const [min, max] = levelFilter.split('-').map(Number);
            matchesLevel = creature.level >= min && creature.level <= max;
        }

        return matchesSearch && matchesPalier && matchesCategory && matchesLevel && matchesType;
    });

    // Recalculer la pagination après filtrage
    currentPage = 1; // Reset à la première page
    calculatePagination();
    renderCreatures();
    updatePaginationUI();
}

// Ouverture du modal avec design amélioré
function openCreatureModal(creatureId) {
    const creature = creaturesData.find(c => c.id === creatureId);
    if (!creature) return;

    selectedCreature = creature;

    // Créer le modal s'il n'existe pas
    let modal = document.querySelector('.creature-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'creature-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            
            <div class="creature-modal-header">
                <div class="creature-modal-image">
                    <img src="${creature.image}" alt="${creature.name}" 
                         onerror="this.src='../assets/Logo_3.png'; this.className='fallback';">
                    <div class="creature-level-overlay">Niveau ${creature.level}</div>
                </div>
                <div class="creature-modal-info">
                    <h2 class="creature-name">${creature.name}</h2>
                    <div class="creature-badges">
                        <span class="badge badge-${creature.category}">${getCategoryDisplay(creature.category)}</span>
                        <span class="badge badge-type">${creature.type}</span>
                        <span class="badge badge-palier">Palier ${creature.palier}</span>
                    </div>
                </div>
            </div>
            
            <div class="creature-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">❤️</div>
                    <div class="stat-info">
                        <div class="stat-label">Points de Vie</div>
                        <div class="stat-value">${creature.hp}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚔️</div>
                    <div class="stat-info">
                        <div class="stat-label">Attaque</div>
                        <div class="stat-value">${creature.attack}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🛡️</div>
                    <div class="stat-info">
                        <div class="stat-label">Défense</div>
                        <div class="stat-value">${creature.defense}</div>
                    </div>
                </div>
            </div>
            
            <div class="creature-section">
                <h4 class="section-title">📖 Description</h4>
                <p class="section-content">${creature.description}</p>
            </div>
            
            <div class="creature-section">
                <h4 class="section-title">📍 Localisation</h4>
                <p class="section-content">${creature.location}</p>
            </div>
            
            <div class="creature-section">
                <h4 class="section-title">⚡ Capacités Spéciales</h4>
                <div class="abilities-grid">
                    ${creature.abilities.map(ability => `
                        <span class="ability-tag">✨ ${ability}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="creature-section">
                <h4 class="section-title">💰 Butin Possible</h4>
                <div class="drops-grid">
                    ${creature.drops.map(drop => `
                        <span class="drop-tag">🎁 ${drop}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fermeture du modal
function closeModal() {
    const modal = document.querySelector('.creature-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    selectedCreature = null;
}

// Utilitaires
function getCategoryDisplay(category) {
    const categories = {
        'boss': 'Boss',
        'elite': 'Élite',
        'creature': 'Créature'
    };
    return categories[category] || category;
}

// Export pour utilisation globale
window.openCreatureModal = openCreatureModal;