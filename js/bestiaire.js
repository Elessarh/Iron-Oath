// Données du bestiaire - Catalogue complet avec toutes les images
const creaturesData = [
    // Palier 1 - Marécage putride
    {
        id: 1,
        name: "Gorbel",
        category: "boss",
        type: "Créature",
        hp: 1250,
        palier: 1,
        image: "../assets/mobs/Gorbel.png",
        description: "Un colosse gélatineux, maître des essaims de slimes. Il écrase tout sur son passage, lentement mais sûrement.",
        drops: [
            { name: "Gelée de Slime", rate: 30, image: "GeléedeSlime.png" },
            { name: "Noyau de Slime", rate: 5, image: "NoyaudeSlime.png" },
            { name: "Essence de Gorbel", rate: 1, image: "EssencedeGorbel.png" }
        ],
        location: "Marécage putride"
    },
    {
        id: 2,
        name: "Petit Slime",
        category: "creature",
        type: "Créature",
        hp: 80,
        palier: 1,
        image: "../assets/mobs/Petit Slime.png",
        description: "Malgré sa petite taille, il bondit sans peur. Inoffensif en apparence mais têtu comme pas deux. Certains disent qu'il garde un secret au coeur mou.",
        drops: [
            { name: "Gelée de Slime", rate: 30, image: "GeléedeSlime.png" }
        ],
        location: "Marécage putride"
    },
    {
        id: 3,
        name: "Slime Guerrier",
        category: "creature",
        type: "Créature",
        hp: 100,
        palier: 1,
        image: "../assets/mobs/Guerrier Slime.avif",
        description: "Né d'un amas magique de gelée ancienne, il a appris à manier l'arme comme un vrai geurrier. Il défend son territoire avec une rage inattendue.",
        drops: [
            { name: "Gelée de Slime", rate: 30, image: "GeléedeSlime.png" }
        ],
        location: "Marécage putride"
    },
    {
        id: 4,
        name: "Slime Soigneur",
        category: "creature",
        type: "Créature",
        hp: 150,
        palier: 1,
        image: "../assets/mobs/Slime Soigneur.png",
        description: "Ce slime irradie une énergie apaisante. Blessures mineures se referment à son passage. Il fuit le combat, mais sauve les siens dans l'ombre.",
        drops: [
            { name: "Gelée de Slime", rate: 30, image: "GeléedeSlime.png" },
            { name: "Noyau de Slime", rate: 5, image: "NoyaudeSlime.png" }
        ],
        location: "Marécage putride"
    },
    {
        id: 5,
        name: "Slime Magicien",
        category: "elite",
        type: "Créature",
        hp: 120,
        palier: 1,
        image: "../assets/mobs/Slime Magicien.png",
        description: "Un slime imprégné d'énergies arcaniques anciennes. Ses attaques lancent des sorts chaotiques et imprévisibles.",
        drops: [
            { name: "Gelée de Slime", rate: 30, image: "GeléedeSlime.png" },
            { name: "Noyau de Slime", rate: 5, image: "NoyaudeSlime.png" }
        ],
        location: "Marécage putride"
    },

    // Palier 1 - Zone des Sangliers
    {
        id: 6,
        name: "Sanglier",
        category: "creature",
        type: "Bête",
        hp: 65,
        palier: 1,
        image: "../assets/mobs/Sangliers.png",
        description: "Une bête sauvage issue des forêts du premier palier. Il charge sans relâche, animé d'une rage primitive.",
        drops: [
            { name: "Peau de Sanglier", rate: 65, image: "Peau de Sanglier.png" }
        ],
        location: "Zone des Sangliers"
    },

    // Palier 1 - Bois Sacré
    {
        id: 7,
        name: "Mage Sylvestre",
        category: "elite",
        type: "Humanoïde",
        hp: 90,
        palier: 1,
        image: "../assets/mobs/Mage Sylvestre.avif",
        description: "Il canalise la magie des arbres anciens. Ses enchantements font fleurir ou pourrir tout ce qu'il touche.",
        drops: [
            { name: "Brindille Enchantée", rate: 30, image: "BrindilleEnchantées.png" },
            { name: "Coeur de Bois", rate: 20, image: "CoeurdeBois.png" },
            { name: "Tissu Spectral", rate: 30, image: "TissuSpectral.png" },
            { name: "Bâton Sylvestre", rate: 2, image: null }
        ],
        location: "Bois Sacré"
    },
    {
        id: 8,
        name: "Mini Tréant",
        category: "creature",
        type: "Plante",
        hp: 50,
        palier: 1,
        image: "../assets/mobs/Mini Tréant.avif",
        description: "Petit gardien de la forêt, il défend les lieux sacrés avec hargne. Sous ses racines courtes dort une volonté de fer.",
        drops: [
            { name: "Pousse de Sylve", rate: 40, image: "PoussedeSylve.png" },
            { name: "Éclat de Bois Magique", rate: 30, image: "EclatdeBoisMagique.png" }
        ],
        location: "Bois Sacré"
    },
    {
        id: 9,
        name: "Tréant Elite",
        category: "elite",
        type: "Plante",
        hp: 80,
        palier: 1,
        image: "../assets/mobs/Tréant Elite.avif",
        description: "Ancien protecteur des forêts oubliées, ce tréant détient une puissance redoutable.",
        drops: [
            { name: "Écorce Sylvestre", rate: 40, image: "EcorceSylvestre.png" },
            { name: "Corde d'arc Sylvestre", rate: 25, image: "CordedarcSylvestre.png" },
            { name: "Arc Sylvestre", rate: 2, image: null }
        ],
        location: "Bois Sacré"
    },
    {
        id: 10,
        name: "Guerrier Tréant",
        category: "elite",
        type: "Plante",
        hp: 100,
        palier: 1,
        image: "../assets/mobs/Guerrier Tréant.avif",
        description: "Forgé dans l'écorce et la magie, ce tréant veille sur les bois sacrés. Il frappe avec la force d'un vieux chêne, et la colère de la forêt.",
        drops: [
            { name: "Écorce de Titan", rate: 35, image: "EcorcedeTitan.png" },
            { name: "Racine Ancestrale", rate: 10, image: "RacineAncestrale.png" },
            { name: "Bouclier Sylvestre", rate: 3, image: null }
        ],
        location: "Bois Sacré"
    },
    {
        id: 11,
        name: "Gardien Colossal",
        category: "boss",
        type: "Golem",
        hp: 250,
        palier: 1,
        image: "../assets/mobs/Gardien Colossal.avif",
        description: "Forgé dans la pierre et éveillé par la magie ancienne, il garde les terres oubliées contre toute intrusion. Ses pas seuls font trembler la forêt...",
        drops: [
            { name: "Mycélium Magique", rate: 5, image: "MycéliumMagique.png" }
        ],
        location: "Bois Sacré"
    },

    // Palier 1 - Vallée des loups
    {
        id: 12,
        name: "Loup Blanc",
        category: "creature",
        type: "Bête",
        hp: 90,
        palier: 1,
        image: "../assets/mobs/Loup Sinistre Blanc.png",
        description: "Gardien de la Vallée des Loups. Son hurlement glace le sang.",
        drops: [
            { name: "Fourrure de Loup", rate: 60, image: "FourruredeLoup.png" },
            { name: "Crocs de Loup", rate: 30, image: "CrocsdeLoup.png" }
        ],
        location: "Vallée des loups"
    },
    {
        id: 13,
        name: "Loup Brun",
        category: "creature",
        type: "Bête",
        hp: 450,
        palier: 1,
        image: "../assets/mobs/Loup Sinistre Brun.png",
        description: "Gardien de la Vallée des Loups. Son hurlement donne une frénésie.",
        drops: [
            { name: "Fourrure de Loup", rate: 60, image: "FourruredeLoup.png" },
            { name: "Crocs de Loup", rate: 30, image: "CrocsdeLoup.png" }
        ],
        location: "Vallée des loups"
    },
    {
        id: 14,
        name: "Loup Noir",
        category: "creature",
        type: "Bête",
        hp: 90,
        palier: 1,
        image: "../assets/mobs/Loup SInistre Noir.png",
        description: "Gardien de la Vallée des Loups. Son hurlement donne des frissons.",
        drops: [
            { name: "Fourrure de Loup", rate: 60, image: "FourruredeLoup.png" },
            { name: "Crocs de Loup", rate: 30, image: "CrocsdeLoup.png" }
        ],
        location: "Vallée des loups"
    },
    {
        id: 15,
        name: "Albal",
        category: "boss",
        type: "Bête",
        hp: 500,
        palier: 1,
        image: "../assets/mobs/Loup SInistre Noir.png",
        description: "Le chef alpha de la Vallée des Loups, une bête légendaire aux crocs acérés.",
        drops: [
            { name: "Fourrure de Loup", rate: 100, image: "FourruredeLoup.png" },
            { name: "Crocs de Loup", rate: 70, image: "CrocsdeLoup.png" },
            { name: "Crocs d'Albal", rate: 20, image: null }
        ],
        location: "Vallée des loups"
    },

    // Anciens mobs conservés (paliers 2-3)
    {
        id: 16,
        name: "Ika",
        category: "boss",
        type: "Tortue Ancienne",
        hp: 800,
        palier: 1,
        image: "../assets/mobs/Ika.avif",
        description: "Cette tortue ancienne erre lentement dans les recoins oubliés du monde. Sa carapace recèle les secrets d'âges passés.",
        drops: [
            { name: "Carapace d'Ika", rate: 80, image: null }
        ],
        location: "Archipel Ika"
    },
    {
        id: 17,
        name: "Narax",
        category: "boss",
        type: "Démon",
        hp: 850,
        palier: 1,
        image: "../assets/mobs/Narax.png",
        description: "Un archidémon des flammes éternelles, seigneur d'un royaume infernal.",
        drops: [
            { name: "Corne de Narak", rate: null, image: null },
            { name: "Flamme éternelle", rate: null, image: null },
            { name: "Grimoire infernal", rate: null, image: null }
        ],
        location: "Cœur des Enfers"
    },
    {
        id: 18,
        name: "Néphantes",
        category: "boss",
        type: "Plante Carnivore",
        hp: 150,
        palier: 1,
        image: "../assets/mobs/Nephantes.gif",
        description: "Cette plante carnivore géante se nourrit de chair et de sang. Ses lianes s'enroulent sans bruit, avant de refermer son piège mortel. Même les aventuriers aguerris évitent ses racines traînantes.",
        drops: [
            { name: "Spore Corrompu", rate: 50, image: null },
            { name: "Fragments de Feuilles", rate: 45, image: null }
        ],
        location: "Champ de Mizunari"
    },
    {
        id: 19,
        name: "Ornstein",
        category: "boss",
        type: "Chevalier Dragon",
        hp: 950,
        palier: 1,
        image: "../assets/mobs/Ornstein.avif",
        description: "Le légendaire tueur de dragons, chevalier au service du soleil, maître de la lance sacrée.",
        drops: [
            { name: "Lance dracotueur", rate: null, image: null },
            { name: "Armure dorée", rate: null, image: null },
            { name: "Anneau solaire", rate: null, image: null }
        ],
        location: "Cathédrale du Soleil"
    },
    {
        id: 20,
        name: "Plante Dévoreuse",
        category: "elite",
        type: "Plante",
        hp: 125,
        palier: 1,
        image: "../assets/mobs/Plante Dévoreuse.avif",
        description: "Discrète sous ses feuilles luxuriantes, le danger rôde au moindre faux pas... Ses racines enserrent ses proies, lentement, avant de les engloutir sans laisser de trace.",
        drops: [],
        location: "Donjon Geldorak"
    },
    {
        id: 21,
        name: "Smoug",
        category: "boss",
        type: "Dragon",
        hp: 1200,
        palier: 1,
        image: "../assets/mobs/Smoug.png",
        description: "Le dragon ancien des montagnes, gardien d'un trésor légendaire accumulé sur des millénaires.",
        drops: [
            { name: "Écaille de dragon", rate: null, image: null },
            { name: "Trésor de Smoug", rate: null, image: null },
            { name: "Souffle de dragon", rate: null, image: null }
        ],
        location: "Pic du Dragon"
    },
    {
        id: 22,
        name: "Spirite de Glace",
        category: "elite",
        type: "Élémentaire",
        hp: 220,
        palier: 1,
        image: "../assets/mobs/Spirite de glace.png",
        description: "Âme ancienne née des tempêtes hivernales, la Spirite de Glace veille sur les terres gelées. Elle murmure aux vents et glace les intrus, protégeant les secrets oubliés du givre éternel.",
        drops: [
            { name: "Eclat Magique Glacial", rate: 35, image: null },
            { name: "Poussière de givre", rate: 35, image: null }
        ],
        location: "Citadelle de glace"
    },

    // Palier 1 - Araignées
    {
        id: 23,
        name: "Araignée Chasseuse",
        category: "creature",
        type: "Araignée",
        hp: 75,
        palier: 1,
        image: "../assets/mobs/Araignée_chasseuse.png",
        description: "Une araignée agile et rusée qui traque ses proies dans l'ombre. Ses pattes acérées percent les armures légères.",
        drops: [
            { name: "Soie d'araignée", rate: 50, image: null },
            { name: "Venin mineur", rate: 25, image: null }
        ],
        location: "Cavernes Sombres"
    },
    {
        id: 24,
        name: "Araignée Empoisonnée",
        category: "elite",
        type: "Araignée",
        hp: 95,
        palier: 1,
        image: "../assets/mobs/Araignée_empoisonnée.png",
        description: "Une araignée dont le venin est mortel. Ses crochets distillent un poison qui paralyse ses victimes.",
        drops: [
            { name: "Soie d'araignée", rate: 60, image: null },
            { name: "Venin puissant", rate: 40, image: null },
            { name: "Glande à poison", rate: 15, image: null }
        ],
        location: "Cavernes Sombres"
    },
    {
        id: 25,
        name: "Araignée Étrangleuse",
        category: "elite",
        type: "Araignée",
        hp: 110,
        palier: 1,
        image: "../assets/mobs/Araignée_étrangleuse.png",
        description: "Cette araignée massive utilise sa toile pour étrangler ses proies. Son corps imposant cache une force redoutable.",
        drops: [
            { name: "Soie renforcée", rate: 55, image: null },
            { name: "Crochets acérés", rate: 30, image: null },
            { name: "Œuf d'araignée", rate: 10, image: null }
        ],
        location: "Cavernes Sombres"
    },

    // Palier 1 - Kobolds
    {
        id: 26,
        name: "Kobold",
        category: "creature",
        type: "Humanoïde",
        hp: 60,
        palier: 1,
        image: "../assets/mobs/Kobold.png",
        description: "Un petit humanoïde rusé vivant dans les cavernes. Faible individuellement mais dangereux en groupe.",
        drops: [
            { name: "Pièce de cuivre", rate: 70, image: null },
            { name: "Outil primitif", rate: 30, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 27,
        name: "Archer Kobold",
        category: "creature",
        type: "Humanoïde",
        hp: 55,
        palier: 1,
        image: "../assets/mobs/Archer_kobold.png",
        description: "Un kobold équipé d'un arc rudimentaire. Il préfère attaquer à distance depuis les hauteurs.",
        drops: [
            { name: "Flèche primitive", rate: 60, image: null },
            { name: "Arc de bois", rate: 20, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 28,
        name: "Guerrier Kobold",
        category: "elite",
        type: "Humanoïde",
        hp: 85,
        palier: 1,
        image: "../assets/mobs/Guerrier_kobold.png",
        description: "Un kobold plus grand et mieux équipé que ses congénères. Il mène les groupes au combat.",
        drops: [
            { name: "Épée ébréchée", rate: 40, image: null },
            { name: "Armure de cuir", rate: 25, image: null },
            { name: "Pièce d'argent", rate: 50, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 29,
        name: "Hallebardier Kobold",
        category: "elite",
        type: "Humanoïde",
        hp: 90,
        palier: 1,
        image: "../assets/mobs/Hallebardier_Kobold.png",
        description: "Armé d'une hallebarde artisanale, ce kobold défend les passages stratégiques des mines.",
        drops: [
            { name: "Hallebarde primitive", rate: 35, image: null },
            { name: "Casque en fer", rate: 20, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 30,
        name: "Mineur Kobold",
        category: "creature",
        type: "Humanoïde",
        hp: 70,
        palier: 1,
        image: "../assets/mobs/Mineur_Kobold.png",
        description: "Un kobold mineur qui extrait des minerais. Plus résistant que la moyenne grâce à son travail.",
        drops: [
            { name: "Pioche usée", rate: 45, image: null },
            { name: "Minerai de fer", rate: 55, image: null },
            { name: "Gemme brute", rate: 15, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 31,
        name: "Soldat Kobold",
        category: "elite",
        type: "Humanoïde",
        hp: 95,
        palier: 1,
        image: "../assets/mobs/Soldat_kobold.png",
        description: "Un kobold entraîné au combat organisé. Il porte une armure fonctionnelle et se bat avec discipline.",
        drops: [
            { name: "Bouclier de fer", rate: 30, image: null },
            { name: "Épée courte", rate: 35, image: null }
        ],
        location: "Mines de Kobold"
    },
    {
        id: 32,
        name: "Sorcier Kobold",
        category: "elite",
        type: "Humanoïde",
        hp: 80,
        palier: 1,
        image: "../assets/mobs/Sorcier_kobold.png",
        description: "Un kobold qui a appris les rudiments de la magie. Ses sorts sont primitifs mais efficaces.",
        drops: [
            { name: "Bâton gravé", rate: 40, image: null },
            { name: "Parchemin magique", rate: 25, image: null },
            { name: "Cristal brut", rate: 20, image: null }
        ],
        location: "Mines de Kobold"
    },

    // Palier 1 - Squelettes
    {
        id: 33,
        name: "Squelette",
        category: "creature",
        type: "Mort-vivant",
        hp: 100,
        palier: 1,
        image: "../assets/mobs/squelette.png",
        description: "Un guerrier défunt animé par la nécromancie. Ses os cliquettent dans la nuit éternelle.",
        drops: [
            { name: "Os ancien", rate: 60, image: null },
            { name: "Poussière d'os", rate: 40, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 34,
        name: "Archer Squelette",
        category: "creature",
        type: "Mort-vivant",
        hp: 90,
        palier: 1,
        image: "../assets/mobs/Archer_squelette.png",
        description: "Un squelette armé d'un arc ancien. Ses flèches ne manquent jamais leur cible.",
        drops: [
            { name: "Os ancien", rate: 55, image: null },
            { name: "Arc maudit", rate: 25, image: null },
            { name: "Flèche spectrale", rate: 30, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 35,
        name: "Épéiste Squelette",
        category: "elite",
        type: "Mort-vivant",
        hp: 120,
        palier: 1,
        image: "../assets/mobs/Epeiste_squelette.png",
        description: "Un maître d'armes du passé, encore mortel malgré la mort. Sa lame danse avec une précision macabre.",
        drops: [
            { name: "Os renforcé", rate: 50, image: null },
            { name: "Épée maudite", rate: 35, image: null },
            { name: "Gemme d'âme", rate: 15, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 36,
        name: "Guerrier Squelette",
        category: "elite",
        type: "Mort-vivant",
        hp: 130,
        palier: 1,
        image: "../assets/mobs/Guerrier_squelette.png",
        description: "Un ancien guerrier ressuscité, vêtu d'une armure rouillée mais toujours fonctionnelle.",
        drops: [
            { name: "Armure ancienne", rate: 30, image: null },
            { name: "Épée rouillée", rate: 40, image: null },
            { name: "Os renforcé", rate: 50, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 37,
        name: "Hallebardier Squelette",
        category: "elite",
        type: "Mort-vivant",
        hp: 135,
        palier: 1,
        image: "../assets/mobs/Hallebardier_squelette.png",
        description: "Gardien éternel armé d'une hallebarde spectrale. Sa portée est redoutable.",
        drops: [
            { name: "Hallebarde maudite", rate: 35, image: null },
            { name: "Os renforcé", rate: 55, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 38,
        name: "Tank Squelette",
        category: "elite",
        type: "Mort-vivant",
        hp: 180,
        palier: 1,
        image: "../assets/mobs/Tank_squelette.png",
        description: "Un colosse osseux recouvert d'une armure lourde. Pratiquement indestructible.",
        drops: [
            { name: "Armure lourde", rate: 40, image: null },
            { name: "Bouclier massif", rate: 35, image: null },
            { name: "Os de titan", rate: 25, image: null }
        ],
        location: "Cimetière Maudit"
    },
    {
        id: 39,
        name: "Sorcier Squelette",
        category: "elite",
        type: "Mort-vivant",
        hp: 110,
        palier: 1,
        image: "../assets/mobs/Sorcier_squelette.png",
        description: "Un nécromancien déchu qui maîtrise encore les arts sombres. Ses sorts drainent la vie.",
        drops: [
            { name: "Bâton nécromantique", rate: 30, image: null },
            { name: "Grimoire maudit", rate: 20, image: null },
            { name: "Essence noire", rate: 35, image: null }
        ],
        location: "Cimetière Maudit"
    },

    // Palier 1 - Déchus
    {
        id: 40,
        name: "Soldat Déchu",
        category: "elite",
        type: "Humanoïde",
        hp: 140,
        palier: 1,
        image: "../assets/mobs/Soldat-Déchu.png",
        description: "Un soldat corrompu par les ténèbres. Son âme est perdue mais son entraînement perdure.",
        drops: [
            { name: "Armure corrompue", rate: 35, image: null },
            { name: "Essence sombre", rate: 40, image: null }
        ],
        location: "Terres Déchues"
    },
    {
        id: 41,
        name: "Gardien Déchu",
        category: "elite",
        type: "Humanoïde",
        hp: 160,
        palier: 1,
        image: "../assets/mobs/Gardien-Déchu.png",
        description: "Autrefois protecteur de la lumière, maintenant serviteur des ombres. Sa force n'a fait que croître.",
        drops: [
            { name: "Bouclier des ténèbres", rate: 30, image: null },
            { name: "Essence sombre", rate: 45, image: null },
            { name: "Casque corrompu", rate: 25, image: null }
        ],
        location: "Terres Déchues"
    },
    {
        id: 42,
        name: "Guerrier Déchu",
        category: "elite",
        type: "Humanoïde",
        hp: 155,
        palier: 1,
        image: "../assets/mobs/Guerrier Déchu.png",
        description: "Un champion tombé dans les ténèbres. Sa lame brise les espoirs comme elle brise les armures.",
        drops: [
            { name: "Épée des ombres", rate: 35, image: null },
            { name: "Essence sombre", rate: 50, image: null }
        ],
        location: "Terres Déchues"
    },
    {
        id: 43,
        name: "Héraut Déchu",
        category: "boss",
        type: "Humanoïde",
        hp: 450,
        palier: 1,
        image: "../assets/mobs/Héraut-Déchu.png",
        description: "Le commandant des armées déchues. Son aura corrompt tout ce qui l'entoure.",
        drops: [
            { name: "Couronne des ténèbres", rate: 15, image: null },
            { name: "Essence pure des ombres", rate: 25, image: null },
            { name: "Sceptre maudit", rate: 20, image: null }
        ],
        location: "Terres Déchues"
    },
    {
        id: 44,
        name: "Faucheuse Déchu",
        category: "boss",
        type: "Mort-vivant",
        hp: 500,
        palier: 1,
        image: "../assets/mobs/Faucheuse-Déchu.png",
        description: "La mort incarnée, corrompue par les ténèbres. Sa faux récolte les âmes des vivants.",
        drops: [
            { name: "Faux de la mort", rate: 10, image: null },
            { name: "Cape spectrale", rate: 20, image: null },
            { name: "Fragment d'âme", rate: 40, image: null }
        ],
        location: "Terres Déchues"
    },

    // Palier 1 - Autres créatures
    {
        id: 45,
        name: "Golem de Glace",
        category: "elite",
        type: "Élémentaire",
        hp: 200,
        palier: 1,
        image: "../assets/mobs/Golem_de_glace.png",
        description: "Forgé dans les profondeurs d'un glacier ancien, le Golem de Glace est une sentinelle implacable. Son corps de cristal givré repousse toute chaleur, et ses coups peuvent figer le sang en un instant.",
        drops: [
            { name: "Peau Dur Glacial", rate: 30, image: null },
            { name: "Poussière de givre", rate: 40, image: null }
        ],
        location: "Citadelle de glace"
    },
    {
        id: 46,
        name: "Ours Glacial",
        category: "elite",
        type: "Bête",
        hp: 175,
        palier: 1,
        image: "../assets/mobs/Ours_Glacial.png",
        description: "Un ours massif adapté au froid extrême. Sa fourrure blanche le rend quasi invisible dans la neige.",
        drops: [
            { name: "Fragment de l'Âme de l'Ours", rate: 5, image: null }
        ],
        location: "Citadelle de glace"
    },
    {
        id: 47,
        name: "Plante Mutante",
        category: "elite",
        type: "Plante",
        hp: 2000,
        palier: 1,
        image: "../assets/mobs/Plante_mutante.png",
        description: "Entité rampante née des mines de Geldorak, Vyrmoss s'imprègne des spores et de la terre humide. Sa peau est couverte de mousse vivante, et son souffle corrompt tout ce qu'il touche.",
        drops: [],
        location: "Donjon Geldorak"
    },
    {
        id: 48,
        name: "Essaim d'Insectes",
        category: "creature",
        type: "Essaim",
        hp: 20,
        palier: 1,
        image: "../assets/mobs/Essaim d'insectes.png",
        description: "Un nuage bourdonnant d'insectes agressifs. Difficile à combattre, impossible à fuir.",
        drops: [
            { name: "Chitin d'insecte", rate: 65, image: null },
            { name: "Venin d'insecte", rate: 30, image: null }
        ],
        location: "Marais Toxique"
    },
    {
        id: 49,
        name: "Farfadet",
        category: "creature",
        type: "Féérique",
        hp: 250,
        palier: 1,
        image: "../assets/mobs/Farfadet.png",
        description: "Une créature espiègle de la forêt enchantée. Méfiez-vous de sa magie illusoire.",
        drops: [
            { name: "Poussière de fée", rate: 45, image: null },
            { name: "Aile de farfadet", rate: 25, image: null },
            { name: "Gemme enchantée", rate: 15, image: null }
        ],
        location: "Forêt Enchantée"
    },
    {
        id: 50,
        name: "Cerf",
        category: "creature",
        type: "Bête",
        hp: 70,
        palier: 1,
        image: "../assets/mobs/Cerf.png",
        description: "Majestueux et insaisissable, le Cerf des Montagnes habite les hauteurs glacées et les forêts enneigées. On raconte qu'il apparaît aux âmes pures, guidant les voyageurs égarés vers la sécurité.",
        drops: [
            { name: "Peau de Cerf des Montagnes", rate: 45, image: null }
        ],
        location: "Tolbana"
    },
    {
        id: 51,
        name: "Bandit Assassin",
        category: "elite",
        type: "Humanoïde",
        hp: 120,
        palier: 1,
        image: "../assets/mobs/Bandit Assassin.png",
        description: "Maître de l'ombre et des lames silencieuses, il ne laisse derrière lui que le vide... et une cible tombée.",
        drops: [
            { name: "Cuire Usé", rate: 30, image: null },
            { name: "Petite Bourse", rate: 35, image: null }
        ],
        location: "Montagne des bandits"
    },
    {
        id: 52,
        name: "Poisson Requin",
        category: "elite",
        type: "Bête Aquatique",
        hp: 500,
        palier: 1,
        image: "../assets/mobs/Poisson_requin.png",
        description: "Prédateur implacable des eaux profondes, le Poisson Requin traque silencieusement ses proies. Ses dents acérées peuvent trancher l'acier, et son instinct ne connaît ni pitié ni repos.",
        drops: [
            { name: "Carapace de requin", rate: 40, image: null }
        ],
        location: "Virelune"
    },

    // Palier 1 - Boss légendaires
    {
        id: 53,
        name: "Illfang",
        category: "boss",
        type: "Kobold Seigneur",
        hp: 600,
        palier: 1,
        image: "../assets/mobs/illfang.png",
        description: "Le roi des kobolds, un seigneur de guerre redoutable. Premier boss légendaire d'Aincrad.",
        drops: [
            { name: "Couronne de Kobold", rate: 15, image: null },
            { name: "Hache du Roi", rate: 20, image: null },
            { name: "Cape royale", rate: 25, image: null }
        ],
        location: "Palais Kobold"
    },
    {
        id: 54,
        name: "Jira",
        category: "boss",
        type: "Démon",
        hp: 750,
        palier: 1,
        image: "../assets/mobs/Jira.png",
        description: "Un démon ancien emprisonné dans les profondeurs. Sa rage est sans limites.",
        drops: [
            { name: "Corne démoniaque", rate: 20, image: null },
            { name: "Sang maudit", rate: 30, image: null },
            { name: "Grimoire démoniaque", rate: 15, image: null }
        ],
        location: "Cachot Infernal"
    },
    {
        id: 55,
        name: "Kamilia",
        category: "boss",
        type: "Mage",
        hp: 650,
        palier: 1,
        image: "../assets/mobs/Kamilia.png",
        description: "Une archimage corrompue. Ses sorts peuvent plier la réalité elle-même.",
        drops: [
            { name: "Bâton arcanique", rate: 15, image: null },
            { name: "Robe enchantée", rate: 20, image: null },
            { name: "Tome de magie", rate: 25, image: null }
        ],
        location: "Tour Arcanique"
    },
    {
        id: 56,
        name: "Léviathan",
        category: "boss",
        type: "Serpent de Mer",
        hp: 5000,
        palier: 1,
        image: "../assets/mobs/leviathan.png",
        description: "Serpent mythique glissant entre les courants profonds, Nymbréa incarne la grâce et la traîtrise des eaux calmes. Ses écailles scintillent comme des perles maudites.",
        drops: [
            { name: "Coeur de Nautherion", rate: null, image: null }
        ],
        location: "Virelune"
    },
    {
        id: 57,
        name: "Priscilia",
        category: "boss",
        type: "Dragon-Humanoïde",
        hp: 850,
        palier: 1,
        image: "../assets/mobs/priscilia.png",
        description: "Une dragonne métamorphe, reine des dragons. Sa beauté cache une puissance dévastatrice.",
        drops: [
            { name: "Écaille de dragon", rate: 30, image: null },
            { name: "Griffe de Priscilia", rate: 20, image: null },
            { name: "Couronne draconique", rate: 10, image: null }
        ],
        location: "Nid du Dragon"
    },
    {
        id: 58,
        name: "Soul Knight",
        category: "boss",
        type: "Chevalier Maudit",
        hp: 800,
        palier: 1,
        image: "../assets/mobs/soulknight.png",
        description: "Un chevalier dont l'âme est liée à son armure pour l'éternité. Gardien immortel.",
        drops: [
            { name: "Armure d'âme", rate: 15, image: null },
            { name: "Épée spectrale", rate: 20, image: null },
            { name: "Heaume maudit", rate: 18, image: null }
        ],
        location: "Forteresse Oubliée"
    },
    {
        id: 59,
        name: "Yula",
        category: "boss",
        type: "Sorcière",
        hp: 700,
        palier: 1,
        image: "../assets/mobs/Yula.png",
        description: "La sorcière des marais, maîtresse des malédictions. Ses potions sont mortelles.",
        drops: [
            { name: "Chaudron magique", rate: 12, image: null },
            { name: "Grimoire de malédiction", rate: 18, image: null },
            { name: "Essence de sorcière", rate: 25, image: null }
        ],
        location: "Marais Maudit"
    },
    {
        id: 60,
        name: "Octana",
        category: "boss",
        type: "Pieuvre Géante",
        hp: 780,
        palier: 1,
        image: "../assets/mobs/Octana.png",
        description: "Une pieuvre colossale des profondeurs. Ses tentacules peuvent couler des navires entiers.",
        drops: [
            { name: "Tentacule géant", rate: 30, image: null },
            { name: "Encre d'Octana", rate: 35, image: null },
            { name: "Perle noire", rate: 15, image: null }
        ],
        location: "Fosse Océanique"
    }
];

// État de l'application
let filteredCreatures = [...creaturesData];
let selectedCreature = null;

// État de la pagination
let currentPage = 1;
let itemsPerPage = 12;
let totalPages = 1;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    calculatePagination();
    renderCreatures();
    setupEventListeners();
    setupPaginationListeners();
});

// Configuration des écouteurs d'événements de pagination
function setupPaginationListeners() {
    // Boutons précédent/suivant
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCreatures();
                updatePaginationUI();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCreatures();
                updatePaginationUI();
            }
        });
    }
    
    // Sélecteur d'éléments par page
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; // Reset à la première page
            calculatePagination();
            renderCreatures();
            updatePaginationUI();
        });
    }
}

// Calcul de la pagination
function calculatePagination() {
    totalPages = Math.ceil(filteredCreatures.length / itemsPerPage);
    
    // S'assurer que la page actuelle est valide
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
}

// Mise à jour de l'interface de pagination
function updatePaginationUI() {
    const paginationContainer = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const paginationInfo = document.getElementById('pagination-info-text');
    const paginationNumbers = document.getElementById('pagination-numbers');
    
    if (!paginationContainer) return;
    
    // Afficher/masquer la pagination selon le nombre d'éléments
    if (filteredCreatures.length <= itemsPerPage) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'block';
    }
    
    // Mise à jour des boutons précédent/suivant
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    // Mise à jour du texte informatif
    if (paginationInfo) {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredCreatures.length);
        paginationInfo.textContent = `Affichage de ${startItem}-${endItem} sur ${filteredCreatures.length} créatures`;
    }
    
    // Génération des numéros de pages
    if (paginationNumbers) {
        paginationNumbers.innerHTML = generatePageNumbers();
    }
}

// Génération des numéros de pages avec ellipses
function generatePageNumbers() {
    let pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
        // Afficher toutes les pages si peu nombreuses
        for (let i = 1; i <= totalPages; i++) {
            pages.push(createPageButton(i));
        }
    } else {
        // Logique d'ellipses pour beaucoup de pages
        pages.push(createPageButton(1));
        
        if (currentPage > 4) {
            pages.push('<span class="pagination-ellipsis">...</span>');
        }
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push(createPageButton(i));
        }
        
        if (currentPage < totalPages - 3) {
            pages.push('<span class="pagination-ellipsis">...</span>');
        }
        
        if (totalPages > 1) {
            pages.push(createPageButton(totalPages));
        }
    }
    
    return pages.join('');
}

// Création d'un bouton de page
function createPageButton(pageNumber) {
    const isActive = pageNumber === currentPage ? 'active' : '';
    return `
        <button class="pagination-number ${isActive}" onclick="goToPage(${pageNumber})">
            ${pageNumber}
        </button>
    `;
}

// Navigation vers une page spécifique
function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        renderCreatures();
        updatePaginationUI();
        
        // Scroll vers le haut de la grille
        const grid = document.getElementById('creatures-grid');
        if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', filterCreatures);
    }

    // Filtres
    const filters = ['palier-filter', 'category-filter', 'level-filter', 'type-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', filterCreatures);
        }
    });

    // Fermeture du modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('creature-modal') || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });

    // Échap pour fermer le modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Rendu des créatures avec images et pagination
function renderCreatures() {
    const grid = document.getElementById('creatures-grid');
    if (!grid) return;

    if (filteredCreatures.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
                <h3>🔍 Aucune créature trouvée</h3>
                <p>Essayez de modifier vos filtres de recherche</p>
            </div>
        `;
        updatePaginationUI();
        return;
    }

    // Calcul des créatures à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const creaturesToShow = filteredCreatures.slice(startIndex, endIndex);

    grid.innerHTML = creaturesToShow.map(creature => `
        <div class="creature-card ${creature.category}" onclick="openCreatureModal(${creature.id})">
            <div class="creature-image-container">
                <img src="${creature.image}" alt="${creature.name}" class="creature-image" 
                     onerror="this.src='../assets/Logo_3.png'; this.className='creature-image fallback';">
            </div>
            
            <div class="creature-header">
                <h3 class="creature-name">${creature.name}</h3>
                <div class="creature-badges">
                    <div class="floor-badge">PALIER ${creature.palier}</div>
                    <div class="type-badge ${creature.category}">${creature.category.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="creature-stats">
                <div class="stat-row">
                    <div class="stat-item">
                        <span class="stat-icon">❤️</span>
                        <span class="stat-label">PV</span>
                        <span class="stat-value">${creature.hp}</span>
                    </div>
                </div>
            </div>
            
            <div class="creature-description">${creature.description}</div>
            
            <div class="creature-footer">
                <div class="creature-location">📍 ${creature.location}</div>
                <button class="view-details-btn">
                    <span>ℹ️</span>
                    DÉTAILS
                </button>
            </div>
        </div>
    `).join('');
    
    // Mettre à jour l'interface de pagination après le rendu
    updatePaginationUI();
}

// Fonction pour générer le chemin de l'image d'un drop
function getDropImagePath(drop) {
    // Si une image est explicitement définie, l'utiliser
    if (drop.image) {
        return `../assets/items/Ressources/${drop.image}`;
    }
    
    // Mapping des noms de drops vers leurs images
    const dropImageMap = {
        // Ressources avec noms spéciaux
        'Spore Corrompu': 'SporeCorrompu.png',
        'Fragments de Feuilles': 'FragmentsdeFeuilles.png',
        'Poussière de givre': 'PoussièredeGivre.png',
        'Eclat Magique Glacial': 'EclatdeBoisMagique.png',
        'Soie d\'araignée': 'FildAraignée.png',
        'Soie renforcée': 'FildAraignéeRenforcé.png',
        'Venin mineur': 'VenindAraignée.png',
        'Venin puissant': 'VenindAraignée.png',
        'Carapace d\'Ika': 'CarapacedIka.png',
        'Crochets acérés': 'CrocsdeLoup.png',
        'Glande à poison': 'VenindAraignée.png',
        'Œuf d\'araignée': 'TissudAraignée.png',
        // Ressources standard
        'Gelée de Slime': 'GeléedeSlime.png',
        'Noyau de Slime': 'NoyaudeSlime.png',
        'Essence de Gorbel': 'EssencedeGorbel.png',
        'Peau de Sanglier': 'Peau de Sanglier.png',
        'Brindille Enchantée': 'BrindilleEnchantées.png',
        'Coeur de Bois': 'CoeurdeBois.png',
        'Tissu Spectral': 'TissuSpectral.png',
        'Pousse de Sylve': 'PoussedeSylve.png',
        'Éclat de Bois Magique': 'EclatdeBoisMagique.png',
        'Écorce Sylvestre': 'EcorceSylvestre.png',
        'Corde d\'arc Sylvestre': 'CordedarcSylvestre.png',
        'Écorce de Titan': 'EcorcedeTitan.png',
        'Racine Ancestrale': 'RacineAncestrale.png',
        'Mycélium Magique': 'MycéliumMagique.png',
        'Fourrure de Loup': 'FourruredeLoup.png',
        'Crocs de Loup': 'CrocsdeLoup.png',
        'Os de Squelette': 'OsdeSquelette.png',
        'Os de Squelette Renforcé': 'OsdeSqueletteRenforcé.png',
        'Poussière d\'Os': 'PoussièredOs.png',
        'Tissu d\'Araignée': 'TissudAraignée.png',
        'Venin d\'Araignée': 'VenindAraignée.png',
        'Fil d\'Araignée': 'FildAraignée.png',
        'Fil d\'Araignée Renforcé': 'FildAraignéeRenforcé.png'
    };
    
    // Chercher l'image dans le mapping
    if (dropImageMap[drop.name]) {
        return `../assets/items/Ressources/${dropImageMap[drop.name]}`;
    }
    
    // Fallback: essayer de générer automatiquement le nom de fichier
    const autoGenerated = drop.name
        .replace(/[\s']+/g, '')
        .replace(/é/g, 'é')
        .replace(/è/g, 'è')
        .replace(/ê/g, 'ê')
        .replace(/à/g, 'à')
        .replace(/ô/g, 'ô')
        .replace(/û/g, 'û')
        .replace(/î/g, 'î');
    
    return `../assets/items/Ressources/${autoGenerated}.png`;
}

// Filtrage des créatures
function filterCreatures() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const palierFilter = document.getElementById('palier-filter')?.value || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const levelFilter = document.getElementById('level-filter')?.value || '';
    const typeFilter = document.getElementById('type-filter')?.value || '';

    filteredCreatures = creaturesData.filter(creature => {
        const matchesSearch = creature.name.toLowerCase().includes(searchTerm) ||
                            creature.type.toLowerCase().includes(searchTerm) ||
                            creature.description.toLowerCase().includes(searchTerm);

        const matchesPalier = !palierFilter || creature.palier.toString() === palierFilter;
        const matchesCategory = !categoryFilter || creature.category === categoryFilter;
        const matchesType = !typeFilter || creature.type.toLowerCase() === typeFilter.toLowerCase();
        
        let matchesLevel = true;
        if (levelFilter) {
            const [min, max] = levelFilter.split('-').map(Number);
            matchesLevel = creature.level >= min && creature.level <= max;
        }

        return matchesSearch && matchesPalier && matchesCategory && matchesLevel && matchesType;
    });

    // Recalculer la pagination après filtrage
    currentPage = 1; // Reset à la première page
    calculatePagination();
    renderCreatures();
    updatePaginationUI();
}

// Ouverture du modal avec design amélioré
function openCreatureModal(creatureId) {
    const creature = creaturesData.find(c => c.id === creatureId);
    if (!creature) return;

    selectedCreature = creature;

    // Créer le modal s'il n'existe pas
    let modal = document.querySelector('.creature-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'creature-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            
            <div class="modal-header-section">
                <div class="modal-left-column">
                    <div class="creature-modal-image">
                        <img src="${creature.image}" alt="${creature.name}" 
                             onerror="this.src='../assets/Logo_3.png'; this.className='fallback';">
                    </div>
                    
                    <div class="stat-card-modal">
                        <div class="stat-icon">❤️</div>
                        <div class="stat-info">
                            <div class="stat-label">Points de Vie</div>
                            <div class="stat-value">${creature.hp}</div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-right-column">
                    <div class="creature-modal-info">
                        <h2 class="creature-name-modal">${creature.name}</h2>
                        <div class="creature-badges-modal">
                            <span class="badge badge-${creature.category}">${getCategoryDisplay(creature.category)}</span>
                            <span class="badge badge-type">${creature.type}</span>
                            <span class="badge badge-palier">Palier ${creature.palier}</span>
                        </div>
                    </div>
                    
                    <div class="creature-info-section">
                        <div class="info-block">
                            <h4 class="info-title">📖 Description</h4>
                            <p class="info-content">${creature.description}</p>
                        </div>
                        
                        <div class="info-block">
                            <h4 class="info-title">📍 Localisation</h4>
                            <p class="info-content">${creature.location}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer-section">
                <h4 class="section-title-footer">💰 Butin Possible</h4>
                <div class="drops-grid-modal">
                    ${creature.drops.map(drop => {
                        const hasRate = drop.rate !== null;
                        const imagePath = getDropImagePath(drop);
                        const itemSlug = drop.name.toLowerCase().replace(/[\s']+/g, '-').replace(/[éèê]/g, 'e').replace(/à/g, 'a');
                        
                        return `
                            <div class="drop-item-modal" onclick="navigateToItem('${itemSlug}', '${drop.name}')" title="Cliquer pour voir cet item">
                                <img src="${imagePath}" alt="${drop.name}" class="drop-icon" onerror="this.src='../assets/Logo_3.png'; this.classList.add('fallback-icon');">
                                <div class="drop-info">
                                    <span class="drop-name">${drop.name}</span>
                                    ${hasRate ? `<span class="drop-rate">${drop.rate}%</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fermeture du modal
function closeModal() {
    const modal = document.querySelector('.creature-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    selectedCreature = null;
}

// Utilitaires
function getCategoryDisplay(category) {
    const categories = {
        'boss': 'Boss',
        'elite': 'Élite',
        'creature': 'Créature'
    };
    return categories[category] || category;
}

// Fonction pour naviguer vers la page items avec recherche de l'item
function navigateToItem(itemSlug, itemName) {
    // Stocker le nom de l'item dans le localStorage pour la recherche
    localStorage.setItem('searchItemFromBestiaire', itemName);
    // Rediriger vers la page items
    window.location.href = 'items.html';
}

// Export pour utilisation globale
window.openCreatureModal = openCreatureModal;
window.navigateToItem = navigateToItem;