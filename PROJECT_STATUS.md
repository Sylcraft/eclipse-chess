# ECLIPSE CHESS — état du projet et reprise

**Dernière mise à jour : 15 octobre 2026, Europe/Paris. Développement arrêté pour cette session.**

**Point de reprise essentiel : le rendu graphique n’est PAS résolu.** Le dernier contrôle visuel de l’utilisateur juge les GLB encore trop fins, difficiles à identifier et peu satisfaisants. Les gains de taille et les tests ne constituent pas une validation artistique. Ne pas reprendre en considérant la V3.1 comme visuellement aboutie.

## Objectif et direction artistique

Jeu d’échecs 3D local, fiable et immersif. Univers dark fantasy gothique : faction **Les Revenants**, environnement **Le Sanctuaire oublié**, pierre noire sculptée, armures anciennes, argent oxydé et accents spectraux bleus. La lisibilité des six types et des deux camps passe avant le détail décoratif. Pas de multijoueur réseau, IA ou comptes dans le périmètre actuel.

## Stack et architecture

- React 19, TypeScript strict, Vite 7 ; Three.js 0.180, React Three Fiber 9, Drei 10.
- chess.js 1.4 comme unique autorité pour les règles ; Zustand 5 pour les commandes et états d’interface.
- Vitest 5, ESLint 9, tests TypeScript inclus dans la compilation. `@types/node` ajouté pour lire les GLB dans les tests locaux.
- Application statique compatible avec Vercel (`dist`), sans API ni variable d’environnement obligatoire. Aucune action de déploiement autorisée pour la reprise.

| Fichier | Responsabilité |
| --- | --- |
| `src/chess/game.ts` | Validation chess.js, noms et états de partie. |
| `src/chess/presentation.ts` | Instantanés de pièces, capture, roque, promotion et interpolation. |
| `src/store/gameStore.ts` | Commandes, sélection, promotion, verrou des transitions et réglages. |
| `src/scene/Board.tsx` | Scène, cases, armée, lumière et caméra. |
| `src/scene/Piece.tsx` | Six modèles procéduraux partagés et contrat `PieceProps`. |
| `src/scene/ImportedPiece.tsx` | Instance GLB avec socle et repli procédural par type. |
| `src/scene/modelAssets.ts` | Chargeur GLB, file de deux chargements, cache et variantes par camp. |
| `src/scene/modelConfig.ts` | Fichiers, orientation, ajustement sur sommets réels et cadrage. |
| `src/scene/modelMaterials.ts` | Tentative V3.1 de finition des matériaux via le shader standard. |
| `src/scene/Sanctuary.tsx` | Socle monumental, ruines et décor sans interception des clics. |
| `src/App.tsx`, `src/Dialog.tsx`, `src/styles.css` | Interface, dialogues, accessibilité et responsive. |
| `tools/*.py` | Audit, préparation Blender et aperçus hors ligne. |

## Fonctionnalités présentes et testées

- Partie locale à deux joueurs : sélection, coups légaux et illégaux, captures, roques, prise en passant et promotion au choix.
- Détection de l’échec, du mat, du pat et des nulles : répétition, matériel insuffisant et règle des 50 coups. Les nulles reconnues terminent automatiquement la partie, comportement hérité de V2.
- Historique SAN, pièces capturées, joueur actif, annulation et nouvelle partie avec confirmation.
- Animations de déplacement et disparition ; roque synchronisé ; silhouettes de promotion conservées pendant le trajet. Commandes de jeu bloquées pendant les transitions, avec délai de secours si le rendu s’arrête.
- Repères de sélection, destinations légales, captures, dernier coup et roi en échec.
- Caméra orbitale, zoom et réinitialisation ; paramètres animations/qualité ; préférence de mouvement réduit au démarrage.
- Plateau textuel jouable au clavier, états annoncés, dialogues avec gestion du focus et Échap ; repli si la scène 3D échoue.
- Six GLB disponibles sur ce disque, chargés par type avec fallback procédural indépendant. Parsing et dimensions testés, sans que cela valide leur qualité visuelle.

L’interface et les mécanismes de clic 3D n’ont pas été recontrôlés dans un navigateur par l’agent pendant les dernières passes : aucun navigateur connecté disponible. L’utilisateur a, lui, signalé un rendu visuel insatisfaisant. La partie et les paramètres restent en mémoire uniquement ; recharger réinitialise la partie.

## État des versions

| Jalon | État réel |
| --- | --- |
| **V2** | Base jouable procédurale, environnement, animations et paramètres ; sauvegardée dans `58a35f8` le 14/10/2026 à 22:53:18 +02:00. |
| **V3** | Intégration locale des six GLB, préparation Blender, caches, normalisation et fallback ; code repris dans le commit de clôture, assets exclus. Intégration technique fonctionnelle, rendu insuffisant. |
| **V3.1** | Tentative d’amélioration des proportions, matériaux, socles, lumière et caméra ; **non validée artistiquement, problème ouvert**. Ne pas multiplier les retouches sans un contrôle visuel reproductible. |

Ces noms sont des jalons de travail : `package.json` indique toujours **2.0.0**, le pied de page **V2.0**. Aucun tag Git de version n’est présent à la clôture. Le jeu est déclaré publié par l’utilisateur ; l’état exact de la version distante n’a pas été interrogé. Le code local V3/V3.1 ne doit pas être assimilé au déploiement public.

## Dernières modifications conservées

- GLB montés via le point de substitution `Piece.renderer`, sans refonte des règles ni de l’interface.
- Ressources partagées, deux matériaux de camp par source, clones de hiérarchie par pièce, repli pendant le chargement ou en cas d’erreur ; instances immobiles conservées lors des coups.
- V3.1 : rayon calculé sur les sommets réels, échelle uniforme et empreinte circulaire maximale de 0,94 case. Socle de hauteur 0,032, personnage à Y=0,034.
- Hauteurs mesurées hors socle : roi 1,336 ; reine 1,234 ; fou 1,017 ; cavalier 0,926 ; tour 1,023 ; pion 0,900. Gains de 10 à 44 % sur le cadrage géométrique antérieur, **sans résolution du défaut visuel**.
- Finition argent/obsidienne, textures conservées, normales atténuées et rugosité bornée par shader ; auto-ombres retirées des personnages, une seule lumière générant les ombres.
- Cadrage rapproché avec distance adaptée aux formats étroits ; tests de projection du plateau.
- Documentation d’origine et de rendu, scripts Python et tests supplémentaires.

Voir [l’inventaire GLB](docs/revenants-assets.md) et [le diagnostic V3.1](docs/rendering-v31.md). Ces documents décrivent les essais techniques ; le retour utilisateur ci-dessus prévaut sur toute formulation qui pourrait laisser croire à une réussite visuelle.

## Assets locaux et droits

| Type | Fichier dans `public/models/revenants/` | Octets | Droits constatés |
| --- | --- | ---: | --- |
| Roi | `king.glb` | 868 884 | Métadonnée CC-BY-4.0, Brian Trepanier/CMBC ; droits tiers Warcraft non précisés. |
| Reine | `queen.glb` | 2 662 980 | Licence, auteur et provenance non confirmés. |
| Fou | `bishop.glb` | 2 382 800 | Licence, auteur et provenance non confirmés. |
| Cavalier | `knight.glb` | 4 013 476 | Métadonnée CC-BY-4.0, davidkong. |
| Tour | `rook.glb` | 4 683 340 | Métadonnée CC-BY-4.0, Pigcraft. |
| Pion | `pawn.glb` | 836 120 | Licence, auteur et provenance non confirmés ; pose en T, sans rig. |

Les déclarations de licence des téléchargements ne sont pas une vérification indépendante des droits. Tous ces fichiers, y compris les trois portant une métadonnée CC-BY, restent exclus du commit.

- **Disque local uniquement** : `pieces_3d/` (sept téléchargements d’origine, extractions, logs, rapports, empreintes et aperçus) et `public/models/revenants/` (six dérivés, environ 15,45 Mo).
- Également non sauvegardés dans Git : `node_modules/`, `dist/`, caches et sorties de compilation.
- Un clone Git seul restaure le code et les modèles procéduraux, **pas les six GLB**. Il faut retrouver les fichiers locaux pour reproduire leur rendu et les six tests de fichiers.
- **Risque de publication connu** : Vite copie `public` dans `dist`. `.gitignore` empêche le suivi Git, pas la publication d’un build local. Aucun filtrage automatique de licence n’est implémenté. Ne pas déployer ce `dist`, utiliser `git add -f` sur les assets, ni transférer ces fichiers vers un service public avant confirmation des droits.

## Vérifications de clôture — 15/10/2026

- `npm.cmd run build` : réussi, TypeScript et build Vite.
- `npm.cmd run lint` : réussi.
- `npm.cmd test` : **49 tests réussis, 7 fichiers**, avec les six GLB présents. Sans assets, les six tests de fichiers sont ignorés ; les autres restent exécutables.
- Avertissement Vite restant : chunk 3D d’environ 974 ko avant compression, 265 ko gzip. Ce chiffre ne comprend pas les fichiers GLB de `public`.
- Les six dérivés sont présents aux tailles du tableau. Leurs SHA-256 avaient été contrôlés identiques avant/après la passe V3.1.
- Contrôles précédents : six URLs GLB HTTP 200, parsing Three.js réel, textures décodées et rendues dans des aperçus Blender hors ligne. Les tests Three.js hors navigateur remplacent le décodage des images par des textures factices.
- Normales finies/non nulles ; pas de duplicats exacts de triangles détectés ; cinq modèles opaques, quatre matériaux MASK sur le cavalier. Ne pas accuser les textures sans nouveau diagnostic.
- **Non validés par l’agent** : rendu du jeu dans React/WebGL, compilation GPU du shader, clics et gestes récents, qualité subjective et performances GPU/mobile. Les tests ne lèvent pas le défaut graphique constaté par l’utilisateur.

## Problèmes ouverts et décisions

1. **Priorité majeure : silhouettes trop fines, modèles difficiles à identifier et rendu peu satisfaisant après V3.1.** Il reste à distinguer limites des assets, pose/topologie et réglages de présentation. Les seules augmentations uniformes sont limitées par la largeur ; ne pas affirmer que les tailles configurées sont toutes atteintes.
2. Pion en pose en T ; cavalier avec 18 matériaux et silhouette longue ; surfaces irrégulières issues des scans. Pas de rig ni d’animation de personnage ajouté.
3. Licences inconnues pour queen/bishop/pawn ; publication des assets bloquée.
4. Bundle 3D volumineux ; absence de mesure GPU/mobile ; shader dépendant des points d’insertion Three.js, tests présents mais compilation GPU à vérifier.

Conserver chess.js comme seule vérité. Les animations sont une projection visuelle et ne doivent pas introduire de règles. Préserver l’architecture et les fonctionnalités existantes. Partager géométries, textures et matériaux ; rendu à la demande, pas de travail sur les sommets à chaque image. Ne pas modifier les téléchargements originaux. Ne pas changer de version de dépendance ou ajouter un effet coûteux pour masquer un défaut non diagnostiqué.

## Trois priorités pour la reprise

1. **Établir une référence visuelle reproductible dans le vrai jeu**, avant toute nouvelle retouche : silhouettes, camps, taille à l’écran, face des modèles et surfaces problématiques.
2. À partir de cette référence, déterminer une correction ciblée de présentation ou la nécessité de modèles/poses mieux adaptés ; conserver le gameplay et comparer avant/après.
3. Clarifier les droits des assets et préparer une éventuelle livraison autorisée, avec attributions et contrôle du coût GPU/mobile. Aucune publication tant que les droits sont inconnus.

**Une seule prochaine action concrète :** lancer le jeu existant, recharger complètement la page et réaliser une capture de référence du plateau initial avec les GLB en qualité élevée, au cadrage par défaut, sans modifier le code. Si aucun navigateur n’est accessible à l’agent, demander ce contrôle visuel à l’utilisateur au lieu de poursuivre à l’aveugle.

## Relancer et tester

Depuis `D:/Projets/Informatique/Programmation/eclipse_chess`, Node.js 22.12+ recommandé :

```powershell
npm.cmd ci
npm.cmd run dev
```

Ouvrir l’URL donnée par Vite, généralement `http://localhost:5173/`. Recharger entièrement la page après une modification de matériaux pour renouveler le cache GLB. Si les dépendances sont déjà installées et à jour, `npm.cmd run dev` suffit.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Pour inspecter les téléchargements locaux : `python tools/audit_revenants.py`. Blender 5.2.2 LTS a été trouvé dans `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`. `tools/prepare_revenants.py` régénère des dérivés : **ne pas le lancer pour un simple redémarrage**, car il réécrit les GLB préparés. Les aperçus Blender ne reproduisent pas le shader WebGL V3.1 et ne remplacent pas le contrôle dans le jeu.

## Sauvegarde Git et repère de session

- Dernier commit avant clôture : **`58a35f8`**, `chore: sauvegarde Eclipse Chess V2`, **14/10/2026 à 22:53:18 +02:00**.
- Sauvegarde de cette session : **commit de clôture du 15/10/2026 contenant ce fichier**, message `chore: sauvegarde V3.1 et documentation de reprise`, référence **`HEAD` immédiatement après la clôture**. Son SHA ne peut pas être inscrit dans son propre contenu sans changer ce SHA ; utiliser la commande ci-dessous pour sa référence exacte. Si de nouveaux commits suivent, retrouver ce message dans l’historique.
- Le commit de clôture conserve code V3/V3.1, tests, scripts de traitement écrits pour ce projet, package/lockfile et documentation ; aucun modèle ou téléchargement.
- Distant existant conservé : `origin`, `https://github.com/Sylcraft/eclipse-chess.git`. Aucun push ni déploiement pendant la clôture. La sauvegarde est locale.

```powershell
git log -1 --format="%h %cI %s"
git status --short
```

Le compte d’exécution Codex peut rencontrer une différence de propriétaire. Dans ce cas, utiliser l’option **limitée à la commande** `git -c safe.directory=D:/Projets/Informatique/Programmation/eclipse_chess ...` ; ne pas modifier la configuration globale sans nécessité.

## Publication autorisée — 23 octobre 2026

L’utilisateur autorise explicitement commits, push sur main et déploiement de la dernière version du code, avant le portfolio. Revue locale : main propre au commit ebbfeee, un commit d’avance sur origin/main (58a35f8). Aucun changement fonctionnel supplémentaire.

Vérifications : npm run lint, npm test (49 tests, 7 fichiers, six GLB locaux présents) et npm run build réussis le 23 octobre. Le chunk 3D reste volumineux (environ 974 Ko avant compression). Les tests locaux ne valent pas validation visuelle WebGL/mobile.

Publication uniquement depuis les fichiers suivis sur GitHub : les six GLB et pieces_3d restent sur le disque, exclus de Git et du build distant. Le repli procédural existant sert les pièces si les GLB sont absents. Ne pas envoyer le dist local, qui contient les modèles non autorisés. L’autorisation de déployer ne confirme pas les licences des modèles ; leur qualité artistique reste non résolue.

Priorités : 1. Vérifier le déploiement public du code suivi. 2. Contrôler visuellement le jeu dans un navigateur réel. 3. Clarifier les licences avant toute publication des modèles.
Prochaine action : pousser main puis vérifier le commit construit par Vercel et les ressources publiques, avant de publier le portfolio. Les résultats distants seront rapportés dans le bilan de mission.
