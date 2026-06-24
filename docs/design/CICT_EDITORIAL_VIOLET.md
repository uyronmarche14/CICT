# CICT Editorial Violet Design System

## Intent

CICT uses the attached ElevenLabs analysis as a structural reference, not as a brand copy. The goal is a calmer, more editorial CICT interface that keeps the existing violet identity, Blockletter display type, Inter/system UI text, and shadcn-style web controls.

## Brand Translation

- **Primary brand**: violet remains the main action and identity color.
- **Atmosphere**: pink and teal support the violet as soft background blooms, dividers, subtle highlights, and status accents. They should not dominate every card.
- **Typography**: Blockletter is reserved for expressive public headings and branded moments. Inter/system UI handles body text, controls, dense admin screens, mobile lists, and form labels.
- **Shape**: buttons and inputs stay fitted at 8-12px radius; cards use 12-16px; hero and feature panels may use 20-24px. Pills are for badges, compact CTAs, and status chips.
- **Depth**: use hairline borders and one soft shadow tier. Avoid heavy glass, stacked shadows, and neon glow unless a public hero intentionally needs atmosphere.

## Tokens

| Role | Web Token | Mobile Token | Use |
| --- | --- | --- | --- |
| Brand action | `--primary` | `primary` | Primary buttons, active nav, selected states |
| Brand active | `--primary-active` | `primaryDeep` | Pressed/hovered primary states |
| Soft canvas | `--canvas` | `canvas` | Public page floor, student portal backgrounds |
| Soft surface | `--surface-soft` | `surfaceSoft` | Section bands, quiet filters |
| Elevated surface | `--surface-elevated` | `surfaceElevated` | Cards and dialogs |
| Hairline | `--hairline` | `hairline` | Card/table/dialog borders |
| Soft text | `--muted-foreground` | `textMuted` | Captions, helper copy, metadata |
| Atmospheric pink | `--atmosphere-rose` | `atmosphereRose` | Background blooms only |
| Atmospheric teal | `--atmosphere-teal` | `atmosphereTeal` | Background blooms only |

## Component Rules

- **Buttons**: default is violet, `outline` is quiet surface + hairline, `ghost` is transparent and low-emphasis. Do not use raw blue/indigo button colors.
- **Cards**: use white/elevated surfaces, hairline borders, restrained radius, and subtle shadow. Admin cards should be dense and scannable; public cards can breathe more.
- **Inputs**: white/elevated field, 44px minimum web height, 50px mobile touch target, violet focus ring.
- **Badges/status**: pill geometry, compact text, semantic tone. Badges should clarify ownership, state, or type.
- **Tables**: compact rows, muted headers, soft hover, no heavy zebra striping.
- **Dialogs/sheets**: elevated surface, hairline border, soft overlay blur, controlled radius.

## Surface Guidance

- **Public web**: expressive but edited. Use fewer atmospheric blooms, consistent hero wording, strong media, and calm section rhythm.
- **Admin web**: do not make it a landing page. Keep density, sidebars, tables, filters, and management workflows work-focused.
- **Student web**: must use CICT violet/canvas tokens instead of blue/indigo gradients.
- **Expo mobile**: use custom primitives. No shadcn dependency. Mirror the web tone through token parity, softer cards, strong but restrained hero moments, and readable list density.

## Motion

- Motion should clarify hierarchy or provide atmosphere. Respect reduced-motion preferences.
- Gradient blooms are decorative only. They should never become button fills, text fills, or required content containers.

## QA Checklist

- No generic blue/indigo surface remains on student-facing shells.
- Cards, buttons, inputs, tables, and badges inherit primitives instead of one-off styling.
- No uncontrolled oversized radius or heavy shadow on utility/admin screens.
- Public pages keep CICT energy while feeling calmer and more premium.
- Mobile screens remain readable, touch-safe, and visually connected to web.
