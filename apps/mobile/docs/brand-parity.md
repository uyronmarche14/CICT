# Brand Parity

## Goal

The mobile app should feel unmistakably part of the same CICT product family as the web app, while still behaving like a mobile-first interface.

This means:

- same brand colors
- same type families
- same rounded control language
- same high/low visual contrast between expressive sections and utility sections

This does **not** mean:

- copying web layouts screen-for-screen
- copying web components directly
- forcing web animation density or desktop spacing onto mobile

## Source Of Truth

Use the following web files as the brand source:

- [apps/web/src/app/globals.css](/home/ronmarche14/projects/CICT/apps/web/src/app/globals.css:6)
- [apps/web/tailwind.config.js](/home/ronmarche14/projects/CICT/apps/web/tailwind.config.js:8)

## Direct Mappings

### Typography

- web body font `Inter` -> mobile body/system font stack with `Inter` as the target loaded family
- web heading font `Blockletter` -> mobile display font for branded feature headings

### Color

- web purple primary -> mobile primary action and hero emphasis
- web pink secondary -> mobile supporting highlights and special states
- web teal accent -> mobile accent moments, chips, highlights, and contrast accents
- web white/near-white surfaces -> mobile cards and page backgrounds
- web muted and border neutrals -> mobile separators, inputs, and low-emphasis surfaces

### Shape

- web rounded radii -> mobile card/button/input rounding
- web shadcn control softness -> mobile control structure

## What Must Adapt For Mobile

### Layout

- desktop multi-column sections become stacked mobile sections
- web navigation/header/footer patterns do not map directly to mobile tabs and stacks
- oversized hero typography should be scaled down and used more selectively

### Motion

- web page-reveal motion should become lighter, shorter mobile transitions
- decorative background effects should be reduced or simplified

### Density

- mobile needs larger tap targets
- mobile metadata must stay more compact and readable
- mobile task flows should prioritize clarity over spectacle

## What Must Not Be Copied Directly

- React/Next UI components from `apps/web`
- web-only CSS patterns
- desktop hero layout compositions
- any layout relying on hover

## Future Implementation Rules

- Translate tokens first, screens second
- Start by replacing mobile theme tokens with web-aligned equivalents
- Load `Blockletter` as an Expo font asset before using it in UI
- Apply expressive brand styling mostly to home/dashboard/event highlights
- Keep profile/settings/attendance screens function-first

## Current Gap Summary

The mobile scaffold currently has:

- a generic blue-led token file
- no imported brand font asset wiring
- only partial visual identity guidance

The future mobile UI pass should resolve those gaps using the materials and docs added in this phase.
