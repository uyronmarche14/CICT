# CICT Frontend Application - Data Requirements Documentation

**Version:** 1.0  
**Last Updated:** December 8, 2025  
**Application:** CICT Website & Admin Portal

---

## Table of Contents
1. [User Management Data](#1-user-management-data)
2. [Authentication Data](#2-authentication-data)
3. [News Management Data](#3-news-management-data)
4. [Events Management Data](#4-events-management-data)
5. [Announcements Data](#5-announcements-data)
6. [Organizations Data](#6-organizations-data)
7. [Roles & Permissions Data](#7-roles--permissions-data)
8. [Activity Logs Data](#8-activity-logs-data)
9. [Media & Assets Data](#9-media--assets-data)
10. [Static Content Data](#10-static-content-data)

---

## 1. User Management Data

### User Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `_id` | String (MongoDB ObjectId) | Yes | Unique identifier for user | Auto-generated | "507f1f77bcf86cd799439011" |
| `email` | String | Yes | User's email address | Valid email format, unique | "admin@cict.edu" |
| `password` | String (Hashed) | Yes | User's encrypted password | Min 8 chars, hashed with bcrypt | "$2b$10$..." |
| `firstName` | String | Yes | User's first name | 2-50 characters | "John" |
| `lastName` | String | Yes | User's last name | 2-50 characters | "Doe" |
| `role` | Enum | Yes | User's system role | One of: full_admin, semi_admin, support | "full_admin" |
| `customRole` | String (ObjectId) | No | Reference to custom role | Valid role ID if assigned | "507f1f77bcf86cd799439012" |
| `isActive` | Boolean | Yes | Account active status | true or false | true |
| `lastLogin` | String (ISO Date) | No | Last login timestamp | ISO 8601 format | "2025-12-08T09:30:00Z" |
| `createdAt` | String (ISO Date) | Yes | Account creation timestamp | Auto-generated ISO 8601 | "2025-01-15T10:00:00Z" |
| `updatedAt` | String (ISO Date) | Yes | Last update timestamp | Auto-generated ISO 8601 | "2025-12-08T09:30:00Z" |

### User Roles

| Role Value | Display Name | Description | Access Level |
|------------|--------------|-------------|--------------|
| `full_admin` | Full Administrator | Complete system access | All permissions |
| `semi_admin` | Semi Administrator | Limited admin access | Selected permissions |
| `support` | Support Staff | Support-level access | View and basic operations |

---

## 2. Authentication Data

### Login Request

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `email` | String | Yes | User's email | Valid email format | "admin@cict.edu" |
| `password` | String | Yes | User's password | Min 8 characters | "Admin@123456" |

### Login Response

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `user` | Object | User profile data | See User Entity above |
| `accessToken` | String (JWT) | Short-lived access token | "eyJhbGciOiJIUzI1NiIs..." |
| `refreshToken` | String (JWT) | Long-lived refresh token | "eyJhbGciOiJIUzI1NiIs..." |

### Password Reset Request

| Field Name | Data Type | Required | Description | Example Value |
|------------|-----------|----------|-------------|---------------|
| `email` | String | Yes | User's registered email | "user@cict.edu" |

### Password Reset Confirmation

| Field Name | Data Type | Required | Description | Example Value |
|------------|-----------|----------|-------------|---------------|
| `token` | String | Yes | Reset token from email | "abc123xyz..." |
| `password` | String | Yes | New password | "NewPass@123" |

---

## 3. News Management Data

### News Article Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `_id` | String (ObjectId) | Yes | Unique article identifier | Auto-generated | "507f1f77bcf86cd799439013" |
| `title` | String | Yes | Article headline | 3-200 characters | "CICT Wins National Tech Award" |
| `content` | String (Rich Text) | Yes | Full article content | Min 10 characters, supports HTML | "\<p\>The College of ICT...\</p\>" |
| `excerpt` | String | Yes | Brief summary | 5-300 characters | "CICT recognized for excellence..." |
| `author` | String/Object | Yes | Article author | User ID or populated User object | "507f1f77bcf86cd799439011" |
| `status` | Enum | Yes | Publication status | draft, published, archived | "published" |
| `publishedAt` | String (ISO Date) | No | Publication timestamp | ISO 8601 format | "2025-12-08T10:00:00Z" |
| `archivedAt` | String (ISO Date) | No | Archive timestamp | ISO 8601 format | null |
| `tags` | Array\<String\> | No | Article tags/categories | Array of strings | ["technology", "awards"] |
| `imageUrl` | String (URL) | No | Featured image URL | Valid URL from Cloudinary | "https://res.cloudinary.com/..." |
| `imageId` | String | No | Cloudinary public ID | For deletion purposes | "cict/news/abc123" |
| `createdAt` | String (ISO Date) | Yes | Creation timestamp | Auto-generated | "2025-12-07T15:30:00Z" |
| `updatedAt` | String (ISO Date) | Yes | Last update timestamp | Auto-generated | "2025-12-08T09:00:00Z" |

### News Status Values

| Status Value | Display Name | Description | Visibility |
|--------------|--------------|-------------|------------|
| `draft` | Draft | Work in progress | Admin only |
| `published` | Published | Live on website | Public |
| `archived` | Archived | No longer active | Admin only |

---

## 4. Events Management Data

### Event Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `_id` | String (ObjectId) | Yes | Unique event identifier | Auto-generated | "507f1f77bcf86cd799439014" |
| `title` | String | Yes | Event name | 2-100 characters | "Tech Summit 2025" |
| `description` | String | Yes | Full event details | Min 10 characters | "Annual technology conference..." |
| `excerpt` | String | Yes | Brief summary | 10-200 characters | "Join us for the biggest tech event" |
| `organizer` | Object | Yes | Event organizer details | Populated User object | {_id, firstName, lastName, email} |
| `startDate` | String (ISO Date) | Yes | Event start date/time | Valid ISO 8601, before endDate | "2025-12-15T09:00:00Z" |
| `endDate` | String (ISO Date) | Yes | Event end date/time | Valid ISO 8601, after startDate | "2025-12-15T17:00:00Z" |
| `location` | String | Yes | Event venue | Min 2 characters | "Main Auditorium, CICT Building" |
| `status` | Enum | Yes | Event status | draft, published, cancelled, completed | "published" |
| `attendees` | Array\<String\> | Yes | List of attendee IDs | Array of User ObjectIds | ["507f...", "607f..."] |
| `maxAttendees` | Number | No | Maximum capacity | Integer ≥ 0, 0 = unlimited | 100 |
| `imageUrl` | String (URL) | No | Event banner image | Valid Cloudinary URL | "https://res.cloudinary.com/..." |
| `imageId` | String | No | Cloudinary public ID | For deletion | "cict/events/xyz789" |
| `tags` | Array\<String\> | No | Event categories | Array of strings | ["workshop", "networking"] |
| `isRegistrationOpen` | Boolean | Yes | Registration status | true or false | true |
| `createdAt` | String (ISO Date) | Yes | Creation timestamp | Auto-generated | "2025-11-20T10:00:00Z" |
| `updatedAt` | String (ISO Date) | Yes | Last update timestamp | Auto-generated | "2025-12-08T11:00:00Z" |

### Event Status Values

| Status Value | Display Name | Description | Actions Available |
|--------------|--------------|-------------|-------------------|
| `draft` | Draft | Planning phase | Edit, Delete, Publish |
| `published` | Published | Open for registration | Join, Leave, Edit, Cancel |
| `cancelled` | Cancelled | Event cancelled | View only |
| `completed` | Completed | Event finished | View only |

---

## 5. Announcements Data

### Announcement Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `_id` | String (ObjectId) | Yes | Unique identifier | Auto-generated | "507f1f77bcf86cd799439015" |
| `title` | String | Yes | Announcement title | 3-200 characters | "Campus Closure Notice" |
| `content` | String | Yes | Full announcement text | Min 10 characters | "The campus will be closed..." |
| `priority` | Enum | Yes | Urgency level | low, medium, high, urgent | "high" |
| `type` | Enum | Yes | Announcement category | general, academic, event, emergency | "general" |
| `author` | String/Object | Yes | Creator | User ID or populated object | "507f1f77bcf86cd799439011" |
| `isActive` | Boolean | Yes | Display status | true or false | true |
| `status` | Enum | No | Publication status | draft, published, archived | "published" |
| `targetAudience` | Array\<String\> | No | Target groups | Array of audience types | ["students", "faculty"] |
| `expiresAt` | String (ISO Date) | No | Expiration date | ISO 8601 format | "2025-12-31T23:59:59Z" |
| `imageUrl` | String (URL) | No | Optional image | Valid Cloudinary URL | "https://res.cloudinary.com/..." |
| `imageId` | String | No | Cloudinary public ID | For deletion | "cict/announcements/def456" |
| `createdAt` | String (ISO Date) | Yes | Creation timestamp | Auto-generated | "2025-12-08T08:00:00Z" |
| `updatedAt` | String (ISO Date) | Yes | Last update timestamp | Auto-generated | "2025-12-08T08:30:00Z" |

### Announcement Priority Levels

| Priority Value | Display Name | Color Code | Use Case |
|----------------|--------------|------------|----------|
| `low` | Low | Blue | General information |
| `medium` | Medium | Yellow | Important updates |
| `high` | High | Orange | Critical notices |
| `urgent` | Urgent | Red | Emergency alerts |

### Announcement Types

| Type Value | Display Name | Description |
|------------|--------------|-------------|
| `general` | General | General campus announcements |
| `academic` | Academic | Academic-related notices |
| `event` | Event | Event announcements |
| `emergency` | Emergency | Emergency notifications |

---

## 6. Organizations Data

### Organization Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `id` | String | Yes | Unique organization slug | Lowercase, hyphenated | "ict-sf" |
| `name` | String | Yes | Short name/acronym | 2-20 characters | "ICT-SF" |
| `fullName` | String | Yes | Full organization name | 5-100 characters | "ICT Student Forum" |
| `description` | String | Yes | Brief description | 50-300 characters | "The premier student organization..." |
| `longDescription` | String | Yes | Detailed description | 200-2000 characters | "The ICT Student Forum serves..." |
| `logo` | String (URL) | Yes | Organization logo | Valid Cloudinary URL | "https://res.cloudinary.com/..." |
| `banner` | String (URL) | Yes | Banner/cover image | Valid Cloudinary URL | "https://res.cloudinary.com/..." |
| `established` | String | Yes | Year established | 4-digit year | "2018" |
| `mission` | String | Yes | Mission statement | 50-500 characters | "To empower ICT students..." |
| `vision` | String | Yes | Vision statement | 50-500 characters | "To be the leading student-driven..." |
| `values` | Array\<String\> | Yes | Core values | 3-10 values | ["Innovation", "Collaboration"] |
| `achievements` | Array\<String\> | Yes | Key achievements | 3-20 achievements | ["Best Student Org 2023"] |
| `members` | Array\<Object\> | Yes | Organization members | See Member Entity below | [...] |
| `color.primary` | String (Hex) | Yes | Primary brand color | Valid hex color | "#6e29f6" |
| `color.secondary` | String (Hex) | Yes | Secondary brand color | Valid hex color | "#f629a8" |
| `color.accent` | String (Hex) | Yes | Accent brand color | Valid hex color | "#29f6d2" |

### Organization Member Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `id` | String | Yes | Unique member ID | Numeric string | "1" |
| `name` | String | Yes | Full name | 3-100 characters | "Alexandra Chen" |
| `position` | String | Yes | Role/title | 3-100 characters | "President" |
| `photo` | String (URL) | Yes | Profile photo | Valid Cloudinary URL | "https://res.cloudinary.com/..." |
| `bio` | String | Yes | Biography | 50-500 characters | "Senior Computer Science student..." |
| `joinedDate` | String (YYYY-MM) | No | Join date | YYYY-MM format | "2022-08" |
| `achievements` | Array\<String\> | No | Personal achievements | 0-20 achievements | ["Led 15+ tech workshops"] |
| `responsibilities` | Array\<String\> | No | Key responsibilities | 0-10 responsibilities | ["Strategic planning"] |
| `skills` | Array\<String\> | No | Skills/expertise | 0-15 skills | ["Leadership", "AI/ML", "Python"] |
| `timeline` | Array\<Object\> | No | Career timeline | See Timeline Event below | [...] |
| `gallery` | Array\<String\> | No | Photo gallery | Array of Cloudinary URLs | ["https://...", "https://..."] |
| `social.linkedin` | String (URL) | No | LinkedIn profile | Valid LinkedIn URL | "https://linkedin.com/in/..." |
| `social.github` | String (URL) | No | GitHub profile | Valid GitHub URL | "https://github.com/..." |
| `social.email` | String | No | Contact email | Valid email format | "alexandra@ict-sf.org" |

### Timeline Event Entity

| Field Name | Data Type | Required | Description | Example Value |
|------------|-----------|----------|-------------|---------------|
| `year` | String | Yes | Event year | "2025" |
| `title` | String | Yes | Event title | "Elected as ICT-SF President" |
| `description` | String | Yes | Event description | "Led organization to unprecedented growth..." |
| `category` | Enum | Yes | Event type | achievement, project, milestone, award, education |
| `details` | Array\<String\> | No | Detailed points | ["Increased membership by 40%", ...] |

---

## 7. Roles & Permissions Data

### Role Entity

| Field Name | Data Type | Required | Description | Validation Rules | Example Value |
|------------|-----------|----------|-------------|------------------|---------------|
| `_id` | String (ObjectId) | Yes | Unique role identifier | Auto-generated | "507f1f77bcf86cd799439016" |
| `name` | String | Yes | Role name | 3-50 characters, unique | "Content Manager" |
| `description` | String | Yes | Role description | 10-300 characters | "Manages news and announcements" |
| `permissions` | Array\<String\> | Yes | Assigned permissions | Array of permission enums | ["create_news", "edit_news"] |
| `isSystemRole` | Boolean | Yes | System-defined role | true or false | false |
| `createdBy` | String/Object | Yes | Creator | User ID or populated object | "507f1f77bcf86cd799439011" |
| `createdAt` | String (ISO Date) | Yes | Creation timestamp | Auto-generated | "2025-11-01T10:00:00Z" |
| `updatedAt` | String (ISO Date) | Yes | Last update timestamp | Auto-generated | "2025-12-08T09:00:00Z" |

### Permission Types

| Category | Permission Value | Display Name | Description |
|----------|------------------|--------------|-------------|
| **News** | `create_news` | Create News | Create news articles |
| | `edit_news` | Edit News | Modify news articles |
| | `delete_news` | Delete News | Remove news articles |
| | `publish_news` | Publish News | Publish news articles |
| | `archive_news` | Archive News | Archive news articles |
| | `view_news` | View News | View all news articles |
| **Announcements** | `create_announcement` | Create Announcement | Create announcements |
| | `edit_announcement` | Edit Announcement | Modify announcements |
| | `delete_announcement` | Delete Announcement | Remove announcements |
| | `publish_announcement` | Publish Announcement | Publish announcements |
| | `archive_announcement` | Archive Announcement | Archive announcements |
| | `view_announcement` | View Announcement | View all announcements |
| **Events** | `create_event` | Create Event | Create events |
| | `edit_event` | Edit Event | Modify events |
| | `delete_event` | Delete Event | Remove events |
| | `publish_event` | Publish Event | Publish events |
| | `view_event` | View Event | View all events |
| | `join_event` | Join Event | Join events as attendee |
| **Members** | `create_member` | Create Member | Add new members |
| | `edit_member` | Edit Member | Modify member profiles |
| | `delete_member` | Delete Member | Remove members |
| | `view_member` | View Member | View member profiles |
| | `manage_member_roles` | Manage Member Roles | Assign/modify member roles |
| **Roles** | `create_role` | Create Role | Create custom roles |
| | `edit_role` | Edit Role | Modify roles |
| | `delete_role` | Delete Role | Remove roles |
| | `view_role` | View Role | View all roles |
| | `assign_role` | Assign Role | Assign roles to users |
| **System** | `view_logs` | View Logs | Access activity logs |
| | `manage_settings` | Manage Settings | Modify system settings |

---

## 8. Activity Logs Data

### Activity Log Entity

| Field Name | Data Type | Required | Description | Example Value |
|------------|-----------|----------|-------------|---------------|
| `_id` | String (ObjectId) | Yes | Unique log identifier | "507f1f77bcf86cd799439017" |
| `user` | String/Object | Yes | User who performed action | User ID or populated object |
| `action` | String | Yes | Action performed | "CREATE", "UPDATE", "DELETE" |
| `resource` | String | Yes | Resource type | "news", "event", "user" |
| `resourceId` | String | No | Specific resource ID | "507f1f77bcf86cd799439013" |
| `details` | Object | No | Additional context | {title: "...", changes: {...}} |
| `ipAddress` | String | No | User's IP address | "192.168.1.1" |
| `userAgent` | String | No | Browser/device info | "Mozilla/5.0..." |
| `createdAt` | String (ISO Date) | Yes | Action timestamp | "2025-12-08T10:15:30Z" |

---

## 9. Media & Assets Data

### Image Upload Requirements

| Property | Value | Description |
|----------|-------|-------------|
| **Storage Service** | Cloudinary | Cloud-based media management |
| **Accepted Formats** | JPG, JPEG, PNG, GIF, WEBP | Standard image formats |
| **Max File Size** | 5 MB | Maximum upload size |
| **Image Processing** | Auto-optimization | Automatic format conversion and compression |
| **CDN Delivery** | Yes | Fast global delivery |

### Image URL Structure

| Component | Description | Example |
|-----------|-------------|---------|
| Base URL | Cloudinary domain | "https://res.cloudinary.com/" |
| Cloud Name | Account identifier | "ddnxfpziq" |
| Resource Type | Image type | "image/upload" |
| Version | Upload version | "v1756660317" |
| Public ID | Unique identifier | "cict/news/abc123" |
| Format | File extension | ".jpg" |

### Image Categories

| Category | Folder Path | Usage | Recommended Size |
|----------|-------------|-------|------------------|
| News Images | `cict/news/` | News article featured images | 1200x630px |
| Event Images | `cict/events/` | Event banners and photos | 1920x1080px |
| Organization Logos | `cict/orgs/logos/` | Organization branding | 512x512px |
| Organization Banners | `cict/orgs/banners/` | Organization headers | 1920x600px |
| Member Photos | `cict/members/` | Member profile pictures | 400x400px |
| Announcement Images | `cict/announcements/` | Announcement visuals | 1200x630px |

---

## 10. Static Content Data

### Navigation Menu Items

| Page | Route | Display Name | Access Level |
|------|-------|--------------|--------------|
| Home | `/` | Home | Public |
| About | `/about` | About | Public |
| Academics | `/academics` | Academics | Public |
| Events | `/events` | Events | Public |
| Admissions | `/admissions` | Admissions | Public |
| News | `/news` | News | Public |
| Student Life | `/student-life` | Student Life | Public |
| Organizations | `/organization` | Organizations | Public |
| Contact | `/contact` | Contact | Public |
| Member Portal | `/member` | Member Portal | Authenticated |
| Admin Dashboard | `/admin` | Admin | Admin Only |

### Admin Navigation Items

| Section | Route | Display Name | Required Permission |
|---------|-------|--------------|---------------------|
| Dashboard | `/admin/dashboard` | Dashboard | Any admin role |
| Users | `/admin/users` | Users | `view_member` |
| News | `/admin/news` | News | `view_news` |
| Events | `/admin/events` | Events | `view_event` |
| Announcements | `/admin/announcements` | Announcements | `view_announcement` |
| Roles & Permissions | `/admin/roles` | Roles & Permissions | `view_role` |

### Organization Types

| Organization ID | Full Name | Established | Primary Color |
|-----------------|-----------|-------------|---------------|
| `ict-sf` | ICT Student Forum | 2018 | #6e29f6 |
| `css` | Computer Science Society | 2019 | #2563eb |
| `iss` | Information Systems Society | 2020 | #059669 |
| `robotcu` | Robotics Club University | 2017 | #dc2626 |
| `best` | Board of European Students of Technology | 2016 | #7c3aed |

---

## Data Validation Summary

### Common Validation Rules

| Field Type | Validation Rule | Error Message |
|------------|-----------------|---------------|
| Email | RFC 5322 compliant | "Invalid email format" |
| Password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special | "Password must meet requirements" |
| Required String | Not empty, trimmed | "This field is required" |
| URL | Valid HTTP/HTTPS URL | "Invalid URL format" |
| Date | ISO 8601 format | "Invalid date format" |
| ObjectId | Valid MongoDB ObjectId | "Invalid ID format" |
| Enum | One of predefined values | "Invalid value" |

### String Length Constraints

| Field Category | Min Length | Max Length | Typical Use |
|----------------|------------|------------|-------------|
| Short Text (Names, Titles) | 2 | 100 | User names, event titles |
| Medium Text (Descriptions) | 10 | 500 | Brief descriptions, excerpts |
| Long Text (Content) | 10 | 10,000 | Full articles, detailed content |
| Email | 5 | 100 | Email addresses |
| URL | 10 | 500 | Image URLs, links |

---

## API Response Format

### Success Response Structure

```
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Resource data here
  }
}
```

### Error Response Structure

```
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### Pagination Response Structure

```
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## Environment Configuration

### Required Environment Variables

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | "http://localhost:5000/api" |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary account name | "ddnxfpziq" |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | "http://localhost:3000" |

---

## Notes

1. **Date Formats**: All dates are stored and transmitted in ISO 8601 format (UTC timezone)
2. **Image Storage**: All images are stored on Cloudinary with automatic optimization
3. **Authentication**: JWT-based authentication with access and refresh tokens
4. **Permissions**: Role-based access control (RBAC) system
5. **Validation**: Client-side validation with Zod, server-side with express-validator
6. **Real-time Updates**: React Query for automatic cache invalidation and refetching
7. **File Uploads**: Multipart/form-data for image uploads with FormData
8. **Error Handling**: Centralized error handling with toast notifications

---

**Document Prepared By:** CICT Development Team  
**For Questions:** Contact the technical lead or refer to the API documentation
