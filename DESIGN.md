---
name: SoundNative
colors:
  surface: '#fbf8ff'
  surface-dim: '#d5d8f9'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#ececff'
  surface-container-high: '#e5e6ff'
  surface-container-highest: '#dee0ff'
  on-surface: '#161a32'
  on-surface-variant: '#434656'
  inverse-surface: '#2b2f48'
  inverse-on-surface: '#f0efff'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#104af0'
  primary: '#0040df'
  on-primary: '#ffffff'
  primary-container: '#2d5bff'
  on-primary-container: '#efefff'
  inverse-primary: '#b8c3ff'
  secondary: '#006a66'
  on-secondary: '#ffffff'
  secondary-container: '#61f5ed'
  on-secondary-container: '#006f6a'
  tertiary: '#50555e'
  on-tertiary: '#ffffff'
  tertiary-container: '#686d76'
  on-tertiary-container: '#ecf0fb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0035bd'
  secondary-fixed: '#65f8f0'
  secondary-fixed-dim: '#3fdbd4'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504d'
  tertiary-fixed: '#dee2ed'
  tertiary-fixed-dim: '#c2c6d1'
  on-tertiary-fixed: '#171c23'
  on-tertiary-fixed-variant: '#424750'
  background: '#fbf8ff'
  on-background: '#161a32'
  surface-variant: '#dee0ff'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  korean-support:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.6'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system is built on the philosophy of "Empathetic Sophistication." It bridges the gap between high-engagement gamification and professional adult education. The goal is to make the daunting task of navigating a new culture feel achievable and encouraging without feeling juvenile.

The aesthetic blends **Modern Minimalism** with **Tactile/Skeuomorphic** accents. While the interface is clean and structured, interactive elements use subtle depth and "pressable" physics to provide the satisfying feedback loop common in successful learning apps. The visual narrative focuses on clarity, removing cognitive load so the user can focus entirely on phonetics and cultural context.

## Colors

The palette moves away from primary "toy" colors in favor of a **Deep Indigo** primary that signals authority and tech-forwardness. This is complemented by a **Vibrant Teal** for secondary actions and "aha!" moments.

- **Primary (Indigo):** Used for main navigation, brand moments, and core progress markers.
- **Secondary (Teal):** Used for rewards, streaks, and positive reinforcement.
- **Category Mutes:** For different learning paths (Workplace, Hospital, Daily Errands), we use highly desaturated, "sophisticated" versions of traditional hues to color-code sections without overwhelming the eye.
- **Neutrals:** A cool-toned slate is used for typography to maintain high legibility against the stark white and soft-gray backgrounds.

## Typography

This design system utilizes **Plus Jakarta Sans** for headlines to provide a friendly, rounded geometric feel that remains professional. **Be Vietnam Pro** is selected for body text due to its exceptional legibility and its visual harmony when paired with Korean glyphs (Hangul).

For Korean text specifically, we maintain a slightly higher line-height (1.6) to ensure the complex radicals are easily distinguishable for learners. All labels and buttons use Plus Jakarta Sans in semi-bold or bold weights to emphasize the "action-oriented" nature of the app.

## Layout & Spacing

The layout follows a **Fluid Grid** system with a focus on vertical progression. 

- **Desktop:** 12-column grid with wide 48px margins to keep content centered and focused, reducing eye strain during long study sessions.
- **Mobile:** Single-column layout with 20px side margins.
- **Rhythm:** We use an 8px base grid. Content cards are separated by "MD" (24px) spacing, while internal card elements use "SM" (12px) to create clear grouping.

The "Learning Path" uses a staggered center-alignment, where nodes are placed slightly off-center to create a rhythmic, flowing journey downward.

## Elevation & Depth

To achieve the "polished gamified" look, this design system utilizes **Tonal Layering** combined with **Tactile Depth**:

1.  **Level 0 (Surface):** The main background, using a very light gray (#F8FAFC).
2.  **Level 1 (Cards):** Pure white with a 1px soft border (#E2E8F0). No shadow in the resting state to keep it modern.
3.  **Interactive Depth:** Primary buttons use a "3D" effect—a solid 4px bottom border in a darker shade of the button's color. When pressed, the button translates 2px down, simulating a physical click.
4.  **Floating Elements:** Only tooltips and modal overlays use soft, ambient shadows (15% opacity Indigo) to suggest they are temporarily obstructing the main flow.

## Shapes

The shape language is consistently **Rounded**. 

- **Cards and Containers:** Use a 16px (1rem) radius to feel welcoming.
- **Buttons:** Use a 12px radius, striking a balance between the extreme "pill" shapes of children's apps and the sharp corners of enterprise software.
- **Path Nodes:** Circular (Fully rounded) to emphasize completion and wholeness.
- **Progress Bars:** Fully rounded ends to suggest smooth, continuous movement.

## Components

### Buttons
Buttons are high-contrast. The **Primary Action** button uses the brand Indigo with a 4px bottom "lip" for a tactile feel. **Secondary Action** buttons use a white background with an Indigo border and no depth effect to indicate a secondary hierarchy.

### Learning Path Nodes
The "Path" is a sequence of circles. Locked nodes are grayscale; active nodes have a vibrant color border corresponding to their category; completed nodes feature a checkmark and a subtle glow effect.

### Cards
Content cards (for flashcards or scenario descriptions) use a white background with a subtle gray border. They never use heavy shadows. The header of the card may have a soft-tinted background (Category Mutes) to provide instant context.

### Progress Bars
Progress bars have a "track" (light gray) and a "fill" (Teal gradient). They should include a subtle "shine" overlay to feel glass-like and premium.

### Input Fields
Fields for translation or phonetic input use a larger font size (18px) and a bold 2px border when focused, using the brand Indigo.

### Iconography
Icons are 24px, 2px stroke weight, with slightly rounded terminals. They should be "semi-flat"—mostly line work but with one small solid-color element (in the category color) to add visual interest.