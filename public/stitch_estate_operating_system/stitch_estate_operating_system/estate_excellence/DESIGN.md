---
name: Estate Excellence
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
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301e'
  on-tertiary-container: '#00a472'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for the intersection of high-end real estate management and luxury hospitality. The brand personality is poised, authoritative, and discreet, prioritizing clarity and ease of use for high-net-worth residents and professional estate managers.

The design style follows a **Modern Corporate** aesthetic with a **Minimalist** ethos. It leverages expansive whitespace, precise geometric alignment, and a restrained palette to evoke a sense of calm and exclusivity. Every element is designed to feel intentional and architectural, avoiding trendy decorative flourishes in favor of timeless, functional elegance.

## Colors
The palette is rooted in deep slates and midnight tones to communicate stability and professional rigor. 

- **Primary & Accent:** Used for structural elements, navigation, and high-level headers to provide a strong visual anchor.
- **Surface Neutrals:** A range of soft greys (Slate 50 to 100) are used to define content areas without the harshness of pure white, creating a "layered paper" effect.
- **Functional Accents:** Teal is reserved for success states and primary CTAs, while a muted red is used for urgent maintenance or security alerts.
- **Interactive States:** Hover states should subtly darken the primary color or introduce a 5% opacity shift to the surface background.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian, yet refined appearance. 

- **Hierarchy:** Use weight over size to establish hierarchy. Medium (500) and Semi-Bold (600) weights distinguish interactive elements and headers from body text.
- **Spacing:** For large display titles, a slight negative letter-spacing is applied to maintain visual tension. Labels use all-caps with generous tracking for a professional, "architectural blueprint" feel.
- **Readability:** Body text is optimized for long-form reports and property details, utilizing a 1.5x line-height ratio.

## Layout & Spacing
The system employs a **Fixed Grid** model for desktop to ensure content remains centered and readable on ultra-wide displays. 

- **Grid:** A 12-column grid is used for dashboards, while a centered 8-column column is used for editorial property pages.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Adaptability:**
    - **Desktop:** Generous 48px outer margins to signal luxury and "breathing room."
    - **Tablet:** 32px margins, transitioning to a 2-column card layout.
    - **Mobile:** 16px margins, stacking all content vertically and utilizing full-width action drawers.

## Elevation & Depth
Depth is created through **Tonal Layers** and extremely soft **Ambient Shadows**. 

The background uses the Surface color (#F8FAFC). Primary content containers (cards, modals) are pure white (#FFFFFF) with a 1px border (#E2E8F0). 

Shadows must be "invisible"—high blur (24px+), low opacity (less than 4%), and slightly offset on the Y-axis to suggest the element is floating just millimeters above the surface. Avoid heavy drop shadows or glow effects. Interaction depth is communicated by shifting from a 1px border to a slightly more pronounced shadow on hover.

## Shapes
The shape language is **Rounded**, strike a balance between modern software and organic architectural forms.

- **Standard Radius:** 8px (0.5rem) for buttons, input fields, and small UI components.
- **Large Radius:** 16px (1rem) for primary content cards and containers.
- **Buttons:** Use the standard radius rather than pills to maintain a professional, structured look.

## Components
- **Buttons:** Primary buttons use the Midnight Slate (#0F172A) with white text. Secondary buttons use a transparent background with a 1px Slate-200 border. 
- **Input Fields:** Minimalist design with a 1px border. On focus, the border color shifts to Primary Slate with a subtle 2px outer halo of 10% opacity primary color.
- **Cards:** White background, 16px corner radius, and a 1px subtle border. No shadow in default state; soft shadow on hover to indicate interactivity.
- **Chips/Badges:** Small, 4px radius, using low-saturation background tints of the status color (e.g., light mint background for Success) with high-contrast text.
- **Lists:** Data-heavy lists should use "Zebra" striping only on hover. Default state uses thin 1px horizontal dividers.
- **Modals:** Centered, 16px radius, with a high-blur backdrop (12px blur) to maintain focus on the task.