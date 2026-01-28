#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script spécifique pour corriger quetes.html et les autres fichiers HTML restants
"""

import os
import re

# Mapping complet des caractères mal encodés
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
    'Ã±': 'ñ',
    'Ã'': 'Ñ',
}

# Fichiers restants à traiter
base_path = r'c:\Users\julie\OneDrive\Desktop\Iron-Oath'
files = [
    os.path.join(base_path, 'pages', 'quetes.html'),
    os.path.join(base_path, 'pages', 'espace-guilde.html'),
    os.path.join(base_path, 'pages', 'admin-dashboard.html'),
    os.path.join(base_path, 'pages', 'hdv.html'),
    os.path.join(base_path, 'pages', 'connexion.html'),
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f'❌ {os.path.basename(filepath)}: Fichier non trouvé')
        continue
    
    try:
        # Lire le fichier en UTF-8
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        total_replacements = 0
        
        # Appliquer tous les remplacements
        for old, new in replacements.items():
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                total_replacements += count
        
        # Sauvegarder si des modifications ont été faites
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ {os.path.basename(filepath)}: {total_replacements} remplacements')
        else:
            print(f'ℹ️  {os.path.basename(filepath)}: Déjà corrigé')
    
    except Exception as e:
        print(f'❌ {os.path.basename(filepath)}: Erreur - {str(e)}')

print('\nTerminé !')
