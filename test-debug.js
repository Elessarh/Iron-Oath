console.log('=== Test de syntaxe auth-supabase.js ===');
try {
    // Test simple pour vérifier que le script peut être chargé
    console.log('Test 1: Script chargé sans erreurs');
    
    // Test de la fonction de connexion si elle existe
    if (typeof checkAuthState === 'function') {
        console.log('Test 2: Fonction checkAuthState accessible');
    } else {
        console.log('Test 2: ÉCHEC - Fonction checkAuthState non accessible');
    }
    
    // Test des boutons
    const loginBtn = document.getElementById('login-link');
    if (loginBtn) {
        console.log('Test 3: Bouton login trouvé');
        console.log('Style display:', loginBtn.style.display);
        console.log('Classes:', loginBtn.className);
    } else {
        console.log('Test 3: ÉCHEC - Bouton login non trouvé');
    }
    
} catch (error) {
    console.error('ERREUR dans le test:', error);
}