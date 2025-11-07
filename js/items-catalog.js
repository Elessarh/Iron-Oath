/* Catalogue d'items Iron Oath - Version Simplifiée */

// Catalogue complet des items (basé sur les vraies images disponibles)
const itemsCatalog = {
    "Accessoires": [
        {
            id: "anneau_faucheuse",
            name: "Anneau de la Faucheuse",
            image: "../assets/items/Accessoires/AnneaudelaFaucheuse.png",
            category: "Accessoires",
            rarity: "legendary",
            description: "Un anneau sombre imprégné de la puissance de la Faucheuse. Confère une aura terrifiante à son porteur.",
            stats: {
                "Dégâts": "+25",
                "Vitesse d'attaque": "+15%",
                "Effet de peur": "20%"
            },
            source: "Boss: La Faucheuse (Palier 3)",
            price: 5000
        },
        {
            id: "anneau_leviathan",
            name: "Anneau de Léviathan",
            image: "../assets/items/Accessoires/AnneaudeLéviathan.png",
            category: "Accessoires",
            rarity: "epic",
            description: "Forgé dans les abysses marins, cet anneau octroie la maîtrise des eaux.",
            stats: {
                "Résistance à l'eau": "+50%",
                "Régénération MP": "+10/s",
                "Nage": "+100%"
            },
            source: "Donjon: Abysses de Léviathan",
            price: 3500
        },
        {
            id: "anneau_pacte",
            name: "Anneau de Pacte",
            image: "../assets/items/Accessoires/Anneaudepacte.png",
            category: "Accessoires",
            rarity: "rare",
            description: "Sceau d'un pacte ancien entre les éléments. Augmente l'affinité magique.",
            stats: {
                "Magie": "+20",
                "Résistance magique": "+25%",
                "Coût MP": "-10%"
            },
            source: "Quête: Le Pacte Élémentaire",
            price: 2000
        },
        {
            id: "collier_aragorn",
            name: "Collier de Aragorn",
            image: "../assets/items/Accessoires/CollierdeAragorn.png",
            category: "Accessoires",
            rarity: "legendary",
            description: "Collier royal porté par le légendaire roi Aragorn. Octroie noblesse et charisme.",
            stats: {
                "Charisme": "+30",
                "Leadership": "+25%",
                "Résistance aux sorts": "+20%"
            },
            source: "Quête légendaire: L'Héritage du Roi",
            price: 8000
        }
    ],
    "Armes": [
        {
            id: "baton_sorcier_shaman",
            name: "Bâton du Sorcier du Shaman",
            image: "../assets/items/Armes/BatonduSorcierduShaman.png",
            category: "Armes",
            rarity: "legendary",
            description: "Bâton ancestral des shamans, capable de canaliser les esprits de la nature.",
            stats: {
                "Dégâts magiques": "+45",
                "Invocation": "+25%",
                "Régénération MP": "+15/s",
                "Sorts de nature": "+30%"
            },
            source: "Boss: Grand Shaman des Esprits",
            price: 8000
        }
    ],
    "Consommables": [
        {
            id: "cle_foret",
            name: "Clé de la Forêt",
            image: "../assets/items/Consommables/Clédelaforêt.png",
            category: "Consommables",
            rarity: "rare",
            description: "Clé mystique qui ouvre les portails secrets de la grande forêt d'Aincrad.",
            stats: {
                "Utilisation unique": "Oui",
                "Portails débloqués": "Forêt Mystique"
            },
            source: "Donjon: Coeur de la Forêt",
            price: 1500
        },
        {
            id: "cle_dechus",
            name: "Clé des Déchus",
            image: "../assets/items/Consommables/ClédesDechus.png",
            category: "Consommables",
            rarity: "epic",
            description: "Clé forgée dans les flammes de l'enfer, permettant d'accéder aux terres maudites.",
            stats: {
                "Utilisation unique": "Oui",
                "Zone débloquée": "Terres des Déchus"
            },
            source: "Boss: Gardien des Déchus",
            price: 3000
        },
        {
            id: "potion_vie_1",
            name: "Potion de Vie I",
            image: "../assets/items/Consommables/PotiondeVieI.png",
            category: "Consommables",
            rarity: "common",
            description: "Potion basique qui restaure une petite quantité de points de vie.",
            stats: {
                "Restauration HP": "+100",
                "Cooldown": "5s"
            },
            source: "Alchimie niveau 10",
            price: 50
        },
        {
            id: "potion_vie_2",
            name: "Potion de Vie II",
            image: "../assets/items/Consommables/PotiondeVieII.png",
            category: "Consommables",
            rarity: "uncommon",
            description: "Potion améliorée qui restaure une quantité modérée de points de vie.",
            stats: {
                "Restauration HP": "+250",
                "Cooldown": "8s"
            },
            source: "Alchimie niveau 30",
            price: 150
        },
        {
            id: "potion_vie_3",
            name: "Potion de Vie III",
            image: "../assets/items/Consommables/PotiondeVieIII.png",
            category: "Consommables",
            rarity: "rare",
            description: "Potion puissante qui restaure une grande quantité de points de vie.",
            stats: {
                "Restauration HP": "+500",
                "Cooldown": "10s"
            },
            source: "Alchimie niveau 50",
            price: 300
        },
        {
            id: "potion_mana",
            name: "Potion de Mana",
            image: "../assets/items/Consommables/PotiondeMana.png",
            category: "Consommables",
            rarity: "common",
            description: "Élixir magique qui restaure l'énergie spirituelle du mage.",
            stats: {
                "Restauration MP": "+150",
                "Cooldown": "5s"
            },
            source: "Alchimie niveau 15",
            price: 75
        }
    ],
    "Ressources": [
        {
            id: "lingot_fer",
            name: "Lingot de Fer",
            image: "../assets/items/Ressources/LingotdeFer.png",
            category: "Ressources",
            rarity: "common",
            description: "Lingot de fer pur, matériau de base pour la forge d'équipements.",
            stats: {
                "Qualité": "Standard",
                "Durabilité": "+10"
            },
            source: "Forge: Minerai de Fer",
            price: 25
        },
        {
            id: "lingot_cuivre",
            name: "Lingot de Cuivre",
            image: "../assets/items/Ressources/LingotdeCuivre.png",
            category: "Ressources",
            rarity: "common",
            description: "Lingot de cuivre, utilisé pour les créations d'alchimie et d'artisanat.",
            stats: {
                "Conductivité": "+15",
                "Résistance à la corrosion": "Élevée"
            },
            source: "Forge: Minerai de Cuivre",
            price: 20
        },
        {
            id: "coeur_arcanique",
            name: "Coeur Arcanique",
            image: "../assets/items/Ressources/CoeurArcanique.png",
            category: "Ressources",
            rarity: "epic",
            description: "Cristal pulsant d'énergie magique pure, composant rare pour les objets enchantés.",
            stats: {
                "Énergie magique": "+50",
                "Stabilité": "Élevée"
            },
            source: "Boss: Archimage Corrompue",
            price: 2500
        },
        {
            id: "essence_miasme",
            name: "Essence de Miasme",
            image: "../assets/items/Ressources/EssencedeMiasme.png",
            category: "Ressources",
            rarity: "rare",
            description: "Essence corrompue extraite des créatures des ombres. Dangereuse mais puissante.",
            stats: {
                "Corruption": "+25",
                "Puissance sombre": "+30"
            },
            source: "Créatures: Miasmes des Marais",
            price: 800
        }
    ],
    "Armures": [
        {
            id: "armure_placeholder",
            name: "Armure Mystérieuse",
            image: "../assets/items/default.png",
            category: "Armures",
            rarity: "rare",
            description: "Une armure légendaire dont les secrets restent à découvrir. Bientôt disponible !",
            stats: {
                "Défense": "+?",
                "Mystère": "100%"
            },
            source: "À venir...",
            price: null
        }
    ],
    "Familiers": [
        {
            id: "familier_placeholder",
            name: "Familier Mystérieux",
            image: "../assets/items/default.png",
            category: "Familiers",
            rarity: "epic",
            description: "Un compagnon fidèle dont l'apparence reste un mystère. Bientôt révélé !",
            stats: {
                "Loyauté": "100%",
                "Mystère": "Maximum"
            },
            source: "À venir...",
            price: null
        }
    ],
    "Montures": [
        {
            id: "monture_placeholder",
            name: "Monture Légendaire",
            image: "../assets/items/default.png",
            category: "Montures",
            rarity: "legendary",
            description: "Une monture extraordinaire qui vous mènera vers de nouveaux horizons !",
            stats: {
                "Vitesse": "+?%",
                "Mystère": "Infini"
            },
            source: "Quête épique à venir",
            price: null
        }
    ],
    "Outils": [
        {
            id: "outil_placeholder",
            name: "Outil Ancien",
            image: "../assets/items/default.png",
            category: "Outils",
            rarity: "uncommon",
            description: "Un outil d'artisan dont les capacités seront bientôt dévoilées.",
            stats: {
                "Efficacité": "+?",
                "Potentiel": "Élevé"
            },
            source: "Artisanat avancé",
            price: null
        }
    ],
    "Runes": [
        {
            id: "rune_placeholder",
            name: "Rune Primordiale",
            image: "../assets/items/default.png",
            category: "Runes",
            rarity: "epic",
            description: "Une rune ancienne contenant des pouvoirs mystiques incommensurables.",
            stats: {
                "Pouvoir magique": "+?",
                "Ancienneté": "Millénaire"
            },
            source: "Ruines anciennes",
            price: null
        }
    ]
};

// Fonction pour obtenir tous les objets dans un format plat
function getAllItems() {
    const allItems = [];
    Object.keys(itemsCatalog).forEach(category => {
        itemsCatalog[category].forEach(item => {
            allItems.push(item);
        });
    });
    return allItems;
}

// Fonction pour rechercher des objets
function searchItems(query) {
    const allItems = getAllItems();
    if (!query) return allItems;
    
    return allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
}

// Fonction pour obtenir les objets par catégorie
function getItemsByCategory(category) {
    if (category === 'all') return getAllItems();
    return itemsCatalog[category] || [];
}