
// @ts-nocheck
// Disabling TypeScript checks for this file due to the dynamic nature of the external API response
// and to align with the structure of the provided JavaScript snippet.
'use server';

import type { SportEvent, Score, EventStatus, Team } from './types';

interface Scores365LeagueInfo {
  competitionId: string; // 365scores API competition ID
  leagueName: string;    // User-friendly league name for our app
  sportName: string;     // User-friendly sport name for our app
  leagueSlug: string;    // Slug for the league in our app
  sportSlug: string;     // Slug for the sport in our app
}

const scores365LeaguesConfig: Scores365LeagueInfo[] = [
  { competitionId: '7', leagueName: 'Premier League', sportName: 'Soccer', leagueSlug: 'premier-league', sportSlug: 'soccer' },
  { competitionId: '11', leagueName: 'La Liga', sportName: 'Soccer', leagueSlug: 'la-liga', sportSlug: 'soccer' },
  { competitionId: '35', leagueName: 'Ligue 1', sportName: 'Soccer', leagueSlug: 'ligue-1', sportSlug: 'soccer' },
  { competitionId: '25', leagueName: 'Bundesliga', sportName: 'Soccer', leagueSlug: 'bundesliga', sportSlug: 'soccer' },
  { competitionId: '17', leagueName: 'Serie A', sportName: 'Soccer', leagueSlug: 'serie-a', sportSlug: 'soccer' },
  { competitionId: '572', leagueName: 'UEFA Champions League', sportName: 'Soccer', leagueSlug: 'uefa-champions-league', sportSlug: 'soccer' },
  { competitionId: '573', leagueName: 'UEFA Europa League', sportName: 'Soccer', leagueSlug: 'uefa-europa-league', sportSlug: 'soccer' },
  { competitionId: '103', leagueName: 'NBA', sportName: 'Basketball', leagueSlug: 'nba', sportSlug: 'basketball' },
  { competitionId: '438', leagueName: 'MLB', sportName: 'Baseball', leagueSlug: 'mlb', sportSlug: 'baseball' },
  { competitionId: '366', leagueName: 'NHL', sportName: 'Ice Hockey', leagueSlug: 'nhl', sportSlug: 'hockey' },
  { competitionId: '104', leagueName: 'MLS', sportName: 'Soccer', leagueSlug: 'mls', sportSlug: 'soccer' },
  { competitionId: '649', leagueName: 'Saudi Professional League', sportName: 'Soccer', leagueSlug: 'saudi-professional-league', sportSlug: 'soccer' },
  { competitionId: '8', leagueName: 'FA Cup', sportName: 'Soccer', leagueSlug: 'fa-cup', sportSlug: 'soccer' },
  { competitionId: '141', leagueName: 'Liga MX', sportName: 'Soccer', leagueSlug: 'liga-mx', sportSlug: 'soccer' },
  { competitionId: '623', leagueName: 'AFC Champions League', sportName: 'Soccer', leagueSlug: 'afc-champions-league', sportSlug: 'soccer' },
  { competitionId: '624', leagueName: 'CAF Champions League', sportName: 'Soccer', leagueSlug: 'caf-champions-league', sportSlug: 'soccer' },
  { competitionId: '102', leagueName: 'Copa Libertadores', sportName: 'Soccer', leagueSlug: 'copa-libertadores', sportSlug: 'soccer' },
  { competitionId: '5096', leagueName: 'FIFA Club World Cup', sportName: 'Soccer', leagueSlug: 'fifa-club-world-cup', sportSlug: 'soccer' },
  { competitionId: '352', leagueName: 'NFL', sportName: 'American Football', leagueSlug: 'nfl', sportSlug: 'american-football' },
];

function map365StatusToEventStatus(statusText?: string, statusId?: number): EventStatus {
  // Prioritize statusId for more reliable mapping
  if (statusId !== undefined) {
    switch (statusId) {
      case 0: // Not Started
        if (statusText) {
            const sLower = statusText.toLowerCase().trim();
            if (sLower === "half time" || sLower === "ht") return 'halftime';
            if (/\b(top|bot|bottom|mid|end)\s+\d+(st|nd|rd|th)?\b/i.test(sLower) || 
                sLower.includes("inning") ||
                sLower === "live" || sLower === "in progress" || sLower === "playing" || sLower === "-") {
                return 'live';
            }
        }
        return 'scheduled';
      case 1: case 2: case 3: case 4: case 5: case 9: case 10: case 11: case 13: case 14: case 15:
        // Check statusText for halftime if statusId indicates live
        if (statusText) {
            const sLower = statusText.toLowerCase().trim();
            if (sLower === "half time" || sLower === "ht") return 'halftime';
        }
        return 'live';
      case 6: case 16: case 17:
        return 'finished';
      case 7: return 'postponed';
      case 8: return 'cancelled';
      case 12: return 'scheduled'; // To Be Announced
      default:
        break;
    }
  }

  const s = statusText?.toLowerCase().trim();

  if (!s) return 'scheduled';

  if (s === "half time" || s === "ht") return 'halftime';

  const finishedStates = ["ended", "final", "final (ot)", "after penalties", "final (so)", "final (ex)", "full-time", "ft", "aet", "after et", "finished", "complete"];
  if (finishedStates.some(term => s.includes(term))) return 'finished';

  const postponedStates = ["postponed", "pst"];
  if (postponedStates.some(term => s.includes(term))) return 'postponed';

  const cancelledStates = ["cancelled", "canceled", "aban", "abandoned", "walkover"];
  if (cancelledStates.some(term => s.includes(term))) return 'cancelled';

  if (/\b(top|bot|bottom|mid|end)\s+\d+(st|nd|rd|th)?\b/i.test(s) || 
      s.includes("inning") || 
      s.includes("live") ||
      s.includes("in progress") ||
      s.includes("playing") ||
      s === "-"
     ) {
    return 'live';
  }

  const liveTextIndicators = ["h.t.", "1st half", "2nd half", "q1", "q2", "q3", "q4", "et", "extra time", "overtime", "ot", "penalties", "shootout", "paused", "interrupted", "break"];
  if (liveTextIndicators.some(ind => s.includes(ind))) {
    return 'live';
  }
  
  if (/^\d+'/.test(s) || /^\d+:\d+$/.test(s)) {
      return 'live';
  }
  
  if (s.includes("vs") || s.includes(" v ")) return 'scheduled';

  return 'scheduled';
}


function transformScores365Event(game: any, leagueConfig: Scores365LeagueInfo, apiLeagueNameForURL: string): SportEvent | null {
  try {
    if (!game || !game.homeCompetitor || !game.awayCompetitor) {
      return null;
    }

    const status = map365StatusToEventStatus(game.statusText, game.statusId);
    if (status === 'postponed' || status === 'cancelled') {
        return null;
    }

    const originalGameId = game.id;
    const eventIdForOurSystem = `365scores-${originalGameId}`;

    const homeTeamName = game.homeCompetitor.name?.trim() || 'Home Team';
    const awayTeamName = game.awayCompetitor.name?.trim() || 'Away Team';

    const homeTeam: Team = {
      id: `365scores-team-${game.homeCompetitor.id}`,
      name: homeTeamName,
      logoUrl: game.homeCompetitor.imageUrl || `https://imagecache.365scores.com/image/upload/f_png,w_82,h_82,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v20/Competitors/${game.homeCompetitor.id}`.trimEnd(),
      abbreviation: (game.homeCompetitor.shortName?.trim() || homeTeamName.substring(0, 3).toUpperCase()).trim(),
    };

    const awayTeam: Team = {
      id: `365scores-team-${game.awayCompetitor.id}`,
      name: awayTeamName,
      logoUrl: game.awayCompetitor.imageUrl || `https://imagecache.365scores.com/image/upload/f_png,w_82,h_82,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v20/Competitors/${game.awayCompetitor.id}`.trimEnd(),
      abbreviation: (game.awayCompetitor.shortName?.trim() || awayTeamName.substring(0, 3).toUpperCase()).trim(),
    };

    let rawTitle: string;
    if (leagueConfig.sportSlug === 'tennis' && game.name) { 
        rawTitle = game.name;
    } else {
        rawTitle = `${homeTeam.name} vs ${awayTeam.name}`;
    }
    if (typeof rawTitle === 'string') {
        rawTitle = rawTitle.replace(/ at /gi, ' vs ');
    }
    const finalEventTitle = rawTitle.trim();


    const slugBase = finalEventTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s_]+/g, '') 
        .trim()                         
        .replace(/[\s_]+/g, '-');    
    const slug = `${slugBase}-${originalGameId}`;

    const homeScoreValue = game.homeCompetitor.score;
    const awayScoreValue = game.awayCompetitor.score;

    const parsedHomeScore = (homeScoreValue !== undefined && homeScoreValue !== null && !isNaN(parseInt(String(homeScoreValue)))) ? parseInt(String(homeScoreValue), 10) : null;
    const parsedAwayScore = (awayScoreValue !== undefined && awayScoreValue !== null && !isNaN(parseInt(String(awayScoreValue)))) ? parseInt(String(awayScoreValue), 10) : null;

    const scores: Score | undefined = (status === 'live' || status === 'finished' || status === 'halftime') && homeScoreValue !== undefined && awayScoreValue !== undefined
      ? {
          home: parsedHomeScore,
          away: parsedAwayScore,
        }
      : undefined;

    const streamingLinks: SportEvent['streamingLinks'] = [];
    const sportsurgeEventName = leagueConfig.sportSlug === 'tennis' && game.name ? finalEventTitle : `${homeTeam.name} vs ${awayTeam.name}`;
    streamingLinks.push({ name: 'Watch on Sportsurge', url: `https://club.sportsurge.uno/#${encodeURIComponent(sportsurgeEventName)}`, type: 'unofficial' });


    return {
      id: eventIdForOurSystem,
      slug,
      title: finalEventTitle,
      sport: leagueConfig.sportName,
      league: leagueConfig.leagueName, 
      teams: { home: homeTeam, away: awayTeam },
      date: new Date(game.startTime).toISOString(),
      venue: game.venue?.name || 'N/A',
      status,
      scores,
      streamingLinks,
      broadcastInfo: game.tvNetworks?.map(n => n.name).join(', ') || undefined,
    };

  } catch (e) {
    console.error('Error transforming 365scores event:', game?.id, leagueConfig.leagueName, e);
    return null;
  }
}

async function fetchScores365EventsForLeague(leagueConfig: Scores365LeagueInfo): Promise<SportEvent[]> {
  const apiUrl = `https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=${leagueConfig.competitionId}&sports=1,2,3,4,10`; 
  try {
    const response = await fetch(apiUrl, { next: { revalidate: 300 } }); 
    if (!response.ok) {
      console.error(`365scores API error for ${leagueConfig.leagueName} (${leagueConfig.competitionId}): ${response.status} ${response.statusText} from ${apiUrl}`);
      return [];
    }
    const data = await response.json();

    if (!data.games || !data.competitions || data.competitions.length === 0) {
      return [];
    }

    const apiLeagueNameForURL = data.competitions[0].nameForURL || leagueConfig.leagueSlug;

    return data.games
      .map((game: any) => transformScores365Event(game, leagueConfig, apiLeagueNameForURL))
      .filter(Boolean) as SportEvent[];
  } catch (error) {
    console.error(`Failed to fetch or process data for ${leagueConfig.leagueName} (Comp ID: ${leagueConfig.competitionId}) from 365scores:`, error);
    return [];
  }
}

export async function fetchAllScores365Events(sportSlugParam?: string): Promise<SportEvent[]> {
  const allEvents: SportEvent[] = [];
  let leaguesToFetch: Scores365LeagueInfo[];

  if (sportSlugParam) {
    // If a specific sport is requested (e.g., 'american-football'), filter for that sport.
    leaguesToFetch = scores365LeaguesConfig.filter(lc => lc.sportSlug === sportSlugParam);
  } else {
    // If fetching for all sports (no specific sportSlugParam),
    // fetch for all configured leagues from 365Scores.
    leaguesToFetch = scores365LeaguesConfig;
  }

  const batchSize = 5;
  const leagueBatches: Scores365LeagueInfo[][] = [];
  for (let i = 0; i < leaguesToFetch.length; i += batchSize) {
    leagueBatches.push(leaguesToFetch.slice(i, i + batchSize));
  }

  for (const batch of leagueBatches) {
    const fetchPromises = batch.map(lc => fetchScores365EventsForLeague(lc));
    try {
      const results = await Promise.all(fetchPromises);
      results.forEach(leagueEvents => {
        allEvents.push(...leagueEvents);
      });
    } catch (error) {
      console.error("Error fetching a batch of 365scores events:", error);
    }
  }

  return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


export async function fetchScores365TeamGames(teamId365: string): Promise<SportEvent[]> {
  const apiUrl = `https://webws.365scores.com/web/games/current/?appTypeId=5&competitors=${teamId365}`;
  try {
    const response = await fetch(apiUrl, { next: { revalidate: 300 } }); // Cache for 5 minutes
    if (!response.ok) {
      console.error(`365scores API error for team ${teamId365} schedule: ${response.status} ${response.statusText} from ${apiUrl}`);
      return [];
    }
    const data = await response.json();

    if (!data.games) {
      return [];
    }

    // For NFL team schedules, the league context is known.
    // Find the league config, defaulting to a generic NFL config if not in main list (though it should be).
    const leagueConfig = scores365LeaguesConfig.find(lc => lc.sportSlug === 'american-football' && lc.competitionId === data.games[0]?.competitionId?.toString()) || 
                         {
                            competitionId: data.games[0]?.competitionId?.toString() || '352', // Standard NFL competition ID from 365scores
                            leagueName: data.games[0]?.competitionDisplayName || 'NFL',
                            sportName: 'American Football',
                            leagueSlug: 'nfl',
                            sportSlug: 'american-football',
                          };
    
    const apiLeagueNameForURL = data.competitions?.[0]?.nameForURL || 'nfl';


    return data.games
      .map((game: any) => transformScores365Event(game, leagueConfig, apiLeagueNameForURL))
      .filter(Boolean) as SportEvent[];
  } catch (error) {
    console.error(`Failed to fetch or process schedule for team ${teamId365} from 365scores:`, error);
    return [];
  }
}

export async function fetchScores365TeamDetails(teamId365: string): Promise<Team | null> {
  const apiUrl = `https://webws.365scores.com/web/competitors/?appTypeId=5&competitorIds=${teamId365}`;
  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 * 24 } }); // Cache for 24 hours
    if (!response.ok) {
      console.error(`365scores API error for team details ${teamId365}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.competitors && data.competitors.length > 0) {
      const teamData = data.competitors[0];
      const teamName = teamData.name?.trim() || 'Unknown Team';
      return {
        id: `365scores-team-${teamData.id}`,
        name: teamName,
        logoUrl: teamData.imageUrl || `https://imagecache.365scores.com/image/upload/f_png,w_120,h_120,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v20/Competitors/${teamData.id}`.trimEnd(),
        abbreviation: (teamData.shortName?.trim() || teamName.substring(0, 3).toUpperCase()).trim(),
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch team details for ${teamId365} from 365scores:`, error);
    return null;
  }
}


export async function getLeagueNameByCompetitionId(competitionId: string): Promise<string | undefined> {
  const league = scores365LeaguesConfig.find(lc => lc.competitionId === competitionId);
  return league?.leagueName;
}
