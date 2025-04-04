/**
 * Component to initialize real-time data refresh on application startup
 * Enhanced with error handling and toast notifications
 */

'use client';

import { useEffect, useState } from 'react';
import { startRealTimeRefresh } from '../lib/utils/dataRefresh';
import { useToast } from '../hooks/use-toast';

// Define the return type of startRealTimeRefresh function
interface RefreshController {
  stop: () => void;
  forceRefresh: () => Promise<RefreshResult>;
  getStatus: () => RefreshStatus;
}

interface RefreshResult {
  status: 'success' | 'error' | 'rate_limited';
  message?: string;
  error?: string;
  symbols?: string[];
}

interface RefreshStatus {
  active: boolean;
  apiCallsInLastMinute: number;
  nextReset: string;
  canMakeApiCall: boolean;
}

export default function DataRefreshInitializer() {
  const [status, setStatus] = useState<string>('initializing');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [controller, setController] = useState<RefreshController | null>(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Start real-time refresh when component mounts (60 second intervals)
      const refreshController = startRealTimeRefresh((result: RefreshResult) => {
        // Convert to EST for consistency
        const estTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York'
        });
        
        setLastRefresh(new Date().toISOString());
        
        // Handle different refresh results
        if (result.status === 'success') {
          setStatus('active');
          setErrorCount(0); // Reset error count on success
          
          // Only show toast for manually triggered refreshes
          if (result.symbols && result.symbols.length > 0) {
            console.log(`[${estTime}] Real-time data refresh completed for ${result.symbols.length} symbols`);
          }
        } 
        else if (result.status === 'rate_limited') {
          setStatus('rate_limited');
          console.warn(`[${estTime}] Data refresh rate limited: ${result.message}`);
          
          // Show toast only occasionally for rate limiting
          if (Math.random() < 0.3) { // Only show ~30% of the time to avoid spamming
            toast({
              title: "Rate limit reached",
              description: "Using cached data while waiting for API rate limit to reset",
              variant: "default",
            });
          }
        }
        else if (result.status === 'error') {
          setStatus('error');
          setErrorCount(prev => prev + 1);
          console.error(`[${estTime}] Real-time data refresh error: ${result.error}`);
          
          // Only show error toast if errors are persistent (3+ in a row)
          if (errorCount >= 2) {
            toast({
              title: "Data refresh error",
              description: "Using cached data while resolving API connection issues",
              variant: "destructive",
            });
          }
        }
      }, 60) as RefreshController; // 60 second refresh interval

      // Store the controller for cleanup and manual refreshes
      setController(refreshController);
      
      // Set initial status
      setStatus('active');
      
      // Force initial refresh
      refreshController.forceRefresh().then(result => {
        if (result.status === 'error') {
          toast({
            title: "Initial data fetch error",
            description: "Using cached data. Will retry shortly.",
            variant: "destructive",
          });
        }
      });
      
      // Periodically check API status
      const statusInterval = setInterval(() => {
        if (refreshController) {
          const status = refreshController.getStatus();
          // Log status periodically for debugging
          console.log(`API status: ${status.apiCallsInLastMinute}/5 calls. Reset at ${status.nextReset}`);
        }
      }, 30000); // Check every 30 seconds
      
      // Clean up when component unmounts
      return () => {
        if (controller) {
          try {
            controller.stop();
          } catch (error) {
            console.error('Error stopping refresh controller:', error);
          }
        }
        clearInterval(statusInterval);
      };
    } catch (error) {
      console.error('Failed to initialize real-time data refresh:', error);
      setStatus('error');
      
      toast({
        title: "Data refresh initialization failed",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
      
      // Return empty cleanup function
      return () => {};
    }
  }, [toast, errorCount]);

  // Expose manual refresh function to parent if needed via React Context
  
  // This component doesn't render anything visible
  return null;
}
