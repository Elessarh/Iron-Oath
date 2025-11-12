# Système de Présence Quotidienne - Récapitulatif

## ✅ Modifications effectuées

### 1. Base de données (SQL)
**Fichier**: `supabase_guilde_setup.sql`
- ✅ Ajout fonction `mark_automatic_absences()` - Marque automatiquement les absents
- ✅ Ajout fonction `get_presence_stats()` - Statistiques de présence
- ✅ Table `guild_presence` déjà existante avec contrainte UNIQUE(user_id, date_presence)

### 2. Interface Espace Guilde
**Fichier**: `pages/espace-guilde.html`
- ✅ Ajout bouton "Marquer ma présence" (vert)
- ✅ Ajout bouton "Déclarer une absence" (rouge)
- ✅ Section "Appel Quotidien" avec affichage des présences

**Fichier**: `css/components/guilde.css`
- ✅ Styles pour les boutons d'appel (présent/absent)
- ✅ Styles pour les cartes de présence (couleurs par statut)
- ✅ Responsive design

**Fichier**: `js/espace-guilde.js`
- ✅ Fonction `markPresence(statut)` - Gère présence ET absence
- ✅ Possibilité de changer son statut dans la journée
- ✅ Affichage temps réel de qui est présent/absent
- ✅ Tous les membres voient les présences des autres

### 3. Dashboard Admin
**Fichier**: `pages/admin-dashboard.html`
- ✅ Section "Appel Quotidien - Aujourd'hui"
- ✅ Statistiques en temps réel (Présents/Absents/En mission)
- ✅ Tableau détaillé avec: Pseudo, Classe, Niveau, Statut, Heure
- ✅ Styles CSS intégrés pour la section présences

**Fichier**: `js/admin-dashboard.js`
- ✅ Fonction `loadPresences()` - Charge les présences du jour
- ✅ Affichage "Non marqué" pour ceux qui n'ont rien déclaré
- ✅ Mise à jour des statistiques automatique

### 4. Documentation
**Fichier**: `GUIDE_PRESENCE_AUTOMATIQUE.md`
- ✅ Guide complet de configuration du cron job
- ✅ 3 options de déploiement (Supabase Edge, Serveur externe, Webhook)
- ✅ Tests et dépannage
- ✅ Personnalisation et exemples

## 🎯 Fonctionnalités implémentées

### Pour les Membres
1. **Marquer présence**: Bouton vert "Marquer ma présence"
2. **Déclarer absence**: Bouton rouge "Déclarer une absence"
3. **Changer d'avis**: Peut modifier son statut pendant la journée
4. **Voir les autres**: Liste complète des membres avec leur statut

### Pour les Admins
1. **Tableau de bord**: Section dédiée aux présences du jour
2. **Statistiques**: Compteurs Présents/Absents/En mission
3. **Détails**: Tableau avec tous les membres et leur heure de marquage
4. **Statut "Non marqué"**: Voir qui n'a encore rien déclaré

### Automatisation
1. **Fonction SQL**: `mark_automatic_absences()` prête à l'emploi
2. **Cron Job**: À configurer via Supabase ou serveur externe
3. **Heure**: 01:00 chaque jour (configurable)
4. **Logique**: Marque "absent" uniquement ceux qui n'ont rien déclaré

## 📋 Statuts possibles

| Statut | Badge | Description |
|--------|-------|-------------|
| `present` | 🟢 Vert | Membre présent (marqué manuellement) |
| `absent` | 🔴 Rouge | Membre absent (marqué manuellement ou automatiquement) |
| `en_mission` | 🟠 Orange | Membre en mission (futur développement) |
| `non-marque` | ⚪ Gris | Pas encore marqué (visible admin uniquement) |

## 🔄 Workflow quotidien

### Scénario 1: Membre marque sa présence à 18:00
1. Membre clique "Marquer ma présence"
2. Statut = "present" enregistré avec heure 18:00
3. À 01:00 le lendemain: Aucune action (déjà marqué)
4. Nouveau jour: Statut vide, doit re-marquer

### Scénario 2: Membre déclare absence à 20:00
1. Membre clique "Déclarer une absence"
2. Statut = "absent" enregistré avec heure 20:00
3. À 01:00 le lendemain: Aucune action (déjà marqué)
4. Nouveau jour: Statut vide

### Scénario 3: Membre ne fait rien
1. Aucune action du membre
2. À 01:00: Fonction automatique s'exécute
3. Statut = "absent" avec commentaire "Absence automatique - non marque"
4. Nouveau jour: Statut vide

### Scénario 4: Membre change d'avis
1. Membre clique "Marquer ma présence" à 18:00 → statut "present"
2. Membre clique "Déclarer une absence" à 22:00 → statut MAJ à "absent"
3. Possibilité de changer autant de fois dans la journée
4. Seul le dernier statut est conservé

## 🚀 Prochaines étapes

### Obligatoire
1. **Configurer le cron job** (voir GUIDE_PRESENCE_AUTOMATIQUE.md)
2. **Tester la fonction** manuellement dans Supabase
3. **Vérifier les policies RLS** sur guild_presence

### Optionnel
- Ajouter notifications Discord/Email
- Historique des présences sur 30 jours
- Statistiques par membre
- Export CSV
- Système de "En mission" avec détails

## 🧪 Tests à effectuer

1. ✅ Membre peut marquer présence
2. ✅ Membre peut déclarer absence
3. ✅ Membre peut changer son statut
4. ✅ Admin voit le tableau des présences
5. ✅ Statistiques s'actualisent
6. ⏳ Fonction automatique à 01:00 (à configurer)
7. ⏳ Pas de doublons (contrainte UNIQUE)
8. ⏳ Tous les membres voient les autres

## 📝 Notes techniques

- **Timezone**: UTC par défaut, configurer selon besoin
- **Réinitialisation**: Chaque jour à 01:00 (configurable)
- **Contrainte**: 1 seule entrée par user/jour (pas de doublons)
- **Visibilité**: Tous les membres/admins voient toutes les présences
- **Modification**: Possible de changer son statut le même jour
- **Historique**: Les anciennes présences sont conservées (date_presence)

## 🎨 Aperçu visuel

### Espace Guilde
```
┌─────────────────────────────────────┐
│ Appel Quotidien                     │
├─────────────────────────────────────┤
│ [Marquer ma présence] [Absence]     │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │test1 │ │alice │ │bob   │         │
│ │🟢    │ │🔴    │ │🟢    │         │
│ │Présent│ │Absent│ │Présent│       │
│ └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

### Dashboard Admin
```
┌────────────────────────────────────────────┐
│ Appel Quotidien - Aujourd'hui              │
│ Présents: 5 | Absents: 2 | En mission: 1  │
├────────────────────────────────────────────┤
│ Pseudo  │ Classe │ Niveau │ Statut │ Heure│
├─────────┼────────┼────────┼────────┼──────┤
│ test1   │ Mage   │ 45     │ 🟢     │ 18:30│
│ alice   │ Shaman │ 32     │ 🔴     │ 20:15│
│ bob     │ Archer │ 28     │ ⚪     │ -    │
└────────────────────────────────────────────┘
```

## ✨ Fonctionnalités bonus implémentées

1. **Update du statut**: Un membre peut corriger son erreur
2. **Statistiques live**: Dashboard admin mis à jour en temps réel
3. **Pas de spam**: Contrainte UNIQUE empêche les doublons
4. **Labels clairs**: "Non marqué" au lieu de vide
5. **Heures affichées**: Voir quand chacun a marqué sa présence

## 🔒 Sécurité

- ✅ RLS activé sur guild_presence
- ✅ Membres peuvent créer leur propre présence uniquement
- ✅ Membres peuvent modifier leur présence du jour uniquement
- ✅ Membres peuvent lire toutes les présences
- ✅ Admins ont accès total
- ✅ Fonction `mark_automatic_absences()` avec SECURITY DEFINER

## 📞 Support

En cas de problème:
1. Vérifier les logs de la console navigateur
2. Vérifier les logs Supabase
3. Tester manuellement les fonctions SQL
4. Consulter GUIDE_PRESENCE_AUTOMATIQUE.md
