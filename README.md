# Poll Builder — Frontend

Vue 3 + Vite SPA. UI redesigned (Mentimeter / StrawPoll style).

## Setup

```bash
npm install
```

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API Gateway base URL |

- `.env.development` → local gateway
- `.env.production` → Render gateway (override on Vercel if needed)

## Run

```bash
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Deploy (Vercel)

Push to GitHub; set `VITE_API_BASE_URL` in project Environment Variables if needed.
