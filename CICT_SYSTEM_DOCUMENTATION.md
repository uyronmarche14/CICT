# CICT System Documentation

Last updated: 2026-05-24
Source of truth: current codebase inspection of `/home/ronmarche14/projects/CICT/apps/backend`, `/home/ronmarche14/projects/CICT/apps/web`, `/home/ronmarche14/projects/CICT/apps/mobile`, and `/home/ronmarche14/projects/CICT/packages`

New developers should start with `docs/DEVELOPER_GUIDE.md`. For admin form dropdowns, reference data, enums, and backend validation rules, use `docs/LOOKUP_PROTOCOL.md`. This file remains the deeper system status and reference document after onboarding.

## 1. Document Purpose

This document explains the current CICT system as it exists in the repository today.

It is intended to:

- document the public-facing features
- document the admin-facing features
- explain the backend modules and data model
- list what is already working
- identify what is partial, unfinished, placeholder, or mismatched
- serve as a project-status reference for future development

Important note:

- This system is not fully finished yet.
- Some features are complete and usable.
- Some features exist in the UI but are only partially connected.
- Some features are planned by the code structure but do not yet have full end-to-end implementation.

---

## 2. System Overview

The CICT project is a pnpm workspace monorepo composed of:

- `apps/web`: a Next.js frontend for the public website and admin panel
- `apps/backend`: an Express + TypeScript backend API
- `apps/mobile`: an Expo student mobile app
- `packages/contracts`: shared TypeScript and Zod API contracts
- `packages/tsconfig`: shared TypeScript compiler defaults
- `packages/eslint-config`: shared ESLint flat configs
- MongoDB: the primary database
- Cloudinary: image hosting for uploaded media
- JWT cookie authentication: for admin login and protected API access

### High-Level Purpose

The system is designed to support:

- a public college/department website
- public news and event publishing
- public organization and member showcase pages
- an admin panel for managing content and organization data
- basic role- and permission-based access control

---

## 3. Technology Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- next-cloudinary

### Backend

- Express
- TypeScript
- Mongoose
- JWT
- bcryptjs
- multer
- Cloudinary SDK
- express-rate-limit
- helmet
- cors
- morgan
- winston

### Infrastructure / External Services

- MongoDB
- Cloudinary
- Render deployment config exists for backend
- Vercel-style frontend environment examples exist

---

## 4. Current Project Scope Summary

### Implemented Core Modules

- [x] admin authentication
- [x] user management
- [x] role storage and permission checks
- [x] news management
- [x] announcement management
- [x] event management
- [x] organization management
- [x] organization member management
- [x] public news pages
- [x] public event pages
- [x] public organization pages
- [x] public member profile pages
- [x] image upload through Cloudinary
- [x] activity logging model and logging middleware

### Partial or Incomplete Modules

- [ ] fully functional role creation/edit UI
- [ ] fully functional user edit UI
- [ ] public announcement detail flow
- [ ] public audit log module
- [ ] refresh-token flow
- [ ] full organization CMS fields in admin
- [ ] full member profile CMS fields in admin
- [ ] public pages for all navigation items
- [ ] consistent semi-admin frontend access

---

## 5. Public User Features

This section describes the user-facing website features available to regular visitors.

## 5.1 Global Website Structure

The public site includes navigation links for:

- Home
- About
- Academics
- Events
- Admissions
- News
- Student Life
- Contact

### Current status

- `Home` is implemented
- `Events` is implemented
- `News` is implemented
- `Contact` is partially implemented
- `About` is currently a placeholder
- `Academics` is currently a placeholder
- `Admissions` is currently a placeholder
- `Student Life` is currently a placeholder

### Global UI behavior

- responsive navigation bar
- mobile menu
- theme toggle
- animated/modern landing presentation

---

## 5.2 Home Page

The home page renders a landing page experience composed of several lazy-loaded sections.

### Current sections

- Hero section
- CICT section
- Story section
- News section
- FAQ section
- Testimonial section
- CTA section
- organization showcase content embedded through the landing/story area

### What this page is for

- introduce CICT visually
- highlight brand/message
- surface selected content
- guide users deeper into the system

---

## 5.3 News Module for Public Users

Public users can browse published news content.

### Available user functions

- [x] view news listing page
- [x] paginate through news articles
- [x] view individual news article pages
- [x] see article title, image, author, date, excerpt, content, and tags
- [x] use native sharing or copy-link fallback
- [x] view related articles section

### News listing behavior

- loads published news from backend
- supports pagination
- shows featured image when available
- shows author name if populated
- shows article tags

### News detail behavior

- loads one article by ID
- protects unpublished content from public access at the backend layer
- renders content as paragraphs split from the stored text

### Current limitations

- there is no rich article editor on the public side
- no public search UI for news even though backend supports text search
- no category archive or tag-filter page

---

## 5.4 Events Module for Public Users

Public users can browse and view event details.

### Available user functions

- [x] view published event listing page
- [x] view detailed event page
- [x] see event title, image, status, excerpt, schedule, location, organizer, tags, and attendee count
- [x] join an event if authenticated
- [x] leave an event if already joined
- [x] see event full / ended state

### Event listing behavior

- loads published events
- displays cards for available events
- shows empty state if there are no current events

### Event detail behavior

- loads an event by ID
- shows event metadata and description
- join/leave button updates attendee status
- checks for:
  - authentication
  - event capacity
  - past-event state

### Authentication behavior on join

- if the user is not authenticated, clicking join redirects to `/admin/login`

### Current limitations

- there is no separate public member/student login area
- joining uses admin-authenticated session mechanics
- there is no waitlist, RSVP approval, or registration form
- there is no event search/filter UI on the public page

---

## 5.5 Organizations Module for Public Users

The system includes public detail pages for organizations.

### Available user functions

- [x] view organization detail page by organization slug
- [x] view hero/banner and logo
- [x] view description
- [x] view mission and vision
- [x] view achievements
- [x] view team/member list

### Organization content shown publicly

- basic identity
- name and full name
- banner and logo
- mission
- vision
- achievements
- team members
- organization colors

### Important implementation note

Some organization content on the public page still uses static fallback data because the API does not yet provide all presentation content needed for the design.

This includes fallback/static support for:

- programs
- events
- benefits
- join information
- some presentation copy

### Current limitations

- there is no public `/organizations` index route in the main app navigation
- some organization sections are intentionally skipped or backed by static data
- the public organization page is only partially CMS-driven

---

## 5.6 Member Profile Pages

The system supports public detail pages for individual organization members.

### Available user functions

- [x] open a member profile page by member ID
- [x] view profile photo
- [x] view member name and position
- [x] view bio
- [x] view joined date / tenure
- [x] view social links
- [x] view skills
- [x] view responsibilities
- [x] view achievements
- [x] support for timeline and gallery display in the page structure

### Data source behavior

- the page loads all organizations
- it searches across all organization member lists
- it finds the matching member ID

### Current limitations

- member discovery is indirect because the page resolves members by scanning organizations
- admin editing currently only supports a smaller subset of member fields than the public profile design can display

---

## 5.7 Contact Page

### Current status

- partially implemented

### Current behavior

- renders a CTA/contact section
- acts more like a prompt-to-contact section than a full contact management feature

### Missing for a full contact module

- [ ] contact form submission
- [ ] inquiry storage
- [ ] email delivery integration
- [ ] admin inbox / contact management

---

## 5.8 Placeholder Public Pages

The following pages currently use a "Coming Soon" style placeholder:

- About
- Academics
- Admissions
- Student Life

This means:

- route exists
- page is intentional
- content is not yet fully built

---

## 6. Admin Features

The system includes an admin area under `/admin`.

## 6.1 Admin Authentication

### Available admin functions

- [x] admin login
- [x] admin logout
- [x] profile fetch on session restore
- [x] password update endpoint in backend

### Authentication design

- backend issues JWT in an HTTP-only cookie named `token`
- frontend uses `withCredentials: true`
- protected routes check the current cookie/session by calling `/auth/profile`

### Seeded development admin account

The seed script creates a default admin account if it does not exist:

- email: `admin@cict.edu`
- password: `Admin@123456`

Important:

- this is a development/bootstrap credential
- it should be changed immediately in any real environment

### Current limitations

- no public user/member authentication flow separate from admin
- no visible admin password-change UI in the current frontend, even though backend endpoint exists
- no refresh-token endpoint is implemented even though frontend includes refresh-related code

---

## 6.2 Admin Dashboard

### Available admin functions

- [x] view basic system summary counts

### Current dashboard metrics

- total users
- total news
- total announcements
- total roles

### Current limitations

- dashboard is summary-only
- no charts or analytics
- no recent activity feed
- no audit log screen
- no system health or content workflow widgets

---

## 6.3 User Management

### Available admin functions

- [x] list users
- [x] paginate users
- [x] search users
- [x] create new user
- [x] delete user
- [x] view role and active status

### User creation fields

- first name
- last name
- email
- password
- role

### Supported roles in create form

- Full Admin
- Semi Admin
- Support

### Backend user-management capabilities

- get all users
- get single user
- update user
- delete user
- assign role / custom role

### Current limitations

- [ ] edit action is shown in UI but not implemented
- [ ] custom role assignment UI is not implemented
- [ ] active/inactive toggle UI is not implemented
- [ ] no user detail page

---

## 6.4 Roles and Permissions Management

### Available admin functions

- [x] list roles
- [x] delete non-system roles
- [x] view role type and permission count

### Backend role-management capabilities

- create role
- get all roles
- get role by ID
- update role
- delete role

### Role model supports

- custom role name
- description
- permission array
- system-role protection
- createdBy tracking

### Current limitations

- [ ] create role button exists but no create-role form is wired
- [ ] edit action is shown in UI but not implemented
- [ ] no dedicated permission assignment UI
- [ ] no role detail page

---

## 6.5 News Management

### Available admin functions

- [x] list news
- [x] search news
- [x] paginate news
- [x] create news article
- [x] edit news article
- [x] delete news article
- [x] upload article image
- [x] set status in form
- [x] set tags

### News form fields

- title
- excerpt
- content
- status
- tags
- featured image

### Backend news capabilities

- create
- list
- get by ID
- update
- delete
- publish endpoint
- archive endpoint

### Current limitations

- [ ] no separate publish/archive controls in admin table UI
- [ ] no WYSIWYG editor, only text/textarea-based editing
- [ ] no scheduling workflow

---

## 6.6 Announcement Management

### Available admin functions

- [x] list announcements
- [x] search announcements
- [x] paginate announcements
- [x] create announcement
- [x] edit announcement
- [x] delete announcement
- [x] upload announcement image
- [x] set priority
- [x] set status
- [x] set target audience
- [x] set expiration date

### Announcement form fields

- title
- content
- priority
- status
- target audience
- expiration date
- image

### Backend announcement capabilities

- create
- list
- get by ID
- update
- delete
- publish endpoint
- archive endpoint

### Current limitations

- [ ] no separate admin publish/archive action buttons
- [ ] no public announcement detail page
- [ ] no audience segmentation logic beyond stored labels

---

## 6.7 Event Management

### Available admin functions

- [x] list events
- [x] create event
- [x] edit event
- [x] delete event
- [x] upload event image
- [x] set status in form
- [x] set capacity
- [x] view attendee count

### Event form fields

- title
- description
- excerpt
- start date/time
- end date/time
- location
- max attendees
- status
- image

### Backend event capabilities

- create
- list
- get by ID
- update
- delete
- join event
- leave event

### Current limitations

- the create form allows selecting status, but the backend currently forces newly created events to `draft`
- there is no separate publish endpoint even though permission types mention event publishing
- no admin attendee-management UI
- no registration-open toggle UI
- no event analytics, attendance export, or check-in flow

---

## 6.8 Organization Management

### Available admin functions

- [x] list organizations
- [x] open organization management page
- [x] edit some organization details
- [x] upload logo
- [x] upload banner
- [x] manage organization members

### Editable organization fields in current admin form

- full name
- description
- mission
- vision
- logo
- banner

### Backend organization capabilities

- list organizations
- get one organization by slug
- update organization
- add member
- update member
- delete member
- upload image

### Current limitations

- [ ] no create-organization flow
- [ ] no delete-organization flow
- [ ] no admin editing for:
  - long description
  - values
  - achievements
  - established year
  - theme colors
  - name/slug management
  - programs / benefits / join info content

---

## 6.9 Organization Member Management

### Available admin functions

- [x] list members for an organization
- [x] add member
- [x] edit member
- [x] delete member
- [x] upload member photo

### Editable member fields in current admin form

- photo
- name
- position
- bio
- social email
- social LinkedIn
- social GitHub
- joined date

### Member profile fields supported by the data model but not fully editable in current admin form

- achievements
- responsibilities
- skills
- timeline
- gallery

### Current limitations

- the public member profile design is richer than the current admin editing form
- no dedicated timeline/gallery editor
- no validation workflow for richer member content

---

## 7. Roles and Permissions

The system uses a mixed role + permission model.

## 7.1 System Roles

### Built-in user roles

- `full_admin`
- `semi_admin`
- `support`

### Meaning

- `full_admin`: unrestricted access
- `semi_admin`: partial admin access
- `support`: view-focused support role

## 7.2 Permission Categories

The backend defines permissions for:

- news management
- announcement management
- member management
- event management
- role management
- system access

### Examples

- `create_news`
- `edit_news`
- `publish_news`
- `create_member`
- `manage_member_roles`
- `create_role`
- `view_logs`
- `manage_settings`

## 7.3 Default Role Access

### Full Admin

- has all permissions

### Semi Admin

- can manage news and announcements
- can view/edit members
- has limited admin capability

### Support

- mostly view-only permissions

## 7.4 Important Frontend Access Gap

There is a current mismatch in admin access behavior:

- the login page accepts `semi_admin`
- the backend permission system supports `semi_admin`
- but the admin layout only fully allows `full_admin` style access in its current route guard

This means semi-admin users are not consistently supported in the current frontend experience.

---

## 8. Backend API Modules

This section summarizes the current backend functional surface.

## 8.1 Authentication API

### Implemented endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PUT /api/auth/password`

### Notes

- registration is admin-protected
- login sets JWT cookie
- logout clears JWT cookie

---

## 8.2 Users API

### Implemented endpoints

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `PATCH /api/users/:id/role`

### Features

- pagination
- text search
- filter by role
- filter by active status

---

## 8.3 Roles API

### Implemented endpoints

- `POST /api/roles`
- `GET /api/roles`
- `GET /api/roles/:id`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`

### Features

- custom role definitions
- system-role delete/update protection

---

## 8.4 News API

### Implemented endpoints

- `POST /api/news`
- `GET /api/news`
- `GET /api/news/:id`
- `PUT /api/news/:id`
- `DELETE /api/news/:id`
- `PATCH /api/news/:id/publish`
- `PATCH /api/news/:id/archive`

### Features

- public published-only behavior
- admin/all-content access when authenticated
- pagination
- search
- image upload

---

## 8.5 Announcements API

### Implemented endpoints

- `POST /api/announcements`
- `GET /api/announcements`
- `GET /api/announcements/:id`
- `PUT /api/announcements/:id`
- `DELETE /api/announcements/:id`
- `PATCH /api/announcements/:id/publish`
- `PATCH /api/announcements/:id/archive`

### Features

- pagination
- search
- priority filtering
- image upload

### Important note

The announcement routes are currently protected by authentication and permission checks. This conflicts with the existence of a public-style announcement carousel in the frontend.

---

## 8.6 Events API

### Implemented endpoints

- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/join`
- `POST /api/events/:id/leave`

### Features

- public published-only view when unauthenticated
- authenticated broader access
- pagination
- search
- upcoming filter
- join/leave registration logic
- attendee caps

---

## 8.7 Organizations API

### Implemented endpoints

- `GET /api/organizations`
- `GET /api/organizations/:id`
- `PUT /api/organizations/:id`
- `POST /api/organizations/upload`
- `POST /api/organizations/:id/members`
- `PUT /api/organizations/:orgId/members/:memberId`
- `DELETE /api/organizations/:orgId/members/:memberId`

### Features

- public read access
- protected admin edit access
- nested member management

---

## 8.8 Missing or Unused API Areas

The frontend suggests or references modules that are not fully backed by current routes.

### Missing / incomplete API coverage

- [ ] refresh-token endpoint
- [ ] audit log API routes
- [ ] public announcement detail route
- [ ] dedicated event publish endpoint

---

## 9. Data Model Summary

## 9.1 User

### Core fields

- email
- password
- firstName
- lastName
- role
- customRole
- isActive
- lastLogin

### Capabilities

- password hashing
- password comparison
- password exclusion from JSON output

## 9.2 Role

### Core fields

- name
- description
- permissions
- isSystemRole
- createdBy

## 9.3 News

### Core fields

- title
- content
- excerpt
- author
- status
- publishedAt
- archivedAt
- tags
- imageUrl
- imageId

## 9.4 Announcement

### Core fields

- title
- content
- author
- priority
- type
- status
- isActive
- targetAudience
- expiresAt
- imageUrl
- imageId

## 9.5 Event

### Core fields

- title
- description
- excerpt
- organizer
- startDate
- endDate
- location
- status
- attendees
- maxAttendees
- imageUrl
- imageId
- tags
- isRegistrationOpen

## 9.6 Organization

### Core fields

- id / slug
- name
- fullName
- description
- longDescription
- logo
- banner
- established
- mission
- vision
- values
- achievements
- members
- color

## 9.7 Organization Member

### Supported fields in the model

- id
- name
- position
- photo
- bio
- joinedDate
- achievements
- responsibilities
- skills
- timeline
- gallery
- social links

## 9.8 Activity Log

### Stored fields

- user
- action
- resource
- resourceId
- details
- ipAddress
- userAgent
- createdAt

### Current behavior

- successful protected actions can be logged through middleware
- logs have a TTL expiration of 90 days

### Current limitation

- there is no completed frontend/admin audit-log screen
- there are no exposed backend audit routes yet

---

## 10. Media Upload and File Handling

The system uses Cloudinary for image uploads.

### Current upload use cases

- news images
- announcement images
- event images
- organization logo/banner
- member photos

### Upload behavior

- images are uploaded in memory through `multer`
- uploaded to Cloudinary
- returned image URL and public ID are stored on records

### Current constraints

- 5 MB file size limit
- image files only

---

## 11. Environment Configuration

## 11.1 Backend Required Variables

### Required

- `MONGODB_URI`
- `JWT_SECRET`

### Used by backend if available

- `PORT`
- `NODE_ENV`
- `JWT_EXPIRE`
- `BCRYPT_ROUNDS`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `LOG_LEVEL`
- `LOG_TO_FILES`
- `ALLOW_VERCEL_PREVIEWS`

## 11.2 Frontend Environment Examples

### Current example variables

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_AUTH_COOKIE_NAME`

---

## 12. Seeded / Bootstrap Data

The backend seed script currently supports:

- default admin user
- system roles
- sample news
- sample announcements
- sample organizations

### Seeded system roles

- Content Manager
- Member Manager
- Viewer

### Seeded content purpose

- make the system usable for local development
- provide initial records for testing
- bootstrap organization pages quickly

---

## 13. Current Known Gaps and Unfinished Areas

This is the most important status section for project planning.

## 13.1 Public-Side Gaps

- [ ] About page content is not implemented
- [ ] Academics page content is not implemented
- [ ] Admissions page content is not implemented
- [ ] Student Life page content is not implemented
- [ ] Contact page is not a full contact feature
- [ ] no public organization index page in main navigation
- [ ] no full CMS-driven organization content for programs/events/benefits/join info
- [ ] no public announcement detail page

## 13.2 Admin-Side Gaps

- [ ] role create/edit UI is not finished
- [ ] user edit UI is not finished
- [ ] no visible password-change UI
- [ ] no audit log screen
- [ ] no system settings screen
- [ ] no organization create/delete flow
- [ ] no advanced member field editor
- [ ] no advanced organization field editor

## 13.3 Frontend/Backend Mismatches

- [ ] announcement carousel appears designed for public use, but announcements API is protected
- [ ] announcement carousel links to `/dashboard/announcements/:id`, but that route is not present in the inspected app structure
- [ ] frontend has audit API helpers, but backend audit routes were not found
- [ ] frontend has refresh-token helper, but backend refresh-token route was not found
- [ ] event create form accepts status, but backend currently creates events as `draft` regardless
- [ ] semi-admin is accepted by login logic but not consistently allowed by admin layout guard

## 13.4 Data-Editing Gaps

- [ ] public member profile supports richer fields than the admin form currently edits
- [ ] organization public view uses static fallback data because backend model/API is not yet the complete source for all sections

---

## 14. Recommended Documentation Checklist for Team Use

Use this as a maintenance checklist for the system.

### Core platform

- [x] public website exists
- [x] admin panel exists
- [x] backend API exists
- [x] MongoDB data models exist
- [x] Cloudinary upload support exists

### Authentication

- [x] login
- [x] logout
- [x] profile fetch
- [x] password update endpoint
- [ ] refresh token flow
- [ ] public/member authentication flow

### Users and roles

- [x] create user
- [x] list users
- [x] delete user
- [x] list roles
- [x] delete non-system role
- [ ] edit user UI
- [ ] create role UI
- [ ] edit role UI
- [ ] assign custom role UI

### Content management

- [x] news CRUD
- [x] announcements CRUD
- [x] events CRUD
- [x] image upload for content
- [ ] content scheduling
- [ ] moderation workflow

### Public content

- [x] news listing/detail
- [x] events listing/detail
- [x] join/leave event
- [x] organization detail
- [x] member detail
- [ ] public announcements module completed end to end
- [ ] full public informational pages completed

### Organization CMS

- [x] edit basic org details
- [x] add/edit/delete members
- [x] upload org and member images
- [ ] edit long description
- [ ] edit values
- [ ] edit achievements
- [ ] edit colors
- [ ] edit join/program/event showcase data
- [ ] edit full member profile content

### Operations and monitoring

- [x] activity log model
- [x] activity logging middleware
- [ ] audit log API
- [ ] audit log admin page
- [ ] system settings UI

---

## 15. Suggested Next Development Priorities

If the goal is to turn this into a more complete production-ready system, the highest-value next steps are:

1. Finish the role/user administration workflows.
2. Resolve frontend/backend mismatches around announcements, audit logs, refresh tokens, and semi-admin access.
3. Complete the public informational pages.
4. Expand organization and member CMS editing to match the richness of the public pages.
5. Add a proper public or member authentication flow if event joining is meant for non-admin users.
6. Add audit log browsing and operational tooling for admins.

---

## 16. Final Status Summary

The CICT system is already a strong functional foundation with:

- a modern public-facing frontend
- a protected admin panel
- MongoDB-backed content and organization management
- role-aware backend authorization
- media upload support
- public news, events, organization, and member pages

However, it is still in an in-progress stage rather than a fully finished production system.

The biggest signs of that are:

- placeholder public pages
- partial admin screens
- a few frontend/backend feature mismatches
- incomplete role and audit tooling
- partial CMS coverage for organization/member content

In short:

- the system already works as a real content-and-organization platform
- but several modules still need completion before it can be considered fully polished and fully consistent end to end
