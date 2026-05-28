# Phase 6: Process Module

## Goal

Add a new admin `Process` module with reusable templates and live instances for operational workflows.

## Current Status

Complete.

- `ProcessTemplate` and `ProcessInstance` models with full CRUD exist.
- `process-engine.service.ts` handles create-from-template, status transitions, advancing nodes.
- Full REST API at `/api/admin/processes` for templates and instances.
- ReactFlow visual editor with 6 node types (start, task, approval, document_requirement, comment_review, end).
- 6 admin UI pages: list, create, edit templates; list, detail instances.
- Node assignments by user, role, or organization.
- Content linkage to news, announcements, and events.
- Unit tests for process engine service exist.
- This phase is fully implemented — the doc was incorrectly marked as scaffold-only.
  - comments, requirements, approval-step APIs
  - real content-to-process linkage UX

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
