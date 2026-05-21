# CICT System Presentation Documentation

Last updated: 2026-05-16

## 1. Purpose of This Document

This document explains the CICT system in simple and presentation-friendly language.

It is meant for:

- panel members
- advisers
- classmates
- stakeholders
- non-technical readers

This version focuses on:

- what the system is
- what sections it has
- what each section is for
- what content can be placed in each section
- who is allowed to manage or post content
- what is already implemented
- what is not yet finished
- what is still being improved

Important note:

- the system is already working in many major areas
- the system is not yet fully final
- some designs and functions are complete enough to use
- some areas are still being polished, expanded, or finished

---

## 2. What the CICT System Is

The CICT system is a web-based platform for the College of Information and Communication Technology.

It has two major purposes:

- to serve as a public website for students and visitors
- to serve as an admin management system for authorized users

In simple terms, it helps the department:

- publish news
- post announcements
- post and manage events
- showcase organizations
- showcase members and officers
- manage admin users
- control access through roles and permissions

---

## 3. Current Overall Status

The best way to describe the project right now is:

- a working system
- already useful
- not yet fully final
- still under improvement

### Current status summary

- [x] many important modules are already implemented
- [x] the public website already has working content pages
- [x] the admin side already has working management features
- [x] content can already be created and updated in several areas
- [ ] some pages are still placeholders
- [ ] some admin tools are still partial
- [ ] some design areas are still being polished
- [ ] some workflows are still being aligned between frontend and backend

---

## 4. Main Parts of the System

The system has two main sides.

## 4.1 Public Side

This is the part seen by:

- students
- visitors
- faculty
- anyone browsing the website

Its purpose is to:

- present information about CICT
- show updates and activities
- highlight organizations
- display members and officers
- promote engagement through events and announcements

## 4.2 Admin Side

This is the protected side for authorized users.

Its purpose is to:

- manage content
- manage users
- manage events
- manage announcements
- manage organizations
- manage members
- control who can access and edit the system

---

## 5. User Roles and Who Can Manage What

The system currently uses roles to control what users can do.

## 5.1 Main Roles in the System

### Full Admin

This is the highest access level.

A Full Admin can generally:

- manage users
- manage roles
- manage news
- manage announcements
- manage events
- manage organizations
- manage members
- delete and edit most content
- publish and archive content

### Semi Admin

This is a limited admin role.

A Semi Admin can currently manage some important content, mainly:

- news
- announcements
- some member-related functions
- some organization-related functions

Important note:

- the backend already supports Semi Admin permissions
- the frontend access experience for Semi Admin is still being polished
- this means the role exists and is partly supported, but not yet perfectly finalized in the user interface

### Support

This is a lower-level role.

Support users are mostly limited to viewing information and have very limited management ability by default.

---

## 5.2 Simple Role Summary

### Who can post news

- Full Admin
- Semi Admin

### Who can post announcements

- Full Admin
- Semi Admin

### Who can post events

- Full Admin by default

### Who can create new admin users

- Full Admin by default

### Who can create new roles

- Full Admin by default

### Who can edit organization details

- Full Admin
- Semi Admin

### Who can add organization members

- Full Admin by default

### Who can edit organization members

- Full Admin
- Semi Admin

### Who can delete organization members

- Full Admin by default

### Who can mostly only view

- Support

---

## 5.3 Important Role Note for Presentation

If this needs to be explained simply:

Full Admin has the highest control.

Semi Admin can help manage content but still has limited access.

Support is mostly for viewing and assisting rather than posting or changing major content.

Also, role behavior is still being improved so that access in the system becomes more consistent and polished.

---

## 6. Public Website Sections and Their Functions

This section explains each major public section in simple terms.

## 6.1 Home Page

### Purpose

The Home page introduces CICT and gives visitors a first impression of the website.

### Current implemented sections

- Hero section
- CICT introduction section
- Story section
- News highlight section
- FAQ section
- Testimonial section
- call-to-action section

### What this section can show

- main headline or welcome message
- identity of CICT
- important highlights
- selected latest news
- questions and answers
- invitation to explore more of the website

### Current status

- [x] implemented
- [ ] still being polished visually and content-wise as the project grows

---

## 6.2 News Section

### Purpose

The News section is for publishing updates, stories, achievements, and important happenings related to CICT.

### What content a news post can contain

- title
- short summary or excerpt
- full article content
- featured image
- tags or topic labels
- publish status
- author information
- publication date

### Examples of possible news content

- department achievements
- student competition wins
- seminar coverage
- hackathon updates
- academic recognitions
- project showcases
- new programs or initiatives
- faculty achievements

### Public user functions

- browse the list of news articles
- open a full article
- view image, author, date, and tags
- view related articles

### Admin functions

- create news
- edit news
- delete news
- upload news image
- assign tags
- set article status

### Who is allowed to post or manage it

- Full Admin
- Semi Admin

### Current status

- [x] implemented and usable
- [ ] can still be improved with richer editing and more polished content workflows

---

## 6.3 Announcements Section

### Purpose

The Announcements section is for quick official notices, reminders, and urgent information.

### What content an announcement can contain

- title
- announcement message or content
- priority level
- status
- target audience
- expiration date
- optional image
- author information

### Examples of possible announcement content

- class suspensions
- deadlines
- event reminders
- exam schedules
- maintenance notices
- urgent department reminders
- general school notices

### Admin functions

- create announcement
- edit announcement
- delete announcement
- upload image
- set priority
- set target audience
- set expiration date
- set status

### Who is allowed to post or manage it

- Full Admin
- Semi Admin

### Public status

- announcements exist in the system
- public announcement presentation is still not yet fully finalized end to end

### Current status

- [x] admin-side management is implemented
- [ ] public-side announcement experience is still being improved

---

## 6.4 Events Section

### Purpose

The Events section is for managing and presenting activities, seminars, gatherings, and programs.

### What content an event can contain

- title
- short summary or excerpt
- full description
- date and time
- location
- event image
- status
- organizer information
- attendee count
- maximum attendee limit
- tags

### Examples of possible event content

- seminars
- workshops
- competitions
- orientation programs
- organization activities
- academic events
- student gatherings

### Public user functions

- view event list
- open event details
- see time, date, location, and organizer
- join an event
- leave an event
- see if the event is full or already ended

### Admin functions

- create event
- edit event
- delete event
- upload event image
- set date and time
- set location
- set event capacity
- manage event content details

### Who is allowed to post or manage it

- Full Admin by default

Important note:

- event access is stricter than news and announcements
- this part may still expand later depending on future permission setup

### Current status

- [x] implemented and functional
- [ ] still being improved in workflow consistency and role coverage

---

## 6.5 Organizations Section

### Purpose

The Organizations section introduces student organizations and presents their identity and role inside CICT.

### What an organization page can contain

- organization name
- full name
- logo
- banner
- short description
- mission
- vision
- achievements
- members
- visual theme or colors

### Examples of what this section is for

- presenting organization identity
- showing what the organization stands for
- showing its officers and members
- highlighting achievements and impact

### Public user functions

- view organization profile
- view organization mission and vision
- view officers and members
- view organization achievements

### Admin functions

- view organizations
- open a management page for an organization
- edit basic organization details
- upload banner
- upload logo

### Who is allowed to manage it

- Full Admin
- Semi Admin

### Current status

- [x] implemented
- [ ] not yet a full complete content management system
- [ ] still being improved with richer editable content

---

## 6.6 Member Profile Section

### Purpose

This section highlights officers or members from organizations.

It gives a more human and professional presentation of the people behind the organizations.

### What a member profile can contain

- member photo
- name
- position
- bio
- joined date
- social links
- achievements
- responsibilities
- skills
- timeline
- gallery

### Public user functions

- open a member profile
- view the person’s role and background
- view their social links
- view achievements and profile details

### Admin functions currently available

- add member
- edit member
- delete member
- upload member photo

### Who is allowed to manage it

- adding members: Full Admin by default
- editing members: Full Admin and Semi Admin
- deleting members: Full Admin by default

### Current status

- [x] public member pages are implemented
- [x] basic member management is implemented
- [ ] advanced member profile editing is still incomplete

Important note:

- the public profile design can show richer information than the current admin editor can fully manage
- this means the feature is already strong visually, but the editing tools are still catching up

---

## 6.7 Contact Section

### Purpose

The Contact section is meant to help visitors know how to reach CICT or take the next step.

### Current content role

- call to action
- invitation to connect
- presentation area for contact-related messaging

### What is not yet fully built

- working contact submission form
- inquiry storage
- email delivery workflow
- admin inbox for messages

### Current status

- [x] partially present
- [ ] not yet a full working contact system

---

## 6.8 Placeholder Academic and Informational Pages

The following pages already exist as routes, but they are still placeholders:

- About
- Academics
- Admissions
- Student Life

### Meaning

These pages are part of the planned system structure, but their final content and design are still being completed.

### Current status

- [x] route exists
- [ ] final content not yet complete

---

## 7. Admin System Sections and Their Functions

This section explains each major admin area.

## 7.1 Admin Login

### Purpose

This protects the admin side so that only authorized users can manage the system.

### What it does

- signs in authorized users
- protects admin pages
- allows admins to access management tools

### Current status

- [x] implemented

---

## 7.2 Admin Dashboard

### Purpose

The dashboard gives a quick overview of the system.

### What it currently shows

- user count
- news count
- announcement count
- role count

### Current status

- [x] implemented
- [ ] still simple and can be improved with richer analytics

---

## 7.3 User Management

### Purpose

This section manages the people who are allowed to access the admin system.

### What it currently allows

- view users
- search users
- create users
- delete users

### What user information is currently managed

- first name
- last name
- email
- password
- role
- active status display

### Who can manage this section

- Full Admin by default

### Current status

- [x] basic user management is implemented
- [ ] full editing is still incomplete

---

## 7.4 Role and Permission Management

### Purpose

This section controls what different types of users are allowed to do in the system.

### What it currently allows

- view roles
- see how many permissions a role has
- delete non-system roles

### What it is meant to support

- creating roles
- customizing permissions
- assigning access properly

### Who can manage this section

- Full Admin by default

### Current status

- [x] foundation is implemented
- [ ] management interface is still incomplete

---

## 7.5 News Management

### Purpose

This section is where admins create and maintain public news content.

### What admins can do

- create news
- edit news
- delete news
- upload an image
- add tags
- choose a status such as draft or published

### What kind of content belongs here

- official updates
- achievement stories
- competition highlights
- department announcements written as articles
- student and faculty features

### Who can manage this section

- Full Admin
- Semi Admin

### Current status

- [x] implemented
- [ ] still open for better editing experience and workflow improvement

---

## 7.6 Announcement Management

### Purpose

This section is for shorter, more direct notices compared to full news articles.

### What admins can do

- create announcements
- edit announcements
- delete announcements
- set audience
- set priority
- set expiration
- upload image

### What kind of content belongs here

- reminders
- urgent notices
- schedules
- operational advisories
- quick school or department updates

### Who can manage this section

- Full Admin
- Semi Admin

### Current status

- [x] implemented on the admin side
- [ ] still being improved for complete public presentation

---

## 7.7 Event Management

### Purpose

This section is for organizing and publishing events.

### What admins can do

- create event
- edit event
- delete event
- upload event image
- set time and place
- set capacity

### What kind of content belongs here

- student activities
- departmental events
- academic seminars
- workshops
- contests
- special programs

### Who can manage this section

- Full Admin by default

### Current status

- [x] implemented
- [ ] still being improved in role handling and content workflow

---

## 7.8 Organization Management

### Purpose

This section manages the official profile of each organization.

### What admins can currently edit

- organization full name
- description
- mission
- vision
- logo
- banner

### What this section is meant to support in the future

- richer organization profile editing
- more complete showcase information
- more complete visual customization

### Who can manage this section

- Full Admin
- Semi Admin

### Current status

- [x] basic organization management is implemented
- [ ] full organization content management is not yet complete

---

## 7.9 Member Management

### Purpose

This section manages the people shown inside organization pages.

### What admins can currently edit

- member photo
- name
- position
- bio
- social links
- joined date

### What this section is expected to grow into

- full officer profile management
- better showcase of achievements
- richer member history and timeline content

### Who can manage this section

- adding members: Full Admin by default
- editing members: Full Admin and Semi Admin
- deleting members: Full Admin by default

### Current status

- [x] basic member management is implemented
- [ ] richer profile management is still being improved

---

## 8. What Is Fully or Mostly Working Right Now

The following areas are already working well enough to demonstrate or use:

- [x] public home page
- [x] public news browsing
- [x] public event browsing
- [x] event detail and join/leave flow
- [x] organization pages
- [x] member pages
- [x] admin login
- [x] user listing and creation
- [x] news management
- [x] announcement management
- [x] event management
- [x] organization management
- [x] member management

This means the system already has real usable value and is not only a prototype idea.

---

## 9. What Is Not Yet Finished

This section should be stated clearly in a presentation so expectations stay realistic.

## 9.1 Pages Not Yet Final

- [ ] About page
- [ ] Academics page
- [ ] Admissions page
- [ ] Student Life page

## 9.2 Admin Tools Not Yet Final

- [ ] full user editing flow
- [ ] full role creation and editing flow
- [ ] advanced organization editing
- [ ] advanced member-profile editing
- [ ] full audit and monitoring view

## 9.3 Workflow Areas Not Yet Final

- [ ] fully polished public announcements experience
- [ ] complete consistency for Semi Admin access in the frontend
- [ ] full contact/inquiry workflow
- [ ] richer publishing and editing workflow for some modules

---

## 10. What Is Currently Being Improved

This is useful when explaining the future direction of the project.

### Ongoing or visible improvement areas

- [ ] better visual polish
- [ ] better content completeness
- [ ] richer admin editing tools
- [ ] more consistent access control behavior
- [ ] fuller informational pages
- [ ] stronger end-to-end system completeness

### Simple explanation

The system is already working, but the team is still improving:

- depth of content
- smoothness of admin workflows
- completeness of public pages
- consistency between all modules

---

## 11. Current Strengths of the Project

These are the strongest talking points for presentation.

### Major strengths

- [x] already has a working public website
- [x] already has a working admin panel
- [x] already supports content posting
- [x] already supports event posting and participation
- [x] already supports organization showcasing
- [x] already supports member showcasing
- [x] already has access-control structure
- [x] already supports image uploading

### Presentation-friendly interpretation

The project already demonstrates real functionality, not just interface design.

It already shows:

- practical usefulness
- system structure
- content management capability
- multi-module integration

---

## 12. Current Limitations

These are the most honest and important limitations to mention.

### Main limitations

- [ ] some pages are still placeholder pages
- [ ] some admin tools are still partial
- [ ] some content models are richer than the current editor forms
- [ ] some role flows still need polishing
- [ ] some public and admin experiences are not yet fully aligned

### Presentation-friendly interpretation

The project has already passed the basic stage, but it is still in the finishing and polishing stage rather than the final completed stage.

---

## 13. Best Overall Description of the System

If this needs to be explained in one clear paragraph during a presentation, this is the best summary:

The CICT system is a working web platform that already includes a public website and an admin management panel. It can already publish news, create announcements, manage events, display organizations, and showcase members. Authorized users can already manage content through the admin side, and the system already has role-based access control. However, some public pages, advanced editing tools, and some workflow details are still being completed and improved. Overall, the project already has a strong functional foundation, but it is not yet in its final polished version.

---

## 14. Quick Final Checklist

### Already implemented

- [x] public homepage
- [x] news module
- [x] announcements management
- [x] events module
- [x] organization pages
- [x] member pages
- [x] admin login
- [x] user management
- [x] role foundation
- [x] content posting tools

### Not yet fully finished

- [ ] full public informational pages
- [ ] full contact system
- [ ] full role management interface
- [ ] full user editing tools
- [ ] full organization CMS
- [ ] full member-profile CMS
- [ ] full audit/monitoring tools

### Still being improved

- [ ] design polish
- [ ] workflow consistency
- [ ] content completeness
- [ ] richer editing support
- [ ] stronger overall system completeness
****