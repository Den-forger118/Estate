---
name: Estate Institutional
colors:
  surface: '#FFFFFF'
  surface-dim: '#d5dcd6'
  surface-bright: '#f5fbf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f0'
  surface-container: '#e9efea'
  surface-container-high: '#e4eae4'
  surface-container-highest: '#dee4df'
  on-surface: '#171d1a'
  on-surface-variant: '#414845'
  inverse-surface: '#2c322e'
  inverse-on-surface: '#ecf2ed'
  outline: '#727975'
  outline-variant: '#c1c8c3'
  surface-tint: '#466559'
  primary: '#04241b'
  on-primary: '#ffffff'
  primary-container: '#1c3a30'
  on-primary-container: '#84a497'
  inverse-primary: '#adcec0'
  secondary: '#4e6359'
  on-secondary: '#ffffff'
  secondary-container: '#cde5d8'
  on-secondary-container: '#52675d'
  tertiary: '#301b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d2e00'
  on-tertiary-container: '#c69459'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8eadb'
  primary-fixed-dim: '#adcec0'
  on-primary-fixed: '#012018'
  on-primary-fixed-variant: '#2f4d42'
  secondary-fixed: '#d0e8db'
  secondary-fixed-dim: '#b4ccbf'
  on-secondary-fixed: '#0b1f17'
  on-secondary-fixed-variant: '#364b41'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#f3bc7d'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#633f0a'
  background: '#f5fbf5'
  on-background: '#171d1a'
  surface-variant: '#dee4df'
  page-bg: '#F6F2EC'
  surface-alt: '#EDE8DF'
  primary-dark: '#111F1A'
  muted: '#6B7A73'
  border: '#D9D2C7'
typography:
  display-h1:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-section:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  data-lg:
    fontFamily: DM Mono
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1'
  data-md:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1'
  display-h1-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  max-width: 1180px
  gutter: 24px
  margin-site: 40px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 64px
---

## Brand & Style

This design system is built upon the principles of **Quiet Luxury** and **Institutional Excellence**. It evokes the atmosphere of a private bank or a five-star hotel’s internal management suite: disciplined, discreet, and exceptionally high-end. 

The aesthetic leverages **Minimalism** with a focus on editorial-grade typography and a restrained material palette. Visual interest is generated not through decoration, but through the precise tension between expansive white space and dense, well-organized data. The system prioritizes functional clarity and a sense of permanence, ensuring that the interface feels like an established institution rather than a fleeting digital product.

## Colors

The palette is rooted in organic, architectural tones. The foundation is a warm, parchment-like off-white (`#F6F2EC`), which provides a softer, more "analog" feel than pure white. 

- **Primary Forest:** Used for core branding and primary actions.
- **Deep Forest:** Reserved for the REIMS sidebar and high-level navigation to create a grounded, structural anchor.
- **Gold Accent:** Used sparingly for critical highlights, status indicators, or premium tier designations.
- **Typography:** The near-black text (`#111714`) ensures high legibility while maintaining a softer contrast than true black.
- **Borders:** The champagne-toned border (`#D9D2C7`) is used for subtle definition without breaking the visual flow.

## Typography

The typographic hierarchy distinguishes between *narrative* and *utility*.

- **Display:** Playfair Display is used for major landmarks. Use H1 for page titles and one H2 section header per page to establish an editorial feel.
- **UI & Body:** DM Sans provides a neutral, highly legible sans-serif for the bulk of the interface. Use medium and semi-bold weights for hierarchy within forms and navigation.
- **Data:** DM Mono is strictly for numeric values—prices, lot numbers, and KPI metrics. This creates a "ledger" aesthetic that signals precision.
- **Styling:** All labels should be uppercase with increased letter spacing to enhance the institutional tone.

## Layout & Spacing

The layout is governed by a **Fixed Grid** system centered within the viewport.

- **Desktop:** A 12-column grid with a maximum content width of 1180px. This constraint ensures readability and prevents data from becoming over-stretched on wide displays.
- **Rhythm:** We use a strict 8px base unit. Section spacing is generous (64px+) to maintain an "airy" feeling, while internal card padding is tighter (24px) to support data density.
- **Mobile:** Transition to a fluid single-column layout with 20px side margins. Data-heavy tables should allow horizontal scrolling within their containers rather than shrinking content.

## Elevation & Depth

This design system avoids heavy drop shadows and traditional skeuomorphism in favor of **Tonal Layering** and **Low-Contrast Outlines**.

- **Surfaces:** Depth is communicated by placing White (`#FFFFFF`) surfaces on top of the warm Off-White (`#F6F2EC`) background. 
- **Borders:** Instead of shadows, use 1px borders in `#D9D2C7` to define card boundaries.
- **REIMS Sidebar:** This component uses the `primary-dark` green to create a "void" effect, appearing as the deepest layer of the application.
- **Interactions:** Subtle background color shifts (e.g., from `surface` to `surface-alt`) are preferred over elevation increases for hover states.

## Shapes

The shape language is sharp and architectural. A consistent **4px radius** is applied to cards, buttons, and decorative elements. This slight rounding prevents the UI from feeling aggressive while maintaining the precision of a professional institution. 

**Strict Rule:** No pill-shaped buttons or fully rounded tags. All buttons must be rectangular with the defined 4px corner radius.

## Components

### Buttons
- **Primary:** Solid `#1C3A30` with white text. 4px radius. DM Sans Semi-bold.
- **Secondary:** Outlined with `#1C3A30`. No fill.
- **Tertiary:** Text-only in `#1C3A30` with a 1px bottom border that appears on hover.

### Input Fields
- **Institutional Style:** No four-sided boxes. Use a bottom-border only (`1px solid #D9D2C7`). On focus, the border transitions to the primary green. Labels sit above the field in `label-caps` style.

### Cards & Panels
- White background, 1px border in `#D9D2C7`, and 4px corner radius. Internal padding should be a consistent 24px.

### Tables
- **Borderless Aesthetic:** Remove all vertical borders. Horizontal borders should be 1px, very faint (`#D9D2C7`). Row heights should be generous (min-height 56px). Use `data-md` for numeric columns.

### Chips & Status Indicators
- Use small, rectangular tags (4px radius) with subtle background fills. For example, a "Premium" tag would use a light tint of the Gold Accent with dark gold text.

### REIMS Sidebar
- The sidebar should utilize `#111F1A` as the background. Navigation items should use a muted green for inactive states and White or Gold for the active state, accompanied by a subtle 2px vertical indicator on the left.