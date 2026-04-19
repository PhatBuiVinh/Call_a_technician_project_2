# Marketing Site Phase 2: High-Impact Conversion Surfaces

Date: 2026-04-19
Scope: apps/marketing-site
Status: implemented and validated

## Goal
Improve first impression and lead conversion quickly.

## Deliverables Implemented

### 1) Homepage hero redesign
- Upgraded hero hierarchy with stronger headline, social proof badge, and trust chips.
- Strengthened CTA hierarchy:
  - Primary CTA: Book a Technician
  - Secondary CTA: Call 1300 551 350
- Added right-side conversion context card (devices fixed, same-day jobs, rating).

Updated file:
- apps/marketing-site/src/components/sections/HomePage-sections/Hero.jsx

### 2) Nav and urgent-callout polish
- Nav alignment and behavior improved:
  - Sticky visual refinement based on scroll state.
  - Better mobile interaction with backdrop and escape close behavior.
  - Body scroll lock while mobile menu is open.
  - Converted top-right contact action to shared Button primitive.
- Urgent callout refined:
  - Cleaner vertical offset and width constraints.
  - Better action grouping and mobile call affordance.
  - Kept primary conversion action highly visible.

Updated files:
- apps/marketing-site/src/components/layout/NavBar.jsx
- apps/marketing-site/src/components/layout/UrgentCallout.jsx

### 3) Contact form visual and UX polish (same logic)
- Improved visual hierarchy with premium card treatment and trust micro-cues.
- Enhanced completion UX:
  - Validation reveal on submit.
  - Focus and scroll to first invalid field.
  - Better field consistency for suburb and datetime controls.
  - Clear success/error live messaging.
- Submission logic and backend behavior preserved.

Updated file:
- apps/marketing-site/src/components/sections/Contact/ContactFormBlock.jsx

### 4) CTA consistency across primary landing sections
- Services section CTA now uses shared Button primitive.
- Minor token consistency update in home request form file upload button hover token.

Updated files:
- apps/marketing-site/src/components/sections/HomePage-sections/ServicesGrid.jsx
- apps/marketing-site/src/components/sections/HomePage-sections/RequestCallForm.jsx
- apps/marketing-site/src/pages/Home.jsx

## Validation
Build command:
- npm run build (apps/marketing-site)

Result:
- Success

Diagnostics:
- No errors in changed Phase 2 files.

## Quick Usability Checks (10)
Validation mode: rapid UX heuristic checks against implemented flows and component behavior.

1. Hero desktop CTA hierarchy is obvious (primary then secondary): PASS
2. Hero mobile CTA stack remains clear and tappable: PASS
3. Hero trust cues are visible without scrolling (social proof + service guarantees): PASS
4. Mobile nav can be dismissed via backdrop tap: PASS
5. Mobile nav can be dismissed via Escape key: PASS
6. Contact form submit reveals validation errors immediately: PASS
7. Contact form moves user to first invalid field to reduce friction: PASS
8. Contact form success state gives clear confirmation and optional reference: PASS
9. CTAs in nav, hero, services, and contact use consistent shared styles: PASS
10. No regressions detected in build after Phase 2 changes: PASS

## Exit Criteria Assessment
1. Core user journey feels visually consistent and premium: MET
2. CTA hierarchy is obvious on desktop and mobile: MET
3. Form completion UX is validated with 5 to 10 quick usability checks: MET (10 checks)

Phase 2 status: complete.
