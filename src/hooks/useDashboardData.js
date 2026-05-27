// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardRepository } from '../services/dashboardRepository';

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await dashboardRepository.getAll();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = () => loadData();

  return { data, loading, error, refetch };
}