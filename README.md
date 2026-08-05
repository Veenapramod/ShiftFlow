# ShiftFlow

A full-stack employee scheduling and labour planning dashboard built for fast-paced shift operations.

> **Portfolio scope:** This is a focused MVP designed and implemented in three days. It demonstrates full-stack CRUD, relational data modelling, business-rule validation, responsive UI design, and continuous integration.

## Features

- Add and remove employees with roles, availability, and hourly rates.
- Build a daily rota by employee, time, and work area.
- Prevent overlapping shifts for the same employee.
- View active employees, scheduled shifts, labour hours, and estimated labour cost.
- Review area allocation for the selected date.
- Use seeded demo data for a quick recruiter walkthrough.
- Run client and server together from one npm workspace.

## Tech stack

- React and TypeScript
- Vite
- Node.js and Express
- SQLite with better-sqlite3
- Zod validation
- GitHub Actions

## Architecture

```text
React client
    |
    | REST / JSON
    v
Express API
    |
    | SQL queries and validation
    v
SQLite database
```

## Local setup

### Requirements

- Node.js 20.19 or newer
- npm
- Git

### Install and run

```bash
git clone https://github.com/YOUR-USERNAME/shiftflow.git
cd shiftflow
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173`.

The API runs at `http://localhost:4000`. Vite proxies `/api` requests to the API during development.

### Production build

```bash
npm run check
npm run build
npm start
```

After the build, Express serves the compiled React application at `http://localhost:4000`.

## Useful commands

```bash
npm run dev      # Run client and server
npm run seed     # Reset and seed local demo data
npm run check    # Type-check both workspaces
npm run build    # Create production builds
npm start        # Start the production server
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/shifts?date=YYYY-MM-DD` | List shifts by date |
| POST | `/api/shifts` | Create shift |
| PUT | `/api/shifts/:id` | Update shift |
| DELETE | `/api/shifts/:id` | Delete shift |
| GET | `/api/dashboard?date=YYYY-MM-DD` | Daily summary |

## Core scheduling rule

ShiftFlow rejects overlapping shifts for the same employee. Two shifts overlap when:

```text
newStart < existingEnd AND newEnd > existingStart
```

The rule is enforced by the API rather than only in the browser.

## Screenshots

Add these before sharing the repository:

1. Dashboard with seeded data.
2. Schedule page with the shift form and rota.
3. Overlap validation error.
4. Mobile responsive view.

Save them in `docs/screenshots/` and embed them here.

## Roadmap

- Employee login and manager authentication
- Weekly calendar view
- Drag-and-drop shift editing
- Availability conflict warnings
- Shift swap requests
- PostgreSQL deployment
- Automated tests

## Project management

See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) for the three-day delivery plan and [`docs/INTERVIEW_NOTES.md`](docs/INTERVIEW_NOTES.md) for the technical explanation.

## Author

**Veena Pramod**  
BSc Computer Science graduate

## License

MIT
