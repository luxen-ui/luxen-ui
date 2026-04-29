# Claude Design

Notes sur les capacités et limites de **Claude Design** (l'environnement Claude.ai dédié au design — projets / artefacts HTML) lorsqu'il travaille avec un design system comme Luxen UI.

::: info SOURCE
Synthèse construite au fil des échanges avec Claude Design lui-même. Ce document est mis à jour au fur et à mesure des découvertes — chaque section représente une capacité ou une limite confirmée.
:::

## Skills : `load` vs `read`

La distinction la plus importante. Claude Design traite deux catégories de skills différemment :

| Type de skill            | Comportement                                                                                                                         | Exemple                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **Built-in skills**      | **Loaded** — appelés via `invoke_skill`, le prompt complet est injecté dans le contexte comme instructions opérationnelles.          | "Make a deck", "Animated video", "Frontend design"              |
| **Repo-resident skills** | **Read only** — fichiers texte inertes, lus comme n'importe quel autre fichier. Pas d'auto-chargement, pas d'activation automatique. | `.claude/skills/`, `AGENTS.md`, `SKILL.md` livrés dans un dépôt |

::: warning CONSÉQUENCE
Un `SKILL.md` placé dans un dépôt **n'est pas un skill enregistré** du point de vue de Claude Design. C'est de la documentation. Pour qu'il soit suivi, il faut soit :

- demander explicitement à Claude Design de le lire et de l'appliquer (ex. _« suis les conventions de MOCKUPS.md »_),
- soit relire le fichier en début de chaque session.
  :::

## L'Agent Skill `luxen-ui` publié

Le skill généré dans `node_modules/luxen-ui/dist/skills/luxen-ui/` ([voir Agent Skills](./agent-skills.md)) tombe dans la catégorie **read only** pour Claude Design — il ne s'active pas tout seul. Pour l'utiliser :

- **Avec Claude Code** : `npx skills add ./node_modules/luxen-ui/dist/skills/luxen-ui` charge le skill comme skill opérationnel.
- **Avec Claude Design** : il faut pointer Claude Design sur le fichier (_« lis `node_modules/luxen-ui/dist/skills/luxen-ui/SKILL.md` et applique-le »_) à chaque conversation.

## Comportement par défaut sur les `<l-*>` tags

Sans instructions, Claude Design écrit `<l-badge>`, `<l-avatar>` etc. dans les artefacts mais le navigateur les traite comme des **éléments HTML inconnus** :

- ✅ Rendu visuel possible — Claude Design écrit du CSS qui cible directement les tags (`l-badge { ... }`, `l-badge[variant="info"] { ... }`).
- ❌ Pas de `customElements.define()`, pas de Shadow DOM, pas de cycle de vie (`connectedCallback`, observers d'attributs).
- ❌ Pas de comportement réel : `<l-tooltip>` ne se positionne pas, `<l-dialog>` ne piège pas le focus, `<l-rating>` est une image statique.
- ❌ Les styles « fuient » — ce qui est encapsulé dans un Shadow DOM en vrai Luxen est mélangé au reste.

Pour un projet de design system axé sur les visuels + tokens + règles de composition, c'est suffisant. Pour des maquettes fonctionnelles (composants qui se comportent vraiment), il faut autre chose.

## Comment rendre les composants réels dans une maquette

Depuis `luxen-ui@0.1.2`, le package publie un dossier `cdn/` self-contained (lit, floating-ui, iconify-icon bundlés en chunks, CSS shadow DOM inliné dans le JS). Un seul `<script type="module">` par élément suffit pour qu'il soit upgradé en vrai custom element avec shadow DOM, lifecycle, et comportement (focus traps, positioning, events).

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- Tokens + base reset -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/luxen-ui@0.1.2/cdn/styles/index.css"
    />

    <!-- Une <script> par élément utilisé. Importer index.js (le registrar),
         pas <name>.js (qui n'exporte que la classe). -->
    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/luxen-ui@0.1.2/cdn/elements/avatar/index.js';
      import 'https://cdn.jsdelivr.net/npm/luxen-ui@0.1.2/cdn/elements/badge/index.js';
    </script>
  </head>
  <body>
    <l-avatar name="Luxen User"></l-avatar>
    <l-badge>Beta</l-badge>
  </body>
</html>
```

Le template complet (avec règles de path derivation, exceptions appearance, fallback API jsDelivr) vit dans `MOCKUPS.md` à la racine du dépôt — c'est lui qu'il faut pointer explicitement à Claude Design en début de conversation.

### Pourquoi `esm.sh` ne marche pas (et pourquoi jsDelivr suffit)

Le `dist/` publié contient des directives Vite non transformées (`import rawStyles from './avatar.css?inline'`) — c'est un trou dans le path npm-consumer pour les bundlers non-Vite. esm.sh tente de les résoudre et casse en 404. Mais le `cdn/` (introduit en `0.1.2`) est un build Vite avec ces directives résolues : tous les imports sont relatifs, les CSS shadow sont inlinés en string JS. jsDelivr le sert tel quel, aucune ré-écriture nécessaire.

→ **Pour les maquettes : toujours jsDelivr + `/cdn/...`, jamais esm.sh + `/dist/...`.**

## Lecture des fichiers du dépôt

Claude Design lit les fichiers **à la demande, quand on lui pointe ou quand il explore**. Conséquences :

- Mettre les instructions dans `AGENTS.md` ou `MOCKUPS.md` à la racine = visibles dès le premier `ls`.
- Les fichiers profondément nichés (`.claude/skills/...`) ne sont lus que si Claude Design décide de fouiller.
- Un fichier `MOCKUPS.md` à la racine est plus discoverable qu'un `SKILL.md` enfoui — à fonctionnalité égale (puisque les deux sont _read_, pas _loaded_).

## Comment lister les fichiers réellement publiés

Claude Design ne connaît pas a priori les chemins exacts des CSS/JS publiés. Deux mécanismes pour qu'il les trouve :

1. **Convention de nommage** — pour `<l-foo>`, le JS registrar est à `cdn/elements/foo/index.js`, le CSS optionnel à `cdn/styles/elements/foo.css`. Préfixe `l-` retiré, mapping 1:1.
2. **API jsDelivr de listing** — `https://data.jsdelivr.com/v1/package/npm/luxen-ui@<version>/flat` retourne l'arborescence complète du package en JSON. Claude Design peut la fetcher pour vérifier qu'un chemin existe avant d'écrire un `<link>`.

Les exceptions à la convention (sous-dossiers `appearance`) sont documentées dans `MOCKUPS.md`.

## Ce que Claude Design **ne peut pas** faire

- ❌ Charger automatiquement un skill depuis un dépôt (pas d'équivalent à `invoke_skill` pour les skills locaux).
- ❌ Exécuter du code serveur ou utiliser des dépendances npm dans un artefact — l'artefact est un HTML autonome dans une iframe sandbox.
- ❌ Persister entre artefacts — chaque artefact est isolé, les composants chargés dans l'un ne sont pas disponibles dans un autre.
- ❌ Importer depuis le système de fichiers local du dépôt dans un artefact — l'iframe n'a accès qu'au réseau public.

## Ce que Claude Design **peut** faire

- ✅ Lire n'importe quel fichier du dépôt (markdown, JSON, code source) si on le lui demande ou s'il l'explore.
- ✅ Charger des modules ESM publics dans les artefacts (jsDelivr, esm.sh, unpkg).
- ✅ Suivre des instructions repo-resident — à condition d'y être pointé explicitement.
- ✅ Utiliser `custom-elements.json` (CEM manifest) comme source de vérité pour les attributs/slots/events des éléments — accessible via `https://cdn.jsdelivr.net/npm/luxen-ui@<version>/cdn/custom-elements.json`.

## TL;DR

> **load = built-in skills uniquement. Read = tout le reste, et seulement quand Claude Design regarde.**

Pour qu'un design system custom (comme Luxen UI) soit utilisé fidèlement par Claude Design, il faut :

1. Un fichier d'instructions à la racine du dépôt (ex. `MOCKUPS.md`) avec un template CDN prêt à coller.
2. Pointer explicitement Claude Design dessus en début de conversation.
3. Épingler une version publiée du package — pas de `@latest`.
