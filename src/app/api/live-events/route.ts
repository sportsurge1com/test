
import { NextResponse } from 'next/server';
import { getAllEventsCombined } from '@/lib/data';
import type { SportEvent } from '@/lib/types';

export async function GET() {
  try {
    const allEvents = await getAllEventsCombined();
    const liveEvents = allEvents.filter(event => event.status === 'live');
    return NextResponse.json(liveEvents);
  } catch (error) {
    console.error('API error fetching live events:', error);
    // In a production app, you might want to log this error to a monitoring service
    return NextResponse.json({ error: 'Failed to fetch live events' }, { status: 500 });
  }
}

// Optional: to ensure dynamic rendering and no caching on the API route itself if desired,
// though getAllEventsCombined has its own caching.
// If you want this API endpoint to always bypass Next.js Data Cache for its own response, uncomment:
// export const dynamic = 'force-dynamic';
