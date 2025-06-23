import type { SportEvent, Sport, League } from './types';
import { Goal, Dribbble, Shield, Diamond, Award, Flag, Swords, CaseSensitive as TennisRacket, Users } from 'lucide-react';
import { fetchAllEspnEvents } from './espn-api';
import { fetchAllScores365Events } from './scores365-api';

export const sports: Sport[] = [
  { id: 'soccer', name: 'Soccer', slug: 'soccer', icon: Goal },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', icon: Dribbble },
  { id: 'american-football', name: 'NFL', slug: 'american-football', icon: Shield },
  { id: 'baseball', name: 'MLB', slug: 'baseball', icon: Diamond },
  { id: 'ice-hockey', name: 'NHL', slug: 'hockey', icon: Award }, // Slug updated
  { id: 'motor-racing', name: 'Motor Sports', slug: 'motor-sports', icon: Flag }, // Slug updated
  { id: 'golf', name: 'Golf', slug: 'golf', icon: Flag },
  { id: 'mma', name: 'MMA', slug: 'mma-ufc', icon: Swords }, // Slug updated
  { id: 'tennis', name: 'Tennis', slug: 'tennis', icon: TennisRacket },
  { id: 'boxing', name: 'Boxing', slug: 'boxing', icon: Shield },
  { id: 'wwe', name: 'WWE', slug: 'wrestling-wwe', icon: Users }, // Slug updated
];

export const leagues: League[] = [
  // Soccer
  { id: 'epl', name: 'Premier League', slug: 'premier-league', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', description: 'The top tier of English football.' },
  { id: 'laliga', name: 'La Liga', slug: 'la-liga', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', description: "Spain's premier professional football division." },
  { id: 'seriea', name: 'Serie A', slug: 'serie-a', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png' },
  { id: 'bundesliga', name: 'Bundesliga', slug: 'bundesliga', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },
  { id: 'ligue1', name: 'Ligue 1', slug: 'ligue-1', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png' },
  { id: 'ucl', name: 'UEFA Champions League', slug: 'uefa-champions-league', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png' },
  { id: 'uel', name: 'UEFA Europa League', slug: 'uefa-europa-league', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/601.png' },
  { id: 'mls', name: 'MLS', slug: 'mls', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/20.png' },
  { id: 'saudi-pro-league', name: 'Saudi Professional League', slug: 'saudi-professional-league', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/7931.png' },
  { id: 'liga-mx', name: 'Liga MX', slug: 'liga-mx', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/22.png' },
  { id: 'caf-champions-league', name: 'CAF Champions League', slug: 'caf-champions-league', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/600.png' },
  { id: 'copa-libertadores', name: 'Copa Libertadores', slug: 'copa-libertadores', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/603.png' },
  { id: 'FIFAClubWorldCup', name: 'FIFA Club World Cup', slug: 'fifa-club-world-cup', sportSlug: 'soccer', logoUrl: 'https://a.espncdn.com/i/leaguelogos/soccer/500/FIFA.CWC.png' },
  // Basketball
  { id: 'nba', name: 'NBA', slug: 'nba', sportSlug: 'basketball', logoUrl: 'https://a.espncdn.com/i/leaguelogos/sports/500/nba.png', description: "North America's premier basketball league." },
  // American Football
  { id: 'nfl', name: 'NFL', slug: 'nfl', sportSlug: 'american-football', logoUrl: 'https://a.espncdn.com/i/leaguelogos/sports/500/nfl.png', description: 'The premier American football league.' },
  // Baseball
  { id: 'mlb', name: 'MLB', slug: 'mlb', sportSlug: 'baseball', logoUrl: 'https://a.espncdn.com/i/leaguelogos/sports/500/mlb.png' },
  // Ice Hockey
  { id: 'nhl', name: 'NHL', slug: 'nhl', sportSlug: 'hockey', logoUrl: 'https://a.espncdn.com/i/leaguelogos/sports/500/nhl.png' }, // sportSlug updated
  // Motor Sports
  { id: 'f1', name: 'Formula 1', slug: 'formula-1', sportSlug: 'motor-sports', logoUrl: 'https://a.espncdn.com/i/leaguelogos/racing/500/f1.png'}, // sportSlug updated
  { id: 'indycar', name: 'IndyCar Series', slug: 'indycar-series', sportSlug: 'motor-sports', logoUrl: 'https://a.espncdn.com/i/leaguelogos/racing/500/irl.png'}, // sportSlug updated
  // Golf
  { id: 'pga', name: 'PGA Tour', slug: 'pga-tour', sportSlug: 'golf', logoUrl: 'https://a.espncdn.com/i/leaguelogos/golf/500/pga.png' },
  // MMA
  { id: 'ufc', name: 'UFC', slug: 'ufc', sportSlug: 'mma-ufc', logoUrl: 'https://a.espncdn.com/i/leaguelogos/mma/500/ufc.png' }, // sportSlug updated
  // Tennis
  { id: 'atp-delray', name: 'Delray Beach Open', slug: 'delray-beach-open', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=ATP' },
  { id: 'atp-rio', name: 'Rio Open', slug: 'rio-open', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=ATP' },
  { id: 'roland-garros-men', name: 'Roland Garros Men', slug: 'roland-garros-men', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=RG' },
  { id: 'roland-garros-women', name: 'Roland Garros Women', slug: 'roland-garros-women', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=RG' },
  { id: 'wimbledon-men', name: 'Wimbledon Men', slug: 'wimbledon-men', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=WIM' },
  { id: 'us-open-men', name: 'US Open Men', slug: 'us-open-men', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=USO' },
  { id: 'australian-open-men', name: 'Australian Open Men', slug: 'australian-open-men', sportSlug: 'tennis', logoUrl: 'https://placehold.co/64x64.png?text=AO' },
  // WWE
  { id: 'wwe-league', name: 'WWE Events', slug: 'wwe-events', sportSlug: 'wrestling-wwe', logoUrl: 'https://placehold.co/64x64.png?text=WWE'}, // sportSlug updated, added a placeholder league for WWE
];

// In-memory cache for combined events
let combinedEventsCache: SportEvent[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 1 * 60 * 1000; // 1 minute cache

export async function getAllEventsCombined(filters?: { sport?: string; league?: string }): Promise<SportEvent[]> {
  const now = Date.now();
  const useCache = !filters || (Object.keys(filters).length === 0);

  if (useCache && combinedEventsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    return combinedEventsCache;
  }
  if (!useCache && combinedEventsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    return filterEvents(combinedEventsCache, filters);
  }

  const espnPromise = fetchAllEspnEvents(filters?.sport).catch(e => { console.error("ESPN fetch error in getAllEventsCombined:", e); return []; });
  const scores365Promise = fetchAllScores365Events(filters?.sport).catch(e => { console.error("365Scores fetch error in getAllEventsCombined:", e); return []; });

  const [espnEventsData, scores365EventsData] = await Promise.all([espnPromise, scores365Promise]);

  const eventMap = new Map<string, SportEvent>();

  // Priority: ESPN -> 365Scores
  espnEventsData.forEach(event => {
    if (!eventMap.has(event.id)) {
      eventMap.set(event.id, event);
    }
  });

  scores365EventsData.forEach(event => {
    if (!eventMap.has(event.id)) {
      eventMap.set(event.id, event);
    }
  });

  const combined = Array.from(eventMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (useCache) {
      combinedEventsCache = combined;
      cacheTimestamp = now;
  }

  return filterEvents(combined, filters);
}

function filterEvents(eventsToFilter: SportEvent[], filters?: { sport?: string; league?: string }): SportEvent[] {
  if (!filters || (!filters.sport && !filters.league)) return eventsToFilter;
  let filtered = eventsToFilter;
  if (filters.sport) {
    filtered = filtered.filter(event => event.sport.toLowerCase().replace(/\s+/g, '-') === filters.sport);
  }
  if (filters.league) {
    filtered = filtered.filter(event => event.league.toLowerCase().replace(/\s+/g, '-') === filters.league);
  }
  return filtered;
}

export async function getAllSports(): Promise<Sport[]> {
  return sports;
}

export async function getAllLeagues(sportSlug?: string): Promise<League[]> {
  if (sportSlug) {
    return leagues.filter(league => league.sportSlug === sportSlug);
  }
  return leagues;
}

export async function getAllEvents(filters?: { sport?: string; league?: string }): Promise<SportEvent[]> {
  // This function primarily served mock data, which is now empty.
  // For actual data, getAllEventsCombined should be used.
  return [];
}

export async function getEventBySlug(slugToFind: string): Promise<SportEvent | undefined> {
  const allCombinedEvents = await getAllEventsCombined();
  // Directly compare the pre-computed slug from the event object with the slugToFind.
  // This relies on event.slug being correctly and canonically generated during data transformation.
  return allCombinedEvents.find(event => event.slug === slugToFind);
}

export async function getSportBySlug(slug: string): Promise<Sport | undefined> {
  return sports.find(sport => sport.slug === slug);
}
