# Marketing Site Image Slot Plan

Use this as a drop-in guide to add more visuals quickly without changing layout structure.

## Naming Rules

- Keep names lowercase with hyphens.
- Use `.webp` if possible, `.jpg` as fallback.
- Hero or wide sections: around 2400x1400.
- Card images: around 1200x900.
- Portrait/testimonial faces: around 800x800.

## Home Page Slots

### 1) Hero Main Visual
- Target file: `apps/marketing-site/src/components/sections/HomePage-sections/Hero.jsx`
- Replace image import with: `src/assets/home/home-hero-team-onsite-01.webp`
- Alt text: Technician team helping a customer on-site.

### 2) Story Chapter Header Thumbnails (3)
- Target file: `apps/marketing-site/src/components/sections/HomePage-sections/HomeStoryFlow.jsx`
- Add one image at top of each chapter card:
  - `src/assets/home/home-story-trust-01.webp`
  - `src/assets/home/home-story-solutions-01.webp`
  - `src/assets/home/home-story-proof-01.webp`
- Alt texts:
  - Trust chapter: Technician showing diagnosis to customer.
  - Solutions chapter: Technician working on laptop and router.
  - Proof chapter: Happy customer with fixed device.

### 3) Services Grid Card Images (6)
- Target file: `apps/marketing-site/src/components/sections/HomePage-sections/ServicesGrid.jsx`
- Add card image field support and map these files per top services:
  - `src/assets/services/service-home-wifi-repair-01.webp`
  - `src/assets/services/service-laptop-speedup-01.webp`
  - `src/assets/services/service-virus-removal-01.webp`
  - `src/assets/services/service-business-it-support-01.webp`
  - `src/assets/services/service-printer-setup-01.webp`
  - `src/assets/services/service-data-recovery-01.webp`

### 4) Testimonials Real Photos (3)
- Target file: `apps/marketing-site/src/components/sections/HomePage-sections/Testimonials.jsx`
- Replace avatar URLs with local files:
  - `src/assets/testimonials/testimonial-sarah-m.webp`
  - `src/assets/testimonials/testimonial-james-p.webp`
  - `src/assets/testimonials/testimonial-linda-k.webp`

### 5) Company Blurb Secondary Photo
- Target file: `apps/marketing-site/src/components/sections/HomePage-sections/CompanyBlurb.jsx`
- Keep current image and add optional second visual slot:
  - `src/assets/home/home-company-tech-van-01.webp`
- Alt text: Company technician van ready for same-day visit.

## About Page Slots

### 6) About Hero Background Photo
- Target file: `apps/marketing-site/src/pages/About.jsx`
- Add subtle hero image layer:
  - `src/assets/about/about-hero-team-01.webp`
- Alt text: Team portrait in Adelaide.

### 7) Values Cards Image Icons (4)
- Target file: `apps/marketing-site/src/pages/About.jsx`
- Add icon-like mini images per value:
  - `src/assets/about/value-same-day-01.webp`
  - `src/assets/about/value-plain-english-01.webp`
  - `src/assets/about/value-respect-care-01.webp`
  - `src/assets/about/value-no-fix-no-fee-01.webp`

## Services Page Slots

### 8) Services Hero Visual
- Target file: `apps/marketing-site/src/components/sections/Services/ServicesHero.jsx`
- Add hero side image or soft background image:
  - `src/assets/services/services-hero-onsite-01.webp`

### 9) Process Strip Step Images (3)
- Target file: `apps/marketing-site/src/components/sections/Services/ProcessStrip.jsx`
- Add one image per step:
  - `src/assets/services/process-contact-01.webp`
  - `src/assets/services/process-onsite-01.webp`
  - `src/assets/services/process-resolved-01.webp`

### 10) Pricing Bands Context Image
- Target file: `apps/marketing-site/src/components/sections/Services/PricingBands.jsx`
- Add background/supporting image:
  - `src/assets/services/pricing-context-01.webp`

## Contact Page Slots

### 11) Contact Hero Side Image
- Target file: `apps/marketing-site/src/components/sections/Contact/ContactHero.jsx`
- Add image to right or as background accent:
  - `src/assets/contact/contact-hero-support-01.webp`

### 12) Contact Trust Strip Step Images (3)
- Target file: `apps/marketing-site/src/components/sections/Contact/ContactTrustStrip.jsx`
- Add small images per step:
  - `src/assets/contact/contact-step-request-01.webp`
  - `src/assets/contact/contact-step-confirm-01.webp`
  - `src/assets/contact/contact-step-visit-01.webp`

## Location Page Slots

### 13) Location Hero Cover
- Target file: `apps/marketing-site/src/pages/Location.jsx`
- Add local Adelaide service-area visual:
  - `src/assets/location/location-hero-adelaide-01.webp`

### 14) Region Card Thumbnails (optional)
- Target file: `apps/marketing-site/src/pages/Location.jsx`
- Add region images for filters/chips:
  - `src/assets/location/region-north-01.webp`
  - `src/assets/location/region-south-01.webp`
  - `src/assets/location/region-east-01.webp`
  - `src/assets/location/region-west-01.webp`

## Blog Page Slots

### 15) Blog Hero Cover
- Target file: `apps/marketing-site/src/components/sections/Blog/BlogHero.jsx`
- Add a hero visual:
  - `src/assets/blog/blog-hero-insights-01.webp`

### 16) Blog Post Cover Convention
- Target files:
  - `apps/marketing-site/src/components/UI/PostCard.jsx`
  - `apps/marketing-site/src/hooks/useBlogPosts.js`
- Keep this naming pattern for local fallback images:
  - `src/assets/blog/post-01-cover.webp`
  - `src/assets/blog/post-02-cover.webp`
  - `src/assets/blog/post-03-cover.webp`
  - etc.

## Quick Rollout Priority

If you want fast visible improvement, do these first:
1. Home hero image refresh
2. Home chapter images (3)
3. Services grid images (6)
4. Contact hero image
5. Blog hero image
