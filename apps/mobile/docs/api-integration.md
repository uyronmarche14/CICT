# API Integration

## Base URL

The app reads backend configuration from:

`EXPO_PUBLIC_API_URL`

Example:

`http://localhost:5000/api`

For Android emulators or physical devices, point this value at a backend URL the device can actually reach.

## Auth Flow

1. Student logs in with identifier and password.
2. Backend returns access token, refresh token, and student payload.
3. Mobile app stores tokens in SecureStore.
4. Axios sends the bearer token on authenticated student requests.
5. On `401`, the client tries `/student/auth/refresh`.
6. If refresh fails, the session is cleared and the app returns to login.

## Endpoints Used

Student auth:
- `POST /student/auth/login`
- `POST /student/auth/refresh`
- `POST /student/auth/logout`

Student profile:
- `GET /student/profile`

Student events:
- `GET /student/events`
- `GET /student/events/:id/registration`
- `POST /student/events/:id/register`
- `POST /student/events/:id/cancel-registration`
- `GET /student/events/:id/qr`
- `GET /student/registrations`
- `GET /student/attendance/history`

Public content:
- `GET /public/announcements`
- `GET /news?status=published`
- `GET /events/:id`

## Known Backend Assumptions

- Student mobile auth uses bearer tokens, not cookie-only flows.
- Student event registration and QR attendance already exist on the backend.
- Published news and announcements are safe for public/mobile consumption.

## Backend Gaps

No backend change is required for the current scaffold.

Recommended minimal future additions:
- Optional mobile-friendly student dashboard endpoint if home screen aggregation becomes expensive
- Optional push-notification device registration endpoint when notifications are added
