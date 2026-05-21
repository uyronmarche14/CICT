# Phase 7A: Landing Page and Updates Hub Expansion

## Goal

Upgrade the landing page and updates hub so the richer event, news, announcement, organization, and leader data can be surfaced as meaningful dynamic features.

## Current Status

Not started.

- The landing page and updates hub already aggregate content.
- Audit-driven spotlight, ranking, and richer summary behavior is still missing.

## Dependencies

- Phase 3A, Phase 5A, and Phase 6A provide most of the structured data this phase will consume.
- [LANDING_AND_UPDATES_HUB_AUDIT.md](/home/ronmarche14/projects/CICT/cictv4/docs/LANDING_AND_UPDATES_HUB_AUDIT.md:1) defines the current gaps.

## Changes

- Add landing blocks for:
  - organization spotlight
  - leadership spotlight
  - achievement spotlight
- Improve updates hub ranking:
  - event ordering by schedule proximity rather than creation time
  - richer grouping of official versus organization activity
- Improve summary inputs for:
  - community cards
  - leadership updates
  - achievement highlights
  - organization cross-links

## API/Data Contracts

- Landing and updates features should consume structured metadata rather than guessing from body text.
- Existing public routes remain stable while new spotlight sections are introduced additively.

## Test Cases

- Updates hub event ordering matches event urgency and schedule.
- Landing sections render cleanly when some spotlight data is missing.
- Cross-links between updates, organizations, leaders, and source content remain valid.

## Acceptance Gate

- Landing and updates surfaces feel intentionally data-driven rather than placeholder-driven.
- Spotlight features reuse structured content across modules cleanly.

## Rollback Notes

- Spotlight sections and ranking logic can be toggled off without affecting the underlying content records.
