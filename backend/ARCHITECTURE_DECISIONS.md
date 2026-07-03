# Backend Architecture Decisions

## 1. Architecture overview

The backend is a TypeScript REST API built with Node.js, Express, MongoDB, and Mongoose. It is implemented as a modular monolith: all features run in one process and deployment unit, but each business area has a clear boundary.

The normal request flow is:

```text
HTTP request
  -> Express middleware
  -> feature route
  -> controller
  -> service
  -> repository
  -> Mongoose model / MongoDB
  -> JSON response
```

This layering keeps HTTP concerns, business rules, and database access separate. It provides useful structure without the operational cost of microservices.

At startup, `server.ts` loads configuration, opens the shared MongoDB connection, initializes the first Admin account when the users collection is empty, and then starts Express. `app.ts` composes security middleware, parsers, logging, feature routes, 404 handling, and the global error handler.

## 2. Folder and module structure

```text
backend/
|-- src/
|   |-- core/
|   |   |-- config/          # Environment parsing and MongoDB connection
|   |   |-- errors/          # Application error classes
|   |   |-- middlewares/     # Auth, validation, upload, and error handling
|   |   `-- utils/           # JWT, Cloudinary, email, and logging
|   |-- modules/
|   |   |-- auth/
|   |   |-- jobs/
|   |   |-- applications/
|   |   |-- candidate/
|   |   |-- recruiter/
|   |   `-- admin/
|   |-- app.ts               # Express application composition
|   `-- server.ts            # Process startup and failure handling
|-- package.json
`-- tsconfig.json
```

Most feature modules contain:

- **Routes:** Endpoint definitions and middleware composition.
- **Controllers:** HTTP input/output translation.
- **Services:** Business rules and authorization checks related to resources.
- **Repositories:** Mongoose queries, population, filtering, and persistence.
- **Models:** MongoDB schemas and indexes.
- **DTOs:** TypeScript request/service contracts.
- **Validators:** Zod runtime schemas.

### Module folder architecture

Each business module follows a consistent internal shape. A full resource module such as `jobs` looks like this:

```text
modules/jobs/
|-- controllers/
|   `-- job.controller.ts       # Converts Express requests into service calls
|-- dtos/
|   |-- job.dto.ts              # Create/update service contracts
|   `-- job.query.dto.ts        # Search and pagination contract
|-- models/
|   `-- job.model.ts            # Mongoose schema, indexes, document type
|-- repositories/
|   `-- job.repository.ts       # MongoDB queries and persistence operations
|-- routes/
|   `-- job.routes.ts           # URLs, HTTP methods, auth, and validation
|-- services/
|   `-- job.service.ts          # Ownership and business rules
`-- validators/
    |-- job.validator.ts        # Create/update request validation
    `-- job.query.validator.ts  # Search/filter query validation
```

Not every module owns a Mongoose model. Persona modules such as `candidate`, `recruiter`, and `admin` operate on the shared User, Job, and Application models through their repositories. This avoids creating duplicate collections simply to match a UI area.

| Module | Main responsibility | Data and collaboration |
| --- | --- | --- |
| `auth` | Registration, login, logout, token refresh, password recovery, current-user profile, and shared User model. | Owns `User`; delegates role-specific profile work to Candidate or Recruiter services. |
| `jobs` | Public job search plus Recruiter job creation, editing, deletion, close/reopen, and ownership checks. | Owns `Job`; reads Applications when filtering jobs that have applicants. |
| `applications` | Candidate applications, duplicate/deadline rules, Recruiter status updates, and status emails. | Owns `Application`; reads Job and Candidate data to enforce ownership and notify users. |
| `candidate` | Candidate profile, bookmarks, application history, resume upload, and dashboard statistics. | Uses User, Job, and Application data; streams resume buffers to Cloudinary. |
| `recruiter` | Recruiter company profile and dashboard statistics. | Aggregates the Recruiter's Jobs, Applications, and Candidate counts. |
| `admin` | User management, read-only platform lists, analytics, and initial Admin creation. | Aggregates User, Job, and Application data across the platform. |

### Dependency direction

The intended dependency direction inside a module is one way:

```text
routes -> controllers -> services -> repositories -> models
             |              |
             |              `-> other feature repositories/services when needed
             `-> response formatting

core middleware/utilities -> available to every module
```

- Routes should not query MongoDB directly.
- Controllers should not contain persistence logic.
- Services coordinate business rules and cross-module operations.
- Repositories are the only normal location for reusable database queries.
- Models describe stored data and do not depend on HTTP code.

Cross-module dependencies are kept explicit. For example, `ApplicationService` uses Job and Candidate repositories because applying and changing status require job rules, ownership checks, and candidate notification data. This is acceptable inside a modular monolith, but circular imports should be avoided.

### Decision and trade-off

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Features are easy to find, test, and change. Layers prevent controllers from becoming database scripts. | Some boilerplate and cross-module imports remain. | Auth, jobs, applications, and persona dashboards have different rules and are large enough to justify clear boundaries. |

## 3. API design approach

The backend exposes REST-style endpoints under `/api`. Resources are grouped by domain:

- `/api/auth`
- `/api/jobs`
- `/api/applications`
- `/api/candidate`
- `/api/recruiter`
- `/api/admin`

HTTP methods express intent: `GET` reads, `POST` creates or performs commands, `PUT` replaces profile/job data, `PATCH` changes a status, and `DELETE` removes data. Public job browsing is separate from protected Candidate, Recruiter, and Admin operations.

Responses use predictable JSON envelopes such as `{ status, data, message }`. List responses also provide pagination metadata. Controllers pass failures to one error middleware rather than formatting errors independently.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| REST is familiar, easy to inspect, and works naturally with browser clients and HTTP tooling. | Some action endpoints, such as close/reopen, are commands rather than pure resource updates. API contracts are not generated from OpenAPI. | The domain is CRUD-heavy, and explicit command routes make business actions easy to understand in an interview and in client code. |

## 4. Authentication and authorization

### Authentication flow

1. Registration validates input and hashes the password before saving the user.
2. Login loads the user by normalized email and compares the submitted password with bcrypt.
3. A successful login returns an access token and refresh token. The current refresh token is stored with the user.
4. Protected requests send the access token as `Authorization: Bearer <token>`.
5. Authentication middleware verifies the token, reloads the user, checks that a refresh-backed session still exists, and rejects suspended accounts.
6. Refresh verifies the refresh token, compares it with the stored token, rotates it, and returns a new token pair.
7. Logout clears the stored refresh token, revoking the session.

Password reset uses a random token. Only its SHA-256 hash is stored, it expires after 10 minutes, and completing a reset clears the refresh token.

### JWT access and refresh token decision

Separate JWT secrets and configurable lifetimes are used for access and refresh tokens. Access tokens are intended to be short-lived; refresh tokens maintain the user session and are rotated.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Signed Bearer tokens keep the browser and API decoupled. Separate lifetimes reduce exposure, while stored refresh tokens allow logout and revocation. | Browser token storage is difficult to secure. One refresh-token field effectively supports one active refresh session per user, and tokens are stored in plaintext. | The project has one web client and a simple session model. Hashed, multi-device sessions can be introduced when required. |

### Role-based access control decision

The domain has three roles: `Candidate`, `Recruiter`, and `Admin`. Route middleware checks permitted roles. Services add ownership rules, for example preventing a Recruiter from editing another Recruiter's job or application.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Roles match the product personas and make access rules readable and reusable. Service checks protect individual resources after the broad role check. | Roles are coarse and may not support organization-specific permissions later. | The current personas and responsibilities are stable. A permission or policy layer can extend RBAC without changing the whole API. |

## 5. Data and external storage decisions

### MongoDB and Mongoose

MongoDB stores users, jobs, and applications. Mongoose provides schemas, enums, timestamps, references, population, validators, document methods, and indexes. Repositories prevent Mongoose queries from spreading through controllers.

The document model works well for flexible Candidate and Recruiter profile fields. References connect jobs to recruiters and applications to jobs and candidates. Indexes cover common fields such as email, role-related tokens, recruiter, job status, skills, location, candidate, and application status.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Flexible documents fit evolving profiles; Mongoose adds structure and convenient relationships; MongoDB aggregations support dashboards. | Cross-document transactions and relational reporting need more care than SQL. Population and regex search can become expensive. | The relationships are limited and the main workload is document-oriented CRUD and filtering. Repository boundaries leave room for query optimization later. |

### Password hashing

Passwords are hashed with bcrypt using 10 salt rounds. Password hashes and token fields are removed when User documents are serialized to JSON. Password-reset tokens use SHA-256 because they are already high-entropy random values and need exact lookup rather than password stretching.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Bcrypt is proven, salted, and intentionally expensive against brute-force attacks. | Its work factor must be reviewed as hardware changes; hashing consumes CPU. | A cost of 10 is practical for this project's expected traffic. The cost can be raised after production benchmarking. |

### Cloudinary resume/PDF storage

Multer accepts resume data in memory, limits files to 5 MB, and restricts the primary upload route to the PDF MIME type. The buffer is streamed to Cloudinary, and only the returned HTTPS URL is stored in the user profile. That URL is used for delivery or download.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| API instances remain stateless; MongoDB does not store large binaries; Cloudinary handles durable storage and delivery. | It adds cost and vendor dependency. MIME/extension checks alone do not prove file content, and private documents need explicit access policy. | Resumes are external files, so managed object delivery is safer and simpler than local server disk. |

## 6. Configuration and HTTP security

### Environment variables

`dotenv` loads backend settings and Zod validates/coerces them in one configuration module. Database, JWT, Cloudinary, SMTP, CORS, frontend URL, runtime mode, port, and Admin bootstrap settings are not hardcoded into feature code.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| The same build can run in development, test, and production with different settings. Startup validation catches malformed values early. | Some current settings have development defaults that are unsafe for production if deployment validation is weak. | Centralized configuration makes it straightforward to require production secrets in CI or deployment infrastructure. |

### CORS

`FRONTEND_URL` supports a comma-separated allowlist. CORS permits the required HTTP methods plus `Content-Type` and `Authorization` headers. It is applied globally before API routes.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Only configured browser origins can read API responses, and multiple deployed frontend origins can be supported. | CORS is a browser policy, not authentication, and non-browser clients are unaffected. | Authentication and RBAC provide actual access control; CORS correctly limits browser integration exposure. |

Helmet adds secure response headers, and an API rate limiter currently allows 100 requests per 15-minute window per process/IP.

## 7. Error handling and validation

### Centralized error handling

Custom `AppError` classes carry expected HTTP status codes. Controllers forward errors to one error middleware, which handles Zod errors, Multer errors, application errors, invalid MongoDB IDs, and unexpected failures. Production responses hide stack traces. Winston logs request context while masking password fields; Morgan provides HTTP access logs.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Responses and logging remain consistent, and controllers stay small. | Log context must be continuously reviewed for sensitive data; local files are not enough for multi-instance operations. | One process and a small team can use this setup now, with structured centralized logging as a clear next step. |

### Validation

Zod validates request bodies and list query strings before controllers. Mongoose provides a second persistence-level validation boundary. Services enforce cross-field and business rules such as salary ranges, application deadlines, duplicate applications, and resource ownership.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Invalid data fails early, errors are field-friendly, and database invariants receive a second check. | DTOs, Zod schemas, and Mongoose schemas can drift because they are separate definitions. | Independent request and persistence validation is safer than trusting the client. Shared generated contracts can reduce duplication later. |

## 8. Pagination, search, and filtering

List endpoints accept `page` and `limit`, usually defaulting to 1 and 10. Repositories use `skip` and `limit`; data and total-count queries often run together with `Promise.all`. Responses return totals and page counts.

Job search supports keyword, skills, location, type, salary, status, recruiter, sorting, and whether a job has applications. Admin and Candidate lists have role/status/entity filters. Case-insensitive regex is used for flexible text matching.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| The API avoids returning whole collections, filters run near the data, and the client receives enough metadata for navigation. | Offset pagination slows on deep pages. Regex search may not use ordinary indexes efficiently. Current `limit` validators need a maximum. | Data volume is appropriate for simple offset pagination. Cursor pagination and Atlas Search can be introduced when measurements justify them. |

## 9. MongoDB connection reuse and pooling

One Mongoose connection is opened during startup and shared by all repositories. The driver pool is configured with a minimum of 2 and maximum of 10 connections per API process, plus server-selection and socket timeouts. Connection events are logged.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Reusing the pool avoids connection setup on every request and limits database pressure from one process. | Every horizontal replica creates its own pool, so total connections grow with instance count. A minimum pool also consumes idle connections. | The current values are conservative for a single small API and can be tuned from production metrics. |

## 10. Security, performance, and scalability trade-offs

### Security trade-offs

- Backend authentication and ownership checks are authoritative; frontend route checks are only user-experience safeguards.
- The public registration schema currently includes `Admin`. Before public deployment, Admin assignment should be removed from public input and restricted to bootstrap or privileged management.
- JWT default secrets must be rejected in production, and refresh tokens should be hashed at rest.
- File checks should add PDF signature inspection, malware scanning, and private/signed Cloudinary access where resumes are confidential.
- In-memory rate limiting works per process; multiple replicas need a shared store such as Redis.

### Performance trade-offs

- Mongoose population is convenient but can create heavy queries as data grows.
- Dashboard counts and aggregations are calculated on demand; caching is unnecessary at current scale but useful later.
- Offset pagination and regex search favor simplicity over very large-dataset performance.
- Synchronous bcrypt work is appropriate for authentication volume but should be monitored under load.

### Scalability trade-offs

- A modular monolith is easier to build and deploy than microservices, but all features scale together.
- SMTP notifications currently run from request workflows and should move to a queue for reliable retry and lower latency.
- Local Winston files are suitable for development or one host, not a horizontally scaled deployment.
- The API is mostly stateless, but refresh sessions, database pool limits, and rate limiting require shared operational planning.

## 11. Future improvements

- Require strong secrets through production configuration and harden Admin provisioning.
- Hash refresh tokens and support separate device/session records.
- Add upper pagination limits, compound indexes, cursor pagination, and database-enforced unique job applications.
- Introduce MongoDB Atlas Search or another full-text search service when regex search becomes expensive.
- Add Redis for shared rate limiting, hot-query caching, and optional session coordination.
- Move email, file scanning, and cleanup into a durable background queue.
- Add OpenAPI documentation and generated frontend contracts.
- Add unit, integration, and API end-to-end tests.
- Emit structured logs with request IDs to centralized storage.
- Add health/readiness endpoints, metrics, tracing, error monitoring, and alerts.
- Add Docker images, CI/CD checks, graceful shutdown, and repeatable deployment configuration.

## 12. Summary

The backend architecture is a strong fit for a production-oriented interview project. It demonstrates layered API design, clear feature boundaries, secure password handling, token rotation, RBAC, database modeling, validation, external file storage, pagination, and connection pooling. It remains simple enough to explain and operate, while the module boundaries provide clear paths to stronger security, caching, queues, observability, and horizontal scaling.
