# Timeline Feature

Last updated: 2026-05-20

## Component

The timeline component lives at [Timeline.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/Timeline.tsx:1).

## Current use

It is currently used on the public member detail page to present milestones and achievements from organization member profiles.

## Data contract

Timeline data comes from the organization data model:
- [organizationData.ts](/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/organizationData.ts:1)

Supported event categories:
- `achievement`
- `project`
- `milestone`
- `award`
- `education`

Each event can include:
- `year`
- `title`
- `description`
- `category`
- `details`

## Interaction model

- the active card is driven by hover state
- the year badge scales and rotates on hover
- the card shifts slightly to create depth
- details expand inline when a card is active
- accent color is injected from the organization theme

## Current caveats

- Interaction is hover-first, so a future click/tap affordance would improve touch behavior.
- Styling and animation are mostly component-local.
- The component assumes a relatively small event list and does not virtualize.
