import { useState, useEffect, useCallback } from "react";

/* Debounce hook - delays search until user stops typing */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function matchesText(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

export function getEventDisplayTitle(event) {
  return event?.title || event?.name || event?.shortName || "";
}

export function eventMatchesQuery(event, query) {
  return (
    matchesText(event?.title, query) ||
    matchesText(event?.name, query) ||
    matchesText(event?.shortName, query) ||
    matchesText(event?.description, query) ||
    matchesText(event?.category, query) ||
    matchesText(event?.location, query) ||
    event?.tags?.some?.((tag) => matchesText(tag, query))
  );
}

/* Main search hook */
export function useSearch(activities, events) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'activities' | 'events'
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const q = debouncedQuery.toLowerCase();
    let all = [];

    /* Search activities */
    if (filter === "all" || filter === "activities") {
      const actRes = Object.entries(activities || {})
        .filter(
          ([key, a]) =>
            matchesText(key, q) ||
            matchesText(a?.title, q) ||
            matchesText(a?.description, q) ||
            matchesText(a?.subtitle, q) ||
            matchesText(a?.tagline, q)
        )
        .map(([key, a]) => ({
          id: key,
          type: "activity",
          title: a?.title || key,
          description: a?.description || a?.subtitle || a?.tagline || "",
          key,
        }));
      all = [...all, ...actRes];
    }

    /* Search events */
    if (filter === "all" || filter === "events") {
      const evRes = (events || [])
        .filter((ev) => eventMatchesQuery(ev, q))
        .map((ev) => {
          const title = getEventDisplayTitle(ev);

          return {
            id: ev.id || title,
            type: "event",
            title,
            description: ev.description || ev.location || "",
            date: ev.date,
            event: ev,
          };
        });
      all = [...all, ...evRes];
    }

    setResults(all);
  }, [debouncedQuery, filter, activities, events]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilter("all");
    setResults([]);
  }, []);

  return { query, setQuery, filter, setFilter, results, clearSearch };
}
