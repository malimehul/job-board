# Architecture Decisions

## Purpose and scope

This document describes the architecture of the Job Portal repository as it is implemented today. The platform is a TypeScript full-stack application with an independent Express REST API in `backend/` and a Next.js web client in `frontend/`.

The design favors clear feature boundaries, straightforward deployment, and enough structure for an interview-scale production-oriented application without introducing distributed-system complexity prematurely.

## 1. Overall architecture

### System context

```text
Browser
  |
  | HTTPS/JSON or multipart/form-data
  v
Next.js frontend  ---- Bearer JWT ---->  Express REST API
                                             |
                         +-------------------+-------------------+
                         |                   |                   |
                         v                   v                   v
                      MongoDB            Cloudinary          SMTP server
                 users/jobs/apps       resume storage       notifications
```

The frontend and backend are separate applications. This keeps the API independently testable and deployable, and allows another client, such as a mobile application, to use the same API later.

### Backend architecture

The backend follows a feature-based, layered architecture:

1. `server.ts` loads validated configuration, connects to MongoDB, initializes the first admin when required, and starts the HTTP server.
2. `app.ts` builds the Express middleware pipeline: Helmet, CORS, rate limiting, request parsing, HTTP logging, feature routes, 404 handling, and centralized error handling.
3. Routes define HTTP endpoints and compose authentication, authorization, upload, and Zod validation middleware.
4. Controllers translate HTTP requests and responses without owning persistence rules.
5. Services contain business rules, such as job ownership, application deadlines, duplicate-application prevention, role-specific profile behavior, and notification triggers.
6. Repositories isolate Mongoose queries, pagination, filtering, population, updates, and aggregations.
7. Mongoose models define persistence schemas, relationships, validation, timestamps, and indexes.

The backend is organized into `auth`, `jobs`, `applications`, `candidate`, `recruiter`, and `admin` modules. Cross-cutting concerns live in `core/`.

### Frontend architecture

The frontend uses the Next.js App Router:

- `src/app/` defines public, authentication, Candidate, Recruiter, and Admin routes, along with shared layouts and loading/error boundaries.
- `src/features/` groups domain-specific components, validators, hooks, constants, and types.
- `src/components/` contains reusable UI and layout components.
- `src/lib/api-client.ts` is the central HTTP client and token-refresh boundary.
- `src/store/auth-store.ts` owns small global client state for the current user and tokens.
- `src/providers/` configures authentication and TanStack Query for the component tree.
- `src/proxy.ts` performs early route and onboarding redirects based on authentication cookies. Client-side role guards improve user experience, while the backend remains the security authority.

Interactive pages use TanStack Query for remote data and mutations. React Hook Form and Zod handle form state and client validation. URL search parameters hold list filters and page numbers, making list views shareable and navigation-friendly.

### Folder and module structure

```text
job-portal/
|-- backend/
|   |-- src/
|   |   |-- core/                 # Config, errors, middleware, utilities
|   |   |-- modules/
|   |   |   |-- auth/             # Users, login, refresh, password reset
|   |   |   |-- jobs/             # Job CRUD, search, filters
|   |   |   |-- applications/     # Applying and status workflow
|   |   |   |-- candidate/        # Profile, bookmarks, dashboard
|   |   |   |-- recruiter/        # Profile and dashboard
|   |   |   `-- admin/             # Administration and analytics
|   |   |-- app.ts                # Express application composition
|   |   `-- server.ts             # Process startup
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- app/                  # Next.js routes and layouts
|   |   |-- features/             # Domain-oriented UI and behavior
|   |   |-- components/           # Shared UI and layouts
|   |   |-- constants/            # API paths, routes, UI text
|   |   |-- lib/                  # API client, environment, API errors
|   |   |-- providers/            # Query and auth providers
|   |   |-- store/                # Zustand auth state
|   |   |-- types/                # Shared frontend contracts
|   |   `-- proxy.ts              # Route/onboarding redirects
|   `-- package.json
`-- package.json                  # Combined development scripts
```

Within a backend module, the usual flow is `route -> controller -> service -> repository -> model`. A frontend flow is typically `page -> feature component/hook -> API client -> REST endpoint`.

### Frontend-to-backend communication

- `NEXT_PUBLIC_API_URL` defines the backend `/api` base URL for the browser.
- Endpoint paths are centralized in `frontend/src/constants/api.ts`.
- The API client serializes JSON, preserves `FormData` for uploads, attaches the access token as `Authorization: Bearer <token>`, converts failed responses into a common `ApiError`, and handles `204` responses.
- On a `401`, a single shared refresh promise prevents multiple simultaneous refresh requests. A successful refresh rotates both tokens and retries the original request.
- The backend returns consistent JSON envelopes such as `{ status, data, message }`, plus pagination metadata for list endpoints.
- Resume uploads use `multipart/form-data`; normal commands and queries use JSON and URL query parameters.

## 2. Key architectural decisions

| Decision | Why it was chosen |
| --- | --- |
| **Node.js with Express** | The API is dominated by asynchronous database, storage, and email operations, and using JavaScript/TypeScript on both sides reduces context switching. Express also makes the middleware and REST pipeline easy to see and customize. |
| **MongoDB with Mongoose** | User profiles, jobs, and applications map naturally to documents. Mongoose supplies validation, references, indexes, document methods, and a consistent repository-facing API. |
| **Next.js App Router** | It provides routing, layouts, build optimization, metadata, error/loading boundaries, and a path to server rendering in one maintained React framework. |
| **TypeScript** | The system has many related DTOs, roles, API payloads, and UI models. Static checking makes those relationships safer to change and easier to understand. |
| **JWT authentication** | The web client and API are separate applications, so Bearer access tokens are a straightforward API credential. Refresh tokens preserve sessions without making access tokens long-lived. |
| **Role-based access control** | Candidate, Recruiter, and Admin are central domain concepts with distinct workflows, making roles a direct and understandable authorization model. |
| **Zustand instead of Redux** | Only a small amount of global client state is needed for identity, tokens, and onboarding status. Zustand supplies persistence and devtools without Redux's additional actions, reducers, and store ceremony. |
| **TanStack Query** | API data has caching, freshness, loading, error, mutation, and invalidation concerns that are different from local UI state. TanStack Query is designed specifically for that server-state lifecycle. |
| **React Hook Form with Zod** | React Hook Form keeps form updates efficient, while Zod provides runtime schemas, inferred types, and consistent error messages through the resolver. |
| **Cloudinary** | Resumes should not live on ephemeral application disks or inside MongoDB. Cloudinary provides managed upload, storage, and HTTPS delivery/download URLs. |
| **Feature-based modules** | Auth, jobs, applications, and persona dashboards have distinct rules and change independently. Grouping by domain keeps those rules discoverable while retaining shared infrastructure. |

## 3. Trade-offs by major decision

| Decision | Benefits | Limitations | Why it is acceptable here |
| --- | --- | --- | --- |
| **Node.js with Express** | One language across the stack; strong ecosystem; non-blocking I/O suits database, upload, and email-heavy API work; Express middleware makes security and validation composition explicit. | CPU-heavy work can block the event loop; Express is intentionally unopinionated, so conventions must be maintained by the team. | The portal is primarily request/response CRUD and external I/O. The layered module conventions supply the structure Express does not impose. CPU-intensive work can later move to workers. |
| **MongoDB with Mongoose** | Flexible documents fit evolving profiles and job data; object references and population are convenient; Mongoose adds schemas, validation, hooks/methods, indexes, and typed models. | Cross-document consistency and relational reporting require more care than in SQL; population can become expensive; schema flexibility can permit drift without discipline. | The core entities are document-shaped and the current relationships are simple. Mongoose schemas and repository boundaries provide sufficient discipline, while aggregations support dashboards. |
| **Next.js App Router** | File-based routes, nested layouts, metadata, loading/error boundaries, route-level bundling, font optimization, and a path to server rendering or static generation. | Framework conventions and server/client component boundaries add complexity; much of the current authenticated UI is client-rendered, so not every server-rendering benefit is used yet. | It gives a production-capable application shell now and leaves room for SEO-oriented public job pages and more server rendering later. |
| **TypeScript throughout** | Catches contract errors early; improves refactoring, editor support, DTOs, role unions, and model/query safety; reduces context switching between applications. | Types add build time and can be bypassed with `any`; frontend and backend types are currently maintained separately. | The domain has many related payloads and roles, making compile-time feedback worth the modest overhead. Shared generated API types can be added later. |
| **JWT access and refresh tokens** | Signed Bearer credentials keep the client and API decoupled; access tokens are short-lived; refresh rotation and database-backed refresh tokens permit logout/session revocation. | Token invalidation and secure browser storage are harder than server sessions; the current model supports one stored refresh token per user and therefore effectively one active refresh session. | JWT works well for a separate browser client and future API consumers. The stored refresh token adds practical revocation without a dedicated session service. |
| **Role-based access control (RBAC)** | Candidate, Recruiter, and Admin permissions are easy to understand and audit; route middleware is reusable; service-level ownership checks prevent recruiters modifying another recruiter's data. | Coarse roles become awkward for granular permissions or organization-specific policies; frontend role checks cannot provide security by themselves. | The product has three stable personas with clear boundaries. A permission/policy model can replace or extend role checks if the domain becomes more complex. |
| **Zustand instead of Redux** | Small API, little boilerplate, persistence and devtools middleware, and direct access from the API client; well suited to current-user and token state. | Fewer enforced conventions for a large team; persisted browser state requires careful hydration and security handling. | Global client state is intentionally small. Server data is not duplicated into Zustand because TanStack Query owns it, so Redux's larger action/reducer architecture would add little value. |
| **TanStack Query for server state** | Query-key caching, request lifecycle state, conditional requests, retries, mutation handling, and targeted cache invalidation remove repetitive fetching code. | Cache-key discipline is required; incorrect invalidation can show stale data; it adds a provider and another state model to understand. | The portal has many related lists and dashboards. A one-minute default stale time and explicit invalidation after mutations provide a sensible freshness/network balance. |
| **React Hook Form with Zod** | Mostly uncontrolled inputs reduce rerenders; one schema supplies runtime validation and inferred form types; resolver integration produces consistent field errors. | Backend schemas are separate, so rules can drift; complex dynamic forms require extra coordination. | Immediate client feedback improves usability, while the backend independently validates every request. Future schema generation or a shared contracts package can reduce duplication. |
| **Cloudinary for resumes/PDFs** | Removes binary storage and delivery load from the API server; upload streams work directly from memory; secure hosted URLs are easy to store in a user profile and serve globally. | Adds vendor dependency and cost; asset lifecycle/deletion and private-document access need explicit policy; network failures must be handled. | Resumes are bounded, external assets rather than transactional database data. Managed storage is safer and simpler than local disk for independently deployed or horizontally scaled API instances. |
| **Feature-based modular structure** | Keeps business vocabulary and related code together; makes ownership, testing, and navigation easier; shared concerns remain centralized. | Some cross-feature imports are inevitable, and small modules contain repeated layer boilerplate. | Auth, jobs, applications, and persona dashboards evolve at different rates. The boundaries support parallel development and later extraction without premature microservices. |

## 4. Security decisions

### Passwords and recovery

- Passwords are hashed with bcrypt using 10 salt rounds before storage. Login uses bcrypt comparison, and serialized users remove `passwordHash` and token fields.
- Password rules are checked with Zod on both registration and reset flows.
- Password-reset tokens are generated from cryptographically secure random bytes, stored as SHA-256 hashes, and expire after 10 minutes. Resetting a password clears the stored refresh token so existing sessions must authenticate again.
- The initial Admin account is created only for an empty user collection and uses environment-provided credentials.

### Access and refresh token flow

- Access and refresh tokens use separate secrets and configurable expirations.
- Login stores the refresh token against the user. Refresh verifies it, compares it with the stored token, rotates it, and returns a new pair.
- Protected requests verify the access token, reload the user, require an active stored session, and reject suspended accounts.
- Logout clears the stored refresh token; the next protected request is rejected even if an access token has not yet expired.
- The browser API client serializes concurrent refresh attempts through one promise to avoid refresh storms.

### Protected routes and authorization

- Express `authenticate` middleware establishes identity from a Bearer token.
- `authorizeRoles` restricts endpoints by Candidate, Recruiter, or Admin role.
- Services enforce resource ownership and domain rules in addition to role checks. For example, recruiters can update only their own jobs and applications.
- Next.js proxy redirects and `RoleGuard` improve navigation and prevent accidental cross-role UI access. They are defense-in-depth for user experience only; all authoritative checks remain on the API.

### HTTP, configuration, and input security

- Helmet applies secure HTTP response headers.
- CORS accepts the comma-separated origins configured in `FRONTEND_URL` and limits methods and request headers.
- API rate limiting currently allows 100 requests per 15-minute window per process/IP.
- Backend and frontend environment variables are parsed with Zod. Secrets remain backend-only; only the public API base URL uses the `NEXT_PUBLIC_` prefix.
- Request bodies and query strings are validated before controllers. The centralized error handler avoids stack traces in production and masks password fields in request logs.

### File upload validation

- Multer limits resumes to 5 MB and uses memory storage, avoiding persistent files on application instances.
- The primary authentication upload route accepts the PDF MIME type only, then streams the buffer to Cloudinary.
- Cloudinary returns an HTTPS URL stored in the candidate profile, so MongoDB stores metadata rather than file bytes.

### Production hardening notes

The current controls are a strong project baseline, but these changes should precede a public production launch:

- Do not allow `Admin` to be selected by the public registration endpoint; keep Admin creation in a privileged bootstrap or management flow.
- Move access/refresh credentials from JavaScript-readable persisted storage and cookies to backend-issued `HttpOnly`, `Secure`, appropriately scoped cookies, with CSRF protection where required.
- Remove insecure default JWT secrets in production and require high-entropy secret values through deployment configuration.
- Hash refresh tokens at rest and model multiple device sessions if concurrent sessions are required.
- Validate PDF magic bytes/content in addition to MIME type or file extension, add malware scanning, and define Cloudinary deletion and private/signed-download policies.
- Add upper bounds to API `limit` query parameters and use a shared rate-limit store when running more than one API instance.

## 5. Performance decisions

### API pagination

- Job, Admin user/job/application, Candidate application, and bookmark lists use `page` and `limit`, with a default page size of 10.
- Repositories use MongoDB `skip`/`limit`, while count and data queries commonly run together with `Promise.all`.
- Responses include total counts and total pages so the frontend can render pagination controls without loading entire collections.
- Offset pagination is simple and appropriate at the current scale. Cursor pagination should replace it for very deep or high-write collections.

### Search and filtering

- Job queries support keyword, skills, location, type, salary, status, recruiter, sorting, and application-presence filters.
- Admin lists support role, account status, application status, and identifiers.
- Jobs and applications have indexes for common equality filters such as recruiter, status, skills, location, candidate, and job references; user email is unique and token lookup fields are indexed.
- Case-insensitive regular-expression search is flexible but will not scale like full-text search. MongoDB text indexes or Atlas Search are a future option.

### Debounced frontend search

- Job keyword input waits 500 ms after typing stops before updating the URL and triggering a query.
- Pending timers are cancelled when typing resumes, on explicit submit/clear, and on unmount. This avoids a request for every keystroke while keeping the UI responsive.

### TanStack Query caching

- A single stable `QueryClient` uses a one-minute default `staleTime`, one retry, and disables refetch-on-window-focus.
- Query keys include page and filter state, so separate result sets are cached independently.
- Mutations invalidate only relevant keys, such as bookmarks, job details, dashboards, or application lists.
- Analytics explicitly use `staleTime: 0` where freshness is more important than reuse.

### Next.js build optimization

- The App Router provides route-level code splitting and optimized production bundles.
- Shared layouts reduce repeated shell work, while loading, error, and not-found boundaries provide progressive feedback.
- `next/font` self-hosts and optimizes the Inter font, with `display: swap` to reduce blocking.
- The project configures Turbopack's repository root for local builds. Next.js also supplies production minification and tree shaking.
- Many data-heavy pages are client components. Public job pages could later move more fetching to server components or static/incremental rendering to reduce browser JavaScript and improve SEO.

### MongoDB connection reuse

- The API opens one Mongoose connection during process startup and reuses it for all repositories.
- The configured pool keeps 2 to 10 connections per API process, with server-selection and socket timeouts to avoid indefinite waits.
- This removes per-request connection overhead. Pool sizes must be revisited when horizontally scaling because every process creates its own pool.

## 6. Scalability considerations

### Current scaling foundations

- **Layered backend modules:** Controllers, services, and repositories can be tested or replaced independently. Features can later be separated into services if traffic or team ownership justifies it.
- **Reusable frontend components:** Shared tables, forms, layouts, status components, navigation, and UI primitives reduce duplication across personas.
- **Centralized API layer:** One client owns headers, serialization, refresh, retry, and error normalization. Endpoint constants prevent URL strings from spreading through components.
- **Environment-based configuration:** Database, token, Cloudinary, SMTP, CORS, API URL, and bootstrap settings can differ by deployment without code changes.
- **External file storage:** Cloudinary prevents local-disk coupling, which is important when multiple stateless API replicas serve traffic.
- **Indexes and paginated list reads:** Existing indexes and pagination provide a reasonable foundation before specialized search infrastructure is needed.

### Recommended future improvements

| Area | Improvement | Scaling value |
| --- | --- | --- |
| Caching | Add Redis for hot public job queries, dashboard aggregates, and shared rate-limit state. | Reduces repeated MongoDB work and keeps behavior consistent across API replicas. |
| Background work | Move email, document processing, and cleanup to a durable queue with retries and dead-letter handling. | Keeps request latency predictable and isolates third-party outages. |
| Database | Add compound indexes based on measured query plans, unique `(jobId, candidateId)` application enforcement, cursor pagination, and Atlas Search/full-text search. | Improves large-list and search performance while making duplicate prevention race-safe. |
| Logging | Emit structured JSON logs with request/correlation IDs to centralized storage. | Makes multi-instance debugging and audit trails practical. |
| Monitoring | Add health/readiness endpoints, metrics, tracing, uptime checks, and error reporting. | Exposes latency, errors, saturation, dependency health, and regressions. |
| Deployment | Add multi-stage Dockerfiles, Docker Compose for local dependencies, CI checks, and an orchestrated deployment with graceful shutdown. | Produces repeatable builds and supports horizontal scaling and rollback. |
| Security | Use HttpOnly token cookies or a hardened session design, secret management, shared rate limiting, upload scanning, and explicit Admin provisioning. | Reduces browser-token and privilege-escalation risks before public exposure. |
| API contracts | Generate OpenAPI documentation and typed client contracts; add unit, integration, and end-to-end suites. | Prevents frontend/backend drift and makes refactoring safer as teams grow. |

A modular monolith should remain the default until measurements show a genuine need for microservices. Redis, queues, and observability can be added around this architecture without first breaking apart the codebase.

## 7. Final summary

This architecture is well suited to a production-oriented interview or project submission: it demonstrates clear separation of concerns, typed full-stack development, validated REST APIs, database modeling and indexing, role-aware workflows, centralized client communication, server-state caching, external file storage, and practical security controls.

It is intentionally a modular monolith rather than an over-engineered distributed system. That keeps the project understandable and deployable today while preserving clear paths to stronger session security, Redis caching, background queues, richer search, centralized logging and monitoring, containerized deployment, and horizontal scaling. With the production-hardening items above completed and supported by automated tests and operational monitoring, the same foundations can support a real production deployment.
