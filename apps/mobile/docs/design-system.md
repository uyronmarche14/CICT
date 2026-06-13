# Mobile Design System

## Purpose

This document defines the visual source of truth for `apps/mobile` before the actual UI refactor begins. The mobile app must inherit the CICT web brand system while adapting it to mobile ergonomics, touch targets, and content density.

The web app is the canonical brand source, especially:

- [globals.css](/home/ronmarche14/projects/CICT/apps/web/src/app/globals.css:6)
- [tailwind.config.js](/home/ronmarche14/projects/CICT/apps/web/tailwind.config.js:1)

## Design Principles

- Brand-consistent, not screen-identical
- Bold hero moments, calm task surfaces
- Mobile-first spacing and touch safety
- High-legibility body text
- Reusable, shadcn-like control behavior translated to React Native
- Light-first, dark-ready

## Typography

### Primary Body Type

- Family: `Inter`
- Mobile role: body copy, labels, helper text, tabs, form fields, metadata, list content
- Tone: clean, neutral, readable

### Display / Heading Type

- Family: `Blockletter`
- Mobile role: major hero text, section feature locks, campaign headlines, branded callouts
- Tone: loud, branded, uppercase
- Constraint: do not overuse for dense task screens

### Heading Rules

Based on the web system:

- headings use the display family
- weight is medium to bold visual presence
- uppercase treatment is preferred for branded headings
- slight letter spacing should be preserved where legibility allows

### Mobile Usage Guidance

- Use `Inter` for nearly all functional screens
- Reserve `Blockletter` for:
  - app hero/header moments
  - dashboard campaign blocks
  - event spotlight cards
  - onboarding/landing moments
- Do not use `Blockletter` for:
  - form inputs
  - attendance tables/history rows
  - long profile sections
  - dense metadata blocks

## Color Tokens

The current web light theme source values are:

### Brand

- `primary`: `#6e29f6`
- `primaryForeground`: `#ffffff`
- `secondary`: `#f629a8`
- `secondaryForeground`: `#ffffff`
- `accent`: `#29f6d2`
- `accentForeground`: `#0f0f0f`

### Neutral Surfaces

- `background`: `#ffffff`
- `foreground`: `#111111`
- `card`: `#ffffff`
- `cardForeground`: `#111111`
- `popover`: `#ffffff`
- `popoverForeground`: `#111111`

### Muted / Borders

- `muted`: `#f3f3f3`
- `mutedForeground`: `#666666`
- `border`: `#e5e5e5`
- `input`: `#e5e5e5`
- `ring`: `#d1d1d1`

### Semantic

- `destructive`: `#ef4444`
- `destructiveForeground`: `#ffffff`

### Mobile Token Mapping

Future mobile tokens should adopt this shape:

- `background`
- `surface`
- `surfaceMuted`
- `surfaceElevated`
- `text`
- `textMuted`
- `primary`
- `primaryForeground`
- `secondary`
- `secondaryForeground`
- `accent`
- `accentForeground`
- `border`
- `input`
- `focusRing`
- `danger`
- `dangerForeground`
- `success`
- `warning`
- `info`

### Token Status

The mobile token file (`src/theme/tokens.ts`) is now brand-aligned with the web app:

- mobile `primary`: `#6E29F6` ✅ (web brand purple)
- mobile `secondary`: `#F629A8` ✅ (web brand pink)
- mobile `accent`: `#29F6D2` ✅ (web brand teal)

## Light-First / Dark-Ready Theme

### Light Theme

The first mobile implementation pass should fully support the light theme values listed above.

### Dark-Ready Values

Documented from the web system for future mobile parity:

- `background`: `#0f0f0f`
- `foreground`: `#f9f9f9`
- `card`: `#1a1a1a`
- `cardForeground`: `#f9f9f9`
- `popover`: `#1a1a1a`
- `popoverForeground`: `#f9f9f9`
- `primary`: `#6e29f6`
- `primaryForeground`: `#ffffff`
- `secondary`: `#f629a8`
- `secondaryForeground`: `#ffffff`
- `accent`: `#29f6d2`
- `accentForeground`: `#0f0f0f`
- `muted`: `#262626`
- `mutedForeground`: `#a3a3a3`
- `border`: `#2d2d2d`
- `input`: `#2d2d2d`
- `ring`: `#3a3a3a`

Dark mode does not need to be implemented across every mobile screen in this phase, but token naming must make that transition straightforward.

## Shape System

The web design system defines a radius base of `0.625rem`, with derived sizes:

- `radius-sm`
- `radius-md`
- `radius-lg`
- `radius-xl`

### Mobile Interpretation

- small controls: 10px
- default controls/cards: 12px to 16px
- prominent cards and hero surfaces: 20px to 24px
- pills and badges: fully rounded

### Intended Feel

- rounded, modern, friendly
- not glassy
- not ultra-sharp/minimal
- consistent with shadcn control softness

## Spacing

Future mobile spacing should stay on an 8px rhythm:

- `xs`: 8
- `sm`: 12
- `md`: 16
- `lg`: 20
- `xl`: 24
- `xxl`: 32

### Mobile Guidance

- use 16px to 20px as the default screen gutter
- use 12px to 16px within cards/forms
- use 24px to 32px between large content sections
- keep tap targets comfortably padded

## Elevation

Use subtle elevation only:

- utility/task cards: light border first, shadow second
- feature cards: slightly deeper elevation allowed
- avoid heavy shadow stacks that fight the bold color system

## Iconography

- simple line icons
- neutral by default
- use brand color sparingly for emphasis
- icons should support task clarity, not decoration overload

## Component Tone

### Buttons

- primary buttons use the brand purple
- secondary/outline buttons use neutral surfaces with clear borders
- destructive buttons use the destructive red
- ghost buttons should be minimal and text-led

### Cards

- white/light card surfaces on light theme
- neutral border
- generous spacing
- stronger visual treatment only for featured content

### Inputs

- neutral border
- quiet background
- brand-colored focus state
- clear error/support text using `Inter`

### Status Elements

- success, warning, danger, and info should remain readable and restrained
- do not replace the main brand palette with semantic overload

## Screen-Level Design Guidance

- Home/dashboard can use the strongest brand moments
- Events can use feature-card emphasis
- Attendance, profile, settings, and forms should stay calmer and more utility-focused
- Web landing-page spectacle should be translated into smaller branded moments on mobile, not copied literally
