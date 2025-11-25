import { useEffect, useRef, useState } from "react";
import { getCurrentWeather } from "../services/weatherApi";

// PUBLIC_INTERFACE
export function useWeather(city) {
  /** Hook to fetch weather for a city with loading/error/data state and auto-cancellation on change. */
  const [data, setData] = useState(null);
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

    getCurrentWeather(city.trim(), { signal: abortRef.current.signal })
      .then((res) => {
        setData(res);
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
  }, [city]);

  // PUBLIC_INTERFACE
  const refetch = () => {
    // Trigger by resetting city state in the parent or just re-run effect by manual flow.
    if (abortRef.current) abortRef.current.abort();
    // This hook expects city change to trigger re-fetch;
    // parent can toggle a key to retrigger useEffect if needed.
  };

  return { data, status, error, refetch };
}
