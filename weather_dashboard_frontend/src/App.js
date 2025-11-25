import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useWeather } from './hooks/useWeather';
import { useForecast } from './hooks/useForecast';

// PUBLIC_INTERFACE
function App() {
  /** Main weather dashboard page with search, current conditions, and forecast. */
  const [theme, setTheme] = useState('light');
  const [cityInput, setCityInput] = useState('San Francisco');
  const [queryCity, setQueryCity] = useState('San Francisco');
  const { data, status, error } = useWeather(queryCity);
  const { data: forecast, status: forecastStatus, error: forecastError } = useForecast(queryCity, { days: 5 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const title = useMemo(() => {
    const loadingAny = status === 'loading' || forecastStatus === 'loading';
    const idleAll = status === 'idle' && forecastStatus === 'idle';
    const errorAny = status === 'error' || forecastStatus === 'error';
    if (idleAll) return 'Search for a city to get started';
    if (loadingAny) return `Fetching weather for "${queryCity}"...`;
    if (errorAny) return `We ran into an issue`;
    if (status === 'success') return `${data?.location?.name}, ${data?.location?.country}`;
    return '';
  }, [status, forecastStatus, queryCity, data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryCity(cityInput);
  };

  const isLoading = status === 'loading' || forecastStatus === 'loading';

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <header className="header">
        <form className="searchbar" onSubmit={handleSubmit} role="search" aria-label="City weather search">
          <input
            className="input"
            type="text"
            placeholder="Enter a city (e.g., London)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            aria-label="City"
          />
          <button className="btn" type="submit" aria-label="Search weather">Search</button>
        </form>
      </header>

      <main className="container" aria-live="polite" aria-busy={isLoading}>
        <h1 className="mt-16" style={{ textAlign: 'center' }}>{title}</h1>

        {(status === 'idle' && forecastStatus === 'idle') && (
          <section className="mt-24 card">
            <p className="small">Try searching for a city to view current conditions and the 5-day forecast.</p>
          </section>
        )}

        {isLoading && (
          <section className="mt-24 card">
            <div className="current">
              <div>
                <div className="skeleton" style={{ width: 220, height: 36, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 160 }} />
              </div>
              <div className="skeleton" style={{ width: 80, height: 48 }} />
            </div>
            <div className="forecast mt-16">
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="day" key={i}>
                  <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 16 }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {(status === 'error' || forecastStatus === 'error') && (
          <section className="mt-24 card" role="alert">
            <p className="error">Error: {error?.message || forecastError?.message || 'Unable to fetch weather.'}</p>
            <button className="btn retry mt-16" onClick={() => setQueryCity(prev => prev)} aria-label="Retry">
              Retry
            </button>
          </section>
        )}

        {status === 'success' && data && (
          <>
            <section className="mt-24 card" aria-label="Current conditions">
              <div className="current">
                <div>
                  <div className="temp">
                    {data.current.icon} {Math.round(data.current.temperature)}{data.current?.units?.temperature || '°C'}
                  </div>
                  <div className="meta">
                    {data.current.description} • Wind {Math.round(data.current.windspeed)} {data.current?.units?.windspeed || 'km/h'}
                  </div>
                </div>
                <div className="bold">{new Date(data.current.time).toLocaleString()}</div>
              </div>
            </section>

            <section className="mt-16" aria-label="Forecast">
              {!forecast || forecast.length === 0 ? (
                <div className="card">
                  <p className="small">No forecast data available.</p>
                </div>
              ) : (
                <div className="forecast">
                  {forecast.map((d) => (
                    <div key={d.date} className="day" aria-label={`Forecast for ${d.date}`}>
                      <div style={{ fontSize: 24 }}>{d.icon}</div>
                      <div className="bold" style={{ marginTop: 6 }}>
                        {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </div>
                      <div className="small" style={{ marginTop: 4 }}>{d.description}</div>
                      <div className="small" style={{ marginTop: 6 }}>
                        {Math.round(d.tMin)}° / <span className="bold">{Math.round(d.tMax)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
