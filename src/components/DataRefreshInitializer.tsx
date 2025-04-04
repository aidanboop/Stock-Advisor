/**
 * Component to initialize real-time data refresh on application startup
 */

'use client';

import { useEffect, useState } from 'react';
import { startRealTimeRefresh } from '../lib/utils/dataRefresh';

// Define the return type of startRealTimeRefresh function
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
      // Start real-time refresh when component mounts (30 second intervals)
      const refreshController = startRealTimeRefresh(() => {
        // Convert to EST for consistency
        const estTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York'
        });
        
        setLastRefresh(new Date().toISOString());
        setStatus('active');
        
        console.log(`[${estTime}] Real-time data refresh completed`);
      }, 30) as RefreshController; // 30 second refresh interval

      // Store the controller for cleanup
      setController(refreshController);
      
      // Set initial status
      setStatus('active');
      
      // Force initial refresh
      refreshController.forceRefresh();
    } catch (error) {
      console.error('Failed to initialize real-time data refresh:', error);
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
