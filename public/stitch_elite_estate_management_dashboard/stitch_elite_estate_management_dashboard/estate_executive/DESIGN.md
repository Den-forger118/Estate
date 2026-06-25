---
name: Estate Executive
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#331200'
  on-tertiary-container: '#cf6721'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for the high-end real estate market, blending the reliability of enterprise SaaS with the aesthetic refinement of luxury property management. The brand personality is authoritative yet approachable, focusing on clarity, precision, and a "quiet luxury" aesthetic. 

The visual style follows a **Modern Corporate** approach with a heavy emphasis on **Minimalism** and **Tonal Layering**. It prioritizes vast whitespace to reduce cognitive load for property managers while utilizing high-quality typography and a sophisticated color palette to evoke a sense of premium service and institutional stability. The goal is to make complex data feel manageable and elegant.

## Colors
The palette is anchored by a deep **Slate Navy** (#0F172A), providing a grounded, professional foundation. This primary color is used for typography and key navigational elements to establish authority.

The secondary accent is a **Refined Emerald** (#059669), used for positive growth indicators, primary actions, and success states, reflecting the "green" of high-value landscapes. A tertiary **Muted Gold** (#B45309) is used sparingly for premium status indicators or luxury property designations. The neutral scale relies on a cool gray palette to maintain a clean, airy environment that allows property imagery and financial data to remain the focal point.

## Typography
This design system utilizes **Inter** for all roles to ensure maximum legibility and a systematic, modern feel. The typographic hierarchy is strictly enforced to guide the user through complex financial dashboards.

Headlines use semi-bold weights with slight negative letter-spacing to create a "tight," premium editorial look. Labels and utility text use a slightly increased letter-spacing and a medium-to-bold weight for immediate scannability in data-heavy views. Line heights are generous in body text to maintain a calm, breathable reading experience.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The main sidebar remains fixed at 280px, while the content area utilizes a 12-column fluid grid that caps at a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.

A 4px baseline grid ensures vertical rhythm. We use "Loose" spacing (24px gutters/margins) to emphasize the luxury aspect of the platform—avoiding the cramped feel of traditional enterprise software. On mobile, margins shrink to 16px, and complex data tables transition to card-based layouts.

## Elevation & Depth
This design system conveys depth through **Tonal Layering** and **Ambient Shadows**. Instead of harsh borders, we use subtle surface color shifts (e.g., a white card on a light-slate background) to define boundaries.

Shadows are used sparingly and are extremely diffused. The standard "Elevated" state uses a large blur radius (24px) with very low opacity (4-6%) tinted with the primary Navy color to prevent a "dirty" gray appearance. Interactive elements like cards use a subtle lift on hover to provide tactile feedback without breaking the professional tone.

## Shapes
The shape language is **Refined and Intentional**. A consistent 8px (0.5rem) radius is applied to standard UI elements like input fields, buttons, and small cards. Larger containers, such as property detail panels or modal overlays, use a 16px (1rem) radius to feel more approachable and modern. This balance of "Soft" and "Rounded" creates a contemporary SaaS feel that distinguishes the product from legacy real estate tools.

## Components

### Buttons
Primary buttons use the Slate Navy background with white text. Hover states transition to the Emerald Green to provide a "growth" oriented feedback loop. Secondary buttons use a subtle light-gray fill with navy text, moving to a light-emerald tint on hover.

### Cards
Cards are the primary container for property data. They feature a white background, a very thin 1px border in a light neutral tone (#E2E8F0), and a soft ambient shadow. 

### Input Fields
Inputs are minimalist: a 1px border (#CBD5E1) that thickens slightly and changes to Emerald Green on focus. Labels are always positioned above the field in a bold, small-cap style for clarity.

### Data Tables
Tables are high-density but clear. Row hover states use a very faint Slate tint. We avoid vertical lines, using only horizontal dividers to maintain a clean, rhythmic look.

### Status Chips
Status indicators (e.g., "Available," "Leased," "Under Maintenance") use a "Pill" shape with low-opacity background tints of their respective semantic colors (Emerald for Success, Amber for Warning, Slate for Neutral) and dark text for high legibility.