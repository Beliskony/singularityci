# Intégration TemplateFloral

1. Copier le dossier `TemplateFloral/` dans `frontend/components/templates/TemplateFloral/`.

2. Dans `registry.tsx`, ajouter :

```tsx
import TemplateFloral from "./TemplateFloral";
import TemplateFloralCover from "./TemplateFloral/cover.png";
import { floralDemoProps } from "./TemplateFloral/demoProps";

export const TEMPLATE_REGISTRY: Record<string, { component, cover, demoProps }> = {
  classic: { component: TemplateClassic, cover: TemplateClassicCover, demoProps: classicDemoProps },
  eclat: { component: TemplateEclat, cover: TemplateEclatCover, demoProps: eclatDemoProps },
  floral: { component: TemplateFloral, cover: TemplateFloralCover, demoProps: floralDemoProps },
};
```

3. Seed DB (migration additive, même style que `005_seed_templates.sql`) :

```sql
CALL sp_template_create('floral', 'Floral', 'Un faire-part bordeaux et or, romantique et élégant.', 16000, 1);
```
(Adapter le prix XOF à ta grille tarifaire - Classic=15000, Éclat=18000.)

4. Le `TemplateFieldSchema` de Floral (pour le formulaire de personnalisation côté dashboard) :

- `colorFields`: toutes les clés `themeColors` utilisées dans les composants
  (`heroBg`, `heroSealColor`, `heroEyebrowColor`, `heroNamesColor`, `heroDateColor`, `heroVenueColor`,
  `welcomeBg`, `welcomeTitleColor`, `welcomeTextColor`,
  `calendarBg`, `calendarTitleColor`, `calendarDayColor`, `calendarMutedColor`, `calendarActiveColor`,
  `programBg`, `programTitleColor`, `programTimeColor`, `programLabelColor`, `programLineColor`,
  `dressCodeBg`, `dressCodeTitleColor`, `dressCodeTextColor`,
  `galleryBg`, `galleryTitleColor`,
  `venueBg`, `venueTitleColor`, `venueNameColor`, `venueTextColor`,
  `rsvpBg`, `rsvpTitleColor`, `rsvpLabelColor`, `rsvpAcceptBg`, `rsvpDeclineBg`, `rsvpAccentColor`,
  `footerBg`, `footerNamesColor`, `footerTextColor`,
  plus les 3 clés de base `primary`, `textOnLight`, `textOnDark`).
- `textFields`: `welcomeTitle`, `welcomeText`, `dressCodeTitle`, `dressCodeText`, `venueText`, `rsvpTitle`.
- `maxImagesByRole`: `{ HERO: 0, GALLERY: 4, VENUE: 1 }` (Floral n'utilise pas d'image HERO dédiée,
  le hero est purement graphique/sceau de cire - à ajuster si tu veux y ajouter une photo plus tard).
- `maxProgramItems`: 6 (au-delà la timeline devient trop longue visuellement).

## Notes de conception

- Palette fidèle à la référence : bordeaux profond (#4a0e1a / #330a12), vin (#6e1b2b),
  or (#c9a24a / #d8bd80), crème (#f4ead9 / #efe0c8).
- Typographie : **Cormorant Garamond** (serif élégant, corps de texte) + **Tangerine**
  (script, réservée aux prénoms et aux titres de section - "belle typographie" demandée).
- Section "dress code" = mockup visuel (palette de couleurs indicative), comme Registry/Fund
  sur Éclat - pas de nouvelle colonne DB nécessaire.
- Le formulaire RSVP garde `status: "ATTENDING" | "NOT_ATTENDING"` (cohérent avec
  `002_rsvp_site_fixes.sql`). Les préférences de boissons (checkboxes) sont une amélioration
  purement visuelle : elles sont repliées dans le champ `message` existant plutôt que d'ajouter
  une colonne - à toi de confirmer si `RsvpFormData`/`sp_rsvp_create` acceptent bien un `message`
  optionnel côté backend réel (comme pour Éclat, ce point n'a pas été re-vérifié sur le fichier
  de types RSVP définitif).
- Pas de `fixed`/intro-gate façon Éclat ici : le Hero est en haut de page normale (comme Classic),
  pour éviter le bug de `position: fixed` cassé par un ancêtre avec `transform` (déjà rencontré
  sur `/apercu`).
- `colorScheme: "light"` appliqué sur le wrapper racine pour éviter toute fuite de dark mode
  du site principal (même pattern que Classic/Éclat).
