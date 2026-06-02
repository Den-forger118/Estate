# Design Consistency Notes

This project does not use a third-party component design system such as Material UI, Ant Design, Chakra, shadcn/ui, Bootstrap, or similar libraries.

The current public website uses:

- **Tailwind CSS v4** as the CSS engine/reset layer through `@import "tailwindcss";` in `app/globals.css`.
- **A custom Ernest Ofori design system** defined in `app/globals.css`.
- **Next Font / Geist** from `next/font/google` in `app/layout.tsx`.

## Core Tokens

```css
--background: #f7f4ef;
--surface: #fffdf8;
--surface-strong: #efe8dc;
--foreground: #18221f;
--muted: #68736d;
--line: #ded5c7;
--brand: #27483f;
--brand-dark: #172e28;
--accent: #b88755;
--accent-soft: #ead8c1;
--shadow: 0 22px 60px rgba(34, 46, 40, 0.12);
```

## Typography

```css
body {
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}

h1 {
  font-size: clamp(3rem, 6vw, 6.8rem);
  line-height: 0.96;
  letter-spacing: 0;
}

h2 {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.04;
  letter-spacing: 0;
}

h3 {
  font-size: 1.2rem;
  line-height: 1.25;
}

p {
  color: var(--muted);
  line-height: 1.7;
}
```

Supporting text styles:

```css
.eyebrow {
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.meta,
.badge,
.results-line {
  color: var(--muted);
  font-size: 0.84rem;
}
```

## Layout Widths

Primary page containers use this width:

```css
width: min(1180px, calc(100% - 32px));
```

Used by:

- `.site-header`
- `.hero`
- `.section`
- `.page-hero`
- `.cta-section`
- `.site-footer`

Mobile adjustment at `max-width: 640px`:

```css
width: min(100% - 24px, 1180px);
```

## Buttons

All buttons should use `.btn` plus either `.btn-primary` or `.btn-secondary`.

Base button:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.82rem 1.25rem;
  font-weight: 750;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease,
    border-color 180ms ease, color 180ms ease;
}

.btn:hover {
  transform: translateY(-2px);
}
```

Primary button:

```css
.btn-primary {
  background: var(--brand);
  color: #fffaf2;
  box-shadow: 0 12px 30px rgba(39, 72, 63, 0.22);
}

.btn-primary:hover {
  background: var(--brand-dark);
  box-shadow: 0 16px 36px rgba(39, 72, 63, 0.3);
}
```

Secondary button:

```css
.btn-secondary {
  border-color: var(--line);
  background: rgba(255, 253, 248, 0.82);
  color: var(--brand);
}

.btn-secondary:hover {
  border-color: var(--accent);
  background: #fffaf2;
}
```

## Navigation Bar

The navigation component is defined in `app/components/Header.tsx`.

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: min(1180px, calc(100% - 32px));
  margin: 16px auto 0;
  padding: 0.7rem 0.75rem 0.7rem 1rem;
  border: 1px solid rgba(222, 213, 199, 0.78);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.86);
  box-shadow: 0 16px 45px rgba(31, 42, 36, 0.08);
  backdrop-filter: blur(18px);
  transition: transform 260ms ease, opacity 260ms ease, box-shadow 260ms ease;
}
```

Hidden scroll state:

```css
.site-header-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(calc(-100% - 24px));
}
```

Brand mark:

```css
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 750;
  white-space: nowrap;
}

.brand-mark span {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand);
  color: #fffaf2;
  font-size: 0.82rem;
}
```

Navigation links:

```css
.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.6rem, 2vw, 1.5rem);
  color: var(--muted);
  font-size: 0.92rem;
}
```

## Cards

Shared card styles:

```css
.property-card,
.blog-card,
.testimonial-card,
.amenity-card,
.service-card,
.team-card,
.value-card,
.contact-card,
.form-card,
.floor-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 253, 248, 0.78);
  box-shadow: 0 14px 38px rgba(31, 42, 36, 0.06);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}
```

Interactive card hover:

```css
.property-card:hover,
.blog-card:hover,
.service-card:hover,
.team-card:hover,
.value-card:hover {
  transform: translateY(-5px);
  border-color: rgba(184, 135, 85, 0.55);
  box-shadow: var(--shadow);
}
```

Card content spacing:

```css
.property-card-body {
  display: grid;
  gap: 0.85rem;
  padding: 1.1rem;
}

.testimonial-card,
.service-card,
.team-card,
.value-card,
.contact-card,
.form-card,
.floor-card {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
}
```

## Images

Image hover behavior:

```css
.hero-media img,
.image-frame img,
.image-panel img,
.gallery-main img,
.gallery-strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 520ms ease, filter 520ms ease;
}

.hero-media:hover img,
.property-card:hover .image-frame img,
.blog-card:hover .image-frame img,
.image-panel:hover img {
  transform: scale(1.045);
  filter: saturate(1.04);
}
```

Image measurements:

```css
.hero-media {
  min-height: 620px;
  border-radius: 28px;
}

.image-frame {
  height: 245px;
  border-radius: 18px 18px 0 0;
}

.blog-card .image-frame {
  height: 215px;
}

.image-panel {
  height: 540px;
  border-radius: 24px;
}

.gallery-main {
  height: min(66vh, 620px);
  border-radius: 26px;
}

.gallery-strip div {
  height: 150px;
  border-radius: 16px;
}
```

## Badges And Pills

Availability badge:

```css
.badge {
  position: absolute;
  top: 14px;
  left: 14px;
  border: 1px solid rgba(255, 250, 242, 0.5);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.92);
  color: var(--brand);
  padding: 0.42rem 0.72rem;
  font-weight: 750;
}
```

Property stat pills:

```css
.property-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.property-stats span {
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--brand);
  padding: 0.45rem 0.68rem;
  font-size: 0.84rem;
  font-weight: 700;
}
```

## Forms

```css
input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fffaf2;
  color: var(--foreground);
  font: inherit;
  padding: 0.95rem 1rem;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--brand);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(39, 72, 63, 0.12);
}

label {
  display: grid;
  gap: 0.55rem;
  color: var(--foreground);
  font-size: 0.9rem;
  font-weight: 650;
}
```

Form grids:

```css
.form-grid {
  display: grid;
  gap: 0.85rem;
}

.form-grid.two {
  grid-template-columns: 1fr 1fr;
}
```

## Section Layouts

Hero:

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(320px, 1.08fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
  min-height: calc(100vh - 96px);
  padding: clamp(3rem, 8vw, 7rem) 0 4rem;
}
```

Standard section:

```css
.section {
  padding: clamp(3.5rem, 7vw, 6.5rem) 0;
}
```

Section intro:

```css
.section-intro {
  display: grid;
  gap: 0.75rem;
  max-width: 760px;
  margin-bottom: 2rem;
}
```

Split section:

```css
.split-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
}
```

Page hero:

```css
.page-hero {
  padding: clamp(4rem, 9vw, 8rem) 0 clamp(2rem, 5vw, 4rem);
}

.page-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(280px, 0.7fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: end;
}
```

CTA section:

```css
.cta-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin: 0 auto clamp(3rem, 7vw, 6rem);
  border-radius: 26px;
  background: var(--surface-strong);
  padding: clamp(1.5rem, 4vw, 3rem);
}
```

## Grids

```css
.property-grid,
.blog-grid,
.testimonial-grid,
.amenity-grid,
.service-grid,
.team-grid,
.value-grid {
  display: grid;
  gap: 1.2rem;
}

.property-grid,
.testimonial-grid,
.blog-grid,
.amenity-grid,
.service-grid,
.team-grid,
.value-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
}
```

Filter panel:

```css
.filter-panel {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr repeat(4, 1fr);
  gap: 0.9rem;
  align-items: end;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(255, 253, 248, 0.86);
  padding: 1rem;
  box-shadow: 0 14px 38px rgba(31, 42, 36, 0.06);
}
```

Detail and contact layouts:

```css
.detail-layout,
.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 1.4rem;
  align-items: start;
}

.detail-main,
.detail-side {
  display: grid;
  gap: 1.2rem;
}

.detail-side {
  position: sticky;
  top: 110px;
}
```

## Footer

```css
.site-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.9fr);
  gap: 2rem;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 3rem 0 2.2rem;
  border-top: 1px solid var(--line);
}

.site-footer p {
  max-width: 430px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
```

## Motion

Page transition:

```css
.page-transition {
  animation: pageIn 520ms ease both;
}
```

Scroll reveal:

```css
.reveal {
  animation: revealUp 680ms ease both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
```

Keyframes:

```css
@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Responsive Rules

Tablet breakpoint:

```css
@media (max-width: 980px) {
  .site-header {
    align-items: flex-start;
    border-radius: 24px;
    flex-wrap: wrap;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 0.4rem 0.2rem;
  }

  .hero,
  .page-hero-inner,
  .split-section,
  .detail-layout,
  .contact-layout,
  .site-footer {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: auto;
  }

  .hero-media,
  .image-panel {
    min-height: auto;
    height: 430px;
  }

  .property-grid,
  .testimonial-grid,
  .blog-grid,
  .amenity-grid,
  .service-grid,
  .team-grid,
  .value-grid,
  .filter-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-side {
    position: static;
  }
}
```

Mobile breakpoint:

```css
@media (max-width: 640px) {
  .header-cta {
    width: 100%;
  }

  .hero,
  .page-hero,
  .section {
    width: min(100% - 24px, 1180px);
  }

  .hero-media {
    height: 360px;
  }

  .property-grid,
  .testimonial-grid,
  .blog-grid,
  .amenity-grid,
  .service-grid,
  .team-grid,
  .value-grid,
  .filter-panel,
  .stat-grid,
  .form-grid.two,
  .gallery-strip,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .cta-section {
    align-items: stretch;
    flex-direction: column;
  }

  .gallery-main {
    height: 360px;
  }
}
```

## Implementation Guidance

For consistency, new public-facing sections should reuse the existing classes and tokens from `app/globals.css`.

Preferred approach:

- Use existing color variables instead of new hex values.
- Use `.btn`, `.btn-primary`, and `.btn-secondary` for all calls to action.
- Use the shared card radius, border, background, and shadow values.
- Keep page containers at `min(1180px, calc(100% - 32px))`.
- Keep mobile container gutters at `24px` total horizontal subtraction.
- Match existing animation durations: `180ms`, `260ms`, `520ms`, and `680ms`.
- Avoid adding a second design system unless the existing styles are intentionally being replaced.



## Dashboard Navigation & Access Logic

The REMS Dashboard is a protected area of the platform and must follow a clear navigation and access structure.

### Access Flow
Public Website → Login → Role-Based Dashboard → Module Navigation

Users must log in before accessing `/dashboard/*` routes. Since backend authentication is not yet implemented, use mock authentication and role switching to simulate access.

### Route Structure
Public Routes:
- /
- /about
- /services
- /properties
- /properties/[slug]
- /blog
- /contact

Authentication Routes:
- /login
- /forgot-password
- /reset-password

Protected Dashboard Routes:
- /dashboard
- /dashboard/properties
- /dashboard/units
- /dashboard/tenants
- /dashboard/leases
- /dashboard/payments
- /dashboard/maintenance
- /dashboard/invoices
- /dashboard/reports
- /dashboard/messages
- /dashboard/documents
- /dashboard/settings
- /dashboard/landlord-applications
- /dashboard/landlord-application

### Role-Based Navigation

Full specification: **`user-roles-navigation.md`**.

Hierarchy: Administrator → Property Manager → Property Owner → Landlord → Tenant → Maintenance Staff.

Property owners apply to become landlords; only admin and property manager approve (`/dashboard/landlord-applications`).

REMS highlights:

- **Admin** — all modules including landlord application review.
- **Property Manager** — operations modules + landlord application review.
- **Property Owner** — owned property, documents, payments; submit `/dashboard/landlord-application`.
- **Landlord** — owner-approved leasing: units, tenants, leases, payments, reports.
- **Tenant** — lease, payments, maintenance, messages, documents.
- **Maintenance Staff** — maintenance, messages, documents only.

Resident services (`/community/*`): all roles **except** maintenance staff.

### Development Notes
- Maintain the same design system used in the public website (typography, spacing, buttons, colors, interactions).
- Use a persistent dashboard layout (`layout.tsx`) so sidebar and top navigation remain fixed while page content changes.
- Implement mock authentication for testing flows.
- Add placeholder route guards (unauthenticated users should redirect to `/login`).
- Ensure navigation feels logical, smooth, and non-chaotic.
- Prioritize consistency, scalability, and clean UX.

## Resident Utility Platform Navigation

The third platform pillar (resident services, not a social network) lives under `/community/*`.

- Development navigation spec: `community-navigation.md`
- Stitch design source: `public/stitch_estate_operating_system/`
- Implementation: `app/community/` with the same dashboard shell tokens as REMS
- Access: mock auth; all roles except `maintenance` (see `user-roles-navigation.md`)



