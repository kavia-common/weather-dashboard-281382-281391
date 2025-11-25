//
// Weather API service layer
// Centralizes network requests and response mapping.
// Reads base URL and API key from environment variables.
//
// Environment variables:
// - process.env.REACT_APP_API_BASE (optional): override base URL
// - process.env.REACT_APP_WEATHER_API_KEY (optional): API key if provider requires it
//

const DEFAULT_BASE = process.env.REACT_APP_API_BASE?.trim()
  ? process.env.REACT_APP_API_BASE.trim().replace(/\/+$/, "")
  : "https://geocoding-api.open-meteo.com"; // default to free, keyless Open-Meteo geocoding

const WEATHER_BASE = process.env.REACT_APP_API_BASE?.trim()
  ? process.env.REACT_APP_API_BASE.trim().replace(/\/+$/, "")
  : "https://api.open-meteo.com";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY?.trim() || "";

// Map common weather codes to a readable description and simple icon
const weatherCodeMap = {
  0: { desc: "Clear sky", icon: "☀️" },
  1: { desc: "Mainly clear", icon: "🌤️" },
  2: { desc: "Partly cloudy", icon: "⛅" },
  3: { desc: "Overcast", icon: "☁️" },
  45: { desc: "Fog", icon: "🌫️" },
  48: { desc: "Depositing rime fog", icon: "🌫️" },
  51: { desc: "Light drizzle", icon: "🌦️" },
  53: { desc: "Moderate drizzle", icon: "🌦️" },
  55: { desc: "Dense drizzle", icon: "🌦️" },
  61: { desc: "Slight rain", icon: "🌧️" },
  63: { desc: "Moderate rain", icon: "🌧️" },
  65: { desc: "Heavy rain", icon: "🌧️" },
  71: { desc: "Slight snow", icon: "🌨️" },
  73: { desc: "Moderate snow", icon: "🌨️" },
  75: { desc: "Heavy snow", icon: "🌨️" },
  95: { desc: "Thunderstorm", icon: "⛈️" },
  96: { desc: "Thunderstorm with hail", icon: "⛈️" },
  99: { desc: "Thunderstorm with heavy hail", icon: "⛈️" },
};

/**
 * Internal helper to run fetch with AbortController and query params.
 */
async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, { signal, headers: buildHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  // If an API requires a key via header, uncomment and map accordingly.
  // if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

/**
 * Resolve city name to coordinates via Open-Meteo Geocoding API (free, no key).
 * Returns { name, country, latitude, longitude }
 */
// PUBLIC_INTERFACE
export async function searchCity(city, { signal } = {}) {
  /** Search for a city and return the best match with coordinates. */
  const q = encodeURIComponent(city);
  const url = `${DEFAULT_BASE}/v1/search?name=${q}&count=1&language=en&format=json`;
  const data = await fetchJson(url, { signal });
  const first = data?.results?.[0];
  if (!first) throw new Error("City not found");
  return {
    name: first.name,
    country: first.country,
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

/**
 * Get current weather and small multi-day forecast from Open-Meteo (free).
 * Returns { current: {...}, forecast: [{ date, tMax, tMin, code, desc, icon }]}
 */
// PUBLIC_INTERFACE
export async function getWeatherByCoordinates(lat, lon, { signal } = {}) {
  /** Fetch current weather and forecast for coordinates. */
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: "true",
    daily: "weathercode,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });
  const url = `${WEATHER_BASE}/v1/forecast?${params.toString()}`;
  const data = await fetchJson(url, { signal });

  const currentCode = data?.current_weather?.weathercode ?? null;
  const currentMapped = weatherCodeMap[currentCode] || { desc: "N/A", icon: "❓" };

  const current = {
    temperature: data?.current_weather?.temperature ?? null,
    windspeed: data?.current_weather?.windspeed ?? null,
    winddirection: data?.current_weather?.winddirection ?? null,
    time: data?.current_weather?.time ?? null,
    weathercode: currentCode,
    description: currentMapped.desc,
    icon: currentMapped.icon,
  };

  const days = (data?.daily?.time || []).map((date, idx) => {
    const code = data?.daily?.weathercode?.[idx] ?? null;
    const map = weatherCodeMap[code] || { desc: "N/A", icon: "❓" };
    return {
      date,
      tMax: data?.daily?.temperature_2m_max?.[idx] ?? null,
      tMin: data?.daily?.temperature_2m_min?.[idx] ?? null,
      code,
      description: map.desc,
      icon: map.icon,
    };
  });

  return { current, forecast: days };
}

/**
 * Convenience method: get current/forecast by city name.
 */
// PUBLIC_INTERFACE
export async function getCurrentWeather(city, { signal } = {}) {
  /** Get weather by city: resolves coordinates then fetches weather data. */
  const coords = await searchCity(city, { signal });
  const weather = await getWeatherByCoordinates(coords.latitude, coords.longitude, { signal });
  return { location: coords, ...weather };
}

/**
 * getForecast(city) as a semantic alias for multi-day forecast.
 */
// PUBLIC_INTERFACE
export async function getForecast(city, { signal } = {}) {
  /** Get forecast for a given city; returns an array of days. */
  const { forecast } = await getCurrentWeather(city, { signal });
  return forecast;
}
