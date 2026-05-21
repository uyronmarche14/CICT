# Floating Badges Feature

Last updated: 2026-05-20

## Scope

Floating badges are implemented on the public member detail page at [member/[id]/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/member/[id]/page.tsx:1).

## What the page renders

Around the member portrait, the page conditionally renders small animated badges for:
- organization name
- the first word of the member position
- the first listed skill
- an achievement highlight when achievements exist

The badges use organization colors and lightweight motion to make the hero feel more alive without changing the core content structure.

## Implementation notes

- Uses the organization color palette coming from the organization data model.
- Uses simple CSS animation classes plus small inline animation delays.
- Badges are decorative. Core profile information remains available as standard text content.

## Related files

- [member/[id]/page.tsx](/home/ronmarche14/projects/CICT/cictv4/src/app/member/[id]/page.tsx:1)
- [organizationData.ts](/home/ronmarche14/projects/CICT/cictv4/src/components/organizations/organizationData.ts:1)
