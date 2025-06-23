
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllEventsCombined } from '@/lib/data';
import type { SportEvent } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (!query) {
      return NextResponse.json([]);
    }

    // Fetch events using the comprehensive, cached, and deduplicated function
    const uniqueEvents = await getAllEventsCombined();
    
    const filteredEvents = uniqueEvents.filter(event => {
      const titleMatch = event.title.toLowerCase().includes(query);
      const sportMatch = event.sport.toLowerCase().includes(query);
      const leagueMatch = event.league.toLowerCase().includes(query);
      const homeTeamMatch = event.teams.home.name.toLowerCase().includes(query);
      const awayTeamMatch = event.teams.away.name.toLowerCase().includes(query);
      return titleMatch || sportMatch || leagueMatch || homeTeamMatch || awayTeamMatch;
    });

    // Limit results for suggestions
    const MAX_RESULTS = 10;
    return NextResponse.json(filteredEvents.slice(0, MAX_RESULTS));

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}

