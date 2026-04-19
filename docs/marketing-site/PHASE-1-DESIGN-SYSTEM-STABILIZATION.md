# Marketing Site Phase 1: Design System Stabilization

Date: 2026-04-19
Scope: apps/marketing-site
Status: implemented and validated

## 1. Objective
Standardize the design foundation so future page refinements are consistent, scalable, and lower risk.

## 2. Implemented Standards

### Typography and hierarchy
- Removed blanket italic styling from all `h1` and `h2` base headings.
- Added reusable heading utility classes:
  - `.h1` for page-level hero/headline usage.
  - `.h2` for section headline usage.
- Added `.section-lead` helper class for consistent supporting copy.

### Spacing rhythm
- Introduced section spacing tiers:
  - `.section-tight` for dense sections.
  - `.section` for default rhythm.
  - `.section-feature` for high-emphasis sections.
- Updated `Section` layout component to accept `size` (`sm`, `md`, `lg`).

### Surface and depth system
- Upgraded base card styles to stronger, cleaner defaults.
- Added `card-spotlight` surface variant for high-emphasis content blocks.

### Interaction and motion
- Added motion timing variables and `motion-standard` utility.
- Applied consistent focus-visible treatment for actionable components.

### CTA and input consistency
- Upgraded button primitives:
  - Larger hit area and stronger visual hierarchy.
  - Consistent hover/press/focus behavior.
  - Correct semantic rendering for button/link/anchor patterns.
- Upgraded input and textarea primitives:
  - Brand-consistent focus ring and border behavior.
  - Improved spacing and interaction polish.

### Token consistency pass
- Removed legacy token usage from target components (`brand1`, `brand2`, `brand3`, `brand4`).
- Replaced with current brand palette classes (`brand-navy`, `brand-blue`, `brand-lightblue`, `brand-green`).

## 3. Files Updated in Phase 1
- apps/marketing-site/src/index.css
- apps/marketing-site/src/components/atoms/Button.jsx
- apps/marketing-site/src/components/atoms/Input.jsx
- apps/marketing-site/src/components/atoms/Textarea.jsx
- apps/marketing-site/src/components/layout/Section.jsx
- apps/marketing-site/src/components/layout/NavBar.jsx
- apps/marketing-site/src/components/sections/HomePage-sections/ServiceAreas.jsx
- apps/marketing-site/src/components/layout/Footer.jsx

## 4. Validation
Validation command:
- `npm run build` (apps/marketing-site)

Expected acceptance criteria for this phase:
1. No legacy `brand1-4` token usage remains in touched components.
2. Shared atoms follow one focus/spacing/interaction standard.
3. Navigation/footer align with brand interaction colors and spacing baseline.
4. Build passes with no blocking errors.

## 5. Next Recommended Work (Phase 2)
1. Apply new hierarchy system to homepage hero trust blocks and CTA stacking.
2. Refine service/pricing surfaces using `card-spotlight` patterns.
3. Run focused accessibility pass (keyboard/focus order and contrast) after visual updates.
