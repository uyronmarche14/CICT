# Backend Scoping & Permissions — Coding Standards

## Golden Rule

Every endpoint that accesses organization-scoped data MUST enforce permissions at **two layers**:

```
Route middleware (express-level)  →  fast-fail for unauthorized users
        │
Controller/service (code-level)  →  defense-in-depth re-check
```

## Layer 1: Route Middleware

Use `authorizeOrganizationScope()` for org-specific routes:

```typescript
router.get(
  '/:orgId/calendar',
  requireAdminAccess,
  authorizeOrganizationScope(Permission.VIEW_ORG_ANALYTICS),
  controller
);
```

Use `authorize()` for global-only routes:

```typescript
router.delete('/:id', requireAdminAccess, authorize(Permission.DELETE_ORGANIZATION), controller);
```

Use `authorizeAnyGlobalOrScoped()` for membership/pending routes:

```typescript
router.get('/pending', requireAdminAccess, authorizeAnyGlobalOrScoped(Permission.MANAGE_MEMBER_ROLES, Permission.VIEW_MEMBER), controller);
```

## Layer 2: Controller/Service Re-check

Always add a service-level re-check if the route middleware could change:

```typescript
// GOOD — double-checked
export const getOrgCalendar = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  if (!req.user || !canAccessOrganizationScope(req.user, orgId, Permission.VIEW_ORG_ANALYTICS)) {
    res.status(403).json({ success: false, message: 'Access denied' }); return;
  }
  // ... fetch data
};
```

```typescript
// BAD — single point of failure
export const getOrgCalendar = async (req: AuthRequest, res: Response) => {
  const { orgId } = req.params;
  // ❌ No re-check! If middleware is removed/refactored, this becomes unguarded
  const items = await getCalendarService(orgId, startDate, endDate);
};
```

## Pattern for CRUD Operations

For create/update/delete operations, use a dedicated permission function in the service:

```typescript
// In service file:
const checkPermission = (user: IAuthenticatedUser, orgId: string, permission: Permission) => {
  if (!canAccessOrganizationScope(user, orgId, permission)) {
    throw new AppError('Access denied', 403);
  }
};

export const updateOrgSettings = async (req, orgId) => {
  checkPermission(req.user, orgId, Permission.MANAGE_SETTINGS);
  // ... proceed
};
```

## Permission Types Reference

| Middleware | Layer 1 (route) | Layer 2 (service) | Used For |
|-----------|----------------|-------------------|----------|
| Global admin | `requireAdminAccess` + `authorize(P)` | N/A (global) | System-wide routes: users, roles, settings |
| Scoped to org | `requireAdminAccess` + `authorizeOrganizationScope(P)` | `canAccessOrganizationScope(user, orgId, P)` | Org routes: tasks, meetings, budget, calendar |
| Any (global OR scoped) | `requireAdminAccess` + `authorizeAnyGlobalOrScoped(...P)` | N/A (both checked) | Membership pending, approvals |

## Checklist for New Routes

- [ ] Middleware includes `authorizeOrganizationScope` or `authorize`?
- [ ] Controller re-checks scope with `canAccessOrganizationScope`?
- [ ] Service function validates scope for the specific orgId?
- [ ] Frontend permission hook mirrors the backend check?
