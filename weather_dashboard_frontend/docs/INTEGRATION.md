# Weather API Integration

This frontend integrates with a weather provider via a dedicated service layer using `fetch` and an `AbortController`. By default, it uses free, keyless Open-Meteo endpoints.

## Files

- `src/services/weatherApi.js`: All network logic and response mapping:
  - searchCity(city)
  - getWeatherByCoordinates(lat, lon)
  - getCurrentWeather(city)
  - getForecast(city)
- `src/hooks/useWeather.js`: Hook that manages `loading/error/data` and cancels requests on city change.
- `src/App.js`: Presentational components that call the hook and render UI, loading skeletons, and errors.

## Configuration

Environment variables (create `.env` from `.env.example`):

- `REACT_APP_API_BASE` (optional): Base URL for the weather API. If not provided, defaults to Open-Meteo (`https://geocoding-api.open-meteo.com` for geocoding and `https://api.open-meteo.com` for forecast).
- `REACT_APP_WEATHER_API_KEY` (optional): API key if your provider requires one. Not needed for Open-Meteo.

Notes:
- Do not hardcode secrets in code.
- If your provider needs an API key in headers or query params, update `buildHeaders()` or append to the request URLs.

## Running

1. Copy `.env.example` to `.env` and set variables if needed.
2. Install dependencies: `npm install`
3. Start the app: `npm start`
4. Visit http://localhost:3000

## Theming

The "Ocean Professional" theme uses:
- Primary: `#2563EB` (blue)
- Secondary/Success: `#F59E0B` (amber)
- Error: `#EF4444`
- Background: `#f9fafb`, Surface: `#ffffff`, Text: `#111827`

UI follows a modern style with rounded cards, subtle shadows, and responsive layout.

## Accessibility

- Search form uses `role="search"` and labeled controls.
- Live regions via `aria-live="polite"` for loading updates.
- Buttons and sections include descriptive `aria-label`s.

## Notes

- The hook cancels in-flight requests on city changes to prevent race conditions.
- If you switch to another API, ensure the response mapping still produces:
  - `data.current = { temperature, windspeed, time, description, icon }`
  - `data.forecast = [{ date, tMax, tMin, description, icon }, ...]`
