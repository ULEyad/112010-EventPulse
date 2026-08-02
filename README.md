# EventPulse — Event Management Backend API

> ⚠️ **Before you do anything else:** rename this project folder and the
> `"name"` field in `package.json` to match the required naming convention:
> **`YourStudentID-EventPulse`**. Everything else in this README assumes
> that's already done.

JavaScript Backend Essentials — Level 4, Semester 2 capstone project. A
complete Node.js/Express/MongoDB backend for an event management platform,
covering all 7 project tasks: architecture, authentication, events API,
registrations, real-time announcements, validation/testing, and deployment.

## Tech stack

Express · Mongoose/MongoDB · JWT + bcryptjs · Socket.io · express-validator ·
Jest + Supertest + mongodb-memory-server · swagger-jsdoc + swagger-ui-express

## Project structure

```
config/          MongoDB connection
controllers/     Route handlers (business logic)
middleware/      requireAuth, requireRole, validate, central errorHandler
models/          User, Category, Event, Registration, Message (Mongoose schemas)
routes/          Express routers + Swagger JSDoc annotations
sockets/         Socket.io real-time announcements
utils/           AppError, asyncHandler
validators/      express-validator rule chains
seed/            Idempotent database seed script
tests/unit/      Jest unit tests (AppError, asyncHandler)
tests/integration/  Supertest + mongodb-memory-server tests (Events API)
postman/         Postman collection + shared environment
api/index.js     Vercel serverless entry point
vercel.json      Vercel deployment config
app.js           Express app (routes, middleware, Swagger, error handler)
server.js        HTTP + Socket.io server entry point (use this locally)
```

## 1. Local setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas or local) and a real JWT_SECRET
npm run seed     # creates Music/Tech/Sports categories, 3 sample events, 1 admin user
npm run dev      # http://localhost:5000
```

Seeded admin login: `admin@eventpulse.com` / `Admin@123` — **change or
remove this before sharing your repo publicly.**

- Swagger docs: `http://localhost:5000/api-docs`
- Health check: `http://localhost:5000/health`

## 2. Running tests

```bash
npm test
```

- `tests/unit` — AppError and asyncHandler, no database needed.
- `tests/integration` — spins up a real (temporary, in-memory) MongoDB via
  `mongodb-memory-server` and drives the Events API through Supertest:
  create/list/filter/paginate, 401 with no token, 403 for non-admins, 404 for
  a missing event, empty (not error) results for a no-match search.

**Note:** the first time `mongodb-memory-server` runs, it downloads a small
MongoDB binary from `fastdl.mongodb.org` and caches it — this needs internet
access once. It's cached after that, and this is exactly how it will behave
in GitHub Actions or any normal CI. (The sandbox this project was assembled
in blocks that download domain, so integration tests couldn't be executed
in *that* environment specifically — everything else, including all 6 unit
tests, was run and passed there. Run `npm test` on your own machine once to
confirm the integration suite too, and paste the output into your repo per
Task 6's "document the result" requirement.)

## 3. API overview

All 12 endpoints are fully documented (parameters, request bodies, response
codes) at `/api-docs` once the server is running. Summary:

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | – | role always defaults to `attendee` |
| POST | `/api/auth/login` | – | returns JWT `{ id, role }` |
| GET | `/api/events` | – | `category, city, startDate, endDate, search, sort(date\|registrations), order, page, limit` |
| POST | `/api/events` | admin | |
| GET | `/api/events/:id` | – | category populated |
| PATCH | `/api/events/:id` | admin | |
| DELETE | `/api/events/:id` | admin | |
| GET | `/api/events/:id/announcements` | any user | ordered by time |
| POST | `/api/registrations` | any user | `{ eventId }`; blocks duplicates + full events |
| GET | `/api/registrations/me` | any user | |
| DELETE | `/api/registrations/:id` | owner only | |
| GET | `/health` | – | server + DB connection state |

### Real-time announcements (Socket.io)

Not a REST endpoint — connect a Socket.io client with the JWT:

```js
const socket = io('http://localhost:5000', { auth: { token: '<JWT>' } });
socket.emit('joinEvent', eventId);
socket.on('announcement', (msg) => console.log(msg));

// admin only:
socket.emit('announce', { eventId, text: 'Doors open at 7pm!' });
```

Only sockets that joined `event:<id>` receive that event's announcements;
only a token with `role: admin` can broadcast. Every announcement is also
saved to MongoDB via the `Message` model, so `GET
/api/events/:id/announcements` shows the full history to anyone who joins
late.

## 4. Postman

Import both files from `postman/`:
`EventPulse.postman_collection.json` + `EventPulse.postman_environment.json`
(select the **EventPulse Environment** in the top-right environment picker).
Running **Auth → Login (Admin)** auto-saves the JWT into `{{token}}` for
every other request via a test script.

## 5. Deployment (Task 7)

**Database — MongoDB Atlas:**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access (0.0.0.0/0 for simplicity, or Vercel's IP ranges).
3. Copy the connection string into `MONGO_URI`.

**API — Vercel:**
1. Push this repo to GitHub (see Git workflow below).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables in the Vercel dashboard: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`. **Never commit real secrets** — `.env` is git-ignored, `.env.example` is the template.
4. Deploy. Vercel uses `vercel.json` + `api/index.js` automatically.

> **Socket.io + Vercel caveat:** Vercel serverless functions are stateless
> and don't hold a persistent connection open, so WebSocket-based real-time
> features don't work reliably there. `api/index.js` still serves the full
> REST API, `/health`, and `/api-docs` on Vercel as required. For the
> Socket.io announcements feature to work *in production too*, either run
> `server.js` on a host with a persistent Node process (Render, Railway,
> Fly.io, a VPS — all have generous free/low-cost tiers), or demo that piece
> locally. This is a real, common constraint of serverless platforms, not a
> bug — worth mentioning to your reviewer rather than leaving them to
> discover it.

**Verify after deploying:** `https://<your-app>.vercel.app/health` and
`/api-docs` should both load.

## 6. Git workflow (Task 7)

This project was scaffolded with structured commits already applied locally
(`git log --oneline` to see them) and tagged `v1.0.0`. To finish the
workflow yourself:

```bash
# create an empty repo on GitHub first (no README/license — this repo already has one), then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
git push origin v1.0.0

# open a Pull Request describing the work (either via GitHub's web UI,
# or the GitHub CLI once you have a feature branch merging into main):
gh pr create --title "EventPulse v1.0.0" --body "Implements Tasks 1-7: architecture, auth, events API, registrations, real-time announcements, validation/testing, deployment."
```

Keep using [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `test:`, `docs:`, `chore:`) for anything you add from here.

## 7. Sharing (Task 7)

Set the GitHub repo visibility so "anyone with the link can view" (or make
it public), and share both the repository link and the Vercel deployment
link.

## Design notes / deliberate choices

- **bcryptjs instead of native `bcrypt`** — identical hashing behavior, but
  pure JavaScript with no native compilation step, which avoids a common
  class of build failures on serverless platforms like Vercel.
- **Capacity + duplicate-registration checks** are done at the controller
  level (count-then-create) for clarity, backed by a unique `(user, event)`
  index at the database level as a hard safety net against duplicates. Under
  very high concurrency there's a small race window on the capacity check
  specifically; a MongoDB transaction would close it fully if you want to
  extend this further.
- **Search** uses case-insensitive regex on `name`/`description` rather than
  a MongoDB text index, so it matches partial words predictably and combines
  cleanly with the other filters/pagination in one aggregation pipeline.
