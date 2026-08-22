# Poll Builder — Frontend

Vue 3 + Vite single-page app for the Poll Builder assignment. Talks to the
ASP.NET Core backend (ApiGateway → PollService / VoteService /
RealtimeService) entirely through the API Gateway, including live results
over SignalR.

## Stack

- Vue 3 (`<script setup>`) + Vue Router 4
- Vite
- `@microsoft/signalr` for the live results connection
- Plain CSS custom properties (no framework) — see `src/style.css`

## Project structure

```
src/
  api/          fetch wrapper + typed calls to PollService/VoteService
  realtime/     SignalR connection helper (joins a poll's result group)
  components/   AppHeader, PollCodeBadge, ResultBar
  views/        CreatePollView, VoteView, ResultsView, NotFoundView
  router/       route table
```

## Environment variables

The app reads one variable at build/run time:

| Variable              | Purpose                                    |
| ---------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL`    | Base URL of the deployed **API Gateway** (not any individual service) |

- `.env.development` → `http://localhost:5102` (matches the Gateway's dev `launchSettings.json`)
- `.env.production` → placeholder; **on Vercel this is overridden by a real
  Environment Variable in the project settings**, not by editing this file
- `.env.example` → reference for teammates

## Run locally

Requires the backend running locally first (ApiGateway on `5102`,
PollService on `5149`, VoteService on `5135`, RealtimeService on `5164` —
see the backend's `ocelot.json`).

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`, which is already in the Gateway's CORS
allow-list for Development.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally on :4173
```

## Docker

```bash
docker build -t pollbuilder-frontend \
  --build-arg VITE_API_BASE_URL=https://your-gateway.onrender.com .
docker run -p 8080:80 pollbuilder-frontend
```

Note: `VITE_API_BASE_URL` is baked into the JS bundle at **build** time
(Vite/static SPA behavior), not read at container start. If the backend
URL changes, rebuild the image — don't just restart the container.

## How the pages talk to the backend

| Page | Calls |
| --- | --- |
| Create poll (`/`) | `POST /polls` |
| Vote (`/poll/:code`) | `GET /polls/:code`, `POST /polls/:code/vote` |
| Results (`/poll/:code/results`) | `GET /polls/:code/results`, then SignalR `ReceiveResults` on `/hubs/poll` (joins group `:code`) |

Votes rely on a `voter_token` cookie set by VoteService (`credentials:
'include'` on every request) — no login required, one vote per browser.

## Known gap

Backend's `PollService/appsettings.json` currently has a real Postgres
connection string (with password) committed to source. Move it to user
secrets / environment variables before making the repo public.
