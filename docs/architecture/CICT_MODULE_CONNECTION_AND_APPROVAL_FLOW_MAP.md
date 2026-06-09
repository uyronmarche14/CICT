# CICT Portal Module Connection and Approval Flow Map

## Document Information

| Field | Details |
|---|---|
| Project | CICT Portal |
| Document Type | Module Connection and Approval Flow Map |
| Last Updated | 2026-06-09 |
| Source Audit | `../audits/CICT_WORKFLOW_ARCHITECTURE_AND_PROCESS_AUDIT.md` |

---

## 1. System-Level Architecture Flow

```mermaid
flowchart TD
    WebPublic["Public Website"]
    WebAdmin["Admin CMS"]
    WebStudent["Student Web"]
    Mobile["Expo Student Mobile"]
    Contracts["@cict/contracts"]
    API["Express API"]
    AdminAuth["Admin Auth<br/>JWT cookie + CSRF"]
    StudentAuth["Student Auth<br/>Bearer/cookie + refresh"]
    RBAC["RBAC + Organization Scope"]
    Services["Controllers and Services"]
    DB[(MongoDB / Mongoose)]
    Cloudinary["Cloudinary Uploads"]
    Push["Expo Push / Local Reminders"]
    Audit["ActivityLog + ContentApprovalAction"]
    Reports["Dashboard, Attendance, Org Analytics"]

    Contracts --> WebPublic
    Contracts --> WebAdmin
    Contracts --> WebStudent
    Contracts --> Mobile
    Contracts --> API

    WebPublic --> API
    WebAdmin --> API
    WebStudent --> API
    Mobile --> API

    API --> AdminAuth
    API --> StudentAuth
    AdminAuth --> RBAC
    StudentAuth --> Services
    RBAC --> Services
    Services --> DB
    Services --> Cloudinary
    Services --> Push
    Services --> Audit
    Services --> Reports
```

---

## 2. Module Dependency Map

| Source Module | Target Module | Data or Event | Trigger | Status | Notes |
|---|---|---|---|---|---|
| Admin Auth | Users/Roles | user id, role, permissions | login/profile | Connected | Active-user and deleted-role checks exist. |
| Users/Roles | Organization Assignment | scoped permissions | assign org role | Connected | Actor cannot assign permissions beyond own global scope. |
| News | Public Website/Mobile | published news | publish/read | Connected | Anonymous reads are status-filtered. |
| Announcements | Public Website/Mobile | published active notices | publish/read | Connected | Public route hides expired/inactive/unpublished. |
| Events | Student Registration | event eligibility/settings | student browses/registers | Connected | Published/upcoming and eligibility filters apply. |
| Student Registration | QR Pass | signed QR token | student opens ticket | Connected | Token includes event, registration, student, qrVersion, nonce. |
| QR Pass | Attendance Scan | token/manual student number | scanner submits | Connected | Backend validates event and duplicate state. |
| Attendance Scan | Reports/History | attendance logs/counts | scan/status correction | Partially Connected | UI export should call backend export endpoint. |
| Content Approval | Process Engine | content process instance | expected workflow link | Partially Connected | `processInstanceId` exists but lifecycle is not automatic. |
| Membership Applications | Approvals Page | pending applications | student applies | Partially Connected | Scoped route middleware mismatch. |
| Dashboard | User/content/event/org models | counts | dashboard load | Partially Connected | Cache key is not user/scope-specific. |
| Notifications | Mobile users | push/local messages | publish/register | Needs Manual Verification | Token registration and local reminders exist; delivery triggers need runtime proof. |

---

## 3. Authentication Flow

```mermaid
flowchart TD
    A["Admin submits email/password"] --> B["POST /api/auth/login"]
    B --> C["User.findOne + bcrypt compare"]
    C --> D{"User active?"}
    D -->|No| E["401/403"]
    D -->|Yes| F["JWT cookie + csrf cookie"]
    F --> G["buildAuthenticatedUser"]
    G --> H["Permissions, visible modules, scoped assignments"]
    H --> I["Admin layout/dashboard"]

    J["Student submits identifier/password"] --> K["POST /api/student/auth/login"]
    K --> L["Student.findOne + bcrypt compare"]
    L --> M{"Student active?"}
    M -->|No| N["403"]
    M -->|Yes| O["StudentSession + access/refresh tokens"]
    O --> P["Mobile SecureStore or web student cookie"]
    P --> Q["Student events/profile/attendance"]
```

Admin and student auth are separated. Admin web is cookie-centered; mobile stores student access and refresh tokens in Expo SecureStore and refreshes through the centralized Axios client.

---

## 4. User, Role, and Permission Flow

```mermaid
flowchart TD
    A["Full/custom admin creates role"] --> B["Role permissions"]
    B --> C["Subset check against actor permissions"]
    C --> D["Role saved"]
    D --> E["Assign to user globally or per organization"]
    E --> F["OrganizationAssignment"]
    F --> G["buildAuthenticatedUser"]
    G --> H["visibleAdminModules + scopedAdminModulesByOrganization"]
    H --> I["Web permission hooks"]
    H --> J["Backend service scope checks"]
```

The core RBAC model is strong. The main follow-up is consistency: routes should not block scoped organization users before scope-aware service/controller checks can run.

---

## 5. Content-Creation and Publishing Flow

### News

```mermaid
flowchart TD
    A["Create News"] --> B["News draft"]
    B --> C["Submit"]
    C --> D["pending_approval"]
    D -->|Approve| E["approved"]
    D -->|Reject with reason| F["rejected"]
    E --> G["Publish"]
    B --> G
    G --> H["published"]
    H --> I["Public news/mobile feed"]
    H --> J["Archive"]
    J --> K["archived"]
    C --> L["ContentApprovalAction"]
    D --> L
    G --> L
    J --> L
```

### Announcements

```mermaid
flowchart TD
    A["Create Announcement"] --> B["Announcement draft"]
    B --> C["Submit / approve / reject"]
    C --> D["Publish"]
    D --> E["published + active"]
    E --> F["Public announcement endpoint"]
    F --> G["Web announcements + mobile updates"]
    E --> H["Expiry job can archive expired announcements"]
```

### Events

```mermaid
flowchart TD
    A["Create Event"] --> B["Event draft"]
    B --> C["Submit / approve / reject"]
    C --> D["Publish"]
    D --> E["published"]
    E --> F["Public events"]
    E --> G["Student eligible events"]
    G --> H["Registration and QR"]
    E --> I["Cancel or complete"]
    I -. Missing approval-action history .-> J["ContentApprovalAction"]
```

---

## 6. Event Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> pending_approval: submit
    pending_approval --> approved: approve
    pending_approval --> rejected: reject
    rejected --> draft: edit resets approval
    approved --> published: publish
    draft --> published: direct publish allowed
    published --> cancelled: cancel event
    published --> completed: complete event
```

Events are connected to registration only after they are published and open for registration.

---

## 7. QR Generation and Attendance Flow

```mermaid
flowchart TD
    A["Student registers for event"] --> B["EventRegistration"]
    B --> C["Unique eventId + studentId"]
    B --> D["qrNonce + qrIssuedAt"]
    D --> E["GET /student/events/:id/qr"]
    E --> F["Signed QR JWT"]
    F --> G["Mobile QR screen"]
    G --> H["Admin scanner submits qrToken"]
    H --> I["Verify STUDENT_QR_SECRET signature"]
    I --> J{"eventId matches route?"}
    J -->|No| K["invalid_qr log"]
    J -->|Yes| L{"registration, student, nonce, qrVersion valid?"}
    L -->|No| K
    L -->|Yes| M{"checkedInAt already set?"}
    M -->|Yes| N["duplicate log"]
    M -->|No| O["Set checked_in + increment checkedInCount"]
    O --> P["success log"]
```

---

## 8. Student Mobile Identity Flow

```mermaid
flowchart TD
    A["Student login"] --> B["Access token + refresh token"]
    B --> C["SecureStore"]
    C --> D["Zustand auth store"]
    D --> E["Axios Authorization header"]
    E --> F["Student profile/events/QR/history APIs"]
    F --> G{"401?"}
    G -->|Yes| H["Refresh token request"]
    H --> I{"Refresh succeeds?"}
    I -->|Yes| B
    I -->|No| J["Clear SecureStore and session"]
```

Student identity is server-backed through the `Student` model. The app does not create a local-only student profile for attendance.

---

## 9. QR Scanner and Attendance Validation Flow

```mermaid
flowchart TD
    A["Admin opens scanner page"] --> B["Camera QR or manual student number"]
    B --> C["POST /api/admin/events/:id/attendance/scan"]
    C --> D["authenticate + requireAdminAccess"]
    D --> E["ensureCanManageOwnedContent with SCAN_EVENT_ATTENDANCE"]
    E --> F{"QR token?"}
    F -->|Yes| G["Verify signed QR"]
    F -->|No, student number| H["Find student and registration"]
    H --> I{"Walk-ins allowed?"}
    I -->|Yes| J["Create walk-in registration if eligible/open/capacity"]
    I -->|No| K["not_registered"]
    G --> L["Eligibility and duplicate checks"]
    J --> L
    L --> M["Success, duplicate, or failure log"]
```

Missing UI connection: the scanner page should check `SCAN_EVENT_ATTENDANCE` before rendering scanner controls.

---

## 10. Attendance Reporting and Export Flow

```mermaid
flowchart TD
    A["Admin opens event attendance tab"] --> B["GET attendance logs"]
    B --> C["Backend filters by event, result, scan type, search"]
    C --> D["Summary by result and scan type"]
    D --> E["Web stats and scan log table"]
    E --> F["Client-side CSV from current logs page"]
    E -. Should use .-> G["Backend protected export endpoint"]
    G --> H["Full filtered CSV up to backend limit"]
```

---

## 11. Notifications and Audit-Trail Flow

```mermaid
flowchart TD
    A["Admin mutation route"] --> B["logActivity middleware"]
    B --> C["ActivityLog sanitized details"]
    D["Content workflow action"] --> E["ContentApprovalAction"]
    F["Student registration/QR"] --> G["Student ActivityLog"]
    H["Attendance scan"] --> I["EventAttendanceLog"]
    H --> J["Admin ActivityLog"]
    K["Mobile notification setup"] --> L["Register push token"]
    L -. Needs runtime verification .-> M["Server push delivery"]
```

---

## 12. Dashboard Data Flow

```mermaid
flowchart TD
    A["Admin dashboard request"] --> B["GET /api/admin/dashboard/summary"]
    B --> C["currentUser permissions and organization assignments"]
    C --> D["Count accessible users/students/news/announcements/events/orgs"]
    D --> E["dashboardCache key: summary"]
    E -. Risk: shared cache across scopes .-> F["Scoped admin may receive stale/wrong cached counts"]
```

Recommended fix: include user id, global permission hash, and scoped organization ids in the dashboard cache key.

---

## 13. Process-Node and Approval Flow

```mermaid
flowchart TD
    A["Admin creates process template"] --> B["Nodes, edges, assignments"]
    B --> C["Create process instance"]
    C --> D["Snapshot template nodes/edges"]
    D --> E["Status draft"]
    E --> F["Activate"]
    F --> G["Current node ids"]
    G --> H{"Assigned actor or process approver?"}
    H -->|Yes| I["Approve step / checklist / advance"]
    H -->|No| J["403"]
    I --> K{"End node or no next nodes?"}
    K -->|Yes| L["completed"]
    K -->|No| G
    C -. Not automatically created from content submit .-> M["Content approval workflow"]
```

---

## 14. Disconnected Flow Map

| Flow ID | Source | Expected Target | Missing Connection | Impact | Recommended Action |
|---|---|---|---|---|---|
| CICT-DISC-001 | Dashboard count service | User/scope-specific cache | Cache key does not include user/scope | Scoped counts may leak or appear stale | Key cache by user and scope hash. |
| CICT-DISC-002 | Scanner page | `SCAN_EVENT_ATTENDANCE` permission | Web page uses general event module access | Confusing UI access and backend 403s | Add scan-specific permission guard. |
| CICT-DISC-003 | Membership approval route | Scoped controller check | Global `authorize` runs first | Scoped org admins blocked | Use scope-aware middleware/controller-only guard. |
| CICT-DISC-004 | Event cancel/complete | ContentApprovalAction history | No approval action write | Approval history incomplete | Record cancelled/completed actions. |
| CICT-DISC-005 | Attendance tab export | Backend CSV endpoint | Client builds CSV from loaded page | Incomplete exports | Call backend export endpoint. |
| CICT-DISC-006 | Content submit | Process instance | No automatic link/advance | Duplicate workflow systems | Decide integration policy. |
| CICT-DISC-007 | Push notification service | Runtime delivery proof | Imports/services found, delivery not executed | Notification expectations uncertain | Add tests/manual verification. |

---

## 15. Manual Verification Items

| Item | Reason | Owner | Status |
|---|---|---|---|
| QR camera scan in browser | Camera APIs and scanner component were not executed. | QA | Pending |
| Mobile QR offline token policy | Offline token cache risk requires policy decision. | Product/security | Pending |
| Scoped organization admin membership approval | Needs scoped-role fixtures. | Backend QA | Pending |
| Notification delivery | Requires device token and Expo/backend runtime. | Mobile/backend | Pending |
| Dashboard scoped cache behavior | Needs two-user integration scenario. | Backend QA | Pending |
| Process/content integration decision | Business workflow ownership is unclear. | Product owner | Pending |
| Attendance export privacy | CSV columns may expose student data. | Security/product | Pending |
