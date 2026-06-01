# Guide de Style Front-end (Inspiré par Linear.app)

Ce document répertorie et documente le système de design appliqué aux pages de Connexion et d'Inscription du front-end. Les autres agents de développement et développeurs doivent se référer à ce guide pour copier et appliquer ce style minimaliste et haut de gamme sur les autres pages du projet (produits, profil, panier, etc.).

---

## 🌌 Philosophie du Design

- **Minimaliste & Épuré** : Pas d'éléments superflus. Espacement et grille géométriques, bordures ultra-fines (1px), focus clair.
- **Mode Sombre Absolu** : Fond noir pur (`#000000`) combiné à une grille de points fine (`linear-dots`) et un halo de lumière violette extrêmement doux (`linear-top-glow`).
- **Absence de Conteneur Lourd** : Le formulaire d'authentification flotte directement sur l'arrière-plan (sans carte ou cadre opaque délimité), créant un effet moderne, épuré et aérien identique à `linear.app/login`.
- **Typographie Premium** : Utilisation exclusive de la police **Inter** avec un crénelage (letter-spacing) ajusté pour un effet éditorial condensé (`letter-spacing: -0.02em` / `tracking-editorial`).
- **Boutons Haute-Contraste** : Boutons primaires en blanc pur avec texte noir pour un contraste maximal et une ergonomie optimale.

---

## 🎨 Palette de Couleurs (Couleurs de Thème)

Les variables de couleur sont intégrées dans le fichier [src/index.css](file:///home/kiady/Devellopement/DevProjects/App/Pieces_auto/frontend/src/index.css) sous la directive `@theme` de Tailwind v4. Elles peuvent être utilisées directement via les classes Tailwind classiques :

| Couleur Tailwind | Valeur Hex/RGBA | Description | Usage typique |
| :--- | :--- | :--- | :--- |
| `bg-linear-bg` | `#070709` | Fond noir/bleuté ultra-sombre | Arrière-plan de la page |
| `bg-linear-accent` | `#5e6ad2` | Violet/Indigo signature Linear | Boutons primaires, bordures actives |
| `bg-linear-accent-hover`| `#4d57c2` | Violet foncé pour survol | État de survol (`hover:`) |
| `bg-linear-card` | `rgba(13, 13, 18, 0.65)` | Fond de carte translucide | Cartes en glassmorphism |
| `border-linear-border` | `rgba(255, 255, 255, 0.08)` | Bordure grise très fine | Séparateurs, bordures d'input |
| `text-linear-text-primary`| `#f7f8f8` | Blanc cassé brillant | Titres et textes importants |
| `text-linear-text-secondary`| `#b4bcd0` | Gris clair neutre | Textes secondaires, icônes |
| `text-linear-text-muted` | `#828292` | Gris bleuté estompé | Labels en majuscules, descriptions |

---

## 🧪 Effets Spéciaux & Classes Utilitaires

Trois utilitaires personnalisés ont été ajoutés dans [src/index.css](file:///home/kiady/Devellopement/DevProjects/App/Pieces_auto/frontend/src/index.css) :

### 1. Glassmorphism (`linear-glass`)
Applique un effet de verre dépoli réaliste avec un léger reflet interne en haut de l'élément :
```html
<div className="linear-glass rounded-2xl p-8">
  <!-- Contenu -->
</div>
```

### 2. Halo Lumineux d'Arrière-Plan (`linear-glow`)
Applique un dégradé radial violet très doux centré en haut de l'écran, idéal pour l'arrière-plan global :
```html
<div className="min-h-screen bg-linear-bg linear-glow">
  <!-- Flous d'ambiance optionnels -->
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-accent/10 rounded-full blur-[120px] pointer-events-none" />
</div>
```

### 3. Effet de Balayage Shimmer (`linear-shimmer`)
Idéal pour les états de chargement (skeletons) :
```html
<div className="linear-shimmer w-full h-10 rounded"></div>
```

### 4. Barre de Progression Animée (`progress-shimmer-glow`)
Dégradé violet qui balaye en continu + halo lumineux. Utilisé dans la barre de progression du Register. La largeur est contrôlée via `style={{ width: '...' }}` pour les transitions d'étapes :
```html
<div className="w-full h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
  <div
    className="h-full progress-shimmer-glow transition-all duration-300 ease-out"
    style={{ width: `${(step / 3) * 100}%` }}
  />
</div>
```

### 5. Animation d'Entrée de Carte (`animate-card-enter`)
Applique une animation d'apparition souple (fade + scale + blur) à la carte principale lors du chargement de la page. À appliquer sur le conteneur de la carte glassmorphique :
```html
<div className="linear-glass rounded-2xl p-8 animate-card-enter">
  <!-- Contenu -->
</div>
```

### 6. Blob Flottant Animé (`animate-float-glow`)
Animation lente de lévitation (12 s) appliquée aux blobs de lumière en arrière-plan pour un effet "vivant" et organique :
```html
<div className="absolute ... bg-linear-accent/10 rounded-full blur-[120px] animate-float-glow" />
```

### 7. Grille de Points Arrière-Plan (`linear-dots`)
Génère une grille de points géométriques très subtile en arrière-plan, caractéristique de Linear.app :
```html
<div className="min-h-screen bg-black linear-dots">
  <!-- Contenu -->
</div>
```

### 8. Halo Supérieur Épuré (`linear-top-glow`)
Un halo violet très diffus positionné en haut de l'écran, pour ajouter de la profondeur sans alourdir le fond sombre :
```html
<div className="min-h-screen bg-black linear-dots linear-top-glow">
  <!-- Contenu -->
</div>
```

---

## 📝 Typographie & Contraste (Inspiré par Linear.app)

Pour conserver le rendu haut de gamme, premium et "éditorial" de l'application, nous appliquons des règles de crénelage (letter-spacing) serré et de contrastes de couleurs subtils pour éviter la fatigue visuelle sur fond sombre.

### 1. Espacement des lettres (Letter-spacing)
Sur tous les grands titres et en-têtes (`h1` à `h6`), l'espacement des lettres est resserré pour donner un effet compact et professionnel.
- **En CSS Global** : appliqué automatiquement sur toutes les balises `h1`, `h2`, `h3`, `h4`, `h5`, `h6` :
  ```css
  letter-spacing: -0.02em;
  ```
- **Classe Tailwind personnalisée** : `tracking-editorial` (qui applique `letter-spacing: -0.02em;` via la variable `--tracking-editorial` sous `@theme`).
- **Classes Tailwind standards** : `tracking-tight` ou `tracking-tighter`.

### 2. Contrastes de Couleurs & Évitement du Blanc Pur (#FFFFFF)
Pour réduire la fatigue oculaire sur fond sombre, nous évitons le blanc pur pour le texte général.

- **Titres principaux** : Blanc très légèrement grisé ou en dégradé métallique subtil.
  - *Blanc grisé* : `text-linear-text-primary` (`#f7f8f8`).
  - *Dégradé métallique* : Utilisez la classe utilitaire `text-linear-gradient` :
    ```html
    <h2 className="text-2xl font-semibold text-linear-gradient tracking-editorial">
      Titre Premium
    </h2>
    ```
- **Textes de paragraphe** : Gris texturé premium pour un rendu sophistiqué et lisible.
  - *Gris texturé* : `text-linear-text-paragraph` (ou `text-linear-text-muted` qui est mappé sur `#8a8f98`).
  - *Exemple* :
    ```html
    <p className="text-sm text-linear-text-paragraph">
      Votre description ici...
    </p>
    ```

---

## ✍️ Éléments de Formulaires

Pour conserver le rendu haut de gamme, respectez ces règles lors de la création d'éléments de formulaires :

### Labels de Champs
Toujours en majuscules, taille miniature, gris estompé et espacement des lettres large :
```html
<label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
  Numéro de téléphone
</label>
```

### Champs de Saisie (Inputs)
Fond noir semi-transparent, bordure fine, transition douce lors de l'activation (focus violet avec halo) :
```html
<input
  type="text"
  className="w-full bg-black/30 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-linear-text-muted/60 focus:outline-none focus:border-linear-border-focus focus:ring-1 focus:ring-linear-accent/30 transition-all font-medium"
/>
```

### Boutons Primaires
Fond violet, texte blanc moyen, légère ombre portée violette, effet d'échelle subtil au clic (`active:scale-[0.98]`) :
```html
<button className="w-full bg-linear-accent hover:bg-linear-accent-hover text-white text-sm font-medium py-2.5 rounded-lg border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(94,106,210,0.25)]">
  Continuer
</button>
```

---

## 🔀 Logique de Transition par Étape

Pour les formulaires à étapes complexes (login en 2 phases, inscription en 3 étapes), nous utilisons un conteneur parent en `relative overflow-hidden` et des divs enfants en positionnement absolu se décalant sur l'axe X selon l'étape courante, couplé à une animation d'opacité.

Exemple condensé en React :
```jsx
const [step, setStep] = useState(1);

return (
  <div className="relative overflow-hidden w-full min-h-[200px]">
    {/* Étape 1 */}
    <div className={`transition-all duration-300 ease-out ${
      step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0"
    }`}>
      <!-- Inputs Étape 1 -->
    </div>

    {/* Étape 2 */}
    <div className={`transition-all duration-300 ease-out ${
      step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0"
    }`}>
      <!-- Inputs Étape 2 -->
    </div>
  </div>
);
```
