# CICT Website Data Management

## 1. Data Management Concept

The CICT platform does not only display pages. It stores structured content records that the admin panel can manage.

This allows the platform to behave like a content management system rather than a purely static website.

The platform manages:

- users,
- roles,
- news,
- announcements,
- events,
- organizations,
- members,
- activity logs,
- and media references.

---

# 2. Core Content Records

## News Records

News records store full article-style content.

Useful fields:

- title
- excerpt
- content
- tags
- author
- image
- status
- publish date

## Announcement Records

Announcement records store shorter official notices.

Useful fields:

- title
- content
- priority
- audience
- expiration
- author
- image
- status

## Event Records

Event records store structured event information.

Useful fields:

- title
- excerpt
- description
- start date
- end date
- location
- organizer
- image
- attendee list
- attendee limit
- tags
- status

## Organization Records

Organization records store organization identity and showcase information.

Useful fields:

- name
- full name
- description
- long description
- mission
- vision
- banner
- logo
- achievements
- values
- members
- color theme

## Member Records

Member records store public profile data for members or officers.

Useful fields:

- name
- position
- bio
- photo
- joined date
- achievements
- responsibilities
- skills
- timeline
- gallery
- social links

---

# 3. Status Management

Statuses help control content visibility and workflow.

## News Statuses

- Draft
- Published
- Archived

## Announcement Statuses

- Draft
- Published
- Archived

## Event Statuses

- Draft
- Published
- Cancelled
- Completed

## Rules

- Draft content is not public
- Published content is visible publicly
- Archived content is hidden from active public use
- Cancelled and completed events are managed differently from draft/published content

---

# 4. Public Visibility Rules

The platform should show only the correct public content.

## Public users should see

- published news
- published events
- public organization pages
- public member pages

## Public users should not see

- draft content
- archived admin-only records
- internal notes
- protected admin data

---

# 5. User and Role Data

The system stores user records for admin access.

Useful user fields:

- email
- password
- first name
- last name
- role
- custom role
- active status
- last login

Role data controls what actions users can perform.

---

# 6. Activity and Audit Data

The system includes activity logging support.

Useful activity fields:

- user
- action
- resource
- resource ID
- request details
- IP address
- user agent
- created date

This supports accountability and future audit features.

---

# 7. Media Data

Uploaded media is stored separately and referenced by content records.

Useful media references:

- image URL
- image ID

This allows:

- reusable content images
- organization banners
- member photos
- event images
- announcement images

---

# 8. Data Management Direction

The current system already stores structured content, but future improvements should make content management richer and more complete.

This includes:

- richer organization editing,
- richer member profile editing,
- stronger audit visibility,
- and more complete public page content management.

