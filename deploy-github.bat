@echo off
echo.
echo ===================================================
echo  Iron Oath - Initialisation et Deploiement GitHub
echo ===================================================
echo.

echo [1/5] Verification de Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Git n'est pas installe ou pas dans le PATH
    echo Installez Git depuis: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✅ Git detecte

echo.
echo [2/5] Initialisation du repository Git...
if exist .git (
    echo Repository Git deja initialise
) else (
    git init
    echo ✅ Repository Git initialise
)

echo.
echo [3/5] Ajout de tous les fichiers...
git add .
echo ✅ Fichiers ajoutes

echo.
echo [4/5] Premier commit...
git commit -m "Initial commit - Iron Oath SAO Fan Site"
echo ✅ Commit cree

echo.
echo [5/5] Instructions pour GitHub:
echo.
echo 1. Allez sur https://github.com
echo 2. Cliquez sur "New repository"  
echo 3. Nommez-le "iron-oath"
echo 4. NE PAS cocher "Initialize with README"
echo 5. Cliquez "Create repository"
echo.
echo Ensuite, executez ces commandes:
echo.
echo git remote add origin https://github.com/VOTRE-USERNAME/iron-oath.git
echo git branch -M main
echo git push -u origin main
echo.
echo ===================================================
echo  ✅ Projet pret pour GitHub!
echo ===================================================
echo.
pause