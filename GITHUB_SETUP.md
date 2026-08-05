# Exact GitHub Setup

## 1. Install, test, and create the local repository

From the folder containing `shiftflow`:

```bash
cd shiftflow
npm install
npm run seed
npm run check
npm run build

git init -b main
git add .
git commit -m "chore: initialise ShiftFlow monorepo"
```

`npm install` creates `package-lock.json`. Commit that file so the GitHub Actions workflow can use `npm ci` reliably.

## 2. Create the GitHub repository

On GitHub, select **New repository** and use:

- Repository name: `shiftflow`
- Description: `Full-stack employee scheduling and labour planning dashboard built with React, TypeScript, Express and SQLite.`
- Visibility: Public
- Do not initialise it with a README, license, or `.gitignore` because these already exist locally.

Then connect and push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/shiftflow.git
git remote -v
git push -u origin main
```

With GitHub CLI, the shorter alternative is:

```bash
gh auth login
gh repo create shiftflow --public --source=. --remote=origin --push
```

## 3. Create the development issues

Create these GitHub Issues:

1. `Build SQLite employee and shift schema`
2. `Create employee CRUD API`
3. `Create shift scheduling API`
4. `Prevent overlapping employee shifts`
5. `Build responsive dashboard layout`
6. `Connect schedule form to API`
7. `Add daily labour summary`
8. `Add README screenshots and demo instructions`

Use labels: `backend`, `frontend`, `enhancement`, `documentation`, and `bug`.

## 4. Use feature branches and pull requests

Example API branch:

```bash
git checkout -b feature/scheduling-api
# Make or review API changes
git add server
git commit -m "feat(api): add scheduling endpoints and overlap validation"
git push -u origin feature/scheduling-api
```

Open a pull request into `main`, describe the change, then merge it.

Example UI branch:

```bash
git checkout main
git pull
git checkout -b feature/dashboard-ui
# Make or review UI changes
git add client
git commit -m "feat(ui): build responsive scheduling dashboard"
git push -u origin feature/dashboard-ui
```

## 5. Recommended final commit sequence

```text
chore: initialise ShiftFlow monorepo
feat(api): add employee and shift database schema
feat(api): add scheduling endpoints and conflict validation
feat(ui): build responsive dashboard shell
feat(schedule): connect shift form and daily rota
feat(team): add employee management interface
fix: improve validation messages and mobile layout
ci: add type-check and build workflow
docs: add setup guide, screenshots and interview notes
```

Do not create all commits after everything is finished. Commit at each milestone so the history reflects genuine development.

## 6. Configure the repository About section

Add:

- Website: your live demo when available
- Topics: `react`, `typescript`, `express`, `sqlite`, `workforce-management`, `scheduling`, `full-stack`, `portfolio-project`
- Enable Issues

## 7. Add screenshots

Run the application with seeded data and capture:

- Dashboard
- Schedule form
- Team page
- Overlap error

Place the images in `docs/screenshots/`, update the README, and commit:

```bash
git add README.md docs/screenshots
git commit -m "docs: add ShiftFlow product screenshots"
git push
```

## 8. Create the first release

After the GitHub Actions workflow passes:

```bash
git tag -a v1.0.0 -m "ShiftFlow MVP"
git push origin v1.0.0
```

On GitHub, create a release from `v1.0.0` and summarise the MVP features.

## 9. Pin it to your profile

Open your GitHub profile, select **Customize your pins**, and pin `shiftflow` near the first position.
