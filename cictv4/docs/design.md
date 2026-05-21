# CICT Design Pattern Guide

Last updated: 2026-05-18
Source of truth: current frontend implementation in `/home/ronmarche14/projects/CICT/cictv4`

## Purpose

This document defines the visual and interaction patterns for the CICT website so future pages and components feel like one system instead of a collection of unrelated screens.

It is based on the current codebase, especially:

- `/home/ronmarche14/projects/CICT/cictv4/src/app/globals.css`
- `/home/ronmarche14/projects/CICT/cictv4/src/components/layout/landingPage.tsx`
- `/home/ronmarche14/projects/CICT/cictv4/src/components/sections/landingpage/heroSection.tsx`
- `/home/ronmarche14/projects/CICT/cictv4/src/components/sections/landingpage/newsSection.tsx`
- `/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/index.tsx`

## Design Direction

CICT should feel:

- bold
- youthful
- tech-forward
- community-centered
- official enough for an academic institution

The current visual direction is not minimal corporate UI. It is expressive, animated, and brand-driven. That is a strength and should be preserved, but it needs clearer rules.

## Core Design Principles

### 1. Bold First Impression

The landing experience should open with strong typography, large scale, and visible motion. CICT is presented as a confident technology college, not a passive brochure site.

### 2. Academic Credibility with Modern Energy

Pages should balance institutional clarity with creative visual treatment. Important content must remain readable, structured, and trustworthy even when the presentation is vibrant.

### 3. Modular Storytelling

Pages should be built from clearly separated sections such as hero, story, updates, organizations, events, and CTA. Each section should communicate one idea well.

### 4. Branded Consistency

Color, typography, card treatment, gradients, and motion should come from shared patterns rather than per-page improvisation.

### 5. Responsive by Default

Every section must remain legible and intentional on mobile, tablet, and desktop. Large headlines can scale dramatically, but they must not break flow or hide key actions.

## Brand Foundations

### Color System

The active token set in `globals.css` establishes the brand palette:

| Token | Value | Role |
| --- | --- | --- |
| `--primary` | `#6e29f6` | Main brand color, key actions, gradients, emphasis |
| `--secondary` | `#f629a8` | Expressive accent, highlight state, decorative support |
| `--accent` | `#29f6d2` | Fresh contrast for tech energy and interactive moments |
| `--background` | `#ffffff` | Main light surface |
| `--foreground` | `#111111` | Primary text and high-contrast elements |
| `--muted` | `#f3f3f3` | Secondary surfaces and low-emphasis areas |

#### Recommended usage

- Use `primary` for major CTAs, focused links, key strokes, and section emphasis.
- Use `secondary` and `accent` as support colors, not as replacements for the main action color.
- Use gradients for headlines, glows, and decorative surfaces, not for long-form body text.
- Keep text contrast high against decorative backgrounds.

### Typography

The current system uses:

- `Inter` for body copy and interface text
- `Blockletter` for headings and identity-heavy moments

#### Typography pattern

- Headings: uppercase, high-impact, short phrases
- Body copy: clean, readable, medium-length paragraphs
- Labels and badges: small uppercase or tracked text
- Hero typography: oversized and theatrical, especially on the home page

#### Rule

Use `Blockletter` when the goal is identity, emphasis, or a campaign-style headline. Use `Inter` for content density, navigation, forms, tables, and admin UI.

### Shape and Surface

The UI currently favors:

- rounded cards
- soft borders
- translucent layers
- gradient overlays
- subtle shadow depth

#### Default surface pattern

- `rounded-2xl` or `rounded-xl`
- `border border-border/40` or `border-border/50`
- `bg-card`, `bg-background/60`, or gradient surface blends
- moderate shadow, never overly heavy unless it is a hero or spotlight element

## Layout Patterns

### 1. Hero Pattern

Used in: home page hero

Characteristics:

- full-screen or near full-screen height
- animated or interactive background
- oversized layered typography
- single emotional message
- one clear cue to continue scrolling

Guideline:

The hero should sell identity first and navigation second. Avoid cluttering it with too many buttons or dense text blocks.

### 2. Editorial Intro Pattern

Used in: section headers like updates and story

Characteristics:

- compact eyebrow or badge
- bold gradient or high-contrast heading
- supporting paragraph beneath
- optional CTA row

Guideline:

This should be the default entry pattern for content sections that need context before cards or media appear.

### 3. Showcase Grid Pattern

Used in: story and organization areas

Characteristics:

- one dominant media block
- one or two supporting cards or images
- asymmetric composition
- visual depth through spacing and layering

Guideline:

Use this when the goal is to make institutional content feel alive. Prefer one focal asset over many equally weighted assets.

### 4. Card Collection Pattern

Used in: news, announcements, events, highlights

Characteristics:

- cards with clear boundaries
- concise metadata
- short summaries
- hover response
- clear click target

Guideline:

Cards should be scannable in under three seconds. Title, type, date, and ownership should be obvious.

### 5. Footer Banner Pattern

Used in: footer

Characteristics:

- large closing statement
- social/contact utilities
- low-pressure brand reinforcement
- decorative gradient atmosphere

Guideline:

The footer should feel like a final branded section, not a generic legal dump.

## Component Patterns

### Navigation

The current navbar pattern is:

- floating
- centered
- translucent
- more solid after scroll
- compact on desktop
- collapsible on mobile

Rule:

Top navigation should remain visually light until the user starts moving through content.

### Buttons

Primary button pattern:

- filled with `primary`
- high contrast text
- rounded corners
- light hover emphasis

Secondary button pattern:

- outlined or lower-emphasis filled surface
- used for alternate routes and supporting actions

Rule:

One primary action per local content cluster. Extra actions should step down visually.

### Badges and Eyebrows

Used for:

- section labels
- ownership tags
- content type markers
- small brand statements

Rule:

Badges should clarify context, not compete with headlines.

### Cards

Card content should usually follow this order:

1. label or metadata
2. title
3. summary
4. optional footer action or secondary metadata

Rule:

Do not overload cards with too many controls. Cards are primarily for scanning and navigation.


## Width and Container Rule

All main public page sections should use a consistent maximum width:
```tsx
className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
```

### Tabs

Used in the organization section.

Rule:

Tabs should switch between comparable content sets. They are a good fit for organizations, programs, or categorized academic content, but should not hide critical first-view information.

### Imagery

Preferred imagery types:

- campus photos
- student activity photos
- organization logos
- event visuals
- technology-themed visuals when relevant

Rule:

Images should reinforce real community identity. Decorative tech graphics are support material, not the main proof of CICT’s value.

## Motion Patterns

The current frontend already uses motion meaningfully. The reusable motion language should be:

- fade-up for section reveals
- staggered entrances for grouped content
- slight scale on hover for important visual objects
- gentle transitions for navbar and cards
- restrained looping animation for cues, not for every component

### Motion rule

Animation should guide attention, not become the content itself.

### Accessibility rule

If a component depends on animation to make sense, add a static readable fallback.

## Responsive Patterns

### Mobile

- stack content vertically first
- keep headline scale dramatic but controlled
- preserve spacing around touch targets
- do not rely on hover to reveal essential information

### Tablet

- use two-column transitions where helpful
- maintain strong visual hierarchy
- avoid overfilling wide cards with low-priority text

### Desktop

- allow more asymmetry
- use larger hero scale
- give media room to breathe
- support richer motion and hover polish

## Content Tone in the Interface

The UI copy should sound:

- welcoming
- confident
- student-centered
- informative
- optimistic

Avoid copy that sounds:

- overly corporate
- vague
- filler-heavy
- generic to any school or company

## Implementation Rules

When building new UI for CICT:

1. Start with tokens from `globals.css` before introducing new colors.
2. Reuse the existing section structure pattern: intro, content block, supporting CTA.
3. Prefer gradient text or gradient glow for emphasis, not entire large paragraphs.
4. Use `Blockletter` selectively for high-impact headings, not every label.
5. Keep cards readable and metadata clear.
6. Use animation intentionally and sparingly.
7. Match public pages to the expressive brand, but keep admin pages simpler and more task-focused.

## Public vs Admin Design Pattern

### Public site

- expressive
- motion-rich
- story-driven
- brand-forward

### Admin panel

- clearer density
- faster scanning
- stronger emphasis on forms, tables, and workflow
- fewer decorative effects

Rule:

Both sides should share tokens and typography logic, but they should not have identical visual intensity.

## Current Inconsistencies to Fix Over Time

The current frontend is visually promising, but the design system is not fully normalized yet.

### Main inconsistencies

- some sections use the brand token palette while others use hardcoded grayscale or ad hoc colors
- heading styles vary more than they should across sections
- some content feels institutionally branded while some still reads like placeholder product-marketing copy
- certain components are highly polished while others are still scaffold-level

### Recommended cleanup priorities

1. replace hardcoded colors with token-based color usage
2. standardize section heading structure
3. align CTA language with academic and campus context
4. define shared card variants for news, events, announcements, and organizations
5. create a reusable spacing rhythm for all public pages

## Pattern Summary

The CICT website design pattern can be summarized as:

> bold academic branding + modern tech energy + modular storytelling + clean content cards + purposeful motion

That should be the standard for future work across the public-facing experience.
