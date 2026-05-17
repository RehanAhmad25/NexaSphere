import { useState, useEffect, useCallback } from 'react';

/* Debounce hook - delays search until user stops typing */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/* Main search hook */
export function useSearch(activities, events) {
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('all'); // 'all' | 'activities' | 'events'
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
    if (filter === 'all' || filter === 'activities') {
      const actRes = Object.entries(activities || {})
        .filter(([key, a]) =>
          key.toLowerCase().includes(q) ||
          a?.title?.toLowerCase().includes(q) ||
          a?.description?.toLowerCase().includes(q) ||
          a?.subtitle?.toLowerCase().includes(q) ||
          a?.tagline?.toLowerCase().includes(q)
        )
        .map(([key, a]) => ({
          id:          key,
          type:        'activity',
          title:       a?.title || key,
          description: a?.description || a?.subtitle || a?.tagline || '',
          key,
        }));
      all = [...all, ...actRes];
    }

    /* Search events */
    if (filter === 'all' || filter === 'events') {
      const evRes = (events || [])
        .filter(ev =>
          ev?.title?.toLowerCase().includes(q) ||
          ev?.description?.toLowerCase().includes(q) ||
          ev?.category?.toLowerCase().includes(q) ||
          ev?.location?.toLowerCase().includes(q) ||
          ev?.tags?.some?.(t => t.toLowerCase().includes(q))
        )
        .map(ev => ({
          id:          ev.id || ev.title,
          type:        'event',
          title:       ev.title,
          description: ev.description || ev.location || '',
          date:        ev.date,
          event:       ev,
        }));
      all = [...all, ...evRes];
    }

    setResults(all);
  }, [debouncedQuery, filter, activities, events]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilter('all');
    setResults([]);
  }, []);

  return { query, setQuery, filter, setFilter, results, clearSearch };
}