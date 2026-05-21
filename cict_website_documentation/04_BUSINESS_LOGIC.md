# CICT Website Business Logic

## 1. Core System Logic

The CICT platform follows this main product flow:

```text
Admin Login → Create or Update Content → Publish Content → Public Users Browse Content → Department Keeps Information Updated
```

For events, organizations, and members, the logic continues into more specific flows.

---

# 2. Admin Authentication Logic

## Flow

1. Admin opens the login page.
2. Admin enters credentials.
3. System validates the account.
4. System checks if the account is active.
5. System creates a secure session.
6. System allows access to the admin panel.

## Rules

- only authorized users can access admin routes
- inactive users cannot login successfully
- public visitors cannot access admin management screens

---

# 3. News Publishing Logic

## Flow

1. Authorized admin logs in.
2. Admin opens News Management.
3. Admin creates or edits a news article.
4. Admin fills in title, excerpt, content, tags, and image.
5. System stores the news record as editable content.
6. A user with publish permission moves the article through the workflow.
7. Published records become available to the public website.
8. Draft or archived records are not shown publicly.

## Rules

- only authorized roles can create or edit news
- public users can only see published news
- deleted news is removed from active public view
- article images are stored through the upload system

---

# 4. Announcement Logic

## Flow

1. Authorized admin opens Announcement Management.
2. Admin creates or edits an announcement.
3. Admin sets title, message, priority, target audience, and expiration date.
4. System stores the record as a draft.
5. A user with publish permission activates the announcement through the workflow.
6. Announcement is shown according to public/admin presentation rules.

## Rules

- announcements are shorter and more direct than news
- priority helps indicate urgency
- expiration helps prevent outdated notices from remaining active
- only authorized roles can manage announcements

---

# 5. Event Logic

## Flow

1. Admin opens Event Management.
2. Admin creates or edits an event.
3. Admin sets title, schedule, location, description, image, and attendee limit.
4. System stores the event as a draft.
5. Public users can browse events.
6. Publish, cancel, and complete actions are controlled by dedicated workflow permissions.
7. Event registration is future scope for the MVP.

## Event Statuses

- Draft
- Published
- Cancelled
- Completed

## Rules

- public users should only see published events
- public users cannot join or leave events in the MVP
- public event cards should not redirect users to admin login
- cancelled and completed events are terminal workflow states

---

# 6. Organization Logic

## Flow

1. Admin opens organization management.
2. Admin selects an organization.
3. Admin updates organization details such as name, description, mission, vision, and images.
4. System stores changes.
5. Public organization page reflects the updated content.

## Rules

- organizations are public-facing identity pages
- each organization should have a unique slug or ID
- only authorized roles can edit organization records

---

# 7. Member Logic

## Flow

1. Admin opens a specific organization.
2. Admin adds, edits, or removes a member.
3. Member information is stored inside the organization record.
4. Public member profile page uses that stored information.

## Rules

- each member should have a unique identifier inside the organization
- only authorized roles can modify member data
- member photos should be uploaded through the image system

---

# 8. Public Content Visibility Logic

## Public users can

- browse public pages
- view published news
- view published active announcements
- view published events
- view organizations
- view member profiles

## Public users cannot

- access admin dashboards
- manage content
- view protected admin data
- edit records

---

# 9. User Management Logic

## Flow

1. Full Admin opens Users page.
2. Full Admin or another explicitly authorized admin creates a new admin user or updates one.
3. General user profile updates only allow safe fields such as name data.
4. Role assignment and account activation status use dedicated protected endpoints.
5. System stores user identity, role, and status.
6. Role determines what the user can manage.

## Rules

- user creation is protected
- user creation is separate from organization member management
- role assignment requires explicit role-management permission
- account activation and deactivation require dedicated permission
- self-deletion should not be allowed
- roles define access limits
- only higher-privilege admins should manage accounts

---

# 10. Role and Permission Logic

## Flow

1. System reads the authenticated user role.
2. System resolves the effective permission set from the system role and any assigned custom role.
3. System revalidates the current account state on each protected request.
4. System checks the required permission for the requested action.
5. If the role has the required access, action proceeds.
6. If not, access is denied.

## Current Main Roles

- Full Admin
- Semi Admin
- Support

## Rules

- Full Admin has the widest access
- Semi Admin has limited admin access
- Support is admin-authenticated but mostly view-focused
- role behavior should remain consistent across backend and frontend

## Current MVP Scope Notes

- event participation is browse-only and registration is future scope
- public announcements only appear when published, active, and not expired
- the shared public CTA is informational only until secure contact handling is implemented
- custom role management UI is read-only in the MVP

---

# 11. Media Upload Logic

## Flow

1. Admin uploads an image.
2. System validates the file type and size.
3. System sends the image to the media storage service.
4. System saves the image URL and reference ID.
5. Content records use that image in the public view.

## Rules

- image uploads must be validated
- only admins should upload protected content media
- media should remain linked to the content record

---

# 12. Final System Logic Statement

The business logic of the CICT platform is centered on controlled publishing.

Authorized admins manage the content, the system stores and organizes it, and the public website displays approved information in a clear and modern way.
