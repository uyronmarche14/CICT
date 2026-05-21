# CICT Website Suggested Database Schema

## 1. Database Strategy

The CICT platform uses a content-oriented database structure.

The main records are:

```text
users
roles
news
announcements
events
organizations
organization_members
activity_logs
```

In the current implementation, members are stored inside organization records, but this document presents both conceptual and implementation-aware structure.

---

# 2. users

Stores admin account information.

```sql
users
- id
- email
- password
- first_name
- last_name
- role
- custom_role_id
- is_active
- last_login
- created_at
- updated_at
```

## role values

- full_admin
- semi_admin
- support

---

# 3. roles

Stores custom role definitions.

```sql
roles
- id
- name
- description
- permissions
- is_system_role
- created_by
- created_at
- updated_at
```

---

# 4. news

Stores article-style content.

```sql
news
- id
- title
- excerpt
- content
- author_id
- status
- published_at
- archived_at
- image_url
- image_id
- tags
- created_at
- updated_at
```

## status

- draft
- published
- archived

---

# 5. announcements

Stores short-form official notices.

```sql
announcements
- id
- title
- content
- author_id
- priority
- type
- status
- is_active
- target_audience
- expires_at
- image_url
- image_id
- published_at
- archived_at
- created_at
- updated_at
```

## priority

- low
- medium
- high
- urgent

---

# 6. events

Stores event information.

```sql
events
- id
- title
- excerpt
- description
- organizer_id
- start_date
- end_date
- location
- status
- attendees
- max_attendees
- image_url
- image_id
- tags
- is_registration_open
- created_at
- updated_at
```

## status

- draft
- published
- cancelled
- completed

---

# 7. organizations

Stores organization records.

```sql
organizations
- id
- slug
- name
- full_name
- description
- long_description
- logo
- banner
- established
- mission
- vision
- values
- achievements
- color
- members
- created_at
- updated_at
```

---

# 8. organization_members

Conceptual member structure inside each organization.

```sql
organization_members
- id
- organization_id
- name
- position
- photo
- bio
- joined_date
- achievements
- responsibilities
- skills
- timeline
- gallery
- social
- created_at
- updated_at
```

---

# 9. activity_logs

Stores admin activity.

```sql
activity_logs
- id
- user_id
- action
- resource
- resource_id
- details
- ip_address
- user_agent
- created_at
```

---

# 10. Media References

Many content tables include:

```sql
- image_url
- image_id
```

This allows the platform to keep uploaded image references separate from local storage paths.

