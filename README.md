# ECLIPSE CHESS — V2 · Les Revenants

Jeu d’échecs 3D local pour deux joueurs dans le Sanctuaire oublié. React 19, Three.js / React Three Fiber, Zustand et chess.js. Sans serveur de jeu, compte, IA, réseau ni asset payant.

## Lancement

Node.js 22.12+ recommandé.

```sh
npm install
npm run dev
```

Ouvrir l’adresse affichée par Vite. Sous PowerShell avec scripts désactivés, employer `npm.cmd`.

```sh
npm run lint
npm test
npm run build
npm exec vite preview
```

Pour Vercel : preset Vite, commande `npm run build`, dossier de sortie `dist`. Aucune variable d’environnement nécessaire. Le build reste purement statique.

## Jouer et régler le sanctuaire

Cliquer une pièce du camp actif puis une destination. Les points bleus indiquent les déplacements légaux ; les anneaux orangés indiquent les captures, y compris en passant. La sélection possède un cercle spectral, les deux cases du dernier coup sont teintées et le roi en échec est rouge. Le panneau annonce mat, vainqueur, pat et raisons de nulle. La promotion laisse choisir dame, tour, fou ou cavalier.

Les déplacements durent environ 560 ms, avec une légère élévation. La victime se rétracte dans le sol. Les deux pièces du roque se déplacent ensemble. Le pion conserve sa silhouette pendant le déplacement de promotion, puis prend sa nouvelle forme. Les coups, annulations et nouvelles parties sont bloqués pendant une transition. Le modèle chess.js est mis à jour immédiatement et reste l’unique vérité ; l’animation n’est qu’une présentation.

Glisser pour orbiter, molette ou pincement pour zoomer. La caméra conserve une hauteur minimale pour préserver la lecture du plateau. Les ruines n’interceptent aucun clic. Les boutons de réinitialisation restaurent la caméra sans recréer le contexte WebGL.

Le panneau **Réglages du sanctuaire** permet de désactiver les animations, de choisir la qualité faible/élevée et de réinitialiser la caméra. La préférence système de mouvement réduit est respectée au démarrage. Le mode faible désactive les ombres, limite le DPR à 1 et retire les grandes ruines du fond. Les réglages sont conservés pendant la session, sans sauvegarde permanente.

Le plateau textuel repliable permet de jouer au clavier, avec sélection, destinations légales et roi en échec annoncés. Les dialogues gèrent Échap, le confinement du focus et son retour. En cas d’indisponibilité du rendu 3D, le plateau textuel reste utilisable. Un délai de secours libère les transitions même sans rendu WebGL.

## Direction artistique et performances

Les six silhouettes sont procédurales : roi cuirassé couronné, reine voilée spectrale, fou à mitre et bâton rituel, cheval cuirassé, bastion à créneaux et soldat au heaume ancien. Argent oxydé et obsidienne distinguent les camps ; l’énergie bleue reste ponctuelle.

Le sanctuaire combine le socle sculpté de V1.1, des frises ogivales, des piliers ruinés, des arches fragmentées éloignées du plateau, des gravures au sol, une lumière froide et une brume de profondeur. Aucun téléchargement artistique ni effet de postproduction.

Les détails de chaque archétype sont fusionnés en quatre géométries partagées entre toutes les pièces de ce type : au plus quatre appels de dessin par pièce et par passe. Les matériaux sont partagés entre pièces d’un même camp. La petite texture de pierre est générée localement. Les ressources partagées survivent aux remontages et aux changements de qualité. La scène est rendue à la demande, avec invalidation pendant les transitions et les mouvements de caméra ; les animations ne provoquent pas de mise à jour React à chaque image. Le plateau 3D est chargé séparément avec `React.lazy`.

## Architecture et futurs GLB

- `src/chess/game.ts` : validation chess.js et états de présentation.
- `src/chess/presentation.ts` : instantanés visuels, roque, capture, en passant, promotion et interpolation.
- `src/store/gameStore.ts` : commandes, verrou de transition et réglages.
- `src/scene/Board.tsx` : rendu à la demande, contrôles, feedback et mouvements.
- `src/scene/Piece.tsx` : géométries fusionnées et interface visuelle `PieceProps` (`type`, `color`).
- `src/scene/Sanctuary.tsx` : architecture décorative sans interaction.
- `src/App.tsx`, `src/Dialog.tsx`, `src/styles.css` : interface responsive, accessibilité et dialogues.

`Piece` accepte une prop `renderer`, un composant React respectant `PieceProps`. Un futur composant GLB pourra donc remplacer `RevenantModel` dans l’armée sans modifier le store, les règles ou les transitions. Convention : origine au centre de la base, Y vers le haut, silhouette dans ±0,49 unité sur X/Z, face vers +Z avant l’orientation du camp. Le renderer prend en charge l’orientation du camp, comme `RevenantModel`.

## Vérifications V2 et limites

27 tests automatisés couvrent les règles existantes, promotions, roques des deux côtés, prise en passant, captures animées, verrou des commandes, fin de transition périmée, désactivation des animations, réglages, états de fin et intégrité des six géométries. Les anciens tests d’interaction s’exécutent en mode sans animation ; les nouveaux vérifient le mode animé.

`npm run build`, `npm run lint` et `npm test` ont été exécutés avec succès. Le bundle 3D séparé dépasse encore le seuil d’avertissement de Vite (500 ko avant compression). Aucun navigateur connecté ni navigateur intégré disponible dans cette session : contrôle visuel, clics 3D, gestes tactiles et mesure des performances GPU/mobile restent à effectuer sur appareil réel.

La partie est en mémoire : recharger recommence la partie. Les nulles reconnues par chess.js terminent automatiquement la partie, comme dans la V1.1. Les polices Google Fonts conservent des polices système de secours. WebGL est nécessaire pour la scène 3D. Aucun déploiement Vercel n’a été effectué.
