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
  
  // Update the last updated time every minute
  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
    
    try {
      const interval = setInterval(() => {
        const now = new Date();
        const lastUpdate = new Date(lastUpdated);
        const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
        
        // If more than 60 minutes have passed, refresh the data
        if (diffMinutes >= 60) {
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
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error setting up refresh interval:', err);
      return () => {}; // Return empty cleanup function
    }
  }, [lastUpdated]);
  
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* Initialize hourly data refresh with error handling */}
        {!isLoading && <DataRefreshInitializer />}
        
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  <a href="/" className="hover:text-blue-100">Stock Advisor</a>
                </h1>
                <p className="text-blue-100 text-sm">Real-time stock recommendations</p>
              </div>
              <div className="text-right text-sm">
                <div>Data updates hourly</div>
                <div className="text-blue-100">
                  Last check: {new Date(lastUpdated).toLocaleTimeString()}
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
              <p>Stock Advisor © {new Date().getFullYear()}</p>
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
