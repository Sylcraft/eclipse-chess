# Modèles locaux des Revenants — intégration GLB

Les réglages de présentation ci-dessous décrivent l’intégration initiale. Voir [la passe V3.1](rendering-v31.md) pour les dimensions, matériaux et lumières actuels.

Les six modèles sont installés pour les essais locaux dans `public/models/revenants/`. Les téléchargements, extractions, aperçus et dérivés sont exclus de Git. Aucun commit, push ou déploiement n’a été effectué pour cette intégration.

## Inventaire des téléchargements

| Téléchargement | Contenu et choix retenu |
| --- | --- |
| `king.glb` | GLB 2.0 autonome, choisi pour le roi. |
| `king.zip` | `source/Sketchfab_2025_10_28_15_09_32.blend` et `textures/Image_0.jpeg` ; variante non nécessaire à la conversion. |
| `queen.zip` | `source/DarkValkyrieQueen.glb` et trois JPEG externes redondants avec les images intégrées au GLB. |
| `fou.zip` | `source/VoidboundNecromancer.glb` et `textures/gltf_embedded_0.jpeg`. |
| `pion.zip` | `source/model.glb` et `textures/gltf_embedded_0.jpeg`. |
| `cavalier.glb` | GLB 2.0 du diorama « The Dark Wraith », avec cheval, cavalier et décor. |
| `tour.glb` | GLB 2.0 « Crumbling Stone Watchtower ». |

Les quatre ZIP ont été extraits dans `pieces_3d/_extracted/<nom>/`. Les fichiers téléchargés restent intacts. L’extracteur vérifie que chaque chemin reste dans le dossier cible et n’écrase pas les fichiers déjà extraits. Les SHA-256 des sept téléchargements et ceux des sources de conversion figurent dans les rapports locaux.

## Résultat par pièce

Tailles en Mo décimaux ; nombres de triangles mesurés dans les GLB exportés.

| Pièce | Fichier final | Source GLB → résultat | Triangles source → résultat | Textures finales | Matériaux |
| --- | --- | --- | --- | --- | --- |
| Roi | `king.glb` | 16,41 → 0,87 Mo | 443 645 → 16 000 | 1 × 1024 px | 1 |
| Reine | `queen.glb` | 83,50 → 2,66 Mo | 2 386 150 → 34 029 | 3 × 1024 px | 1 |
| Fou | `bishop.glb` | 53,84 → 2,38 Mo | 1 663 847 → 38 325 | 1 × 1024 px | 1 |
| Cavalier | `knight.glb` | 87,49 → 4,01 Mo | 262 122 → 18 000 | 29 × 256 px | 18 |
| Tour | `rook.glb` | 127,16 → 4,68 Mo | 1 897 327 → 29 853 | 3 × 1024 px | 1 |
| Pion | `pawn.glb` | 28,86 → 0,84 Mo | 819 474 → 9 813 | 1 × 1024 px | 1 |

Total : **15,45 Mo**, contre environ **397,25 Mo** de GLB sources. Le cavalier conserve 163 262 triangles avant décimation après retrait du décor. Le terrain, la végétation et deux cartes de sol/brume sont exclus uniquement du dérivé ; les 20 sous-maillages de la monture, du cavalier et de leur équipement sont réunis avant export. Les 18 matériaux restent distincts pour préserver les textures et transparences.

Blender **5.2.2 LTS**, trouvé dans `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`, assure l’import, la décimation, une soudure de positions si nécessaire, le redimensionnement des images et l’export statique. Les petits éléments disjoints limitent la réduction de certains scans : les objectifs de décimation sont indicatifs ; les nombres réels sont ceux du tableau.

Le cavalier dépendait de `KHR_materials_pbrSpecularGlossiness`, extension ancienne non prise en charge par le GLTFLoader actuel. Blender l’a convertie ; la finition exportée conserve couleur, alpha et normales et utilise une rugosité métallique standard. Les dérivés n’exigent aucun décodeur Draco, Meshopt ou KTX2. Les extensions optionnelles restantes (`KHR_materials_specular`) sont reconnues par Three.js. Tous les buffers et toutes les textures JPEG/PNG sont intégrés : aucune requête vers un chemin du téléchargement ou un service externe n’est nécessaire. Aucun squelette ni animation de personnage dans les six fichiers.

Le `.blend` alternatif du roi contient une texture couleur embarquée de 2048 px. Il référence aussi une HDR de scène absente (`autumn_road_1k.hdr`), non embarquée. Cette HDR n’est pas nécessaire au GLB choisi ni aux lumières du sanctuaire. L’inspection du `.blend` a désactivé l’exécution automatique et n’a pas enregistré le fichier. **Aucune conversion des six pièces n’est bloquée.**

## Provenance et licences

Les ZIP ne contiennent aucun fichier LICENSE, README, copyright ou crédits. Aucun texte de licence n’a été trouvé dans le `.blend` alternatif.

| Pièce | Indication présente dans les métadonnées téléchargées |
| --- | --- |
| Roi | « Lich King - World of Warcraft », Brian Trepanier / CMBC ; `CC-BY-4.0`. [Source déclarée](https://sketchfab.com/3d-models/lich-king-world-of-warcraft-e8b37a8f85d34efa9e01747966f12bb8). |
| Cavalier | « The Dark Wraith », davidkong ; `CC-BY-4.0`. [Source déclarée](https://sketchfab.com/3d-models/the-dark-wraith-392342e94ee94c1b823a367a8ddcf9ee). |
| Tour | « Crumbling Stone Watchtower », Pigcraft ; `CC-BY-4.0`. [Source déclarée](https://sketchfab.com/3d-models/crumbling-stone-watchtower-c6e5072e29e0400180edf5df7e116080). |
| Reine, fou, pion | Aucune licence, auteur ou URL source dans les GLB ; générateur indiqué : `pygltflib@v1.16.1`. Les noms des fichiers ne constituent pas une licence. |

Ces déclarations proviennent des téléchargements et n’ont pas été vérifiées auprès des auteurs. La référence Warcraft du roi peut aussi impliquer des droits tiers que ces métadonnées ne précisent pas. Aucune licence n’est attribuée par le projet aux trois modèles sans notice. Tous les téléchargements et dérivés restent locaux et ignorés, y compris ceux portant une déclaration CC-BY. Les auteurs et mentions existants sont conservés dans les métadonnées des dérivés avec une mention des transformations.

**Ne pas publier ces fichiers ni le dossier `dist` local avant confirmation des droits et mise en place des attributions requises.** Vite copie `public` dans `dist` lors du build : `.gitignore` protège le suivi Git, pas une publication manuelle du build. Un clone du dépôt sans assets utilisera automatiquement les modèles procéduraux.

## Intégration et comportement

`Board.tsx` utilise le point de substitution existant : `<Piece renderer={ImportedPiece} .../>`. Les règles chess.js, les commandes Zustand, l’interface et les transitions de mouvement/capture restent inchangées. Les identités React des pièces immobiles sont conservées pendant un coup pour éviter de remonter toute l’armée.

`modelAssets.ts` charge au plus deux fichiers simultanément, une seule fois par type. La promesse, les géométries, textures et variantes de matériaux sont mises en cache pour la session. Chaque pièce clone uniquement la hiérarchie ; les variantes argent/obsidienne partagent les textures avec les matériaux originaux. Les matériaux sources ne sont pas modifiés. Un petit socle de camp rend la distinction lisible même si une texture couleur est sombre. Les ressources partagées ne sont pas détruites lors d’une capture ou d’un déplacement.

`ImportedPiece.tsx` affiche immédiatement le modèle procédural de son type, puis le GLB lorsqu’il est prêt. Une erreur réseau, de parsing ou de géométrie conserve ce repli, sans interrompre les cinq autres types et sans boucle de nouvelles requêtes. Une erreur est signalée une seule fois par type dans la console. Recharger la page permet de réessayer après réparation d’un fichier.

`modelConfig.ts` centre les bornes, place le point bas sur le socle et applique une échelle uniforme. L’empreinte tient dans un cercle de diamètre 0,80 unité pour ne pas dépasser la case même pendant la rotation de capture. Les hauteurs sont des maxima (roi 1,35 ; reine 1,28 ; fou 1,13 ; cavalier 1,08 ; tour 0,98 ; pion 0,82), limités aussi par la largeur, sans déformer les proportions. Le socle ajoute 0,047 unité. Le roi reçoit un lacet de −90°, le fou de 180°, puis les Blancs font face aux Noirs avec une rotation de camp de 180°. Les corrections de face ont été examinées dans les rendus Blender.

Le pion téléchargé est en **pose en T**, sans rig. Cette pose est conservée ; il ne s’agit pas d’un problème d’import. Les détails irréguliers des scans et la silhouette large de certains personnages restent visibles. Aucun rig ni animation de personnage n’a été ajouté.

## Reproduire localement

Depuis la racine du projet, avec les téléchargements dans `pieces_3d/` :

```powershell
python tools/audit_revenants.py --extract
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python tools/prepare_revenants.py
python tools/audit_revenants.py
npm.cmd run dev
```

Pour un seul modèle, ajouter par exemple `-- knight` à la commande Blender. `tools/preview_revenants.py` produit deux planches de contrôle avec Cycles CPU dans `pieces_3d/_prepared/`. Il ne reproduit pas exactement l’éclairage ni la caméra du jeu.

Rapports locaux : `pieces_3d/_prepared/inventory.json`, un JSON de conversion par pièce, logs dans `pieces_3d/`, aperçus `preview-front.png` et `preview-back.png`. Aucun de ces fichiers dérivés ne doit être suivi par Git tant que les droits ne sont pas confirmés.

## Vérifications

- Build TypeScript/Vite et lint réussis.
- 44 tests : les 27 tests antérieurs, 11 tests des ressources/normalisations et 6 tests sur les vrais GLB.
- Le véritable GLTFLoader Three.js a parsé géométries, hiérarchies et matériaux des six dérivés. Le test hors navigateur remplace seulement le décodage des images par des textures factices ; il ne valide pas leur rendu WebGL.
- L’audit Python vérifie en-têtes, buffers, absence de dépendances externes, tailles, triangles et dimensions JPEG/PNG réelles. Blender a importé et rendu les six fichiers avec leurs textures.
- Les tests locaux sur fichiers sont ignorés si les assets sont absents (CI ou clone Git), les autres tests restent exécutables.
- `npm run dev` démarre correctement ; HTML et six URLs GLB répondent HTTP 200. Chaque réponse GLB est identique au fichier local attendu. Ce contrôle HTTP ne remplace pas un test de rendu dans un navigateur.
- Aucun navigateur connecté disponible : contrôle dans React/WebGL, gestes, clics 3D, reflets et performances GPU/mobile non vérifiés. L’avertissement Vite sur la taille du bundle 3D reste présent.
