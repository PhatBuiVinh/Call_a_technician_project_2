# Marketing Site Phase 0: Baseline and Priorities

Date: 2026-04-19
Scope: apps/marketing-site
Owner: GitHub Copilot (execution pass)

## 1. Agreed Strategic Goal
Elevate the customer website from a functional service site to a premium, trustworthy lead-conversion experience while preserving clarity and performance.

## 2. Prioritized UX Backlog (Impact Order)
1. Unify design language (typography, spacing, depth, interactions) across all primary pages.
2. Strengthen CTA hierarchy and visual prominence in top-of-funnel sections.
3. Remove legacy token/class drift to avoid visual inconsistency and maintenance overhead.
4. Improve perceived quality of form controls and interactive states.
5. Improve top navigation and footer polish for first and last impression quality.

## 3. Baseline Technical Snapshot
Source: production build run on 2026-04-19 using `npm run build` in apps/marketing-site.

Build results:
- Build status: success
- Build time: 6.34s
- Modules transformed: 2683
- Main JS chunk: dist/assets/index-BSNRqsxk.js (356.26 kB, gzip 115.59 kB)
- Largest route/page chunk: dist/assets/Home-B9tPh9Sx.js (141.48 kB, gzip 44.27 kB)
- Main CSS chunk: dist/assets/index-TTknjzpu.css (50.50 kB, gzip 8.46 kB)
- Largest image in output: dist/assets/Smiling Businesswoman with Tablet _ Premium…-Photoroom-YjpTRrCp.png (820.25 kB)

Known baseline warning:
- Browserslist data is 8 months old (non-blocking, maintenance task).

## 4. Baseline Risks and Constraints
1. Current visual language was coherent but flattened by repeated border-white-card patterns.
2. Token drift existed (`brand1/2/3/4` classes in some components), creating style fragmentation risk.
3. Component semantics risk existed in button rendering (button nested inside link/anchor).

## 5. Visual Direction Board (Locked for Phase 1)
Direction: premium local service brand, not startup-generic.

Visual principles:
1. Strong but calm contrast: navy foundation, light blue accents, green for decisive actions.
2. Layered depth: cards and sections should show clear hierarchy, not one flat style.
3. Confident typography: avoid blanket italics; use italics only as selective accent.
4. Intentional motion: short, smooth transitions with consistent easing and duration.
5. Conversion-first hierarchy: primary CTA always reads first, secondary actions support.

## 6. Exit Criteria Status (Phase 0)
1. Finalized UX priority list: completed.
2. Frozen baseline build metrics: completed.
3. Visual direction documented and locked: completed.

Phase 0 status: complete.
