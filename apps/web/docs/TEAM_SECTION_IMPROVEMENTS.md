# Team Section Improvements

Last updated: 2026-05-20

## Current implementation

The public organization team experience is driven from:
- [components/organizations/index.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/organizations/index.tsx:1)
- [components/organizations/sections/TeamSection.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/organizations/sections/TeamSection.tsx:1)
- [components/organizations/MemberCard.tsx](/home/ronmarche14/projects/CICT/apps/web/src/components/organizations/MemberCard.tsx:1)

The earlier resizing work is still reflected in the current layout: leadership content is visually emphasized, team cards have more breathing room, and the section uses a broader container than the original version.

## What matters now

- The team section is data-driven from organization content.
- It feeds into the member detail flow.
- It should stay visually aligned with the organization color system.

## Documentation note

This file now serves as a lightweight state note rather than a change log. For implementation work, the source of truth is the current component code rather than the original sizing diff.
