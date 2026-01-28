/**
 * Système de cryptage léger pour les clés Supabase
 * Obfuscation simple pour éviter la lecture directe des clés
 */

// Fonction de décodage simple (Base64 seulement)
function decodeKey(encodedKey) {
    try {
        // Décoder le Base64 directement
        return atob(encodedKey);
    } catch (error) {
        console.error('❌ Erreur décodage clé:', error);
        return null;
    }
}

// Fonction d'encodage pour générer les clés cryptées (à utiliser en développement)
function encodeKey(plainKey) {
    try {
        // Rotation des caractères (+3)
        let rotated = '';
        for (let i = 0; i < plainKey.length; i++) {
            const char = plainKey.charAt(i);
            const code = char.charCodeAt(0);
            
            if (code >= 65 && code <= 90) { // A-Z
                rotated += String.fromCharCode(((code - 65 + 3) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                rotated += String.fromCharCode(((code - 97 + 3) % 26) + 97);
            } else if (code >= 48 && code <= 57) { // 0-9
                rotated += String.fromCharCode(((code - 48 + 3) % 10) + 48);
            } else {
                rotated += char;
            }
        }
        
        // Encoder en Base64
        return btoa(rotated);
    } catch (error) {
        console.error('❌ Erreur encodage clé:', error);
        return null;
    }
}

// Export des fonctions
window.decodeKey = decodeKey;
window.encodeKey = encodeKey;