# CICT Website System Requirements

## 1. Functional Requirements

## Authentication

The system must allow admins to:

- login,
- logout,
- maintain a protected session,
- retrieve profile information.

---

## Dashboard

The system must allow admins to:

- view total users,
- view total news,
- view total announcements,
- view total roles.

---

## User Management

The system must allow authorized admins to:

- create users,
- view users,
- search users,
- paginate users,
- delete users,
- assign roles.

---

## Role and Permission Management

The system must:

- define admin roles,
- protect routes by permission,
- allow role listing,
- support custom roles in the data layer,
- prevent unauthorized actions.

---

## News Management

The system must allow authorized admins to:

- create news,
- edit news,
- delete news,
- upload image,
- add tags,
- set status.

The public site must allow users to:

- browse published news,
- open individual news articles.

---

## Announcement Management

The system must allow authorized admins to:

- create announcements,
- edit announcements,
- delete announcements,
- set priority,
- set target audience,
- set expiration date,
- upload image,
- set status.

---

## Event Management

The system must allow authorized admins to:

- create events,
- edit events,
- delete events,
- upload image,
- set location,
- set date and time,
- set attendee limit,
- set event status.

The public side must allow users to:

- browse events,
- view event details,
- join an event,
- leave an event.

---

## Organization Management

The system must allow authorized admins to:

- view organizations,
- update organization details,
- upload banner,
- upload logo.

The public side must allow users to:

- view organization pages,
- view organization mission and vision,
- view achievements,
- view member listings.

---

## Member Management

The system must allow authorized admins to:

- add members,
- edit members,
- delete members,
- upload member photo.

The public side must allow users to:

- open member detail pages,
- view member profile information.

---

## Media Management

The system must:

- validate image uploads,
- store uploaded images,
- link stored media to content records.

---

## 2. Non-Functional Requirements

The system should be:

- responsive on desktop and mobile,
- fast enough for public browsing,
- secure for admin access,
- maintainable for future updates,
- modular for future feature expansion,
- readable for non-technical content managers.

---

## 3. Security Requirements

The system must:

- protect admin routes,
- validate user sessions,
- restrict actions by role,
- protect content management APIs,
- validate uploaded files,
- prevent unauthorized content editing.

---

## 4. Content Requirements

The system should support:

- text content,
- image content,
- status-based content visibility,
- structured event and organization data,
- publishable and editable records.

---

## 5. Future Requirements

Later versions should support:

- more complete informational pages,
- stronger role management UI,
- audit and activity review,
- advanced member profiles,
- richer organization content,
- fuller contact workflow,
- more complete analytics and reporting.

