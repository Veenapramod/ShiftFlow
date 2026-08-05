# ShiftFlow Interview Notes

## 30-second explanation

ShiftFlow is a full-stack workforce scheduling dashboard inspired by my experience working in shift operations. Managers can maintain a team directory, schedule employees by work area, prevent overlapping shifts, and see labour hours and estimated labour cost for a selected day. I built the frontend with React and TypeScript, the API with Express, and the local data layer with SQLite.

## Technical decisions

- **React and TypeScript:** reusable UI components and compile-time type checking.
- **Express:** a small REST API that is quick to explain and test.
- **SQLite:** zero-configuration relational storage suitable for an MVP.
- **Server-side conflict validation:** prevents invalid overlapping shifts even if a different frontend calls the API.
- **npm workspaces:** one repository with separate client and server packages.
- **GitHub Actions:** every push and pull request is type-checked and built.

## Challenge to discuss

The most important scheduling rule was overlap prevention. I modelled shifts with date, start time, and end time, then queried for any existing shift where the new start was before the existing end and the new end was after the existing start. I kept this validation in the API so the business rule is enforced consistently.

## Honest limitations

Version 1.0 does not include authentication, overnight shifts, employee self-service, notifications, or payroll integration. Those features were excluded to keep the MVP deliverable within three days.
