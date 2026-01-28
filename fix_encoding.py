#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction des problèmes d'encodage UTF-8 dans les fichiers HTML
"""

import os

# Mapping des caractères mal encodés vers leur version correcte
replacements = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã®': 'î',
    'Ã§': 'ç',
    'Ã‰': 'É',
    'Ã€': 'À',
    'Å"': 'œ',
    "â€™": "'",
    'â€"': '—',
    'Ã‚': 'Â',
    'Ã«': 'ë',
    'Ã¯': 'ï',
    'Ãª': 'ê',
    'Ã¹': 'ù',
    'Ã‡': 'Ç',
    'Ãˆ': 'È',
    'ÃŠ': 'Ê',
    'Ã‹': 'Ë',
    'ÃŽ': 'Î',
    'Ã"': 'Ô',
    'Ã›': 'Û',
    'Ãœ': 'Ü',
    'â€œ': '"',
    'â€': '"',
    'â‚¬': '€',
    # Corrections pour les emojis mal encodés
    'ðŸ—ºï¸': '🗺️',
    'ðŸ°': '🏰',
    'ðŸŽ›ï¸': '🎛️',
    'ðŸ"': '🔍',
    'ðŸ'¤': '👤',
    'ðŸ"§': '📧',
    'ðŸŽ–ï¸': '🎖️',
    'âš"ï¸': '⚔️',
    'ðŸ›¡ï¸': '🛡️',
    'ðŸ›ï¸': '🏛️',
    'â³': '⏳',
    'ðŸŒŸ': '🌟',
    'ðŸ"': '🔴',
    'ðŸ"µ': '🔵',
    'ðŸ'°': '💰',
    'ðŸ"‹': '📋',
    'ðŸ"œ': '📜',
    'ðŸ'Ž': '💎',
    'ðŸ"¬': '📬',
    'ðŸª': '🏪',
    # Corrections spécifiques
    'QuÃªtes': 'Quêtes',
    'DÃ©connexion': 'Déconnexion',
    'Ã©lÃ©ments': 'éléments',
    'CatÃ©gories': 'Catégories',
    'RaretÃ©s': 'Raretés',
    'crÃ©ature': 'créature',
    'trÃ©sors': 'trésors',
    'MaÃ®tre': 'Maître',
    'Ã‰pÃ©iste': 'Épéiste',
    'immÃ©diat': 'immédiat',
    'masquÃ©': 'masqué',
    'connectÃ©': 'connecté',
    'supprimÃ©': 'supprimé',
    'BÃªte': 'Bête',
    'HumanoÃ¯de': 'Humanoïde',
    'Ã©lÃ©mentaire': 'élémentaire',
    'dÃ©faut': 'défaut',
    'Ã©viter': 'éviter',
    'DÃ©couvrez': 'Découvrez',
    'Ã©quipements': 'équipements',
    'catÃ©gories': 'catégories',
    'RaretÃ©': 'Rareté',
    'CatÃ©gorie': 'Catégorie',
    'crÃ©': 'créa',
    'Ã‰cran': 'Écran',
    'RÃ´le': 'Rôle',
    'AccÃ©der': 'Accéder',
    'CrÃ©ature': 'Créature',
    'DÃ©mon': 'Démon',
    'Ã‰lÃ©mentaire': 'Élémentaire',
    'BientÃ´t': 'Bientôt',
    'QuÃªte': 'Quête',
    'Ã©tape': 'étape',
    'rÃ©compense': 'récompense',
    'complÃ¨te': 'complète',
    'prÃ©': 'pré',
    'dÃ©': 'dé',
    'rÃ©': 'ré',
    'Ã©': 'é',
}

# Fichiers à traiter
base_path = r'c:\Users\julie\OneDrive\Desktop\Iron-Oath'
files = [
    os.path.join(base_path, 'index.html'),
    os.path.join(base_path, 'pages', 'map.html'),
    os.path.join(base_path, 'pages', 'connexion.html'),
    os.path.join(base_path, 'pages', 'profil.html'),
    os.path.join(base_path, 'pages', 'bestiaire.html'),
    os.path.join(base_path, 'pages', 'items.html'),
    os.path.join(base_path, 'pages', 'quetes.html'),
    os.path.join(base_path, 'pages', 'espace-guilde.html'),
    os.path.join(base_path, 'pages', 'admin-dashboard.html'),
    os.path.join(base_path, 'pages', 'hdv.html'),
]

report = []
total_files_processed = 0
total_files_corrected = 0
grand_total_replacements = 0

for filepath in files:
    if not os.path.exists(filepath):
        report.append(f'❌ {os.path.basename(filepath)}: Fichier non trouvé')
        continue
    
    try:
        # Lire le fichier - essayer différents encodages
        content = None
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    content = f.read()
                    break
            except:
                continue
        
        if content is None:
            raise Exception("Impossible de lire le fichier avec les encodages testés")
        
        original_content = content
        total_replacements = 0
        replacement_details = {}
        
        # Appliquer tous les remplacements
        for old, new in replacements.items():
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                total_replacements += count
                replacement_details[old] = count
        
        # Sauvegarder si des modifications ont été faites
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            report.append(f'✅ {os.path.basename(filepath)}: {total_replacements} remplacements effectués')
            if replacement_details:
                for old_char, count in sorted(replacement_details.items(), key=lambda x: x[1], reverse=True)[:5]:
                    report.append(f'   - "{old_char}" → "{replacements[old_char]}": {count}x')
            total_files_corrected += 1
            grand_total_replacements += total_replacements
        else:
            report.append(f'ℹ️  {os.path.basename(filepath)}: Aucun problème détecté')
        
        total_files_processed += 1
    
    except Exception as e:
        report.append(f'❌ {os.path.basename(filepath)}: Erreur - {str(e)}')

# Afficher le rapport
log_file = os.path.join(base_path, 'encoding_fix_report.txt')
with open(log_file, 'w', encoding='utf-8') as log:
    log.write('\n' + '='*70 + '\n')
    log.write('📊 RAPPORT DE CORRECTION D\'ENCODAGE UTF-8\n')
    log.write('='*70 + '\n\n')
    for line in report:
        log.write(line + '\n')
    log.write('\n' + '='*70 + '\n')
    log.write(f'📈 RÉSUMÉ:\n')
    log.write(f'   - Fichiers traités: {total_files_processed}\n')
    log.write(f'   - Fichiers corrigés: {total_files_corrected}\n')
    log.write(f'   - Total de remplacements: {grand_total_replacements}\n')
    log.write('='*70 + '\n')

print(f"Rapport enregistré dans: {log_file}")
print(f"Fichiers traités: {total_files_processed}, Fichiers corrigés: {total_files_corrected}, Total remplacements: {grand_total_replacements}")
