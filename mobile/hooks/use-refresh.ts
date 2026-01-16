/**
 * Custom Hook for Data Refresh Pattern
 * Reduces duplication in screens that need pull-to-refresh
 */

import { useState, useCallback } from 'react';

interface UseRefreshOptions {
  onRefresh: () => Promise<void> | void;
}

export function useRefresh({ onRefresh }: UseRefreshOptions) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
}
