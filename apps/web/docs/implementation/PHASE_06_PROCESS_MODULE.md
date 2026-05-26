# Phase 6: Process Module

## Goal

Add a new admin `Process` module with reusable templates and live instances for operational workflows.

## Current Status

**Completed.**

- Process models exist with full CRUD.
- Admin sidebar entry and full admin pages exist.
- ReactFlow visual builder with 6 custom node types and edge styling.
- Backend engine with status transitions, advance, approve/reject, checklist.
- Instance executor with backend-wired actions and assignee gating.
- Comments, requirements, approval-step, checklist APIs.
- Node inspector with per-type configuration (task, approval, document, review, start/end).
- Template → Instance lifecycle: design, launch, execute, archive.

### Still Pending (non-blocking)
- Content-to-process linkage UX in news/event/announcement admin forms.

## Dependencies

- Content linkage and audit foundations are in place.
- ReactFlow is a planned UI dependency for the visual builder.

## Changes

- Add models:
  - `ProcessTemplate`
  - `ProcessInstance`
- Add supported node types:
  - `start`
  - `task`
  - `approval`
  - `document_requirement`
  - `comment_review`
  - `end`
- Add optional content linkage for:
  - news
  - announcements
  - events

## API/Data Contracts

- Templates store reusable nodes and edges.
- Instances store live workflow state, comments, requirements, approval steps, and content linkage.
- Process linkage is optional in v1.

## Test Cases

- Template can be created and loaded.
- Instance can be created from a template or standalone.
- Comments and requirements persist correctly.

## Acceptance Gate

- Process data works independently from whether the visual builder is fully enabled.

## Rollback Notes

- Process routes and UI can be disabled without affecting content publishing.
