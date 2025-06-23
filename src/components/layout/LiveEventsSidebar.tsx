
'use client';

import type { SportEvent } from '@/lib/types';
import Link from 'next/link';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { RadioTower, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LiveEventsSidebar() {
  const [liveEvents, setLiveEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true); // Manages loading state, true for initial load

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component is unmounted

    const fetchLiveEventsData = async () => {
      try {
        const response = await fetch('/api/live-events');
        if (!isMounted) return; // Don't update if component unmounted

        if (!response.ok) {
          console.error('Failed to fetch live events:', response.statusText);
          setLiveEvents([]); // Clear events or handle error appropriately
          return;
        }
        const data: SportEvent[] = await response.json();
        setLiveEvents(data);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching live events:', error);
          setLiveEvents([]); // Clear events or handle error
        }
      }
    };

    const initialLoad = async () => {
      if (isMounted) setLoading(true);
      await fetchLiveEventsData();
      if (isMounted) setLoading(false);
    };

    initialLoad(); // Perform the initial fetch

    // Set up polling for subsequent updates
    const intervalId = setInterval(() => {
      fetchLiveEventsData(); // Fetch updates, but don't set global loading state for these polls
    }, 30000); // Poll every 30 seconds

    // Cleanup function
    return () => {
      isMounted = false; // Set flag to false when component unmounts
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount

  // Display loader only during initial load and if no events are yet available
  if (loading && liveEvents.length === 0) {
    return (
      <SidebarMenuItem>
        <div className="px-3 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading live...
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center h-8 w-8">
           <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </SidebarMenuItem>
    );
  }

  // Display message if not loading and no live events are found
  if (!loading && liveEvents.length === 0) {
    return (
      <SidebarMenuItem>
        <div className="px-3 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          No live events.
        </div>
        {/* Optional: Icon for collapsed view when no live events */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center h-8 w-8">
           {/* <RadioTower className="h-5 w-5 text-sidebar-foreground/50" /> */}
        </div>
      </SidebarMenuItem>
    );
  }

  // Display live events
  return (
    <>
      {liveEvents.map((event) => (
        <SidebarMenuItem key={event.id}>
          <SidebarMenuButton
            asChild
            tooltip={{ children: event.title, side: "right", align: "center" }}
          >
            <Link href={`/events/${event.slug}`}>
              <RadioTower className="h-4 w-4 text-destructive animate-pulse" />
              <span className="truncate">{event.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
