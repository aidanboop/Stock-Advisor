/**
 * Component to initialize data refresh on application startup
 */

'use client';

import { useEffect, useState } from 'react';
import { startHourlyRefresh } from '../lib/utils/dataRefresh';

// Define the return type of startHourlyRefresh function
interface RefreshController {
  stop: () => void;
  forceRefresh: () => Promise<void>;
}

export default function DataRefreshInitializer() {
  const [status, setStatus] = useState('initializing');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [controller, setController] = useState<RefreshController | null>(null);

  useEffect(() => {
    try {
      // Start hourly refresh when component mounts
      const refreshController = startHourlyRefresh(() => {
        setLastRefresh(new Date().toISOString());
        setStatus('active');
      }) as RefreshController;

      // Store the controller for cleanup
      setController(refreshController);
      
      // Set initial status
      setStatus('active');
    } catch (error) {
      console.error('Failed to initialize data refresh:', error);
      setStatus('error');
    }

    // Clean up when component unmounts
    return () => {
      if (controller) {
        try {
          controller.stop();
        } catch (error) {
          console.error('Error stopping refresh controller:', error);
        }
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
