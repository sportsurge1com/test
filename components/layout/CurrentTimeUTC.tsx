'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function CurrentTimeUTC() {
  const [timeUTC, setTimeUTC] = useState<string | null>(null);

  useEffect(() => {
    const updateUTCTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC', // Changed to UTC
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      setTimeUTC(formatter.format(now) + ' UTC'); // Changed suffix to UTC
    };

    // Set initial time immediately
    updateUTCTime();

    // Update time every minute
    const intervalId = setInterval(updateUTCTime, 60000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (!timeUTC) {
    // Fallback display while loading or if time is not yet set
    return (
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>--:-- -- UTC</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-xs text-muted-foreground mr-2">
      <Clock className="h-3.5 w-3.5" />
      <span>{timeUTC}</span>
    </div>
  );
}
