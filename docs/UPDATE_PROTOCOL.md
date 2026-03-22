Documentation Update Protocol (DUP)
Purpose
This protocol ensures that documentation remains synchronized with the codebase as the project evolves.

All documentation updates must be included in the same pull request as the corresponding code change.

Core Rule
If a change affects system behavior, interfaces, architecture, or structure, the relevant documentation must be updated in the same PR.

Code changes without documentation updates are considered incomplete.

When Documentation Must Be Updated
API Changes
If an endpoint is added, removed, or modified.

Update:

docs/backend/api.md

Examples:

new route
request/response format changes
authentication changes
Database Changes
If the Prisma schema changes.

Update:

docs/database/schema.md

Examples:

new model
new field
changed relation
Backend Architecture Changes
If services, middleware, or modules are added or changed.

Update:

docs/backend/backend-overview.md

docs/backend/services.md

Frontend Architecture Changes
If routing, state management, or major UI structure changes.

Update:

docs/frontend/routing.md

docs/frontend/ui-architecture.md

Environment or Infrastructure Changes
If environment variables or deployment behavior change.

Update:

docs/operations/environment.md

docs/operations/deployment.md

Pull Request Requirement
All PRs must complete the documentation checklist.

Example:

[ ] API docs updated
[ ] database docs updated
[ ] architecture docs updated
[ ] environment docs updated
Responsibility
The developer submitting the PR is responsible for updating the documentation.

Reviewers must verify that documentation updates are included when required.