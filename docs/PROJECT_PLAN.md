# ShiftFlow: 3-Day Build Plan

## Scope guardrail

Version 1.0 contains employee management, daily shift scheduling, overlap prevention, area coverage, labour-hour reporting, and estimated labour cost. Authentication, payroll integration, notifications, and drag-and-drop scheduling are deliberately postponed.

## Day 1: Foundation and API

- Create the GitHub repository and project board.
- Scaffold the npm workspaces.
- Build the Express API and SQLite schema.
- Add employee and shift endpoints.
- Add input validation and overlap prevention.
- Seed the database and test the endpoints.

Target commits:

- `chore: initialise ShiftFlow monorepo`
- `feat(api): add employee and shift database schema`
- `feat(api): add scheduling endpoints and conflict validation`

## Day 2: React interface

- Build the sidebar and responsive shell.
- Add dashboard summary cards.
- Add shift creation and daily rota views.
- Add employee management.
- Connect all forms to the API.
- Test empty, success, and error states.

Target commits:

- `feat(ui): build responsive dashboard shell`
- `feat(schedule): connect shift form and daily rota`
- `feat(team): add employee management interface`

## Day 3: Portfolio polish

- Test overlap prevention and deletion flows.
- Improve mobile styles and accessibility labels.
- Add README screenshots and architecture notes.
- Add GitHub Actions CI.
- Open and merge one pull request.
- Tag `v1.0.0` and pin the repository on your profile.

Target commits:

- `fix: improve form errors and responsive layout`
- `ci: add type-check and production build workflow`
- `docs: add screenshots, setup guide and project decisions`
