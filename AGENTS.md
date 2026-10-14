# Consignes permanentes pour Codex — Eclipse Chess

## Commencer une mission

- Lire `PROJECT_STATUS.md` avant toute intervention, puis les fichiers concernés et les différences Git. Ne pas écraser le travail local existant.
- Le dernier retour visuel de l’utilisateur fait foi : **la qualité des GLB V3.1 reste insatisfaisante et non résolue**. Les 49 tests et les gains d’échelle ne constituent pas une validation artistique. Une future résolution doit être confirmée par un contrôle visuel explicite.
- Adapter le travail à la demande. Ne pas profiter d’une clôture ou d’une documentation pour développer de nouvelles fonctionnalités.

## Architecture et gameplay

- Conserver React/TypeScript/Vite, R3F/Three.js, Zustand et l’architecture actuelle, sauf demande motivée de changement.
- chess.js reste la source unique de vérité. Ne pas reproduire ses règles dans le renderer, le store ou les animations.
- Préserver les règles spéciales, promotions, captures, sélection, états de partie, historique, annulation, paramètres, caméra, responsive, plateau clavier et accessibilité.
- Préserver le verrou d’interaction pendant les transitions et le fallback procédural indépendant pour chaque type de GLB.
- Prioriser l’identification immédiate des pièces, les contrastes des camps et la lecture des cases. Évaluer les modifications artistiques dans le vrai jeu ; expliciter tout contrôle visuel impossible.

## Performance et fiabilité

- Partager géométries, textures, matériaux et chargements. Conserver le cache par type, la file de chargement et le rendu à la demande.
- Éviter les calculs sur les sommets et les mises à jour React à chaque image. Ne pas augmenter inutilement les lumières avec ombres, les draw calls, la résolution ou les effets de postproduction.
- Ne pas introduire de dépendances inutiles, de refonte non demandée, de réseau multijoueur, d’IA ou de comptes.
- Après des modifications de code, vérifier `npm.cmd run build`, `npm.cmd run lint` et `npm.cmd test` ; ajouter des tests pertinents si le comportement change. Rapporter précisément les échecs, tests ignorés et vérifications impossibles.
- Les tests des six fichiers GLB sont conditionnels à leur présence locale. Ne pas présenter une exécution sans ces fichiers comme une validation des modèles.
- Ne pas diagnostiquer une texture ou des normales comme défectueuses sans les inspecter. Les captures Blender ne valident pas le shader WebGL.

## Assets, licences et publication

- **Ne jamais modifier ni supprimer les téléchargements originaux dans `pieces_3d/`.** Préparer les dérivés séparément. Ne pas régénérer les GLB pour une simple relance.
- Ne pas inventer de licence. Queen, bishop et pawn n’ont pas de droits de redistribution confirmés à la clôture du 15/10/2026. Les mentions CC-BY des autres modèles et les éventuels droits tiers doivent aussi être vérifiés avant publication.
- Garder les téléchargements, GLB, ZIP, BLEND, textures et dérivés non autorisés exclus de Git. Respecter les exclusions de `pieces_3d/` et `public/models/revenants/`. Ne pas utiliser `git add -f` pour les contourner.
- **Ne publier aucun asset sans confirmation des droits, provenance et attributions nécessaires.** Cette interdiction couvre les déploiements et transferts publics, pas seulement Git.
- Vite copie `public/` dans `dist/` : `.gitignore` n’empêche pas la publication des assets d’un build local. Ne pas pousser un build précompilé contenant des assets non autorisés. Préparer et inspecter un artefact sans ces fichiers avant tout déploiement public autorisé.
- Préserver les configurations distantes existantes. Aucun push GitHub, déploiement Vercel ou autre publication sans instruction explicite de l’utilisateur. Un commit local ne vaut pas autorisation de publier.

## Fin de mission et reprise

- Actualiser **`PROJECT_STATUS.md` à la fin de chaque mission importante** : changements réels, commandes et résultats des tests, limites connues, retour utilisateur, versions de travail, licences et repère Git daté.
- Distinguer fonctionnement technique, mesures géométriques et validation visuelle. Ne pas marquer le problème graphique résolu sur la seule base du build ou des tests.
- Conserver trois priorités ordonnées et **une seule prochaine action concrète**, suffisamment précise pour reprendre sans contexte oral.
- Lors d’une sauvegarde autorisée, inspecter la liste indexée et les différences avant commit ; exclure secrets, assets non autorisés, dépendances, builds et caches. Ne rien supprimer sans demande.
- Rendre compte du commit créé et de ce qui reste uniquement sur le disque local. Mettre à jour les documents historiques si leur formulation contredit le dernier retour utilisateur.
