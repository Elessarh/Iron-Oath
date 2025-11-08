@echo off
echo 🚀 TEST DE LA PAGE À PROPOS IRON OATH
echo =====================================
echo.
echo 📋 Vérification des fichiers...
echo.

REM Vérifier que les fichiers existent
if exist "pages\about.html" (
    echo ✅ pages\about.html - Page À Propos créée
) else (
    echo ❌ pages\about.html - MANQUANT
)

if exist "assets\Logo_3.png" (
    echo ✅ assets\Logo_3.png - Logo présent
) else (
    echo ❌ assets\Logo_3.png - MANQUANT
)

if exist "js\link-checker.js" (
    echo ✅ js\link-checker.js - Script de vérification créé
) else (
    echo ❌ js\link-checker.js - MANQUANT
)

echo.
echo 🧪 Tests à effectuer manuellement :
echo.
echo 1. Ouvrir index.html dans le navigateur
echo 2. Cliquer sur le logo Iron Oath
echo 3. Vérifier la redirection vers la page À Propos
echo 4. Appuyer sur F12 et taper : fullLinkCheck()
echo 5. Tester la navigation depuis toutes les pages
echo.
echo 📹 Vérifications spécifiques :
echo - La vidéo YouTube s'affiche et se lance
echo - Le design est responsive
echo - Tous les liens du menu fonctionnent
echo.
echo 🎯 Démarrage du test...
start "" "index.html"
echo.
echo ✅ Test démarré ! Suivez les instructions ci-dessus.
pause