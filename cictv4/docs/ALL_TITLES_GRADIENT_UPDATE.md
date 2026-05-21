# All Titles Gradient Update

Last updated: 2026-05-20

This note is now archival.

The repo still uses gradient section titles, but the canonical implementation is no longer a one-off sweep across many files. The current shared source of truth is [REUSABLE_COMPONENTS_UPDATE.md](/home/ronmarche14/projects/CICT/cictv4/docs/REUSABLE_COMPONENTS_UPDATE.md:1), especially the `PublicSectionHeader` component at [PublicSectionHeader.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/sections/landingpage/PublicSectionHeader.tsx:1).

Current guidance:
- Prefer `PublicSectionHeader` for public-facing section headers.
- Keep the gradient style `from-foreground to-primary`.
- Only use inline heading markup when a page needs custom layout, such as the member detail hero or specialized admin surfaces.

Related files:
- [REUSABLE_COMPONENTS_UPDATE.md](/home/ronmarche14/projects/CICT/cictv4/docs/REUSABLE_COMPONENTS_UPDATE.md:1)
- [PublicSectionHeader.tsx](/home/ronmarche14/projects/CICT/cictv4/src/components/sections/landingpage/PublicSectionHeader.tsx:1)
