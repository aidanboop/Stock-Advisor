'use client';

import { useState, useEffect } from 'react';
import DataRefreshInitializer from '../components/DataRefreshInitializer';
import './globals.css';

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEstTime, setCurrentEstTime] = useState<string>('');
  
  // Update data in real-time
  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
    
    try {
      // Function to convert time to EST
      const getEstTime = () => {
        const now = new Date();
        return now.toLocaleString('en-US', {
          timeZone: 'America/New_York',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        });
      };
      
      // Update EST time every second
      const timeInterval = setInterval(() => {
        setCurrentEstTime(getEstTime());
      }, 1000);
      
      // Refresh data every 30 seconds instead of hourly
      const dataInterval = setInterval(() => {
        fetch('/api/refresh')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setLastUpdated(data.refreshedAt);
            }
          })
          .catch(err => {
            console.error('Error refreshing data:', err);
            // Don't set error state here to avoid UI disruption
          });
      }, 30000); // Check every 30 seconds
      
      // Initial data fetch on mount
      fetch('/api/refresh')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLastUpdated(data.refreshedAt);
          }
        })
        .catch(err => {
          console.error('Error refreshing data:', err);
        });
      
      return () => {
        clearInterval(timeInterval);
        clearInterval(dataInterval);
      };
    } catch (err) {
      console.error('Error setting up refresh interval:', err);
      return () => {}; // Return empty cleanup function
    }
  }, []);
  
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* Initialize real-time data refresh with error handling */}
        {!isLoading && <DataRefreshInitializer />}
        
        {/* Header */}
        <header className="bg-blue-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  <a href="/" className="hover:text-blue-100">Aidan's Stock Advisor</a>
                </h1>
                <p className="text-blue-100 text-sm">Real-time stock recommendations</p>
              </div>
              <div className="text-right text-sm">
                <div>Real-time updates (EST)</div>
                <div className="text-blue-100 font-medium">
                  Current time: {currentEstTime}
                </div>
                <div className="text-xs text-blue-200">
                  Last update: {new Date(lastUpdated).toLocaleTimeString('en-US', {timeZone: 'America/New_York'})} EST
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Error message if needed */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-7xl mx-auto mt-2">
            <p>{error}</p>
          </div>
        )}
        
        {/* Main content */}
        {children}
        
        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>Aidan's Stock Advisor © {new Date().getFullYear()}</p>
              <p className="mt-1">
                Data provided by Yahoo Finance API. This application is for educational purposes only.
              </p>
              <p className="mt-1">
                Recommendations are based on technical indicators and insider trading analysis.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
