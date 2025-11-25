# Weather Dashboard (React)

A lightweight weather dashboard with a modern "Ocean Professional" theme. Features a city search, current conditions, and multi-day forecast with loading and error states.

## Quick Start

1. Copy `.env.example` to `.env` (optional to change API base/key)
2. Install deps: `npm install`
3. Start: `npm start` (http://localhost:3000)

See `docs/INTEGRATION.md` for configuration details.

## Features

- Dedicated API service (fetch + AbortController), logic separated from UI
- Hook-based data fetching (`useWeather`)
- Ocean Professional theme: blue/amber accents, rounded cards, subtle shadows
- Loading skeletons, errors with retry
- Responsive and accessible

## Scripts

- `npm start` - dev server
- `npm test` - tests
- `npm run build` - production build
