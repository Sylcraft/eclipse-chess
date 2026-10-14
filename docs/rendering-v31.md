# V3.1 — Présentation locale des GLB

Cette passe modifie uniquement le rendu React/Three.js. Aucun GLB, téléchargement, texture source ou fichier de règles n’a été modifié. Les restrictions de redistribution restent celles de [l’inventaire](revenants-assets.md) : queen, bishop et pawn sans licence confirmée, assets ignorés par Git. Aucun commit, push ou déploiement.

## Diagnostic constaté

- Chaque GLB préparé contient un nœud et un maillage logique ; le cavalier comporte 18 primitives/matériaux. Le chargeur conserve un téléchargement par type, deux variantes de camp et des géométries/textures partagées entre les 32 instances. Aucun chargement répété par pièce.
- L’ancien ajustement utilisait `0,8 / hypot(largeur, profondeur)`, donc les coins vides de la boîte englobante réduisaient inutilement les personnages. Les hauteurs configurées étaient des plafonds, rarement atteints.
- La teinte du camp noir multipliait les couleurs déjà peintes dans les textures. Un matériau du cavalier a même une couleur de base noire : une simple multiplication ne peut pas la rendre lisible.
- Toutes les normales inspectées sont finies, non nulles et de longueur voisine de 1. Elles sont préservées ; aucune reconstruction ou lissage global n’est appliqué.
- Roi, reine, fou, tour et pion sont opaques. Quatre matériaux du cavalier utilisent `MASK`, avec seuils de 0,014 à 0,215. Aucun mode `BLEND` dans les six fichiers actuels. Une transparence généralisée n’explique donc pas leur apparence.
- La reine et la tour ont des textures de normales et de métal/rugosité ; plusieurs matériaux du cavalier ont des normales. Ces cartes, les contrastes peints, la petite taille à l’écran et les ombres propres peuvent accentuer le scintillement et les surfaces fines. Ce sont des facteurs plausibles, pas la preuve d’une texture corrompue.
- Aucun triangle exactement superposé ni arête nulle n’a été détecté dans les dérivés, à une quantification de 10⁻⁷ unité. Cela ne permet pas d’exclure des surfaces proches ou tous les artefacts de profondeur.
- Les textures sont embarquées et ont déjà été décodées dans les aperçus Blender de l’intégration. Rien dans ces contrôles ne justifie de les déclarer défectueuses. Les trous, surfaces fines et la pose en T du pion appartiennent aux modèles utilisés ; cette passe ne reconstruit pas les maillages.

## Proportions mesurées

Les positions réelles des sommets, avec la hiérarchie et le lacet de chaque modèle, servent désormais au calcul du rayon. L’échelle reste **uniforme**. Le cercle de diamètre maximal **0,94** unité laisse au minimum **0,06** unité entre les enveloppes de deux pièces voisines, pour toute rotation verticale, y compris une capture.

Hauteurs des personnages, hors socle, mesurées par Three.js sur les vrais fichiers :

| Pièce | Avant | V3.1 | Gain |
| --- | ---: | ---: | ---: |
| Roi | 1,083 | 1,336 | +23 % |
| Reine | 0,932 | 1,234 | +32 % |
| Fou | 0,758 | 1,017 | +34 % |
| Cavalier | 0,726 | 0,926 | +28 % |
| Tour | 0,712 | 1,023 | +44 % |
| Pion | 0,820 | 0,900 | +10 % |

Les plafonds artistiques sont 1,65 / 1,55 / 1,30 / 1,24 / 1,15 / 0,90. La largeur réelle limite volontairement la hauteur avant ces plafonds : atteindre toutes ces valeurs obligerait à étirer les personnages ou à dépasser leur case. La reine et le roi dominent, les pièces intermédiaires sont plus volumineuses, le pion reste le plus bas. La différence de hauteur cavalier/pion est modeste à cause de la silhouette longue de la monture et de la pose du pion.

Les socles partagent les mêmes géométries et matériaux par camp : hauteur **0,032**, rayon maximal **0,32**, fin anneau spectral. Le personnage repose à **0,034** unité, sans traverser le plateau. Le socle ne sert pas à gonfler artificiellement la hauteur de la pièce.

## Matériaux et éclairage

`modelMaterials.ts` clone chaque matériau une seule fois par camp. Les cartes couleur, normales, métal/rugosité, UV et les coupures alpha utiles sont conservées et partagées. Une finition de statue mélange la couleur d’origine avec un argent ancien (`#c3cfd2`) ou une obsidienne bleu-gris (`#56677a`). La luminance des textures conserve un relief doux ; un plancher de couleur évite les surfaces entièrement noires. Ce traitement n’écrit aucune image.

La force des normales est ramenée à 42 % de la valeur d’origine. La rugosité finale est bornée entre 0,52 et 0,90 et le métal entre 0,10 et 0,50 dans le shader pour limiter les reflets ponctuels. Les coupures alpha du cavalier restent opaques après découpe, sans alpha hash ; l’alpha-to-coverage utilise l’anticrénelage multisample du contexte lorsqu’il est disponible. Les vrais matériaux translucides éventuels restent respectés. Les émissions déjà définies sont conservées ; une faible émission froide relève seulement les matériaux sans émission.

La lumière principale est adoucie, le remplissage frontal et la lumière hémisphérique sont renforcés ; une directionnelle bleue de contour remplace la ponctuelle. Il reste **une seule lumière avec ombres** et le même nombre de lumières. Les pièces projettent leur ombre sur les cases mais ne reçoivent plus les ombres : ce choix évite les auto-ombres parasites sur leurs surfaces fines. Les cases et le sanctuaire continuent à recevoir les ombres. La qualité faible reste sans ombres.

La finition utilise trois insertions limitées dans le shader standard Three.js, avec une clé de cache par camp. Les tests vérifient les points d’insertion de la version installée et la conservation de l’échantillonnage des cartes. Cela ne remplace pas une compilation GPU et un examen visuel sur appareil réel.

## Caméra, performances et vérification

Le cadrage de base est rapproché (`7,8 / 10,8 / 11,8`, cible à Y=0,25). Sur écran étroit, la distance augmente pour préserver les bords du plateau. Un test projette les quatre coins du plateau et une enveloppe haute de 1,65 unité pour des formats compris entre 0,65 et 2. Les contrôles orbitaux, le zoom et la remise à zéro restent disponibles.

Le rendu à la demande, la file de chargement limitée à deux GLB, le cache prêt, les variantes de matériaux et le repli procédural par type restent en place. La mesure des sommets ne s’exécute qu’à la préparation des modèles ; aucun parcours de géométrie ni traitement React n’est ajouté à chaque image. Aucun téléchargement artistique ni dépendance n’est ajouté.

Vérifications V3.1 : **49 tests**, incluant les règles/animations existantes, les six GLB réels, les dimensions, les matériaux et le cadrage ; build et lint. Les sommes SHA-256 des six GLB sont identiques avant/après. Les tests de fichiers sont ignorés si les assets locaux sont absents du clone.

Aucun navigateur connecté n’était disponible : rendu React/WebGL, compilation GPU du shader, lisibilité subjective, scintillement en mouvement et performances mobile restent à vérifier. Le gain de hauteur est mesuré ; l’amélioration visuelle finale n’est pas attestée par une capture du jeu. Le bundle 3D conserve l’avertissement de taille Vite.

Lancer `npm.cmd run dev`, puis **recharger complètement la page** pour reconstruire le cache des matériaux après cette modification. Ne pas publier le `dist` local : Vite y copie les assets dont les droits ne sont pas confirmés.

## Retour visuel utilisateur à la clôture — 15/10/2026

Les modèles restent trop fins, difficilement identifiables et peu satisfaisants dans le jeu. **La V3.1 n’a pas résolu le problème graphique.** Les gains chiffrés ci-dessus sont géométriques ; ils ne constituent pas un résultat artistique validé. La priorité de reprise est une capture de référence reproductible du vrai plateau avant toute nouvelle modification. Voir [PROJECT_STATUS.md](../PROJECT_STATUS.md).
