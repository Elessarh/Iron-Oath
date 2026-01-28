/* map.js - Gestion de la carte du monde */

// Variables globales
let questLayers = null;
let map = null; // Variable globale pour la carte

// Groupes de couches pour organiser les marqueurs
const layerGroups = {
    questesSecondaires: L.layerGroup(),
    questesPrincipales: L.layerGroup(),
    donjons: L.layerGroup(),
    villes: L.layerGroup(),
    monstres: L.layerGroup(),
    marchands: L.layerGroup()
};

document.addEventListener('DOMContentLoaded', function() {
    // Système de coordonnées basé sur les points de référence fournis
    // Nord: X=2560, Z=85  |  Sud: X=2560, Z=5036  |  Ouest: X=85, Z=2560  |  Est: X=5036, Z=2560
    // 
    // Conversion pour Leaflet CRS.Simple:
    // X du jeu = lng dans Leaflet (85 à 5036)
    // Z du jeu = inversé dans Leaflet (Z=85 -> lat=5036, Z=5036 -> lat=85)
    // 
    // Bounds Leaflet: [[lat_min, lng_min], [lat_max, lng_max]]
    // lat_min = 85 (correspond à Z=5036 du jeu - Sud)
    // lat_max = 5036 (correspond à Z=85 du jeu - Nord)  
    // lng_min = 85 (correspond à X=85 du jeu - Ouest)
    // lng_max = 5036 (correspond à X=5036 du jeu - Est)
    const bounds = [[85, 85], [5036, 5036]];
    
    // Centre de la carte: X=2560, Z=2560 du jeu
    // En Leaflet: lat = 5121-2560 = 2561, lng = 2560
    const centerLat = 5121 - 2560; // 2561 dans Leaflet pour Z=2560 du jeu
    const centerLng = 2560;        // X=2560 du jeu
    
    // Initialisation de la carte Leaflet avec zoom ultra-précis
    map = L.map('game-map', {
        crs: L.CRS.Simple,
        minZoom: -6,    // Zoom out très éloigné pour vue d'ensemble complète
        maxZoom: 10,    // Zoom ULTRA rapproché pour voir les pixels individuels
        zoom: -3,       // Zoom initial (vue d'ensemble)
        center: [centerLat, centerLng], // Centre de la carte [lat_leaflet, lng_leaflet]
        zoomControl: true,
        attributionControl: false,
        // Limiter le déplacement aux bounds de la carte avec une marge élargie
        maxBounds: [[-1000, -1000], [6120, 6120]], // Marge très élargie pour le zoom extrême
        maxBoundsViscosity: 0.5, // Résistance réduite pour plus de liberté
        // Améliorer les performances pour le zoom extrême
        preferCanvas: false, // Désactiver canvas pour zoom pixel-parfait
        // Contrôle ultra-fin du déplacement et zoom
        zoomSnap: 0.05, // Incréments de zoom ultra-fins
        zoomDelta: 0.3, // Sensibilité molette plus fine
        wheelPxPerZoomLevel: 120, // Contrôle précis de la molette
        // Options avancées pour zoom élevé
        bounceAtZoomLimits: false,
        doubleClickZoom: 'center', // Double-clic pour centrer et zoomer
        boxZoom: true,  // Zoom par sélection rectangulaire
        keyboard: true, // Contrôles clavier
        scrollWheelZoom: true,
        touchZoom: true // Support tactile amélioré
    });
    
    // Charger l'image de la carte
    const imageOverlay = L.imageOverlay('../assets/carte.png', bounds);
    imageOverlay.addTo(map);
    
    // Fonction pour lire les paramètres URL et centrer la carte
    function checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const x = urlParams.get('x');
        const y = urlParams.get('y');
        
        // console.log('=== checkURLParams ===');
        // console.log('URL params:', { x, y });
        
        if (x && y) {
            // console.log('Processing URL params for quest coordinates');
            // Convertir les coordonnées du jeu vers Leaflet
            const gameX = parseInt(x);
            const gameZ = parseInt(y);
            const leafletCoords = gameToLeafletCoords(gameX, gameZ);
            
            // console.log('Converted coordinates:', { gameX, gameZ, leafletCoords });
            
            // Centrer la carte sur ces coordonnées avec un zoom approprié
            map.setView(leafletCoords, 4); // Zoom niveau 4 pour voir la quête clairement
            
            // Créer un marqueur temporaire pour mettre en évidence la position
            const highlightMarker = L.marker(leafletCoords, {
                icon: L.divIcon({
                    className: 'quest-highlight-marker',
                    html: `<div style="
                        background: #ff0080;
                        border: 3px solid #ffffff;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        box-shadow: 0 0 20px #ff0080;
                        animation: pulse 2s infinite;
                    "></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
            
            // Ajouter une popup pour indiquer les coordonnées
            const popup = L.popup()
                .setLatLng(leafletCoords)
                .setContent(`
                    <div style="text-align: center; color: #00a8ff; font-family: 'Orbitron', monospace;">
                        <strong>📍 Quête ciblée</strong><br>
                        <span style="color: #00ffff;">X: ${gameX}, Z: ${gameZ}</span><br>
                        <small style="color: #888;">Cliquez ailleurs pour fermer</small>
                    </div>
                `)
                .openOn(map);
            
            // Retirer le marqueur temporaire après 5 secondes
            setTimeout(() => {
                map.removeLayer(highlightMarker);
            }, 5000);
            
            // Nettoyer l'URL après avoir traité les paramètres
            const cleanURL = window.location.pathname;
            window.history.replaceState({}, document.title, cleanURL);
        }
    }
    
    // Ajuster la vue pour montrer toute la carte
    map.fitBounds(bounds, {
        padding: [20, 20] // Padding pour éviter que les bords touchent
    });

    // Affichage des coordonnées en temps réel avec précision pixel
    const coordController = L.control({position: 'bottomleft'});
    coordController.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'coord-display-live');
        div.innerHTML = `
            <div style="background: rgba(0,0,0,0.9); color: #00a8ff; padding: 10px; border-radius: 6px; font-family: 'Orbitron', monospace; font-size: 12px; min-width: 200px;">
                <div><strong>📍 Coordonnées Pixel:</strong></div>
                <div style="margin: 4px 0;">X: <span id="mouse-x" style="color: #00ffff; font-weight: bold;">-</span>, Z: <span id="mouse-y" style="color: #00ffff; font-weight: bold;">-</span></div>
                <div id="precision-indicator" style="font-size: 9px; color: #ff6b00; margin-bottom: 4px;">Précision: Standard</div>
                <div style="font-size: 10px; color: #888; margin-top: 4px;">
                    Zone: <span id="zone-info">Exploration</span>
                </div>
            </div>
        `;
        return div;
    };
    coordController.addTo(map);
    
    // Tracker le mouvement de la souris avec précision pixel
    map.on('mousemove', function(e) {
        const mouseX = document.getElementById('mouse-x');
        const mouseY = document.getElementById('mouse-y');
        const zoneInfo = document.getElementById('zone-info');
        
        if (mouseX && mouseY) {
            // Système de coordonnées corrigé selon les points de référence
            // Correspondance Leaflet -> Coordonnées du jeu :
            // e.latlng.lng = X (horizontal, 85 à 5036) ✅
            // e.latlng.lat = Y dans Leaflet, mais Z en jeu (vertical inversé)
            // 
            // Point de référence: Nord=Z:85, Sud=Z:5036
            // Dans Leaflet: Nord=lat:5036, Sud=lat:85 (inversé)
            // Donc: Z_jeu = 5121 - lat_leaflet (85+5036 = 5121)
            
            // Précision adaptée au niveau de zoom
            const currentZoom = map.getZoom();
            let precision = 0;
            
            if (currentZoom >= 6) {
                precision = 3; // Précision au millième de pixel pour zoom extrême
            } else if (currentZoom >= 3) {
                precision = 2; // Précision au centième pour zoom fort
            } else if (currentZoom >= 0) {
                precision = 1; // Précision au dixième pour zoom moyen
            }
            
            // X = directement e.latlng.lng (horizontal)
            const coordX = precision > 0 ? e.latlng.lng.toFixed(precision) : Math.round(e.latlng.lng);
            
            // Z = inversion pour corriger Nord/Sud
            // Leaflet lat=85 -> Z=5036 (Sud), Leaflet lat=5036 -> Z=85 (Nord)
            const gameZ = 5121 - e.latlng.lat;
            const coordZ = precision > 0 ? gameZ.toFixed(precision) : Math.round(gameZ);
            
            mouseX.textContent = coordX;
            mouseY.textContent = coordZ;
            
            // Mettre à jour l'indicateur de précision
            const precisionIndicator = document.getElementById('precision-indicator');
            if (precisionIndicator) {
                let precisionText = "";
                let precisionColor = "";
                
                if (currentZoom >= 8) {
                    precisionText = "🔬 ULTRA-PRÉCISION (Pixel parfait)";
                    precisionColor = "#ff0080";
                } else if (currentZoom >= 6) {
                    precisionText = "🔍 HAUTE PRÉCISION (Millième)";
                    precisionColor = "#ff6b00";
                } else if (currentZoom >= 3) {
                    precisionText = "📏 PRÉCISION FINE (Centième)";
                    precisionColor = "#ffaa00";
                } else if (currentZoom >= 0) {
                    precisionText = "📐 PRÉCISION NORMALE (Dixième)";
                    precisionColor = "#00ffff";
                } else {
                    precisionText = "🗺️ PRÉCISION STANDARD";
                    precisionColor = "#888888";
                }
                
                precisionIndicator.textContent = precisionText;
                precisionIndicator.style.color = precisionColor;
            }
            
            // Déterminer la zone basée sur les coordonnées corrigées
            if (zoneInfo) {
                let zone = "Terre Inconnue";
                
                // Utiliser les valeurs numériques pour la comparaison de zone
                const numX = parseFloat(coordX);
                const numZ = parseFloat(coordZ);
                
                // Définir des zones basées sur le nouveau système de coordonnées
                // Centre approximatif : X=2560, Z=2560
                if (numX >= 85 && numX <= 1700) {
                    if (numZ >= 85 && numZ <= 1700) {
                        zone = "Terres du Nord-Ouest";
                    } else if (numZ >= 1701 && numZ <= 3400) {
                        zone = "Plaines Centrales Ouest";
                    } else if (numZ >= 3401 && numZ <= 5036) {
                        zone = "Terres du Sud-Ouest";
                    }
                } else if (numX >= 1701 && numX <= 3400) {
                    if (numZ >= 85 && numZ <= 1700) {
                        zone = "Territoires du Nord";
                    } else if (numZ >= 1701 && numZ <= 3400) {
                        zone = "Cœur du Royaume";
                    } else if (numZ >= 3401 && numZ <= 5036) {
                        zone = "Terres du Sud";
                    }
                } else if (numX >= 3401 && numX <= 5036) {
                    if (numZ >= 85 && numZ <= 1700) {
                        zone = "Terres du Nord-Est";
                    } else if (numZ >= 1701 && numZ <= 3400) {
                        zone = "Plaines Centrales Est";
                    } else if (numZ >= 3401 && numZ <= 5036) {
                        zone = "Terres du Sud-Est";
                    }
                }
                
                // Ajouter l'indicateur de précision selon le zoom
                if (currentZoom >= 6) {
                    zone += " 🔬"; // Indicateur de précision maximale
                } else if (currentZoom >= 3) {
                    zone += " 🔍"; // Indicateur de haute précision
                }
                
                zoneInfo.textContent = zone;
            }
        }
    });
    
    // Tracker de zoom simple pour les événements
    function updateZoomDisplay() {
        // Fonction vide - plus de contrôles visuels de zoom
    }
    
    // Événements de zoom pour mettre à jour l'affichage
    map.on('zoomend', updateZoomDisplay);
    
    // Raccourcis clavier pour le zoom
    document.addEventListener('keydown', function(e) {
        // Seulement si la carte est focusée ou si aucun input n'est actif
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            switch(e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    map.zoomIn(0.5);
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    map.zoomOut(0.5);
                    break;
                case '0':
                    e.preventDefault();
                    map.fitBounds(bounds, { padding: [20, 20] });
                    break;
                case 'c':
                case 'C':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        map.setView([2560, 2560], 0);
                    }
                    break;
                case 'm':
                case 'M':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        map.setZoom(map.getMaxZoom());
                    }
                    break;
            }
        }
    });
    
    // Amélioration du zoom par molette avec accélération
    let zoomAcceleration = 1;
    let lastWheelTime = 0;
    
    map.getContainer().addEventListener('wheel', function(e) {
        const now = Date.now();
        const timeDelta = now - lastWheelTime;
        
        // Accélération du zoom si rotation rapide
        if (timeDelta < 100) {
            zoomAcceleration = Math.min(zoomAcceleration + 0.1, 2);
        } else {
            zoomAcceleration = 1;
        }
        
        lastWheelTime = now;
    });
    
    // Message d'aide au premier chargement
    setTimeout(function() {
        if (map.getZoom() === -3) { // Si toujours au zoom initial
            const helpTooltip = L.popup({
                closeButton: false,
                autoClose: true,
                autoPan: false,
                className: 'zoom-help-popup'
            })
            .setLatLng([2560, 2560])
            .setContent(`
                <div style="font-family: 'Orbitron', sans-serif; text-align: center;">
                    <strong style="color: #00a8ff;">🔍 Zoom Amélioré !</strong><br>
                    <small style="color: #888;">
                        Utilisez la molette pour zoomer<br>
                        ou les contrôles en haut à droite
                    </small>
                </div>
            `)
            .openOn(map);
            
            // Fermer automatiquement après 4 secondes
            setTimeout(() => {
                map.closePopup(helpTooltip);
            }, 4000);
        }
    }, 1500);
    
    // Initialiser l'affichage du zoom
    updateZoomDisplay();
    
    // ========================================
    // SYSTÈME DE QUÊTES SUR LA CARTE
    // ========================================
    
    // Définition des quêtes avec leurs coordonnées
    const questData = [
        // QUÊTE PRINCIPALE - Introduction (1-7)
        {
            id: 'quest-1',
            name: 'Parler au Maître Épéiste',
            type: 'principale',
            step: 1,
            coordinates: [1805, 4294],
            description: 'Commencez votre aventure - Point de spawn'
        },
        {
            id: 'quest-2', 
            name: 'Tuer 10 Sangliers',
            type: 'principale',
            step: 2,
            coordinates: [1797, 3633],
            description: 'Zone de chasse aux sangliers'
        },
        {
            id: 'quest-3',
            name: 'Parler à Abraham',
            type: 'principale', 
            step: 3,
            coordinates: [1808, 3649],
            description: 'Abraham vous attend'
        },
        {
            id: 'quest-4',
            name: 'Parler à la Vieille Mara',
            type: 'principale',
            step: 4,
            coordinates: [1560, 3411],
            description: 'Informations importantes'
        },
        {
            id: 'quest-5',
            name: 'Prendre la Rune',
            type: 'principale',
            step: 5,
            coordinates: [1421, 3092],
            description: 'Rune mystérieuse'
        },
        
        // BRANCHE 8.1 - Elma (Mizunari)
        {
            id: 'quest-8-1',
            name: 'Parler à Elma',
            type: 'principale',
            step: 8.1,
            coordinates: [3136, 3667],
            description: 'Quête d\'Elma - Mizunari'
        },
        {
            id: 'quest-8-1-2',
            name: 'Trouver Harrold',
            type: 'principale',
            step: 8.1,
            coordinates: [3326, 3787],
            description: 'Harrold vous attend'
        },
        {
            id: 'quest-8-1-5',
            name: 'Maître Épéiste (Cathédrale)',
            type: 'principale',
            step: 8.1,
            coordinates: [1839, 4530],
            description: 'Cathédrale'
        },
        {
            id: 'quest-8-1-6',
            name: 'Trouver Velka',
            type: 'principale',
            step: 8.1,
            coordinates: [2844, 2993],
            description: 'CastelBrume'
        },
        {
            id: 'quest-8-1-7',
            name: 'Parler à Eric',
            type: 'principale',
            step: 8.1,
            coordinates: [2864, 4491],
            description: 'Ruine Squelettique'
        },
        {
            id: 'quest-8-1-9',
            name: 'Téléporteur',
            type: 'principale',
            step: 8.1,
            coordinates: [2783, 4427],
            description: 'Utilisez le téléporteur'
        },
        {
            id: 'quest-8-1-10',
            name: 'Spectre Archiviste',
            type: 'principale',
            step: 8.1,
            coordinates: [2940, 4476],
            description: 'Saut requis'
        },
        {
            id: 'quest-8-1-13',
            name: 'Tuer Nasgul (Boss)',
            type: 'principale',
            step: 8.1,
            coordinates: [2821, 4439],
            description: 'Boss de fin de branche'
        },
        
        // BRANCHE 8.2 - Mine de Geldorak
        {
            id: 'quest-8-2-2',
            name: 'Parler à Neko',
            type: 'principale',
            step: 8.2,
            coordinates: [4297, 3890],
            description: 'Mine de Geldorak'
        },
        
        // SUITE PRINCIPALE (9-19)
        {
            id: 'quest-13',
            name: 'Homme Cagoulé',
            type: 'principale',
            step: 13,
            coordinates: [325, 3196],
            description: 'Homme mystérieux'
        },
        {
            id: 'quest-15',
            name: 'Parler à Catherine',
            type: 'principale',
            step: 15,
            coordinates: [2380, 2417],
            description: 'Labyrinthe'
        },
        {
            id: 'quest-16',
            name: 'Réparer le Sceau',
            type: 'principale',
            step: 16,
            coordinates: [3188, 4011],
            description: 'Archipel d\'Ika'
        },
        {
            id: 'quest-17',
            name: 'Ombre Mystérieuse',
            type: 'principale',
            step: 17,
            coordinates: [3188, 4011],
            description: 'Entité mystérieuse'
        },
        
        // TOLBANA (20-26)
        {
            id: 'quest-21',
            name: 'Parler à Mephisto',
            type: 'principale',
            step: 21,
            coordinates: [3200, 1458],
            description: 'Tolbana'
        },
        {
            id: 'quest-22',
            name: 'Rapport à Wali',
            type: 'principale',
            step: 22,
            coordinates: [3198, 1501],
            description: 'Retour à Wali'
        },
        {
            id: 'quest-23',
            name: 'Parler à Emy',
            type: 'principale',
            step: 23,
            coordinates: [3233, 1484],
            description: 'Livraison de ressources'
        },
        
        // VIRELUNE (26.1-28)
        {
            id: 'quest-26-1',
            name: 'Parler à Ramoon',
            type: 'principale',
            step: 26.1,
            coordinates: [1590, 1972],
            description: 'Virelune - Nouveau chapitre'
        },
        {
            id: 'quest-26-2',
            name: 'Parler à Malrik',
            type: 'principale',
            step: 26.2,
            coordinates: [3327, 1641],
            description: 'Tolbana'
        },
        {
            id: 'quest-27-1',
            name: 'Parler à Virel',
            type: 'principale',
            step: 27.1,
            coordinates: [1539, 1995],
            description: 'Virelune'
        },
        {
            id: 'quest-28',
            name: 'Suite avec Ramoon',
            type: 'principale',
            step: 28,
            coordinates: [1590, 1972],
            description: 'Après Léviathan'
        },
        
        // DONJON FINAL (29)
        {
            id: 'quest-29-1',
            name: 'Parler à Silrix',
            type: 'principale',
            step: 29.1,
            coordinates: [1015, 1185],
            description: 'Donjon Araignée Xal\'Zirith'
        },
        
        // QUÊTES SECONDAIRES - Ville de Départ
        {
            id: 'secondary-varn',
            name: 'Varn',
            type: 'secondaire',
            step: 'S',
            coordinates: [2800, 4297],
            description: '4 Fourrures Loup, 2 Éclats Bois, 1 Os Squelette'
        },
        {
            id: 'secondary-milla',
            name: 'Milla',
            type: 'secondaire',
            step: 'S',
            coordinates: [2207, 4187],
            description: '15 Fragments Feuilles, 2 Mycélium'
        },
        {
            id: 'secondary-inari',
            name: 'Inari',
            type: 'secondaire',
            step: 'S',
            coordinates: [1760, 4736],
            description: 'Full armure Ika'
        },
        {
            id: 'secondary-orin',
            name: 'Orin',
            type: 'secondaire',
            step: 'S',
            coordinates: [1745, 4724],
            description: '5 Minerais Fer, 5 Corde Arc'
        },
        {
            id: 'secondary-rikyu',
            name: 'Rikyu',
            type: 'secondaire',
            step: 'S',
            coordinates: [1500, 4315],
            description: '25 Fragments Feuilles, 8 Fleur Allium'
        },
        {
            id: 'secondary-bunta',
            name: 'Bunta',
            type: 'secondaire',
            step: 'S',
            coordinates: [1500, 4328],
            description: '5 Éclats Bois, 5 Poussière Os, 3 Noyau Silme'
        },
        {
            id: 'secondary-meiko',
            name: 'Meiko',
            type: 'secondaire',
            step: 'S',
            coordinates: [1273, 4308],
            description: '5 Tissus Araignée, 3 Cuir Usé'
        },
        {
            id: 'secondary-saria',
            name: 'Saria',
            type: 'secondaire',
            step: 'S',
            coordinates: [1274, 4317],
            description: '50 Gelées Silme, 10 Minerais Fer'
        },
        {
            id: 'secondary-tilda',
            name: 'Tilda',
            type: 'secondaire',
            step: 'S',
            coordinates: [1883, 4010],
            description: '1 Arc Courbé'
        },
        {
            id: 'secondary-lila',
            name: 'Lila',
            type: 'secondaire',
            step: 'S',
            coordinates: [1878, 3992],
            description: '1 Cœur de Bois'
        },
        
        // QUÊTES SECONDAIRES - Hanaka
        {
            id: 'secondary-genzo',
            name: 'Genzo',
            type: 'secondaire',
            step: 'S',
            coordinates: [1532, 3376],
            description: '6 Crocs Loup, 2 Éclats Bois - Hanaka'
        },
        {
            id: 'secondary-bartok',
            name: 'Bartok',
            type: 'secondaire',
            step: 'S',
            coordinates: [1526, 3377],
            description: '25 Peaux Sanglier, 25 Crocs Loup - Hanaka'
        },
        {
            id: 'secondary-greta',
            name: 'Greta',
            type: 'secondaire',
            step: 'S',
            coordinates: [1438, 3407],
            description: '15 Fleurs Allium, 5 Fils Araignée - Hanaka'
        },
        {
            id: 'secondary-therra',
            name: 'Sœur Therra',
            type: 'secondaire',
            step: 'S',
            coordinates: [1406, 3435],
            description: '20 Gelées Silme, 1 Essence Corbel - Hanaka'
        },
        {
            id: 'secondary-toban',
            name: 'Toban',
            type: 'secondaire',
            step: 'S',
            coordinates: [1356, 3441],
            description: '5 Écorces Titan, 2 Mycélium - Hanaka'
        },
        {
            id: 'secondary-rina',
            name: 'Rina',
            type: 'secondaire',
            step: 'S',
            coordinates: [1502, 3533],
            description: '4 Fleurs Allium, 2 Gelées Silme - Hanaka'
        },
        {
            id: 'secondary-maya',
            name: 'Maya',
            type: 'secondaire',
            step: 'S',
            coordinates: [1500, 3560],
            description: '8 Brindilles Enchantées, 2 Gelée Silme - Hanaka'
        },
        
        // QUÊTES SECONDAIRES - Mizunari
        {
            id: 'secondary-michelle',
            name: 'Michelle',
            type: 'secondaire',
            step: 'S',
            coordinates: [3131, 3666],
            description: '10 Fragments Feuilles - Mizunari'
        },
        {
            id: 'secondary-martine',
            name: 'Martine',
            type: 'secondaire',
            step: 'S',
            coordinates: [3150, 3672],
            description: '16 Épis Sauvages - Mizunari'
        },
        {
            id: 'secondary-elwyn',
            name: 'Elwyn',
            type: 'secondaire',
            step: 'S',
            coordinates: [3111, 3703],
            description: '10 Écorces, 10 Brindilles, 3 Racines - Mizunari'
        },
        {
            id: 'secondary-louise',
            name: 'Louise',
            type: 'secondaire',
            step: 'S',
            coordinates: [3147, 3704],
            description: '10 Lingots Cuivre - Mizunari'
        },
        {
            id: 'secondary-phares',
            name: 'Phares',
            type: 'secondaire',
            step: 'S',
            coordinates: [3149, 3714],
            description: '20 Bloches Bois - Mizunari'
        },
        
        // QUÊTES SECONDAIRES - Jardin des Géants
        {
            id: 'secondary-zebulgarath',
            name: 'Zebulgarath',
            type: 'secondaire',
            step: 'S',
            coordinates: [372, 2477],
            description: '3 Racines Ancestrales - Jardin des Géants'
        },
        
        // QUÊTES SECONDAIRES - Valhatt
        {
            id: 'secondary-saya',
            name: 'Saya',
            type: 'secondaire',
            step: 'S',
            coordinates: [492, 3028],
            description: '4 Tissus Spectral, 3 Brindilles - Valhatt'
        },
        {
            id: 'secondary-ayaka',
            name: 'Ayaka',
            type: 'secondaire',
            step: 'S',
            coordinates: [479, 3013],
            description: '25 Pousses Sylves, 5 Mycélium - Valhatt'
        },
        {
            id: 'secondary-daiki',
            name: 'Daiki',
            type: 'secondaire',
            step: 'S',
            coordinates: [430, 3046],
            description: '4 Peaux Sanglier, 2 Crocs Albal - Valhatt'
        },
        
        // QUÊTES SECONDAIRES - Camp Militaire
        {
            id: 'secondary-jean',
            name: 'Jean',
            type: 'secondaire',
            step: 'S',
            coordinates: [3225, 2891],
            description: '40 Bloches Chêne, 20 Minerais Fer - Camp Militaire'
        },
        {
            id: 'secondary-corentin',
            name: 'Corentin',
            type: 'secondaire',
            step: 'S',
            coordinates: [3291, 2905],
            description: '64 Bloches Chêne - Camp Militaire'
        },
        {
            id: 'secondary-fira',
            name: 'Fira',
            type: 'secondaire',
            step: 'S',
            coordinates: [3396, 2947],
            description: '1 Éclat Glacial, 3 Poussières Os - Camp Militaire'
        },
        
        // QUÊTES SECONDAIRES - Candelia
        {
            id: 'secondary-yannis',
            name: 'Yannis',
            type: 'secondaire',
            step: 'S',
            coordinates: [2014, 834],
            description: '32 Bûches bois - Candelia'
        },
        {
            id: 'secondary-gilmar',
            name: 'Gilmar',
            type: 'secondaire',
            step: 'S',
            coordinates: [1959, 791],
            description: '10 Éclats Glacial, 5 Fragments Violet - Candelia'
        },
        {
            id: 'secondary-tomoko',
            name: 'Tomoko',
            type: 'secondaire',
            step: 'S',
            coordinates: [1955, 814],
            description: '20 Écorce Sylvestre, 5 Racines - Candelia'
        },
        {
            id: 'secondary-pierre',
            name: 'Pierre',
            type: 'secondaire',
            step: 'S',
            coordinates: [2018, 877],
            description: '20 Buches Bois - Candelia'
        },
        {
            id: 'secondary-romeo',
            name: 'Roméo',
            type: 'secondaire',
            step: 'S',
            coordinates: [1991, 832],
            description: '16 Peaux Cerf Montagnes - Candelia'
        },
        {
            id: 'secondary-emilie',
            name: 'Émilie',
            type: 'secondaire',
            step: 'S',
            coordinates: [1984, 753],
            description: '20 Épis Blé - Candelia'
        },
        
        // QUÊTES SECONDAIRES - Virelune
        {
            id: 'secondary-juliette',
            name: 'Juliette',
            type: 'secondaire',
            step: 'S',
            coordinates: [1565, 1968],
            description: '16 Bûches Chêne, 16 Bûches Bouleau - Virelune'
        },
        {
            id: 'secondary-luc',
            name: 'Luc',
            type: 'secondaire',
            step: 'S',
            coordinates: [1624, 1852],
            description: '3 Pioches Félés - Virelune'
        },
        {
            id: 'secondary-sam',
            name: 'Sam',
            type: 'secondaire',
            step: 'S',
            coordinates: [1600, 2006],
            description: 'Tuer 20 Araignées - Virelune'
        },
        {
            id: 'secondary-monique',
            name: 'Monique',
            type: 'secondaire',
            step: 'S',
            coordinates: [1563, 2000],
            description: 'Tuer 10 Requins - Virelune'
        },
        
        // QUÊTES SECONDAIRES - SVF (Sans Village Fixe)
        {
            id: 'secondary-gilbert',
            name: 'Gilbert',
            type: 'secondaire',
            step: 'S',
            coordinates: [1700, 1018],
            description: '15 Tissus Spectral - SVF'
        },
        {
            id: 'secondary-horace',
            name: 'Horace',
            type: 'secondaire',
            step: 'S',
            coordinates: [3084, 1913],
            description: '12 Cuirs Usé, 8 Peaux Cerf - SVF'
        },
        {
            id: 'secondary-haruto',
            name: 'Haruto',
            type: 'secondaire',
            step: 'S',
            coordinates: [1868, 2112],
            description: '30 Gelées Silme, 25 Carapaces Requin - SVF'
        }
    ];

    // Données des villes
    const villesData = [
        {
            id: 'ville-depart',
            name: 'Ville de départ',
            coordinates: [1800, 4297],
            description: 'Point de départ de votre aventure'
        },
        {
            id: 'hanaka',
            name: 'Hanaka',
            coordinates: [1531, 3423],
            description: 'Ville prospère au cœur du royaume'
        },
        {
            id: 'mizunari',
            name: 'Mizunari',
            coordinates: [3138, 3684],
            description: 'Cité portuaire animée'
        },
        {
            id: 'tolbana',
            name: 'Tolbana',
            coordinates: [3306, 1603],
            description: 'Ville fortifiée du nord'
        },
        {
            id: 'virelune',
            name: 'Virelune',
            coordinates: [1617, 1958],
            description: 'Village mystique sous la lune'
        },
        {
            id: 'valhat',
            name: 'Valhat',
            coordinates: [500, 3059],
            description: 'Avant-poste de l\'ouest'
        }
    ];

    // Données des donjons
    const donjonsData = [
        {
            id: 'donjon-geldorak',
            name: 'Donjon de Geldorak',
            coordinates: [4270, 3891],
            description: 'Donjon redoutable gardé par Geldorak'
        },
        {
            id: 'donjon-ruine',
            name: 'Donjon Ruine',
            coordinates: [2783, 4427],
            description: 'Ruines anciennes pleines de mystères'
        },
        {
            id: 'donjon-labyrinthe',
            name: 'Donjon Le Labyrinthe',
            coordinates: [2384, 2417],
            description: 'Labyrinthe complexe et dangereux'
        },
        {
            id: 'donjon-xalzirith',
            name: 'Donjon de Xal\'Zirith',
            coordinates: [1015, 1185],
            description: 'Donjon sombre de Xal\'Zirith'
        },
        {
            id: 'donjon-kobold',
            name: 'Donjon Kobold',
            coordinates: [3412, 1080],
            description: 'Territoire des Kobolds agressifs'
        }
    ];

    // Données des marchands
    const marchandsData = [
        {
            id: 'marchand-depart',
            name: 'Marchand de départ',
            coordinates: [1788, 4162],
            description: 'Marchand général pour les débutants'
        },
        {
            id: 'marchand-outils',
            name: 'Marchand d\'outils',
            coordinates: [1812, 4162],
            description: 'Spécialisé dans les outils et équipements'
        },
        {
            id: 'forgeron-armure-depart',
            name: 'Forgeron d\'armure',
            coordinates: [1764, 4126],
            description: 'Forge des armures de qualité'
        },
        {
            id: 'forgeron-arme-depart',
            name: 'Forgeron d\'arme',
            coordinates: [1775, 4134],
            description: 'Maître forgeron d\'armes'
        },
        {
            id: 'marchand-mizunari',
            name: 'Marchand de Mizunari',
            coordinates: [3130, 3703],
            description: 'Marchand de la cité portuaire'
        },
        {
            id: 'marchand-tolbana',
            name: 'Marchand de Tolbana',
            coordinates: [3317, 1640],
            description: 'Marchand de la ville fortifiée'
        },
        {
            id: 'marchand-donjon-ruine',
            name: 'Marchand Donjon Ruine',
            coordinates: [2833, 4707],
            description: 'Marchand près des ruines'
        },
        {
            id: 'forgeron-arme-tolbana',
            name: 'Forgeron d\'arme',
            coordinates: [3236, 1483],
            description: 'Forgeron d\'armes de Tolbana'
        },
        {
            id: 'forgeron-armure-tolbana',
            name: 'Forgeron d\'armure',
            coordinates: [3236, 1483],
            description: 'Forgeron d\'armures de Tolbana'
        },
        {
            id: 'forgeron-donjon',
            name: 'Forgeron Donjon',
            coordinates: [2413, 2375],
            description: 'Forgeron spécialisé près du donjon'
        }
    ];

    // Données des zones de monstres
    const monstresData = [
        {
            id: 'zone-sanglier',
            name: 'Zone Sanglier',
            coordinates: [1866, 3575],
            description: 'Territoire des sangliers sauvages'
        },
        {
            id: 'vallee-loups',
            name: 'Vallée des Loups',
            coordinates: [2504, 3815],
            description: 'Vallée hantée par les loups'
        },
        {
            id: 'ruines-maudites',
            name: 'Ruines Maudites',
            coordinates: [2825, 4450],
            description: 'Ruines peuplées de créatures maudites'
        },
        {
            id: 'archipel-ika',
            name: 'Archipel d\'Ika',
            coordinates: [3304, 4105],
            description: 'Îles mystérieuses d\'Ika'
        },
        {
            id: 'montagnes-bandits',
            name: 'Montagnes des Bandits',
            coordinates: [4152, 3910],
            description: 'Repaire des bandits de montagne'
        },
        {
            id: 'bois-sacree',
            name: 'Bois Sacrée',
            coordinates: [1287, 3155],
            description: 'Forêt sacrée où apparaissent les Tréants'
        },
        {
            id: 'marecage-putride',
            name: 'Marécage putride',
            coordinates: [299, 3200],
            description: 'Marécage infecté et dangereux'
        },
        {
            id: 'champ-nephantes',
            name: 'Champ de Néphantes',
            coordinates: [3374, 3763],
            description: 'Champs hantés par les Néphantes'
        },
        {
            id: 'foret-noir',
            name: 'Forêt Noir',
            coordinates: [1314, 1343],
            description: 'Forêt sombre et menaçante'
        },
        {
            id: 'atlantide',
            name: 'Atlantide',
            coordinates: [1369, 1940],
            description: 'Cité engloutie d\'Atlantide'
        },
        {
            id: 'montagne-cerfs',
            name: 'Montagne des Cerfs',
            coordinates: [4109, 1133],
            description: 'Montagnes paisibles des cerfs'
        },
        {
            id: 'citadelle-glace',
            name: 'Citadelle de Glace',
            coordinates: [3995, 2012],
            description: 'Forteresse de glace éternelle'
        }
    ];
    
    // Groupe de couches pour les quêtes
    questLayers = L.layerGroup();
    questLayers.addTo(map);
    
    // Créer les icônes personnalisées pour les quêtes
    // Détecter si on est dans le dossier pages/ ou à la racine
    const basePath = window.location.pathname.includes('/pages/') ? '../assets/map_assets/' : './assets/map_assets/';
    const cacheBuster = '?v=20260128';
    
    const questSecondaryIcon = L.icon({
        iconUrl: basePath + 'Quetes-Secondaires.png' + cacheBuster,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
    
    const questMainIcon = L.icon({
        iconUrl: basePath + 'Quetes-Principales.png' + cacheBuster,
        iconSize: [40, 40], // Plus grande pour les quêtes principales
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    // Icônes pour les villes
    const villeIcon = L.icon({
        iconUrl: basePath + 'Ville.png' + cacheBuster,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });

    // Icônes pour les donjons
    const donjonIcon = L.icon({
        iconUrl: basePath + 'Donjon.png' + cacheBuster,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
    });

    // Icônes pour les marchands
    const marchandIcon = L.icon({
        iconUrl: basePath + 'Marchand.png' + cacheBuster,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17]
    });

    // Icônes pour les zones de monstres
    const monstreIcon = L.icon({
        iconUrl: basePath + 'Monstre.png' + cacheBuster,
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5],
        popupAnchor: [0, -17.5]
    });
    
    // Fonction pour convertir les coordonnées du jeu vers Leaflet
    function gameToLeafletCoords(gameX, gameZ) {
        // X reste identique, Z est inversé
        return [5121 - gameZ, gameX];
    }
    
    // Fonction pour regrouper les quêtes par coordonnées identiques
    function groupQuestsByCoordinates(quests) {
        const grouped = {};
        
        quests.forEach(quest => {
            const key = `${quest.coordinates[0]}_${quest.coordinates[1]}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(quest);
        });
        
        return grouped;
    }
    
    // Créer les marqueurs de quêtes
    function createQuestMarkers() {
        const groupedQuests = groupQuestsByCoordinates(questData);
        
        Object.values(groupedQuests).forEach(questGroup => {
            const quest = questGroup[0]; // Prendre la première quête du groupe
            const leafletCoords = gameToLeafletCoords(quest.coordinates[0], quest.coordinates[1]);
            
            // Choisir l'icône selon le type de quête
            const icon = quest.type === 'principale' ? questMainIcon : questSecondaryIcon;
            
            // Créer le marqueur avec les options de type pour le système de toggles
            const marker = L.marker(leafletCoords, { 
                icon: icon,
                questType: quest.type // Ajouter le type pour l'organisation des couches
            });
            
            // Créer le contenu du popup
            let popupContent = '';
            
            if (questGroup.length === 1) {
                // Une seule quête à cette position
                const q = questGroup[0];
                popupContent = `
                    <div class="quest-popup">
                        <div class="quest-header ${q.type}">
                            <strong>${q.type === 'principale' ? '⭐' : '📜'} ${q.name}</strong>
                        </div>
                        <div class="quest-details">
                            <p><strong>Type:</strong> ${q.type === 'principale' ? 'Quête Principale' : 'Quête Secondaire'}</p>
                            <p><strong>Étape:</strong> ${q.step}</p>
                            <p><strong>Coordonnées:</strong> X:${q.coordinates[0]}, Z:${q.coordinates[1]}</p>
                            <p class="quest-description">${q.description}</p>
                        </div>
                        <div class="quest-actions">
                            <button onclick="openQuestPage()" class="quest-btn">📋 Voir toutes les quêtes</button>
                        </div>
                    </div>
                `;
            } else {
                // Plusieurs quêtes à la même position
                popupContent = `
                    <div class="quest-popup multi-quest">
                        <div class="quest-header">
                            <strong>🏹 Plusieurs Quêtes (${questGroup.length})</strong>
                        </div>
                        <div class="quest-list">
                `;
                
                questGroup.forEach(q => {
                    popupContent += `
                        <div class="quest-item ${q.type}">
                            <span class="quest-icon">${q.type === 'principale' ? '⭐' : '📜'}</span>
                            <span class="quest-name">${q.name}</span>
                            <span class="quest-step">Étape ${q.step}</span>
                        </div>
                    `;
                });
                
                popupContent += `
                        </div>
                        <div class="quest-details">
                            <p><strong>Coordonnées:</strong> X:${quest.coordinates[0]}, Z:${quest.coordinates[1]}</p>
                        </div>
                        <div class="quest-actions">
                            <button onclick="openQuestPage()" class="quest-btn">📋 Voir toutes les quêtes</button>
                        </div>
                    </div>
                `;
            }
            
            marker.bindPopup(popupContent, {
                minWidth: 300,
                maxWidth: 400,
                className: 'quest-marker-popup'
            });
            
            // Ajouter le marqueur au groupe de quêtes
            questLayers.addLayer(marker);
        });
    }
    
    // Créer les marqueurs de quêtes
    createQuestMarkers();

    // Fonction pour créer les marqueurs de villes
    function createVilleMarkers() {
        // console.log(`🏰 Creating ${villesData.length} ville markers`);
        villesData.forEach(ville => {
            const leafletCoords = gameToLeafletCoords(ville.coordinates[0], ville.coordinates[1]);
            
            const marker = L.marker(leafletCoords, { 
                icon: villeIcon
            });

            const popupContent = `
                <div class="location-popup ville">
                    <div class="location-header">
                        <strong>🏰 ${ville.name}</strong>
                    </div>
                    <div class="location-details">
                        <p><strong>Type:</strong> Ville</p>
                        <p><strong>Coordonnées:</strong> X:${ville.coordinates[0]}, Z:${ville.coordinates[1]}</p>
                        <p class="location-description">${ville.description}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            layerGroups.villes.addLayer(marker);
        });
    }

    // Fonction pour créer les marqueurs de donjons
    function createDonjonMarkers() {
        // console.log(`⚔️ Creating ${donjonsData.length} donjon markers`);
        donjonsData.forEach(donjon => {
            const leafletCoords = gameToLeafletCoords(donjon.coordinates[0], donjon.coordinates[1]);
            
            const marker = L.marker(leafletCoords, { 
                icon: donjonIcon
            });

            const popupContent = `
                <div class="location-popup donjon">
                    <div class="location-header">
                        <strong>⚔️ ${donjon.name}</strong>
                    </div>
                    <div class="location-details">
                        <p><strong>Type:</strong> Donjon</p>
                        <p><strong>Coordonnées:</strong> X:${donjon.coordinates[0]}, Z:${donjon.coordinates[1]}</p>
                        <p class="location-description">${donjon.description}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            layerGroups.donjons.addLayer(marker);
        });
    }

    // Fonction pour créer les marqueurs de marchands
    function createMarchandMarkers() {
        // console.log(`🛒 Creating ${marchandsData.length} marchand markers`);
        marchandsData.forEach(marchand => {
            const leafletCoords = gameToLeafletCoords(marchand.coordinates[0], marchand.coordinates[1]);
            
            const marker = L.marker(leafletCoords, { 
                icon: marchandIcon
            });

            const popupContent = `
                <div class="location-popup marchand">
                    <div class="location-header">
                        <strong>💰 ${marchand.name}</strong>
                    </div>
                    <div class="location-details">
                        <p><strong>Type:</strong> Marchand</p>
                        <p><strong>Coordonnées:</strong> X:${marchand.coordinates[0]}, Z:${marchand.coordinates[1]}</p>
                        <p class="location-description">${marchand.description}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            layerGroups.marchands.addLayer(marker);
        });
    }

    // Fonction pour créer les marqueurs de zones de monstres
    function createMonstreMarkers() {
        // console.log(`👹 Creating ${monstresData.length} monstre markers`);
        monstresData.forEach(zone => {
            const leafletCoords = gameToLeafletCoords(zone.coordinates[0], zone.coordinates[1]);
            
            const marker = L.marker(leafletCoords, { 
                icon: monstreIcon
            });

            const popupContent = `
                <div class="location-popup monstre">
                    <div class="location-header">
                        <strong>👹 ${zone.name}</strong>
                    </div>
                    <div class="location-details">
                        <p><strong>Type:</strong> Zone de Monstres</p>
                        <p><strong>Coordonnées:</strong> X:${zone.coordinates[0]}, Z:${zone.coordinates[1]}</p>
                        <p class="location-description">${zone.description}</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            layerGroups.monstres.addLayer(marker);
        });
    }

    // Créer tous les marqueurs
    // console.log('🚀 Creating all markers...');
    createQuestMarkers();
    // console.log('✅ Quest markers created');
    createVilleMarkers();
    // console.log('✅ Ville markers created');
    createDonjonMarkers();
    // console.log('✅ Donjon markers created');
    createMarchandMarkers();
    // console.log('✅ Marchand markers created');
    createMonstreMarkers();
    // console.log('✅ Monstre markers created');
    
    // Organiser les marqueurs de quêtes par type et initialiser les toggles
    // console.log('📋 Organizing markers into groups...');
    organizeMarkersIntoGroups();
    // console.log('🎛️ Initializing toggles...');
    initializeToggles();
    
    // Vérifier les paramètres URL pour centrer sur une quête spécifique
    checkURLParams();
});

// Fonction globale pour ouvrir la page des quêtes
function openQuestPage() {
    window.location.href = 'quetes.html';
}

// ==========================================
// SYSTÈME DE TOGGLES POUR VISIBILITÉ
// ==========================================

// Variables pour stocker les marqueurs
let questesMarkers = [];
let questesSecondairesMarkers = [];

// Fonction pour réorganiser les marqueurs existants dans les groupes
function organizeMarkersIntoGroups() {
    // Les marqueurs de quêtes sont déjà dans questLayers
    // On va réorganiser par type
    questLayers.eachLayer(function(marker) {
        if (marker.options && marker.options.questType) {
            if (marker.options.questType === 'principale') {
                layerGroups.questesPrincipales.addLayer(marker);
            } else {
                layerGroups.questesSecondaires.addLayer(marker);
            }
        }
    });
    
    // Retirer le questLayers original puisqu'on utilise maintenant les groupes séparés
    if (map.hasLayer(questLayers)) {
        map.removeLayer(questLayers);
    }
    
    // Ajouter tous les layerGroups à la carte (ils seront visibles par défaut)
    Object.values(layerGroups).forEach(layerGroup => {
        if (layerGroup.getLayers().length > 0) {
            layerGroup.addTo(map);
        }
    });
    
    // Logs de débogage
    // console.log('=== Debug LayerGroups ===');
    Object.entries(layerGroups).forEach(([name, layerGroup]) => {
        // console.log(`${name}: ${layerGroup.getLayers().length} marqueurs`);
    });
}

// Fonction de gestion des toggles
function initializeToggles() {
    const toggles = {
        'toggle-quetes-secondaires': layerGroups.questesSecondaires,
        'toggle-quetes-principales': layerGroups.questesPrincipales,
        'toggle-donjons': layerGroups.donjons,
        'toggle-villes': layerGroups.villes,
        'toggle-monstres': layerGroups.monstres,
        'toggle-marchands': layerGroups.marchands
    };
    
    Object.entries(toggles).forEach(([toggleId, layerGroup]) => {
        const toggle = document.getElementById(toggleId);
        const label = document.querySelector(`label[for="${toggleId}"]`);
        
        if (toggle) {
            // S'assurer que tous les toggles sont cochés par défaut
            toggle.checked = true;
            
            // Fonction pour gérer le toggle
            const handleToggle = function() {
                // Forcer l'état de la checkbox si elle n'a pas changé
                const isChecked = toggle.checked;
                // console.log(`🔘 Toggle ${toggleId} -> ${isChecked ? 'ON' : 'OFF'}`);
                
                if (isChecked) {
                    if (!map.hasLayer(layerGroup)) {
                        layerGroup.addTo(map);
                        // console.log(`✅ Added ${toggleId} to map (${layerGroup.getLayers().length} markers)`);
                    }
                } else {
                    if (map.hasLayer(layerGroup)) {
                        map.removeLayer(layerGroup);
                        // console.log(`❌ Removed ${toggleId} from map (${layerGroup.getLayers().length} markers)`);
                    }
                }
            };
            
            // Écouter les événements sur la checkbox
            toggle.addEventListener('change', handleToggle);
            toggle.addEventListener('click', handleToggle);
            
            // Écouter aussi les clics sur le label
            if (label) {
                label.addEventListener('click', function(e) {
                    // Laisser le comportement par défaut du label, puis traiter
                    setTimeout(handleToggle, 10);
                });
            }
        } else {
            // console.warn(`Toggle element with ID "${toggleId}" not found`);
        }
    });
    
    // Log de débogage pour vérifier que la fonction est appelée
    // console.log('=== initializeToggles() completed ===');
    
    // Test direct : forcer l'affichage de tous les layers
    // console.log('=== Force adding all layers to map ===');
    Object.entries(toggles).forEach(([name, layerGroup]) => {
        if (layerGroup.getLayers().length > 0 && !map.hasLayer(layerGroup)) {
            layerGroup.addTo(map);
            // console.log(`🔧 Force added ${name} to map`);
        }
    });
    
    // Gestion du bouton admin (exemple - peut être étendu)
    const adminBtn = document.querySelector('.admin-toggle-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            alert('Fonctionnalité admin à venir...');
        });
    }
}

// Fin du DOMContentLoaded principal
