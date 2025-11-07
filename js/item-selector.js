/* item-selector.js - Sélecteur d'items avec images pour HDV */

class ItemSelector {
    constructor() {
        this.itemsData = this.initializeItemsData();
        this.selectedItem = null;
        this.onItemSelected = null; // Callback function
    }

    // Données des items organisées par catégories
    initializeItemsData() {
        return {
            'armes': {
                name: '⚔️ Armes',
                items: [
                    { id: 'baton_sorcier_shaman', name: 'Bâton du Sorcier du Shaman', image: 'Armes/BatonduSorcierduShaman.png' }
                ]
            },
            'consommables': {
                name: '🧪 Consommables',
                items: [
                    { id: 'cle_foret', name: 'Clé de la Forêt', image: 'Consommables/Clédelaforêt.png' },
                    { id: 'cle_dechus', name: 'Clé des Déchus', image: 'Consommables/ClédesDechus.png' },
                    { id: 'cle_xal_zirith', name: 'Clé de Xal\'Zirith', image: 'Consommables/ClédeXalZirith.png' },
                    { id: 'cle_halloween', name: 'Clé Halloween', image: 'Consommables/CléHalloween.png' },
                    { id: 'cle_overall', name: 'Clé Overall', image: 'Consommables/CléOverall.png' },
                    { id: 'cristal_potion', name: 'Cristal de Potion', image: 'Consommables/CristaldePotion.png' },
                    { id: 'cristal_halloween', name: 'Cristal d\'Halloween', image: 'Consommables/CristalDHalloween.png' },
                    { id: 'cristal_soutien', name: 'Cristal du Soutien I', image: 'Consommables/CristalduSoutienI.png' },
                    { id: 'parchemin_maitrise', name: 'Parchemin de Maîtrise', image: 'Consommables/ParchemindeMaîtrise.png' },
                    { id: 'parchemin_reallocation', name: 'Parchemin de Réallocation', image: 'Consommables/ParchemindeRéallocation.png' },
                    { id: 'potion_mana', name: 'Potion de Mana', image: 'Consommables/PotiondeMana.png' },
                    { id: 'potion_mana_moyenne', name: 'Potion de Mana Moyenne', image: 'Consommables/Potion de Mana Moyenne.png' },
                    { id: 'potion_mana_superieur', name: 'Potion de Mana Supérieur', image: 'Consommables/Potion de Mana Supérieur.png' },
                    { id: 'potion_albal', name: 'Potion d\'Albal', image: 'Consommables/PotiondAlbal.png' },
                    { id: 'potion_vie_i', name: 'Potion de Vie I', image: 'Consommables/PotiondeVieI.png' },
                    { id: 'potion_vie_ii', name: 'Potion de Vie II', image: 'Consommables/PotiondeVieII.png' },
                    { id: 'potion_vie_iii', name: 'Potion de Vie III', image: 'Consommables/PotiondeVieIII.png' },
                    { id: 'potion_martyr', name: 'Potion du Martyr', image: 'Consommables/PotionduMartyr.png' },
                    { id: 'sandwich_nephantes', name: 'Sandwich de Nephantes', image: 'Consommables/SandwichdeNephantes.png' },
                    { id: 'viande_sanglier', name: 'Viande de Sanglier', image: 'Consommables/ViandedeSanglier.png' }
                ]
            },
            'ressources': {
                name: '🔧 Ressources',
                items: [
                    { id: 'aile_tenebreuse', name: 'Aile Ténébreuse', image: 'Ressources/AileTénébreuse.png' },
                    { id: 'bonbon_sucre', name: 'Bonbon Sucrée au Sucre', image: 'Ressources/BonbonSucréeauSucre.png' },
                    { id: 'brindille_enchantees', name: 'Brindille Enchantées', image: 'Ressources/BrindilleEnchantées.png' },
                    { id: 'buche_bouleau', name: 'Bûche de Bouleau', image: 'Ressources/BuchedeBouleau.png' },
                    { id: 'buche_chene', name: 'Bûche de Chêne', image: 'Ressources/BuchedeChêne.png' },
                    { id: 'carapace_ika', name: 'Carapace d\'Ika', image: 'Ressources/CarapacedIka.png' },
                    { id: 'carapace_requin', name: 'Carapace de Requin', image: 'Ressources/CarapcedeRequin.png' },
                    { id: 'cendre_sarcophage', name: 'Cendre de Sarcophage', image: 'Ressources/CendredeSarcophage.png' },
                    { id: 'coeur_arcanique', name: 'Coeur Arcanique', image: 'Ressources/CoeurArcanique.png' },
                    { id: 'coeur_bois', name: 'Coeur de Bois', image: 'Ressources/CoeurdeBois.png' },
                    { id: 'coeur_flammes', name: 'Coeur de Flammes', image: 'Ressources/CoeurdeFlammes.png' },
                    { id: 'coeur_nautherion', name: 'Coeur de Nautherion', image: 'Ressources/CoeurdeNautherion.png' },
                    { id: 'coeur_necrotique', name: 'Coeur Nécrotique', image: 'Ressources/CoeurNécrotique.png' },
                    { id: 'coeur_putrifie', name: 'Coeur Putrifié', image: 'Ressources/CoeurPutrifié.png' },
                    { id: 'corde_arc_sylvestre', name: 'Corde d\'arc Sylvestre', image: 'Ressources/CordedarcSylvestre.png' },
                    { id: 'corne_ebrechee', name: 'Corne Ébrechée', image: 'Ressources/CorneEbrechée.png' },
                    { id: 'criniere', name: 'Crinière', image: 'Ressources/Crinière.png' },
                    { id: 'cristal_corrompu', name: 'Cristal Corrompu', image: 'Ressources/CristalCorrompu.png' },
                    { id: 'crocs_loup', name: 'Crocs de Loup', image: 'Ressources/CrocsdeLoup.png' },
                    { id: 'debris_chair', name: 'Débris Putride de Chair', image: 'Ressources/DébrisPutridedeChair.png' },
                    { id: 'eclat_bois_magique', name: 'Éclat de Bois Magique', image: 'Ressources/EclatdeBoisMagique.png' },
                    { id: 'ecorce_titan', name: 'Écorce de Titan', image: 'Ressources/EcorcedeTitan.png' },
                    { id: 'ecorce_sylvestre', name: 'Écorce Sylvestre', image: 'Ressources/EcorceSylvestre.png' },
                    { id: 'essence_gorbel', name: 'Essence de Gorbel', image: 'Ressources/EssencedeGorbel.png' },
                    { id: 'essence_miasme', name: 'Essence de Miasme', image: 'Ressources/EssencedeMiasme.png' },
                    { id: 'fil_araignee', name: 'Fil d\'Araignée', image: 'Ressources/FildAraignée.png' },
                    { id: 'fil_araignee_renforce', name: 'Fil d\'Araignée Renforcé', image: 'Ressources/FildAraignéeRenforcé.png' },
                    { id: 'fourrure_loup', name: 'Fourrure de Loup', image: 'Ressources/FourruredeLoup.png' },
                    { id: 'fourrure_vide', name: 'Fourrure du Vide', image: 'Ressources/FourrureduVide.png' },
                    { id: 'fragment_jaune', name: 'Fragment Cassé Jaune', image: 'Ressources/FragmentCasséJaune.png' },
                    { id: 'fragment_rouge', name: 'Fragment Cassé Rouge', image: 'Ressources/FragmentCasséRouge.png' },
                    { id: 'fragment_violet', name: 'Fragments Cassé Violet', image: 'Ressources/FragmentsCasséViolet.png' },
                    { id: 'fragment_citrouille', name: 'Fragment de Citrouille', image: 'Ressources/FragmentdeCitrouille.png' },
                    { id: 'fragment_ame_ours', name: 'Fragment de l\'Âme de l\'Ours', image: 'Ressources/FragmentdelÂmedelOurs.png' },
                    { id: 'fragments_feuilles', name: 'Fragments de Feuilles', image: 'Ressources/FragmentsdeFeuilles.png' },
                    { id: 'gelee_slime', name: 'Gelée de Slime', image: 'Ressources/GeléedeSlime.png' },
                    { id: 'griffe_nocturne', name: 'Griffe Nocturne', image: 'Ressources/GriffeNocturne.png' },
                    { id: 'lingot_cramoisi', name: 'Lingot Cramoisi', image: 'Ressources/Lingot cramoisi.png' },
                    { id: 'lingot_cuivre', name: 'Lingot de Cuivre', image: 'Ressources/LingotdeCuivre.png' },
                    { id: 'lingot_fer', name: 'Lingot de Fer', image: 'Ressources/LingotdeFer.png' },
                    { id: 'lingot_metal_enchante', name: 'Lingot de métal enchanté', image: 'Ressources/Lingotdemétalenchanté.png' },
                    { id: 'lingot_ame_metal', name: 'Lingot d\'Âme de Métal', image: 'Ressources/LingotdÂmedeMétal.png' },
                    { id: 'minerai_cramoisi', name: 'Minerai Cramoisi', image: 'Ressources/Mineraicramoisi.png' },
                    { id: 'minerai_charbon', name: 'Minerai de Charbon', image: 'Ressources/MineraideCharbon.png' },
                    { id: 'minerai_cuivre', name: 'Minerai de Cuivre', image: 'Ressources/MineraideCuivre.png' },
                    { id: 'minerai_fer', name: 'Minerai de Fer', image: 'Ressources/MineraideFer.png' },
                    { id: 'mycelium_magique', name: 'Mycélium Magique', image: 'Ressources/MycéliumMagique.png' },
                    { id: 'noyau_slime', name: 'Noyau de Slime', image: 'Ressources/NoyaudeSlime.png' },
                    { id: 'os_squelette', name: 'Os de Squelette', image: 'Ressources/OsdeSquelette.png' },
                    { id: 'os_squelette_renforce', name: 'Os de Squelette Renforcé', image: 'Ressources/OsdeSqueletteRenforcé.png' },
                    { id: 'peau_sanglier', name: 'Peau de Sanglier', image: 'Ressources/Peau de Sanglier.png' },
                    { id: 'peau_glacial', name: 'Peau d\'ur Glacial', image: 'Ressources/PeaudurGlacial.png' },
                    { id: 'petite_bourse', name: 'Petite Bourse', image: 'Ressources/PetiteBourse.png' },
                    { id: 'piece_metal_enchante', name: 'Pièce de métal enchanté', image: 'Ressources/Piècedemétalenchanté.png' },
                    { id: 'piece_ame_metal', name: 'Pièce d\'Âme de Métal', image: 'Ressources/PiècedÂmedeMétal.png' },
                    { id: 'pousse_sylve', name: 'Pousse de Sylve', image: 'Ressources/PoussedeSylve.png' },
                    { id: 'poussiere_echo', name: 'Poussière d\'Echo Spectrale', image: 'Ressources/PoussièredEchoSpectrale.png' },
                    { id: 'poussiere_givre', name: 'Poussière de Givre', image: 'Ressources/PoussièredeGivre.png' },
                    { id: 'poussiere_os', name: 'Poussière d\'Os', image: 'Ressources/PoussièredOs.png' },
                    { id: 'racine_ancestrale', name: 'Racine Ancestrale', image: 'Ressources/RacineAncestrale.png' },
                    { id: 'spore_corrompu', name: 'Spore Corrompu', image: 'Ressources/SporeCorrompu.png' },
                    { id: 'tissu_araignee', name: 'Tissu d\'Araignée', image: 'Ressources/TissudAraignée.png' },
                    { id: 'tissu_maudit', name: 'Tissu Maudit', image: 'Ressources/TissuMaudit.png' },
                    { id: 'tissu_spectral', name: 'Tissu Spectral', image: 'Ressources/TissuSpectral.png' },
                    { id: 'venin_araignee', name: 'Venin d\'Araignée', image: 'Ressources/VenindAraignée.png' },
                    { id: 'voile_banshee', name: 'Voile de la Banshee', image: 'Ressources/VoiledelaBanshee.png' },
                    { id: 'ame_herald', name: 'Âme de l\'Herald', image: 'Ressources/ÂmedelHerald.png' },
                    { id: 'ame_ruines', name: 'Âme des ruines', image: 'Ressources/Âmedesruines.png' },
                    { id: 'ame_reaper', name: 'Âme du Reaper', image: 'Ressources/ÂmeduReaper.png' },
                    { id: 'ame_warden', name: 'Âme du Warden', image: 'Ressources/ÂmeduWarden.png' }
                ]
            }
        };
    }

    // Créer l'interface de sélection d'item
    createItemSelector() {
        const selector = document.createElement('div');
        selector.className = 'item-selector-modal';
        selector.innerHTML = `
            <div class="item-selector-overlay"></div>
            <div class="item-selector-content">
                <div class="item-selector-header">
                    <h3>🎒 Sélectionner un Item</h3>
                    <button class="close-selector">❌</button>
                </div>
                
                <div class="item-search">
                    <input type="text" placeholder="🔍 Rechercher un item..." class="item-search-input">
                </div>
                
                <div class="item-categories">
                    ${Object.entries(this.itemsData).map(([categoryId, category]) => `
                        <div class="item-category" data-category="${categoryId}">
                            <div class="category-header">
                                <h4>${category.name}</h4>
                                <span class="item-count">(${category.items.length} items)</span>
                            </div>
                            <div class="category-items">
                                ${category.items.map(item => `
                                    <div class="item-card" data-item-id="${item.id}" data-item-name="${item.name}" data-item-image="${item.image}">
                                        <div class="item-image">
                                            <img src="../assets/items/${item.image}" alt="${item.name}" 
                                                 onerror="this.src='../assets/items/default.png'">
                                        </div>
                                        <div class="item-name">${item.name}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="selector-actions">
                    <button class="cancel-selection">Annuler</button>
                    <button class="confirm-selection" disabled>Sélectionner cet Item</button>
                </div>
            </div>
        `;

        return selector;
    }

    // Ouvrir le sélecteur d'items
    open(callback) {
        this.onItemSelected = callback;
        const selector = this.createItemSelector();
        document.body.appendChild(selector);

        // Animation d'ouverture
        setTimeout(() => {
            selector.classList.add('active');
        }, 10);

        this.setupEventListeners(selector);
    }

    // Configuration des événements
    setupEventListeners(selector) {
        const overlay = selector.querySelector('.item-selector-overlay');
        const closeBtn = selector.querySelector('.close-selector');
        const cancelBtn = selector.querySelector('.cancel-selection');
        const confirmBtn = selector.querySelector('.confirm-selection');
        const searchInput = selector.querySelector('.item-search-input');
        const itemCards = selector.querySelectorAll('.item-card');

        // Fermeture du modal
        [overlay, closeBtn, cancelBtn].forEach(element => {
            element.addEventListener('click', () => this.close(selector));
        });

        // Recherche d'items
        searchInput.addEventListener('input', (e) => {
            this.filterItems(selector, e.target.value);
        });

        // Sélection d'items
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectItem(selector, card);
            });
        });

        // Confirmation de sélection
        confirmBtn.addEventListener('click', () => {
            if (this.selectedItem && this.onItemSelected) {
                this.onItemSelected(this.selectedItem);
                this.close(selector);
            }
        });
    }

    // Filtrer les items par recherche
    filterItems(selector, searchTerm) {
        const categories = selector.querySelectorAll('.item-category');
        const searchLower = searchTerm.toLowerCase();

        categories.forEach(category => {
            const items = category.querySelectorAll('.item-card');
            let visibleCount = 0;

            items.forEach(item => {
                const itemName = item.dataset.itemName.toLowerCase();
                const isVisible = itemName.includes(searchLower);
                
                item.style.display = isVisible ? 'flex' : 'none';
                if (isVisible) visibleCount++;
            });

            // Masquer la catégorie si aucun item visible
            category.style.display = visibleCount > 0 ? 'block' : 'none';
            
            // Mettre à jour le compteur
            const counter = category.querySelector('.item-count');
            if (searchTerm) {
                counter.textContent = `(${visibleCount} items trouvés)`;
            } else {
                const totalItems = category.querySelectorAll('.item-card').length;
                counter.textContent = `(${totalItems} items)`;
            }
        });
    }

    // Sélectionner un item
    selectItem(selector, card) {
        // Retirer la sélection précédente
        selector.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));
        
        // Sélectionner le nouvel item
        card.classList.add('selected');
        
        this.selectedItem = {
            id: card.dataset.itemId,
            name: card.dataset.itemName,
            image: card.dataset.itemImage
        };

        // Activer le bouton de confirmation
        const confirmBtn = selector.querySelector('.confirm-selection');
        confirmBtn.disabled = false;
        confirmBtn.textContent = `Sélectionner "${this.selectedItem.name}"`;
    }

    // Fermer le sélecteur
    close(selector) {
        selector.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(selector);
        }, 300);
    }
}

// Export de la classe
window.ItemSelector = ItemSelector;