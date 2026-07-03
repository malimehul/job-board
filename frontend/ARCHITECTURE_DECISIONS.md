# Frontend Architecture Decisions

## 1. Architecture overview

The frontend is a TypeScript application built with Next.js and React. It uses the App Router for pages and layouts, feature folders for domain-specific UI, TanStack Query for remote data, Zustand for small global client state, React Hook Form and Zod for forms, and Tailwind CSS for styling.

The common data flow is:

```text
Next.js page or feature component
  -> TanStack Query hook or mutation
  -> centralized API client
  -> Express REST API
  -> query cache / Zustand auth update
  -> reusable UI component
```

The frontend does not contain authoritative business authorization. It controls navigation and presentation, while the backend validates identity, role, ownership, and data.

## 2. Folder and module structure

```text
frontend/
|-- src/
|   |-- app/                  # App Router pages, layouts, loading/error states
|   |   |-- (auth)/           # Login, registration, password recovery
|   |   |-- jobs/             # Public job browsing/details
|   |   |-- candidate/        # Candidate pages and onboarding
|   |   |-- recruiter/        # Recruiter pages and onboarding
|   |   `-- admin/            # Admin dashboards and lists
|   |-- features/             # Domain components, hooks, schemas, constants
|   |-- components/
|   |   |-- ui/               # Shared controls and display components
|   |   `-- layouts/          # Public and dashboard shells
|   |-- constants/            # Routes, API endpoints, and UI text
|   |-- lib/                  # API client, environment, and API errors
|   |-- providers/            # Query and authentication providers
|   |-- store/                # Zustand authentication state
|   |-- types/                # Frontend domain/API types
|   `-- proxy.ts              # Early auth, role, and onboarding redirects
|-- next.config.ts
|-- package.json
`-- tsconfig.json
```

Routes live where Next.js expects them, while reusable feature behavior stays outside route files. This prevents large pages from owning every form, table, modal, and validation rule.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Code is grouped by product feature and shared UI remains reusable. Route files stay easier to scan. | A feature may still depend on shared types, API constants, and components; boundaries are conventions rather than enforced packages. | Candidate, Recruiter, Admin, jobs, applications, and auth are clear product areas with substantial reusable UI. |

## 3. Framework and language decisions

### Next.js App Router

Next.js provides file-based routing, nested layouts, metadata, loading/error/not-found boundaries, optimized production builds, route-level code splitting, and a path to server rendering or static generation. The proxy can redirect protected and onboarding routes before a page renders.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Routing and application structure are standardized. Layouts reduce duplicated shells, and public pages can later gain SEO/server-rendering improvements. | Server/client component rules add complexity. Much of the current data-heavy UI is client-rendered, so not all App Router performance benefits are used. | The portal needs many nested role-based routes and layouts. Next.js supports those now and leaves room for more server rendering later. |

### TypeScript

Strict TypeScript is used for components, props, API envelopes, users, jobs, applications, form inputs, query results, and role unions. The `@/*` path alias keeps imports readable.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Refactoring is safer, editor support is stronger, and invalid role or payload shapes are caught early. | Frontend contracts can drift from backend DTOs, and escape hatches such as casts can weaken safety. | The number of related domain types makes compile-time feedback valuable. Generated API types are a future improvement. |

### Tailwind CSS

Tailwind CSS is imported globally and extended with theme variables for brand colors, spacing, radii, shadows, typography, status colors, and dark mode. Components compose utilities close to their markup.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Styling is fast, consistent, responsive, and easy to reuse without inventing many class names. Theme tokens keep the visual system coherent. | Long utility strings can reduce readability, and inconsistent combinations are possible without component discipline. | Shared UI components and centralized theme tokens control repetition while keeping development fast for this project size. |

## 4. State-management decisions

### Zustand instead of Redux

Zustand stores only global authentication state: current user, access token, refresh token, and login/logout actions. Persistence restores the session after reload, devtools are enabled during development, and onboarding status is derived from the user.

Redux was not chosen because server data is handled by TanStack Query and the remaining global state is small. Actions, reducers, selectors, and a larger store setup would add ceremony without enough benefit.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Minimal boilerplate, direct access from the API client, persistence, and simple actions. | Large teams may need stronger conventions. Hydration requires care, and persisted authentication data is security-sensitive. | The store has one focused responsibility. If client-only workflows grow substantially, slices or a more formal state model can be introduced. |

### TanStack Query for server state

TanStack Query owns fetched jobs, applications, bookmarks, profiles, dashboards, and Admin data. The shared client uses a one-minute stale time, one retry, and no refetch on window focus. Query keys include filters and pages. Mutations invalidate relevant cached data.

Analytics override the default with immediate staleness where freshness matters more.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Loading, errors, caching, retries, deduplication, and invalidation are handled consistently. Server data is not duplicated into Zustand. | Query-key and invalidation mistakes can create stale UI. It introduces another state model developers must understand. | The portal has many repeated lists and dashboards, so caching and mutation coordination save significant custom code. |

## 5. Forms and validation

### React Hook Form and Zod

React Hook Form manages form values, submission state, and field errors. Zod schemas describe authentication, job, Candidate, Recruiter, application, and password rules. `zodResolver` connects the two, and TypeScript types are inferred from schemas.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Mostly uncontrolled fields reduce rerenders; schemas provide runtime checks, inferred types, and consistent field messages. | Frontend and backend schemas are duplicated and may drift. Complex dynamic forms need extra code. | Client validation improves usability, while the backend independently validates all security-sensitive data. |

### Form validation approach

- Field-level constraints provide immediate, specific messages.
- Cross-field refinements enforce rules such as matching passwords and maximum values being greater than minimum values.
- Forms display API errors separately from client validation errors.
- Client validation is treated as user feedback, not as a security boundary.

## 6. API client decision

### Native Fetch instead of Axios

The project does not currently use Axios. `src/lib/api-client.ts` wraps the browser's native `fetch` API and exposes typed `get`, `post`, `put`, `patch`, and `delete` methods.

The client:

- Uses `NEXT_PUBLIC_API_URL` as the validated base URL.
- Attaches Bearer access tokens from Zustand.
- Serializes normal request bodies as JSON and leaves `FormData` unchanged for resume uploads.
- Converts failed responses into a shared `ApiError` with backend validation details.
- Handles empty `204` responses.
- Refreshes tokens after a `401`, retries the original request once, and shares one refresh promise across concurrent failures.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| No additional HTTP dependency; the wrapper is small, typed, and tailored to the API. Refresh and error behavior are centralized. | Axios offers richer interceptors, timeout helpers, request cancellation conventions, and broad compatibility utilities out of the box. The custom wrapper must maintain these concerns itself. | Modern Next.js supports `fetch` well, and current requirements are covered by a compact client. Axios can be adopted later without changing feature call sites significantly. |

Endpoint paths are centralized in `src/constants/api.ts`, preventing URL strings from being repeated across pages.

## 7. Protected routes and role-based UI

Protection exists at several frontend levels:

- `proxy.ts` reads authentication, role, and onboarding cookies and redirects unauthenticated or cross-role navigation.
- `AuthProvider` waits for Zustand hydration, verifies the session through `/auth/me`, recovers or clears state, and redirects expired sessions.
- Role-specific layouts use `RoleGuard` to avoid rendering unauthorized UI.
- Navigation and dashboard destinations change for Candidate, Recruiter, and Admin users.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Users are redirected early, onboarding order is consistent, and role-specific UI is not shown accidentally. | Cookies and client state are JavaScript-readable and can be edited by a user. Frontend checks cannot enforce real authorization. | The Express API independently verifies every protected request and role. Frontend checks are correctly treated as navigation and user-experience controls. |

## 8. Debounced search

The public job keyword field waits 500 ms after the user stops typing before applying the search. It clears the previous timer when typing continues, supports immediate submit/clear, and cleans up on unmount. Filters and page numbers are stored in URL search parameters and become part of the TanStack Query key.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Avoids one request per keystroke, keeps URLs shareable, and preserves browser navigation behavior. | Adds a small delay and timer logic. Server search still uses regex and can become expensive at scale. | A 500 ms delay is a reasonable balance for a job search interface and meaningfully reduces unnecessary traffic. |

## 9. Reusable component structure

Shared UI includes buttons, loaders, breadcrumbs, user/notification menus, tables, status controls, and onboarding elements. Shared layout components provide public and dashboard shells. Feature folders contain focused components such as job cards, filters, forms, application tables, analytics charts, profile forms, and modals.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Consistent behavior and styling, less duplication, and smaller page components. | Over-generalized components can gain too many props; similar Admin and feature tables may still duplicate behavior. | Current components are close to domain needs. Repetition can be consolidated when stable shared patterns become clear. |

## 10. Error, loading, and empty states

- Root `loading.tsx`, `error.tsx`, and `not-found.tsx` cover route-level states.
- TanStack Query provides `isLoading`, `isPending`, and `error` for API-driven pages and mutations.
- Shared loaders and page-specific messages keep feedback consistent.
- List and table components display empty results rather than rendering blank space.
- The API client normalizes backend and network failures into one error type.
- Forms disable or label pending submissions and show field/API errors.

| Benefits | Limitations | Why acceptable here |
| --- | --- | --- |
| Users receive feedback during network work and understand when data is absent or failed. | State presentation is implemented across multiple pages and is not yet a single design-system pattern. | Shared primitives plus TanStack Query provide consistency without requiring a large component framework. |

## 11. Performance trade-offs

- **Query caching:** A one-minute stale time reduces repeated requests, but briefly stale data is possible. Mutations explicitly invalidate affected keys.
- **Client rendering:** Interactive dashboards are easy to build, but many client components increase browser JavaScript and reduce some Next.js server-rendering benefits.
- **Code splitting:** App Router routes and layouts create production code-splitting boundaries, but large feature dependencies can still increase a route bundle.
- **Debouncing and pagination:** These limit requests and rendered records, but offset pagination and backend regex search will need improvement for very large datasets.
- **Memoized lookup:** Bookmark IDs are converted to a `Set` for constant-time checks in job lists, adding a small amount of memory to reduce repeated array searches.
- **Fonts and build:** `next/font` self-hosts Inter with `display: swap`; Next.js provides minification and tree shaking, and Turbopack is configured for the repository root.

## 12. Security trade-offs

- Access and refresh tokens are persisted in Zustand/local storage, while access/role/onboarding data is also copied to JavaScript-readable cookies. This is convenient for client hydration and proxy redirects but increases XSS impact.
- Before public production deployment, authentication should move to backend-issued `HttpOnly`, `Secure`, carefully scoped cookies, with CSRF protection where needed.
- Role and onboarding cookies are hints only. They may be modified by users, so the backend must remain authoritative.
- Only `NEXT_PUBLIC_` values are safe to expose to the browser. Server secrets must never be added to frontend environment variables.
- Rendering backend error text is useful, but messages should not expose internal details. The backend already hides stacks in production.
- Resume uploads should retain client-side type/size guidance, but the backend and storage pipeline must perform the real validation.

## 13. Scalability trade-offs

- Feature folders and reusable components support a growing UI, but there are no enforced package boundaries.
- A centralized API client simplifies behavior, but it becomes a critical shared module and requires tests around refresh and retries.
- Zustand is ideal for current auth state; substantially more client-only workflow state may require organized slices or a more formal event model.
- TanStack Query scales across many screens, but query keys should be centralized or factory-generated as their number grows.
- Frontend/backend types are separate. More endpoints increase contract drift risk without OpenAPI or generated clients.
- Most protected pages fetch after hydration. Larger scale and public SEO needs may justify server components, prefetching, streaming, or incremental static regeneration.

## 14. Future improvements

- Move authentication to secure HttpOnly cookies and add CSRF protection as appropriate.
- Generate TypeScript API contracts and a client from OpenAPI.
- Add query-key factories and feature-specific API hooks to standardize cache behavior.
- Add component, hook, and API-client unit tests plus Playwright end-to-end coverage.
- Move suitable public job pages and initial reads to server components or cached server fetches.
- Add route-level dynamic imports for heavy analytics/chart experiences if bundle analysis shows a need.
- Add a consistent toast/notification system and shared error, loading, skeleton, and empty-state components.
- Add accessibility testing, keyboard-flow checks, and automated contrast checks.
- Add bundle analysis, Web Vitals reporting, frontend error monitoring, and product analytics.
- Consider a shared component catalog such as Storybook as the design system grows.

## 15. Summary

The frontend architecture is a strong fit for a production-oriented interview project. It demonstrates Next.js routing, strict TypeScript, a reusable Tailwind-based UI, clear separation between local and server state, typed forms, centralized API communication, token refresh, role-aware navigation, debounced search, and deliberate loading/error behavior. It stays understandable today while providing clear paths to stronger session security, generated contracts, deeper server rendering, automated testing, monitoring, and larger-team conventions.
