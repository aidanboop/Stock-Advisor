/**
 * Component to initialize data refresh on application startup
 */

'use client';

import { useEffect, useState } from 'react';
import { startHourlyRefresh } from '../lib/utils/dataRefresh';

export default function DataRefreshInitializer() {
  const [status, setStatus] = useState('initializing');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    // Start hourly refresh when component mounts
    const refreshController = startHourlyRefresh(() => {
      setLastRefresh(new Date().toISOString());
      setStatus('active');
    });

    // Set initial status
    setStatus('active');

    // Clean up when component unmounts
    return () => {
      refreshController.stop();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
