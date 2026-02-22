import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

const COOKIE_KEY  = 'analytics_filters';
const COOKIE_OPTS = { expires: 30, sameSite: 'Lax' }; // 30 days

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const DEFAULT_FILTERS = {
  start_date: todayMinus(30),
  end_date:   new Date().toISOString().slice(0, 10),
  age:        'all',
  gender:     'all',
};

export function useCookieFilters() {
  const [filters, setFiltersRaw] = useState(() => {
    try {
      const saved = Cookies.get(COOKIE_KEY);
      return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) } : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  // Persist to cookie whenever filters change
  useEffect(() => {
    Cookies.set(COOKIE_KEY, JSON.stringify(filters), COOKIE_OPTS);
  }, [filters]);

  const setFilters = useCallback((updater) => {
    setFiltersRaw((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersRaw(DEFAULT_FILTERS);
    Cookies.remove(COOKIE_KEY);
  }, []);

  return { filters, setFilters, resetFilters };
}
