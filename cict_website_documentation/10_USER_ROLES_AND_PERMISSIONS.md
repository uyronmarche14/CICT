# CICT Website User Roles and Permissions

## 1. Main User Types

The platform has both public users and admin users.

## Public Visitor

Can:

- browse public pages
- view published news
- view published active announcements
- view published events
- view organizations
- view member profiles

Cannot:

- access admin pages
- manage content
- edit records
- join or leave events in the MVP

---

# 2. Admin Roles

## Full Admin

Highest permission level.

Can:

- login to admin panel
- manage users
- manage roles
- create, edit, delete, publish, and archive news
- create, edit, delete, publish, and archive announcements
- create, edit, delete, publish, cancel, and complete events
- manage organizations
- add, edit, and delete members
- activate or deactivate admin users
- assign system or custom roles

## Semi Admin

Limited admin role.

Can generally:

- login to admin panel
- view the admin dashboard when granted at least one admin-facing permission
- create and edit some news content
- create and edit some announcement content
- create and edit some event content
- manage some organization/member content
- assist with content operations

Cannot fully replace Full Admin for all sensitive actions.

## Support

Lower-level administrative role.

Can generally:

- login to admin only when granted admin-facing permissions through the backend
- view certain information
- assist in limited ways depending on assigned permissions

Cannot:

- perform broad administrative control by default

---

# 3. Permission Matrix

| Action | Full Admin | Semi Admin | Support | Public Visitor |
|---|---|---|---|---|
| Login to admin | Yes | Yes when backend permissions allow | Yes when backend permissions allow | No |
| View dashboard | Yes | Yes when backend permissions allow | Yes when backend permissions allow | No |
| Create user | Yes | No by default | No by default | No |
| Edit user profile fields | Yes | Limited if `edit_user` is granted | No by default | No |
| Change user status | Yes | No by default | No by default | No |
| Assign roles | Yes | No by default | No by default | No |
| Delete user | Yes | No by default | No by default | No |
| View roles | Yes | Limited if `view_role` is granted | No by default | No |
| Create role | Yes | No | No | No |
| Edit role | Yes | No | No | No |
| Delete role | Yes | No | No | No |
| Create news | Yes | Yes | No | No |
| Edit news | Yes | Yes | No | No |
| Publish news | Yes | Yes when granted | No by default | No |
| Archive news | Yes | No by default | No by default | No |
| Delete news | Yes | No by default | No by default | No |
| Create announcement | Yes | Yes | No | No |
| Edit announcement | Yes | Yes | No | No |
| Publish announcement | Yes | Yes when granted | No by default | No |
| Archive announcement | Yes | No by default | No by default | No |
| Delete announcement | Yes | No by default | No by default | No |
| Create event | Yes | Yes when granted | No by default | No |
| Edit event | Yes | Yes when granted | No by default | No |
| Publish event | Yes | Yes when granted | No by default | No |
| Cancel event | Yes | No by default | No by default | No |
| Complete event | Yes | No by default | No by default | No |
| Delete event | Yes | No by default | No by default | No |
| Edit organization | Yes | Yes | No | No |
| Add member | Yes | Yes when granted | No by default | No |
| Edit member | Yes | Yes | No | No |
| Delete member | Yes | No by default | No by default | No |
| View public pages | Yes | Yes | Yes | Yes |
| Join event | Future scope | Future scope | Future scope | Future scope |

---

# 4. Content Ownership Rules

## News

Managed by:

- Full Admin
- Semi Admin

## Announcements

Managed by:

- Full Admin
- Semi Admin

## Events

Managed by:

- Full Admin
- Semi Admin when explicit event permissions are granted

## Organizations

Managed by:

- Full Admin
- Semi Admin

## Members

Managed by:

- Full Admin
- Semi Admin for editing in supported flows

---

# 5. Access Rules

## Public Side

Public users can only see approved public content.

## Admin Side

Admin users must be authenticated.

## Protected Operations

Sensitive operations must check backend permission before execution.

This includes:

- role changes
- user activation and deactivation
- content publish/archive/cancel/complete actions
- admin user creation

## Future Permission Direction

Later versions should improve:

- finer-grained role management,
- custom role creation and editing UI,
- better audit visibility.
