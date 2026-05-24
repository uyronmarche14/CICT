# Materials Inventory

## Purpose

This file tracks the approved design materials copied or referenced for the mobile brand system.

## Copied Assets

### Heading Font

- Asset: `Blockletter.otf`
- Mobile path: [apps/mobile/assets/fonts/Blockletter.otf](/home/ronmarche14/projects/CICT/apps/mobile/assets/fonts/Blockletter.otf)
- Source path: [apps/web/public/fonts/Blockletter.otf](/home/ronmarche14/projects/CICT/apps/web/public/fonts/Blockletter.otf)
- Intended use:
  - branded headings
  - hero callouts
  - dashboard feature sections
  - event spotlight moments
- Not intended for:
  - form labels
  - long text
  - metadata rows
  - dense settings/profile content

## Referenced Materials

### Web Brand Token Source

- Source: [apps/web/src/app/globals.css](/home/ronmarche14/projects/CICT/apps/web/src/app/globals.css:51)
- Why referenced:
  - canonical colors
  - canonical light/dark values
  - font family assignments
  - radius derivation

### Tailwind Brand Mapping

- Source: [apps/web/tailwind.config.js](/home/ronmarche14/projects/CICT/apps/web/tailwind.config.js:8)
- Why referenced:
  - confirms semantic token names
  - confirms heading font mapping
  - confirms shadcn-style color roles

## Asset Loading Expectations

For the later UI implementation phase:

- load `Blockletter.otf` through Expo font loading
- define font family constants centrally
- do not reference file paths directly inside arbitrary components
- keep asset registration inside the mobile theme/bootstrap layer

## Rules For Adding Future Materials

- Only copy assets that are truly needed by mobile
- Prefer documenting source-of-truth token references over duplicating random web files
- Never copy full web components into the mobile folder as “materials”
- Record every new copied font/image/design asset here with:
  - source path
  - mobile destination
  - usage intent
  - loading/runtime notes
