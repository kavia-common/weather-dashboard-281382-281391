import { useEffect, useRef, useState } from "react";
import { getForecast } from "../services/weatherApi";

// PUBLIC_INTERFACE
export function useForecast(city, options = {}) {
  /**
   * Hook to fetch 5-day forecast for a city with loading/error/data state and auto-cancellation.
   * Options:
   *  - days: number (default 5) -> how many days to slice from the service response
   */
  const days = typeof options.days === "number" ? options.days : 5;

  const [data, setData] = useState(null); // array of day objects or null
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!city || !city.trim()) {
      setData(null);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    getForecast(city.trim(), { signal: abortRef.current.signal })
      .then((res) => {
        const sliced = Array.isArray(res) ? res.slice(0, days) : [];
        setData(sliced);
        setStatus("success");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err);
        setStatus("error");
      });

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [city, days]);

  // PUBLIC_INTERFACE
  const refetch = () => {
    if (abortRef.current) abortRef.current.abort();
    // parent can toggle a key or change city to re-trigger; keeping simple/no-op here
  };

  return { data, status, error, refetch };
}
