# Organization RBAC — Admin Permission Guide

## Permission Levels

There are two levels of admin access to organization features:

### 1. Global Admin

A user with a system role (`full_admin`, `semi_admin`, `support`) with `canAccessAdmin: true`.

**Can:**
- Access ALL organizations and their modules
- Manage memberships for any org
- Create/edit/delete any organization
- All organization module operations (tasks, meetings, budget, etc.)

**Gated by:** System role assignment + `requireAdminAccess` or `authorize(Permission.*)` middleware.

### 2. Scoped Org Admin

A user assigned to specific organizations via `OrganizationAssignment`.

**Can:**
- Access only assigned organizations
- Use only permitted modules within those orgs
- Approve/reject memberships for their orgs
- Manage their org's tasks, meetings, budget, etc.

**Gated by:** `OrganizationAssignment` records + `canAccessOrganizationScope()` utility at the controller level.

## Permission Check Flow

```
Request → authenticate → requireAdminAccess? → authorize(Permission.X)? → controller
                                                                              ↓
                                                    canAccessOrganizationScope(user, orgId, permission)
```

### Route-level (middleware)

| Middleware | What it checks | Who passes |
|-----------|---------------|------------|
| `authenticate` | Valid JWT, user exists | All authenticated users |
| `requireAdminAccess` | `canAccessAdminPanel(user)` | Global admins only |
| `authorize(Permission.X)` | `hasGlobalPermission(user, X)` | Users with global Permission.X |
| `authorizeAny(Perm.A, Perm.B)` | User has at least one of A or B globally | Users with global permission |

### Controller-level (runtime)

| Utility | What it checks | Who passes |
|---------|---------------|------------|
| `canAccessOrganizationScope(user, orgId, perm)` | User has global perm OR user has org assignment with that module | Global + scoped admins |

## Membership-Specific Rules

| Operation | Permission Required | Scoped Admin Support |
|-----------|-------------------|---------------------|
| View memberships | `VIEW_MEMBER` | ✅ via `checkMembershipPermission` |
| Create membership | `MANAGE_MEMBER_ROLES` | ✅ via `checkMembershipPermission` |
| Approve membership | `MANAGE_MEMBER_ROLES` | ✅ via `checkMembershipPermission` |
| Reject membership | `MANAGE_MEMBER_ROLES` | ✅ via `checkMembershipPermission` |
| Update membership | `MANAGE_MEMBER_ROLES` | ✅ via `checkMembershipPermission` |
| Delete membership | `MANAGE_MEMBER_ROLES` | ✅ via `checkMembershipPermission` |
| View pending (all orgs) | `MANAGE_MEMBER_ROLES` or `VIEW_MEMBER` | Global only (requires `requireAdminAccess`) |

## Route Architecture

Organization routes use two patterns:

### Pattern A: Router-level protection (legacy)
```typescript
router.use(authenticate);
router.use(requireAdminAccess);  // Blocks scoped admins!
// Routes use authorize() + controller
```

### Pattern B: Per-route protection (recommended for scoped access)
```typescript
router.use(authenticate);
// Each route individually:
router.get('/:orgId/memberships', authorizeAny(...), controller);
// Controller handles scoped check internally
```

## Common Pitfall

**Scoped admin blocked by `requireAdminAccess` at router level:**

```
Request → authenticate ✅
       → requireAdminAccess ❌ (scoped admin blocked before reaching controller)
```

**Fix:** Remove router-level `requireAdminAccess`, use per-route `authorize()` + controller-level `checkMembershipPermission()` which handles scoped access.
