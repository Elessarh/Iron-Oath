#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script avancé pour corriger l'encodage avec détection automatique
"""

import os

# Fichiers à corriger
base_path = r'c:\Users\julie\OneDrive\Desktop\Iron-Oath'
files = [
    os.path.join(base_path, 'pages', 'quetes.html'),
    os.path.join(base_path, 'pages', 'espace-guilde.html'),
    os.path.join(base_path, 'pages', 'admin-dashboard.html'),
    os.path.join(base_path, 'pages', 'hdv.html'),
    os.path.join(base_path, 'pages', 'connexion.html'),
    os.path.join(base_path, 'index.html'),
    os.path.join(base_path, 'pages', 'map.html'),
    os.path.join(base_path, 'pages', 'profil.html'),
    os.path.join(base_path, 'pages', 'bestiaire.html'),
    os.path.join(base_path, 'pages', 'items.html'),
]

# Liste de remplacement simple mais complète
def fix_encoding(text):
    """Corriger l'encodage avec une seule passe de remplacement"""
    # Ces chaînes sont déjà en UTF-8 double-encodé, on les replace directement
    text = text.replace('QuÃªtes', 'Quêtes')
    text = text.replace('QuÃªte', 'Quête')
    text = text.replace('DÃ©connexion', 'Déconnexion')
    text = text.replace('DÃ©couvrez', 'Découvrez')
    text = text.replace('CatÃ©gorie', 'Catégorie')
    text = text.replace('catÃ©gories', 'catégories')
    text = text.replace('RaretÃ©', 'Rareté')
    text = text.replace('raretÃ©s', 'raretés')
    text = text.replace('trÃ©sors', 'trésors')
    text = text.replace('Ã©quipements', 'équipements')
    text = text.replace('immÃ©diat', 'immédiat')
    text = text.replace('Ã©lÃ©ments', 'éléments')
    text = text.replace('Ã©viter', 'éviter')
    text = text.replace('dÃ©faut', 'défaut')
    text = text.replace('connectÃ©', 'connecté')
    text = text.replace('masquÃ©', 'masqué')
    text = text.replace('supprimÃ©', 'supprimé')
    text = text.replace('Ã‰cran', 'Écran')
    text = text.replace('RÃ©initialiser', 'Réinitialiser')
    text = text.replace('trouvÃ©s', 'trouvés')
    text = text.replace('gÃ©nÃ©rÃ©es', 'générées')
    text = text.replace('PrÃ©cÃ©dent', 'Précédent')
    text = text.replace('NumÃ©ros', 'Numéros')
    text = text.replace('Ã©dition', 'édition')
    text = text.replace('crÃ©Ã©', 'créé')
    text = text.replace('SÃ©lectionner', 'Sélectionner')
    text = text.replace('Ã‰pÃ©e', 'Épée')
    text = text.replace('Ã©pique', 'épique')
    text = text.replace('LÃ©gendaire', 'Légendaire')
    text = text.replace('lÃ©gendaire', 'légendaire')
    text = text.replace('Ãªtre', 'être')
    text = text.replace('PropriÃ©tÃ©s', 'Propriétés')
    text = text.replace('propriÃ©tÃ©s', 'propriétés')
    text = text.replace('qualitÃ©', 'qualité')
    text = text.replace('supÃ©rieure', 'supérieure')
    text = text.replace('intÃ©ressantes', 'intéressantes')
    text = text.replace('capacitÃ©s', 'capacités')
    text = text.replace('GÃ©nÃ©rer', 'Générer')
    text = text.replace('Ã©couteurs', 'écouteurs')
    text = text.replace('Ã©vÃ©nements', 'événements')
    text = text.replace('prÃ©cÃ©dent', 'précédent')
    text = text.replace('crÃ©ature', 'créature')
    text = text.replace('crÃ©atures', 'créatures')
    text = text.replace('CrÃ©ature', 'Créature')
    text = text.replace('HumanoÃ¯de', 'Humanoïde')
    text = text.replace('BÃªte', 'Bête')
    text = text.replace('DÃ©mon', 'Démon')
    text = text.replace('Ã‰lÃ©mentaire', 'Élémentaire')
    text = text.replace('Ã©lÃ©mentaire', 'élémentaire')
    text = text.replace('ContrÃ´les', 'Contrôles')
    text = text.replace('contrÃ´le', 'contrôle')
    text = text.replace('BientÃ´t', 'Bientôt')
    text = text.replace('SÃ©lecteur', 'Sélecteur')
    text = text.replace('AccÃ©der', 'Accéder')
    text = text.replace('RÃ´le', 'Rôle')
    text = text.replace('EnvoyÃ©s', 'Envoyés')
    text = text.replace('PossÃ©dÃ©s', 'Possédés')
    text = text.replace('rÃ©servÃ©s', 'réservés')
    text = text.replace('MaÃ®tre', 'Maître')
    text = text.replace('Ã‰pÃ©iste', 'Épéiste')
    text = text.replace('CoordonnÃ©es', 'Coordonnées')
    text = text.replace('coordonnÃ©es', 'coordonnées')
    text = text.replace('RÃ©cupÃ©rez', 'Récupérez')
    text = text.replace('mystÃ©rieuse', 'mystérieuse')
    text = text.replace('PrÃ©requis', 'Prérequis')
    text = text.replace('premiÃ¨re', 'première')
    text = text.replace('aprÃ¨s', 'après')
    text = text.replace('DÃ©but', 'Début')
    text = text.replace('CathÃ©drale', 'Cathédrale')
    text = text.replace('TÃ©lÃ©porteur', 'Téléporteur')
    text = text.replace('tÃ©lÃ©porteur', 'téléporteur')
    text = text.replace('MatÃ©riaux', 'Matériaux')
    text = text.replace('matÃ©riaux', 'matériaux')
    text = text.replace('SpÃ©ciaux', 'Spéciaux')
    text = text.replace('PutrifiÃ©', 'Putrifié')
    text = text.replace('Ã©tape', 'étape')
    text = text.replace('Ã©tapes', 'étapes')
    text = text.replace('complÃ¨te', 'complète')
    text = text.replace('rÃ©compense', 'récompense')
    text = text.replace('injectÃ©', 'injecté')
    text = text.replace('gÃ©nÃ©rÃ©s', 'générés')
    text = text.replace('Ã‰lÃ©ments', 'Éléments')
    text = text.replace('Ã‰dition', 'Édition')
    text = text.replace('donnÃ©es', 'données')
    text = text.replace('quÃªtes', 'quêtes')
    text = text.replace('SystÃ¨me', 'Système')
    text = text.replace('optimisÃ©', 'optimisé')
    
    # Emojis
    text = text.replace('ðŸ—ºï¸', '🗺️')
    text = text.replace('ðŸ°', '🏰')
    text = text.replace('ðŸŽ›ï¸', '🎛️')
    text = text.replace('ðŸ"', '🔍')
    text = text.replace('ðŸ'¤', '👤')
    text = text.replace('ðŸ"§', '📧')
    text = text.replace('ðŸŽ–ï¸', '🎖️')
    text = text.replace('âš"ï¸', '⚔️')
    text = text.replace('ðŸ›¡ï¸', '🛡️')
    text = text.replace('ðŸ›ï¸', '🏛️')
    text = text.replace('â³', '⏳')
    text = text.replace('ðŸŒŸ', '🌟')
    text = text.replace('ðŸ"', '🔴')
    text = text.replace('ðŸ"µ', '🔵')
    text = text.replace('ðŸ'°', '💰')
    text = text.replace('ðŸ"‹', '📋')
    text = text.replace('ðŸ"œ', '📜')
    text = text.replace('ðŸ'Ž', '💎')
    text = text.replace('ðŸ"¬', '📬')
    text = text.replace('ðŸª', '🏪')
    text = text.replace('ðŸ"¢', '🔢')
    text = text.replace('ðŸ"…', '📅')
    text = text.replace('ðŸ'¾', '💾')
    text = text.replace('âœï¸', '✏️')
    text = text.replace('â­', '⭐')
    text = text.replace('âš ï¸', '⚠️')
    text = text.replace('Ã‰pique', 'Épique')
    text = text.replace('Ã©', 'é')
    text = text.replace('Ã¨', 'è')
    text = text.replace('Ã ', 'à')
    text = text.replace('Ã´', 'ô')
    text = text.replace('Ã®', 'î')
    text = text.replace('Å"', 'œ')
    
    return text

report = []
grand_total = 0

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    try:
        # Lire en UTF-8
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            original = f.read()
        
        # Corriger
        corrected = fix_encoding(original)
        
        # Compter les changements
        changes = sum(1 for a, b in zip(original, corrected) if a != b)
        
        if corrected != original:
            # Sauvegarder
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(corrected)
            report.append(f'✅ {os.path.basename(filepath)}: ~{changes} corrections')
            grand_total += changes
        else:
            report.append(f'ℹ️  {os.path.basename(filepath)}: Déjà correct')
    
    except Exception as e:
        report.append(f'❌ {os.path.basename(filepath)}: {str(e)}')

# Afficher le rapport
print('\n' + '='*70)
print('📊 RAPPORT FINAL DE CORRECTION UTF-8')
print('='*70)
for line in report:
    print(line)
print('='*70)
print(f'📈 TOTAL: ~{grand_total} corrections effectuées')
print('='*70 + '\n')
