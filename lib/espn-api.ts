
// @ts-nocheck
// Disabling TypeScript checks for this file due to the dynamic nature of the external API response.
// Proper type definitions for the ESPN API would be ideal in a production scenario.
'use server';

import type { SportEvent, Score, EventStatus, Team, StatisticItem, MatchDetailItem, MatchDetailAthlete, SoccerTeamDetailedInfo } from './types';

interface EspnLeagueInfo {
  id: string; // Internal ID, e.g. UEFAChampionsLeague
  name: string; // ESPN API league identifier, e.g. UEFA.CHAMPIONS
  type: string; // sport type, e.g. soccer, basketball
  displayName: string; // User-friendly league name
  sportSlug: string; // slug for the sport, e.g. 'soccer', 'basketball'
}

// Helper function to generate a readable display name from an ID
function generateDisplayName(id: string): string {
  if (!id) return '';

  const overrides: { [key: string]: string } = {
    'MLS': 'MLS',
    'MexicanLigaBBVAMX': 'Mexican Liga BBVA MX',
    'CopaAmérica': 'Copa América',
    'MexicanLigadeExpansiónMX': 'Mexican Liga de Expansión MX',
    'FrenchTropheedesChampions': 'French Trophée des Champions',
    'German2Bundesliga': 'German 2. Bundesliga',
    'SpanishLALIGA2': 'Spanish LaLiga 2',
    'NCAAMensSoccer': "NCAA Men's Soccer",
    'CONMEBOLUEFACupofChampions': 'CONMEBOL-UEFA Cup of Champions',
    'NonFIFAFriendly': 'Non-FIFA Friendly',
    'ConcacafCup': 'Concacaf Cup',
    'USA.1': 'MLS',
    'ENG.1': 'Premier League',
    'ESP.1': 'La Liga',
    'GER.1': 'Bundesliga',
    'ITA.1': 'Serie A',
    'FRA.1': 'Ligue 1',
    'UEFA.CHAMPIONS': 'UEFA Champions League',
    'UEFA.EUROPA': 'UEFA Europa League',
    // 'nfl': 'NFL', // NFL is now handled by 365scores, but keep for other potential football types if needed
    'mlb': 'MLB',
    'nhl': 'NHL',
    'f1': 'Formula 1',
    'irl': 'IndyCar Series',
    'ufc': 'UFC',
    'pfl': 'PFL',
    'pga': 'PGA Tour',
    'lpga': 'LPGA Tour',
    'champions-tour': 'Champions Tour',
    'liv': 'LIV Golf',
    'WBA': 'WBA Boxing',
    'WBC': 'WBC Boxing',
    'IBF': 'IBF Boxing',
    'WBO': 'WBO Boxing',
    // Tennis specific display names are removed as tennis is handled by a new API
    'WWE': 'WWE',
    'NASCARCupSeries': 'NASCAR Cup Series',
    'NASCARXfinitySeries': 'NASCAR Xfinity Series',
    'NASCARTruckSeries': 'NASCAR Truck Series',
  };

  if (overrides[id]) {
    return overrides[id];
  }
   if (overrides[id.toLowerCase()]) {
    return overrides[id.toLowerCase()];
  }

  let result = id
    .replace(/([A-Z]+(?=[A-Z][a-zÀ-ÖØ-öø-ÿ]))|([A-Z][a-zÀ-ÖØ-öø-ÿ]+)|([A-Z]+)|([0-9]+)/g, (match, p1, p2, p3, p4) => {
      return ' ' + (p1 || p2 || p3 || p4);
    })
    .replace(/\s+/g, ' ')
    .trim();

  result = result.replace(/Cupof/g, 'Cup of');
  result = result.replace(/Copadel/g, 'Copa del');
  result = result.replace(/Ligade/g, 'Liga de');
  result = result.replace(/ Usa /g, ' USA ');

  if (id === 'american-football') return 'NFL';
  if (id === 'hockey') return 'NHL'; // Updated for new slug
  if (id === 'motor-sports') return 'Motor Racing'; // Updated for new slug
  if (id === 'tennis') return 'Tennis';
  if (id === 'mma-ufc') return 'MMA'; // Updated for new slug
  if (id === 'wrestling-wwe') return 'WWE'; // Updated for new slug


  return result || id;
}


const espnLeaguesDataRaw: Omit<EspnLeagueInfo, 'displayName' | 'sportSlug'> & { sportSlug: string }[] = [
    // Soccer
    { id: 'UEFAChampionsLeague', name: 'UEFA.CHAMPIONS', type: 'soccer', sportSlug: 'soccer' },
    { id: 'UEFAEuropaLeague', name: 'UEFA.EUROPA', type: 'soccer', sportSlug: 'soccer' },
    { id: 'UEFAEuropaConferenceLeague', name: 'UEFA.EUROPA.CONF', type: 'soccer', sportSlug: 'soccer' },
    { id: 'EnglishPremierLeague', name: 'ENG.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'EnglishFACup', name: 'ENG.FA', type: 'soccer', sportSlug: 'soccer' },
    { id: 'EnglishCarabaoCup', name: 'ENG.LEAGUE_CUP', type: 'soccer', sportSlug: 'soccer' },
    { id: 'SpanishLaLiga', name: 'ESP.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'SpanishCopadelRey', name: 'ESP.COPA_DEL_REY', type: 'soccer', sportSlug: 'soccer' },
    { id: 'GermanBundesliga', name: 'GER.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'MLS', name: 'USA.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ConcacafChampionsLeague', name: 'CONCACAF.CHAMPIONS', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ItalianSerieA', name: 'ITA.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'FrenchLigue1', name: 'FRA.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'CoupedeFrance', name: 'FRA.COUPE_DE_FRANCE', type: 'soccer', sportSlug: 'soccer' },
    { id: 'MexicanLigaBBVAMX', name: 'MEX.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'EnglishLeagueChampionship', name: 'ENG.2', type: 'soccer', sportSlug: 'soccer' },
    { id: 'CoppaItalia', name: 'ITA.COPPA_ITALIA', type: 'soccer', sportSlug: 'soccer' },
    { id: 'SaudiKingsCup', name: 'KSA.KINGS.CUP', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ScottishPremiership', name: 'SCO.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ScottishCup', name: 'SCO.TENNENTS', type: 'soccer', sportSlug: 'soccer' },
    { id: 'LeaguesCup', name: 'CONCACAF.LEAGUES.CUP', type: 'soccer', sportSlug: 'soccer' },
    { id: 'MexicanLigadeExpansiónMX', name: 'MEX.2', type: 'soccer', sportSlug: 'soccer' },
    { id: 'MexicanCopaMX', name: 'MEX.COPA_MX', type: 'soccer', sportSlug: 'soccer' },
    { id: 'AustralianALeagueMen', name: 'AUS.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'CONMEBOLLibertadores', name: 'CONMEBOL.LIBERTADORES', type: 'soccer', sportSlug: 'soccer' },
    { id: 'TurkishSuperLig', name: 'TUR.1', type: 'soccer', sportSlug: 'soccer' },
    { id: 'InternationalFriendly', name: 'FIFA.FRIENDLY', type: 'soccer', sportSlug: 'soccer' },
    { id: 'FIFAWorldCup', name: 'FIFA.WORLD', type: 'soccer', sportSlug: 'soccer' },
    { id: 'FIFAClubWorldCup', name: 'FIFA.CWC', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ConcacafGoldCup', name: 'CONCACAF.GOLD', type: 'soccer', sportSlug: 'soccer' },
    { id: 'UEFAEuropeanChampionship', name: 'UEFA.EURO', type: 'soccer', sportSlug: 'soccer' },
    { id: 'CopaAmérica', name: 'CONMEBOL.AMERICA', type: 'soccer', sportSlug: 'soccer' },
    { id: 'AFCAsianCup', name: 'AFC.ASIAN.CUP', type: 'soccer', sportSlug: 'soccer' },
    { id: 'AfricaCupofNations', name: 'CAF.NATIONS', type: 'soccer', sportSlug: 'soccer' },
    { id: 'ClubFriendly', name: 'CLUB.FRIENDLY', type: 'soccer', sportSlug: 'soccer' },
    { id: 'MensOlympicTournament', name: 'FIFA.OLYMPICS', type: 'soccer', sportSlug: 'soccer' },

    // American Football
    { id: 'NFL', name: 'nfl', type: 'football', sportSlug: 'american-football' },
    // Basketball
    { id: 'NBA', name: 'nba', type: 'basketball', sportSlug: 'basketball' },
    // Baseball - Handled by 365scores
    // Ice Hockey
    { id: 'NHL', name: 'nhl', type: 'hockey', sportSlug: 'hockey' }, // sportSlug updated

    // Racing
    { id: 'F1', name: 'f1', type: 'racing', sportSlug: 'motor-sports' }, // sportSlug updated
    { id: 'IndyCar', name: 'irl', type: 'racing', sportSlug: 'motor-sports' }, // sportSlug updated
    // { id: 'NASCARCupSeries', name: 'nascar', type: 'racing', sportSlug: 'motor-sports' }, // REMOVED - Failing endpoint
    // MMA
    { id: 'UFC', name: 'ufc', type: 'mma', sportSlug: 'mma-ufc' }, // sportSlug updated
    { id: 'PFL', name: 'pfl', type: 'mma', sportSlug: 'mma-ufc' }, // sportSlug updated

    // Golf
    { id: 'PGATour', name: 'pga', type: 'golf', sportSlug: 'golf' },
    { id: 'LPGATour', name: 'lpga', type: 'golf', sportSlug: 'golf' },
    { id: 'LIVGolf', name: 'liv', type: 'golf', sportSlug: 'golf' },
    { id: 'ChampionsTour', name: 'champions-tour', type: 'golf', sportSlug: 'golf' },
    // Boxing - REMOVED - Failing endpoints
    // WWE - REMOVED - Failing endpoint
    // Tennis - Removed, will be handled by the new global tennis API
];


const espnLeagues: EspnLeagueInfo[] = espnLeaguesDataRaw.map(league => ({
  ...league,
  displayName: generateDisplayName(league.id)
}));


function getFormattedDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function generateApiUrl(sportType: string, leagueName: string): string {
  const formattedDateForOthers = getFormattedDate();
  if (sportType === 'football' && leagueName === 'nfl') {
    return `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`;
  }
  if (sportType === 'basketball' && leagueName === 'nba') {
    return `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`;
  }
   if (sportType === 'racing' && (leagueName === 'f1' || leagueName === 'irl')) {
    return `https://site.api.espn.com/apis/site/v2/sports/racing/${leagueName}/scoreboard`;
  }
  // The 'nascar' API call was failing, so it's effectively removed by removing the config
   if (sportType === 'mma' && (leagueName === 'ufc' || leagueName === 'pfl')) {
    return `https://site.api.espn.com/apis/site/v2/sports/mma/${leagueName}/scoreboard`;
  }
  if (sportType === 'golf') {
    return `https://site.api.espn.com/apis/site/v2/sports/golf/${leagueName}/scoreboard`;
  }
  // The 'boxing' and 'wwe' API calls were failing, so they are effectively removed.
  return `https://site.api.espn.com/apis/site/v2/sports/${sportType}/${leagueName}/scoreboard?dates=${formattedDateForOthers}`;
}

function mapEspnStatus(statusType: any): EventStatus {
    let status: EventStatus = 'scheduled'; // Default
    if (statusType) {
        const isCompleted = statusType.completed === true;
        if (isCompleted) {
            return 'finished';
        }

        const state = statusType.state?.toLowerCase();
        const name = statusType.name?.toLowerCase();
        const detail = statusType.detail?.toLowerCase();
        const shortDetail = statusType.shortDetail?.toLowerCase();

        if (name === 'status_final' || name === 'final' || name === 'full-time' || name === 'ft' || state === 'post') {
            status = 'finished';
        } else if (name === 'halftime' || (detail && (detail.includes('half-time') || detail.includes(' ht')))) {
            status = 'halftime';
        } else if (state === 'in' || name === 'status_inprogress' || name === 'inprogress' || name === 'live') {
            status = 'live';
        } else if (state === 'pre' || name === 'status_scheduled' || name === 'scheduled' || detail === 'tbd' || shortDetail === 'tbd') {
            status = 'scheduled';
        } else if (name === 'status_postponed' || name === 'postponed' || detail === 'postponed' || shortDetail === 'postponed') {
            status = 'postponed';
        } else if (name === 'status_canceled' || name === 'canceled' || name === 'cancelled' || detail === 'canceled' || detail === 'cancelled' || shortDetail === 'canceled' || shortDetail === 'cancelled') {
            status = 'cancelled';
        }
    }
    return status;
}


function transformEspnF1Session(
    gpEvent: any,
    session: any,
    leagueDisplayName: string,
    sportNameFromApi: string,
    sportSlugFromConfig: string
): SportEvent | null {
    try {
        const status = mapEspnStatus(session.status?.type);

        if (status === 'postponed' || status === 'cancelled') {
            return null;
        }

        const actualSportName = generateDisplayName(sportSlugFromConfig) || sportNameFromApi;
        const originalEspnEventId = `${gpEvent.id}_${session.id}`;
        const eventIdForOurSystem = `espn-${originalEspnEventId}`;

        const sessionName = (session.name || session.type?.text || session.type?.shortDetail || session.type?.description || "Session").trim();
        const gpEventName = (gpEvent.shortName || gpEvent.name).trim();

        // Canonical title for F1: GP Name - Session Name
        let finalEventTitle = `${gpEventName} - ${sessionName}`.trim();
        finalEventTitle = finalEventTitle.replace(/ at /gi, ' vs ');


        const slugBase = finalEventTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
        const slug = `${slugBase}-${originalEspnEventId}`;


        const streamingLinks: SportEvent['streamingLinks'] = [];
        const streamingEventName = `${encodeURIComponent(gpEventName)}%20vs%20${encodeURIComponent(sessionName)}`;
        streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingEventName}`, type: 'unofficial' });


        const placeholderTeam = (name: string, abbrSuffix: string = 'P') => {
            const trimmedName = name.trim();
            return {
                id: `espn-team-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${abbrSuffix}`,
                name: trimmedName,
                logoUrl: `https://placehold.co/64x64.png?text=${encodeURIComponent((trimmedName.substring(0,2).toUpperCase().trim() + abbrSuffix).trim())}`.trimEnd(),
                abbreviation: (trimmedName.substring(0,2).toUpperCase() + abbrSuffix).trim(),
            };
        };

        const teams = {
            home: placeholderTeam(gpEventName, 'GP'),
            away: placeholderTeam(sessionName, 'S')
        };

        return {
            id: eventIdForOurSystem,
            slug,
            title: finalEventTitle,
            sport: actualSportName,
            league: leagueDisplayName,
            teams: teams,
            date: session.date,
            venue: (gpEvent.circuit?.fullName || session.circuit?.fullName || gpEvent.venue?.fullName || session.venue?.fullName || 'N/A').trim(),
            status,
            scores: undefined,
            streamingLinks,
            broadcastInfo: (session.broadcasts?.[0]?.media?.shortName || gpEvent.broadcasts?.[0]?.media?.shortName)?.trim(),
            statistics: null,
            details: null,
        };

    } catch (e) {
        console.error(`Error transforming ESPN F1 session: GP ID ${gpEvent?.id}, Session ID ${session?.id}`, leagueDisplayName, e);
        return null;
    }
}

function transformEspnMmaFight(
    fightCardEvent: any,
    fightCompetition: any,
    leagueConfig: EspnLeagueInfo,
    sportNameFromApi: string
): SportEvent | null {
    try {
        if (!fightCompetition.competitors || fightCompetition.competitors.length < 2) {
            return null;
        }

        const status = mapEspnStatus(fightCompetition.status?.type);

        if (status === 'postponed' || status === 'cancelled') {
            return null;
        }

        const fighter1Data = fightCompetition.competitors[0].athlete;
        const fighter2Data = fightCompetition.competitors[1].athlete;

        if (!fighter1Data || !fighter2Data) return null;

        const fighter1PlayerId = fighter1Data.id;
        const fighter2PlayerId = fighter2Data.id;

        const fighter1Name = fighter1Data.displayName?.trim() || 'Fighter 1';
        const fighter2Name = fighter2Data.displayName?.trim() || 'Fighter 2';

        // Canonical title for MMA: Fighter 1 Name vs Fighter 2 Name (order from API)
        let finalEventTitle = `${fighter1Name} vs ${fighter2Name}`.trim();
        finalEventTitle = finalEventTitle.replace(/ at /gi, ' vs ');


        const fighter1: Team = {
            id: `espn-fighter-${fighter1PlayerId}`,
            name: fighter1Name,
            logoUrl: fighter1PlayerId
                       ? `https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/${fighter1PlayerId}.png&h=80&w=80&scale=crop`
                       : `https://placehold.co/64x64.png?text=${encodeURIComponent((fighter1Data.shortName?.trim() || fighter1Name.substring(0, 2).toUpperCase() || 'F1').trim())}`.trimEnd(),
            abbreviation: (fighter1Data.shortName?.trim() || fighter1Name.substring(0, 3).toUpperCase() || 'F1A').trim(),
        };

        const fighter2: Team = {
            id: `espn-fighter-${fighter2PlayerId}`,
            name: fighter2Name,
            logoUrl: fighter2PlayerId
                       ? `https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/${fighter2PlayerId}.png&h=80&w=80&scale=crop`
                       : `https://placehold.co/64x64.png?text=${encodeURIComponent((fighter2Data.shortName?.trim() || fighter2Name.substring(0, 2).toUpperCase() || 'F2').trim())}`.trimEnd(),
            abbreviation: (fighter2Data.shortName?.trim() || fighter2Name.substring(0, 3).toUpperCase() || 'F2A').trim(),
        };

        const originalEspnFightId = `${fightCardEvent.id}_${fightCompetition.id}`;
        const eventIdForOurSystem = `espn-${originalEspnFightId}`;

        const slugBase = finalEventTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
        const slug = `${slugBase}-${originalEspnFightId}`;

        const streamingLinks: SportEvent['streamingLinks'] = [];
        const streamingEventName = `${encodeURIComponent(fighter1.name)}%20vs%20${encodeURIComponent(fighter2.name)}`;
        streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingEventName}`, type: 'unofficial' });


        const venue = (fightCompetition.venue?.fullName || fightCardEvent.venue?.fullName || 'N/A').trim();
        const broadcastInfo = (fightCompetition.broadcasts?.[0]?.media?.shortName || fightCardEvent.broadcasts?.[0]?.media?.shortName)?.trim();
        const actualSportName = generateDisplayName(leagueConfig.sportSlug) || sportNameFromApi;

        const isExplicitMainEvent = fightCompetition.type?.abbreviation?.toLowerCase() === 'main event' ||
                                  (Array.isArray(fightCompetition.headlines) && fightCompetition.headlines.some(h => h.type?.toLowerCase() === 'main event'));

        const isFiveRounderFromDetails = fightCompetition.details?.regulation?.periods === 5;
        const isFiveRounderFromFormat = fightCompetition.format?.regulation?.periods === 5;


        const isMainEvent = isExplicitMainEvent || isFiveRounderFromDetails || isFiveRounderFromFormat;

        const homeStatsRaw = fightCompetition.competitors[0].statistics;
        const awayStatsRaw = fightCompetition.competitors[1].statistics;

        const homeStats: StatisticItem[] = Array.isArray(homeStatsRaw) ? homeStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];
        const awayStats: StatisticItem[] = Array.isArray(awayStatsRaw) ? awayStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];


        return {
            id: eventIdForOurSystem,
            slug,
            title: finalEventTitle,
            sport: actualSportName,
            league: leagueConfig.displayName,
            teams: { home: fighter1, away: fighter2 },
            date: fightCompetition.date,
            venue,
            status,
            scores: undefined,
            streamingLinks,
            broadcastInfo,
            isMainEvent,
            statistics: homeStats.length > 0 || awayStats.length > 0 ? { home: homeStats, away: awayStats } : null,
            details: null, // MMA specific details transformation if needed later
        };

    } catch (e) {
        console.error(`Error transforming ESPN MMA fight: Card ID ${fightCardEvent?.id}, Fight ID ${fightCompetition?.id}`, leagueConfig.displayName, e);
        return null;
    }
}

function transformEspnTennisMatch(matchData: any, tournamentNameInput: string): SportEvent | null {
    try {
        if (!matchData.competitors || matchData.competitors.length < 2) {
            return null;
        }

        const status = mapEspnStatus(matchData.status?.type || matchData.status);

        if (status === 'postponed' || status === 'cancelled') {
            return null;
        }

        const competitor1Data = matchData.competitors[0];
        const competitor2Data = matchData.competitors[1];

        const player1Name = (competitor1Data.athlete?.displayName || competitor1Data.displayName || 'Player 1').trim();
        const player2Name = (competitor2Data.athlete?.displayName || competitor2Data.displayName || 'Player 2').trim();

        // Canonical title for Tennis: Player 1 Name vs Player 2 Name (order from API)
        let finalEventTitle = (matchData.shortName || `${player1Name} vs ${player2Name}`).trim();
        finalEventTitle = finalEventTitle.replace(/ at /gi, ' vs ');


        const player1Id = competitor1Data.athlete?.id || competitor1Data.id || player1Name.replace(/\s+/g, '').toLowerCase();
        const player2Id = competitor2Data.athlete?.id || competitor2Data.id || player2Name.replace(/\s+/g, '').toLowerCase();

        const player1: Team = {
            id: `espn-player-${player1Id}`,
            name: player1Name,
            logoUrl: competitor1Data.athlete?.headshot?.href || `https://placehold.co/64x64.png?text=${encodeURIComponent(player1Name.substring(0, 2).toUpperCase())}`,
            abbreviation: (competitor1Data.athlete?.shortName?.trim() || player1Name.substring(0, 3).toUpperCase()).trim(),
        };

        const player2: Team = {
            id: `espn-player-${player2Id}`,
            name: player2Name,
            logoUrl: competitor2Data.athlete?.headshot?.href || `https://placehold.co/64x64.png?text=${encodeURIComponent(player2Name.substring(0, 2).toUpperCase())}`,
            abbreviation: (competitor2Data.athlete?.shortName?.trim() || player2Name.substring(0, 3).toUpperCase()).trim(),
        };

        const tournamentName = tournamentNameInput.trim();

        const originalEspnMatchId = matchData.id;
        const eventIdForOurSystem = `espn-${originalEspnMatchId}`;

        const slugBase = finalEventTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
        const slug = `${slugBase}-${originalEspnMatchId}`;


        const streamingLinks: SportEvent['streamingLinks'] = [];
        const streamingEventName = `${encodeURIComponent(player1.name)}%20vs%20${encodeURIComponent(player2.name)}`;
        streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingEventName}`, type: 'unofficial' });

        const venue = (matchData.venue?.fullName || matchData.location || tournamentName || 'N/A').trim();
        const broadcastInfo = matchData.broadcasts?.map(b => b.media?.shortName?.trim()).filter(Boolean).join(', ') || undefined;

        const homeStatsRaw = matchData.competitors[0].statistics;
        const awayStatsRaw = matchData.competitors[1].statistics;

        const homeStats: StatisticItem[] = Array.isArray(homeStatsRaw) ? homeStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];
        const awayStats: StatisticItem[] = Array.isArray(awayStatsRaw) ? awayStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];

        const homeScoreString = competitor1Data.score;
        const awayScoreString = competitor2Data.score;
        const parsedHomeScore = (homeScoreString !== undefined && homeScoreString !== null && !isNaN(parseInt(String(homeScoreString)))) ? parseInt(String(homeScoreString), 10) : null;
        const parsedAwayScore = (awayScoreString !== undefined && awayScoreString !== null && !isNaN(parseInt(String(awayScoreString)))) ? parseInt(String(awayScoreString), 10) : null;

        const scores: Score | undefined = (status === 'live' || status === 'finished') && parsedHomeScore !== null && parsedAwayScore !== null
          ? {
              home: parsedHomeScore,
              away: parsedAwayScore,
              displayHome: String(homeScoreString),
              displayAway: String(awayScoreString),
            }
          : undefined;

        return {
            id: eventIdForOurSystem,
            slug,
            title: finalEventTitle,
            sport: 'Tennis',
            league: tournamentName,
            teams: { home: player1, away: player2 },
            date: matchData.date,
            venue,
            status,
            scores,
            streamingLinks,
            broadcastInfo,
            statistics: homeStats.length > 0 || awayStats.length > 0 ? { home: homeStats, away: awayStats } : null,
            details: null,
        };

    } catch (e) {
        console.error('Error transforming ESPN Tennis match:', matchData?.id, tournamentNameInput, e);
        return null;
    }
}

async function fetchEspnTennisEvents(): Promise<SportEvent[]> {
    const apiUrl = 'https://site.web.api.espn.com/apis/personalized/v2/scoreboard/header?sport=tennis';
    const sportEvents: SportEvent[] = [];
    try {
        const response = await fetch(apiUrl, { next: { revalidate: 600 } }); // Cache for 10 minutes
        if (!response.ok) {
            console.error(`ESPN Tennis API error: ${response.status} ${response.statusText} from ${apiUrl}`);
            return [];
        }
        const data = await response.json();

        if (data.sports && Array.isArray(data.sports)) {
            for (const sportItem of data.sports) {
                if (sportItem.leagues && Array.isArray(sportItem.leagues)) {
                    for (const leagueItem of sportItem.leagues) {
                        const tournamentName = leagueItem.name?.trim() || 'Tennis Tournament';
                        if (leagueItem.events && Array.isArray(leagueItem.events)) {
                            for (const eventData of leagueItem.events) {
                                const sportEvent = transformEspnTennisMatch(eventData, tournamentName);
                                if (sportEvent) {
                                    sportEvents.push(sportEvent);
                                }
                            }
                        }
                    }
                }
            }
        }
        return sportEvents;
    } catch (error) {
        console.error(`Failed to fetch or process Tennis data from ESPN Header API: ${apiUrl}:`, error);
        return [];
    }
}


function transformEspnEvent(event: any, leagueDisplayName: string, sportNameFromApi: string, sportSlugFromConfig: string): SportEvent | null {
  try {
    if (sportSlugFromConfig === 'mma-ufc' && event.competitions && event.competitions.length > 0) {
      return null;
    }
     if (sportSlugFromConfig === 'motor-sports' && leagueDisplayName === 'Formula 1' && event.competitions && event.competitions.length > 0) {
      return null;
    }
    if (sportSlugFromConfig === 'tennis') {
        return null;
    }
    // Boxing and WWE are removed, so this block will no longer be hit for them.
    if (sportSlugFromConfig === 'boxing' || sportSlugFromConfig === 'wrestling-wwe') {
        return null;
    }

    const competition = event.competitions?.[0];
    if (!competition && !(sportSlugFromConfig === 'motor-sports' || sportSlugFromConfig === 'golf')) {
         return null;
    }

    const status = mapEspnStatus(competition?.status?.type || event.status?.type);
    const originalEspnEventId = event.id;

    if (status === 'postponed' || status === 'cancelled') {
        return null;
    }

    const eventIdForOurSystem = `espn-${originalEspnEventId}`;
    const actualSportName = generateDisplayName(sportSlugFromConfig) || sportNameFromApi;


    if ((sportSlugFromConfig === 'motor-sports' && leagueDisplayName !== 'Formula 1') || sportSlugFromConfig === 'golf') {
      const primaryCompetitionDetails = competition || event;
      const eventDateStr = primaryCompetitionDetails.date || event.date;

      if (!eventDateStr) return null;

      let titleForSlugBase = (event.name || event.shortName || `${leagueDisplayName} Event`).trim();
      titleForSlugBase = titleForSlugBase.replace(/ at /gi, ' vs ');
      const displayEventTitle = titleForSlugBase;


      const slugBase = titleForSlugBase
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
      const slug = `${slugBase}-${originalEspnEventId}`;

      const streamingLinks: SportEvent['streamingLinks'] = [];
      // For Golf/Racing (non-F1), use the event title for the hash
      streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${encodeURIComponent(displayEventTitle)}`, type: 'unofficial' });


      const placeholderTeam = (name: string, abbrSuffix: string = 'P') => {
          const trimmedName = name.trim();
          return {
            id: `espn-team-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${abbrSuffix}`,
            name: trimmedName,
            logoUrl: `https://placehold.co/64x64.png?text=${encodeURIComponent((trimmedName.substring(0,2).toUpperCase().trim() + abbrSuffix).trim())}`.trimEnd(),
            abbreviation: (trimmedName.substring(0,2).toUpperCase() + abbrSuffix).trim(),
          };
      };

      let teams = {
        home: placeholderTeam(event.shortName?.trim() || leagueDisplayName, 'H'),
        away: placeholderTeam("Event", 'A')
      };

      const homeStatsRaw = primaryCompetitionDetails.competitors?.[0]?.statistics;
      const awayStatsRaw = primaryCompetitionDetails.competitors?.[1]?.statistics;
      const homeStats: StatisticItem[] = Array.isArray(homeStatsRaw) ? homeStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];
      const awayStats: StatisticItem[] = Array.isArray(awayStatsRaw) ? awayStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];



      return {
        id: eventIdForOurSystem,
        slug,
        title: displayEventTitle,
        sport: actualSportName,
        league: leagueDisplayName,
        teams: teams,
        date: eventDateStr,
        venue: (primaryCompetitionDetails.venue?.fullName || event.circuit?.fullName || 'N/A').trim(),
        status,
        scores: undefined,
        streamingLinks,
        broadcastInfo: (primaryCompetitionDetails.broadcasts?.[0]?.media?.shortName || event.broadcasts?.[0]?.media?.shortName)?.trim(),
        statistics: homeStats.length > 0 || awayStats.length > 0 ? { home: homeStats, away: awayStats } : null,
        details: null,
      };
    }

    if (!competition?.competitors || competition.competitors.length < 2) {
      return null;
    }

    const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === 'home');
    const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === 'away');

    if (!homeCompetitor || !awayCompetitor || !homeCompetitor.team || !awayCompetitor.team) {
        // Fallback if precise home/away team structure isn't found (e.g. some individual sports or different API structure)
        let fallbackTitleForSlugBase = (event.name || event.shortName || `${leagueDisplayName} Event`).trim();
        fallbackTitleForSlugBase = fallbackTitleForSlugBase.replace(/ at /gi, ' vs ');
        const fallbackDisplayTitle = fallbackTitleForSlugBase;

        const fallbackSlugBase = fallbackTitleForSlugBase.toLowerCase().replace(/[^a-z0-9\s_]+/g, '').trim().replace(/[\s_]+/g, '-');
        const fallbackSlug = `${fallbackSlugBase}-${originalEspnEventId}`;

        const placeholderHomeTeam = { id: 'espn-team-placeholder-home', name: 'Team 1', logoUrl: 'https://placehold.co/64x64.png?text=T1', abbreviation: 'T1' };
        const placeholderAwayTeam = { id: 'espn-team-placeholder-away', name: 'Team 2', logoUrl: 'https://placehold.co/64x64.png?text=T2', abbreviation: 'T2' };

        const streamingLinks: SportEvent['streamingLinks'] = [];
        const streamingHash = `${encodeURIComponent(placeholderHomeTeam.name)}%20vs%20${encodeURIComponent(placeholderAwayTeam.name)}`;
        streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingHash}`, type: 'unofficial' });


        return {
            id: eventIdForOurSystem,
            slug: fallbackSlug,
            title: fallbackDisplayTitle,
            sport: actualSportName,
            league: leagueDisplayName,
            teams: { home: placeholderHomeTeam, away: placeholderAwayTeam },
            date: event.date,
            venue: (competition?.venue?.fullName || 'N/A').trim(),
            status,
            scores: undefined, // Scores might not be applicable or available in this structure
            streamingLinks,
            broadcastInfo: competition?.broadcasts?.[0]?.media?.shortName?.trim(),
            statistics: null,
            details: null,
        };
    }


    const homeTeamData = homeCompetitor.team;
    const awayTeamData = awayCompetitor.team;

    const homeTeamName = (homeTeamData.displayName || homeTeamData.name || 'Home Team').trim();
    const awayTeamName = (awayTeamData.displayName || awayTeamData.name || 'Away Team').trim();

    const titleForSlugBase = `${awayTeamName} vs ${homeTeamName}`; // Canonical title for slug base
    let displayEventTitle = (event.name || event.shortName || titleForSlugBase).trim(); // Display title can be more descriptive
    displayEventTitle = displayEventTitle.replace(/ at /gi, ' vs ');


    const homeTeam: Team = {
      id: `espn-team-${homeTeamData.id}`,
      name: homeTeamName,
      logoUrl: (homeTeamData.logo || `https://placehold.co/64x64.png?text=${encodeURIComponent((homeTeamData.abbreviation?.trim() || homeTeamData.shortDisplayName?.trim() || 'H').trim())}`).trimEnd(),
      abbreviation: (homeTeamData.abbreviation?.trim() || homeTeamData.shortDisplayName?.trim() || 'H').trim(),
    };

    const awayTeam: Team = {
      id: `espn-team-${awayTeamData.id}`,
      name: awayTeamName,
      logoUrl: (awayTeamData.logo || `https://placehold.co/64x64.png?text=${encodeURIComponent((awayTeamData.abbreviation?.trim() || awayTeamData.shortDisplayName?.trim() || 'A').trim())}`).trimEnd(),
      abbreviation: (awayTeamData.abbreviation?.trim() || awayTeamData.shortDisplayName?.trim() || 'A').trim(),
    };

    const homeScoreString = homeCompetitor.score; // This is already a string from the API like "2"
    const awayScoreString = awayCompetitor.score; // This is already a string from the API like "0"

    const parsedHomeScore = (typeof homeScoreString === 'string' && homeScoreString.trim() !== '' && !isNaN(parseFloat(homeScoreString))) ? parseFloat(homeScoreString) : null;
    const parsedAwayScore = (typeof awayScoreString === 'string' && awayScoreString.trim() !== '' && !isNaN(parseFloat(awayScoreString))) ? parseFloat(awayScoreString) : null;

    const scores: Score | undefined = (status === 'live' || status === 'finished' || status === 'halftime') && parsedHomeScore !== null && parsedAwayScore !== null
      ? {
          home: parsedHomeScore,
          away: parsedAwayScore,
          displayHome: typeof homeScoreString === 'string' ? homeScoreString : (parsedHomeScore !== null ? String(parsedHomeScore) : undefined),
          displayAway: typeof awayScoreString === 'string' ? awayScoreString : (parsedAwayScore !== null ? String(parsedAwayScore) : undefined),
        }
      : undefined;

    const venue = (competition.venue?.fullName || 'N/A').trim();

    const slugBase = titleForSlugBase // Use the canonical "Away vs Home" for slug base
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
    const slug = `${slugBase}-${originalEspnEventId}`;


    const streamingLinks: SportEvent['streamingLinks'] = [];
    const streamingHash = `${encodeURIComponent(homeTeam.name)}%20vs%20${encodeURIComponent(awayTeam.name)}`;
    streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingHash}`, type: 'unofficial' });


    const broadcastInfo = competition.broadcasts?.[0]?.media?.shortName?.trim();

    const homeStatsRaw = homeCompetitor.statistics;
    const awayStatsRaw = awayCompetitor.statistics;
    const homeStats: StatisticItem[] = Array.isArray(homeStatsRaw) ? homeStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];
    const awayStats: StatisticItem[] = Array.isArray(awayStatsRaw) ? awayStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];

    const matchDetails: MatchDetailItem[] = [];
    if (competition.details && Array.isArray(competition.details)) {
        competition.details.forEach((detail: any) => {
            const athletesInvolved: MatchDetailAthlete[] = detail.athletesInvolved?.map((ath: any) => ({
                id: ath.id,
                displayName: ath.displayName,
                teamId: ath.team?.id,
            })) || [];

            let detailType = detail.type?.text || 'Event';
            if (detail.penaltyKick) detailType = 'Penalty';
            if (detail.ownGoal) detailType = 'Own Goal';

            matchDetails.push({
                type: detailType,
                time: detail.clock?.displayValue || '',
                teamId: detail.team?.id,
                teamName: detail.team?.id === homeTeamData.id ? homeTeamName : detail.team?.id === awayTeamData.id ? awayTeamName : undefined,
                athletesInvolved,
                isGoal: detail.scoringPlay,
                isOwnGoal: detail.ownGoal,
                isPenalty: detail.penaltyKick,
                isCard: detail.yellowCard || detail.redCard,
                cardType: detail.yellowCard ? 'yellow' : detail.redCard ? 'red' : undefined,
            });
        });
    }


    return {
      id: eventIdForOurSystem,
      slug,
      title: displayEventTitle,
      sport: actualSportName,
      league: leagueDisplayName,
      teams: { home: homeTeam, away: awayTeam },
      date: event.date,
      venue,
      status,
      scores,
      streamingLinks,
      broadcastInfo,
      statistics: homeStats.length > 0 || awayStats.length > 0 ? { home: homeStats, away: awayStats } : null,
      details: matchDetails.length > 0 ? matchDetails : null,
    };
  } catch (e) {
    console.error('Error transforming ESPN event:', event?.id, leagueDisplayName, e);
    return null;
  }
}

export async function fetchEspnEventsForLeague(leagueConfig: EspnLeagueInfo): Promise<SportEvent[]> {
  if (leagueConfig.sportSlug === 'tennis') {
    return []; // Tennis is now fetched by fetchEspnTennisEvents
  }
  const apiUrl = generateApiUrl(leagueConfig.type, leagueConfig.name);
  try {
    const response = await fetch(apiUrl, { next: { revalidate: 600 } }); // Revalidate every 10 minutes
    if (!response.ok) {
      console.error(`Network response was not ok for ${leagueConfig.displayName} (${leagueConfig.name} from ${apiUrl}): ${response.statusText}`);
      return [];
    }
    const data = await response.json();

    const apiSportName = data.sport?.name || data.leagues?.[0]?.sport?.name || leagueConfig.type;
    const sportEvents: SportEvent[] = [];

    if (leagueConfig.name === 'f1' && data.events) { // F1 has a different structure with GP events containing session competitions
        for (const gpEvent of data.events) {
            if (gpEvent.competitions && Array.isArray(gpEvent.competitions)) {
                for (const session of gpEvent.competitions) {
                    const sportEvent = transformEspnF1Session(gpEvent, session, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
                    if (sportEvent) {
                        sportEvents.push(sportEvent);
                    }
                }
            }
        }
    } else if (leagueConfig.type === 'mma' && data.events) { // MMA (UFC, PFL) has fight cards (events) with individual fights (competitions)
        for (const fightCardEvent of data.events) {
            if (fightCardEvent.competitions && Array.isArray(fightCardEvent.competitions)) {
                for (const fightCompetition of fightCardEvent.competitions) {
                    const sportEvent = transformEspnMmaFight(fightCardEvent, fightCompetition, leagueConfig, apiSportName);
                    if (sportEvent) {
                        sportEvents.push(sportEvent);
                    }
                }
            }
        }
    } else if (data.events) { // Standard structure for most sports
        data.events.forEach((event: any) => {
            const sportEvent = transformEspnEvent(event, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
            if (sportEvent) {
                sportEvents.push(sportEvent);
            }
        });
    } else if (data.competitions && data.competitions.length > 0 && (leagueConfig.type === 'racing' || leagueConfig.type === 'golf')) {
        // Some racing/golf events might be directly under competitions or nested inside
       const nestedEvents = data.competitions.flatMap((comp: any) => comp.events || (comp.type === 'event' ? [comp] : []) );
         if (nestedEvents.length > 0) {
           nestedEvents.forEach((event: any) => {
             const sportEvent = transformEspnEvent(event, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
             if (sportEvent) {
                sportEvents.push(sportEvent);
             }
           });
        } else if(data.id && data.name && data.date){ // Fallback if data itself is a single event structure
             const singleEvent = transformEspnEvent(data, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
             if (singleEvent) sportEvents.push(singleEvent);
        }
    } else if (data.id && data.name && data.date && data.competitions){ // Catch-all for single event responses that still have a competitions array
        // This can happen for some individual events like specific Boxing matches
        const sportEvent = transformEspnEvent(data, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
        if (sportEvent) {
            sportEvents.push(sportEvent);
        }
    } else if (data.id && data.name && data.date && (leagueConfig.sportSlug === 'boxing' || leagueConfig.sportSlug === 'wrestling-wwe')) { // WWE and Boxing often directly return event data
         const sportEvent = transformEspnEvent(data, leagueConfig.displayName, apiSportName, leagueConfig.sportSlug);
         if (sportEvent) {
            sportEvents.push(sportEvent);
        }
    }


    return sportEvents;
  } catch (error) {
    console.error(`Failed to fetch or process data for ${leagueConfig.displayName} (${leagueConfig.name}) from ${apiUrl}:`, error);
    return [];
  }
}

export async function fetchAllEspnEvents(sportSlugParam?: string): Promise<SportEvent[]> {
  const allEvents: SportEvent[] = [];

  // NFL and MLB are primarily sourced from 365scores, so skip them here if fetching all
  // or if specifically requested (as 365scores API would be preferred).
  // However, if the specific sport is 'basketball', still fetch it via ESPN.
  if (sportSlugParam === 'american-football' || sportSlugParam === 'baseball' || sportSlugParam === 'boxing' || sportSlugParam === 'wrestling-wwe') {
    return [];
  }

  if (sportSlugParam === 'tennis') {
    const tennisEvents = await fetchEspnTennisEvents();
    allEvents.push(...tennisEvents);
    return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  let leaguesToFetch = espnLeagues;
  if (sportSlugParam) {
    leaguesToFetch = espnLeagues.filter(league => league.sportSlug === sportSlugParam);
  } else {
    // If fetching all, explicitly filter out NFL and MLB as they are sourced elsewhere.
    leaguesToFetch = espnLeagues.filter(league => league.sportSlug !== 'american-football' && league.sportSlug !== 'baseball');
  }

  if (leaguesToFetch.length > 0) {
      const batchSize = 5; // Fetch leagues in batches to avoid too many concurrent requests
      const leagueBatches: EspnLeagueInfo[][] = [];
      for (let i = 0; i < leaguesToFetch.length; i += batchSize) {
        leagueBatches.push(leaguesToFetch.slice(i, i + batchSize));
      }

      for (const batch of leagueBatches) {
        const fetchPromises = batch.map(league =>
          fetchEspnEventsForLeague(league).catch(e => {
            console.error(`Error fetching events for league ${league.displayName} in batch:`, e);
            return [] as SportEvent[]; // Return empty array on error to not break Promise.all
          })
        );
        try {
          const results = await Promise.all(fetchPromises);
          results.forEach(leagueEvents => {
            if (leagueEvents) { // Ensure leagueEvents is not undefined (though catch should prevent this)
                allEvents.push(...leagueEvents);
            }
          });
        } catch (error) {
          console.error("Error fetching a batch of ESPN events:", error);
        }
      }
  }

  // If fetching all sports (no sportSlugParam), add tennis events
  if (!sportSlugParam) {
    const tennisEvents = await fetchEspnTennisEvents();
    allEvents.push(...tennisEvents);
  }

  return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


// Helper to look up league display name if needed, though ideally it's passed in
async function getLeagueNameByCompetitionId(competitionId: string): Promise<string | undefined> {
  const league = espnLeagues.find(l => l.name === competitionId || l.id === competitionId);
  return league?.displayName;
}


export async function fetchEspnSoccerTeamScheduleAndInfo(teamId: string): Promise<{ teamDetails: SoccerTeamDetailedInfo | null; upcomingGames: SportEvent[] }> {
  const apiUrl = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/teams/${teamId}/schedule?region=us&lang=en&fixture=true`;
  let teamDetails: SoccerTeamDetailedInfo | null = null;
  const upcomingGames: SportEvent[] = [];

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Revalidate every hour
    if (!response.ok) {
      console.error(`ESPN Soccer Team Schedule API error for team ${teamId}: ${response.status} ${response.statusText} from ${apiUrl}`);
      return { teamDetails: null, upcomingGames: [] };
    }
    const data = await response.json();

    if (data.team) {
      const apiTeam = data.team;
      teamDetails = {
        id: apiTeam.id,
        name: apiTeam.name?.trim() || 'Unknown Team',
        displayName: apiTeam.displayName?.trim() || 'Unknown Team',
        abbreviation: apiTeam.abbreviation?.trim(),
        logoUrl: apiTeam.logo || `https://placehold.co/128x128.png?text=${apiTeam.abbreviation || 'TEAM'}`,
        recordSummary: apiTeam.recordSummary?.trim(),
        standingSummary: apiTeam.standingSummary?.trim(),
        clubhouseUrl: apiTeam.clubhouse,
        color: apiTeam.color,
        alternateColor: apiTeam.alternateColor,
        seasonYear: data.season?.year,
        seasonDisplayName: data.season?.displayName?.trim(),
      };
    }

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((gameEvent: any) => {
        if (!gameEvent.competitions || !gameEvent.competitions[0]) return;
        const competition = gameEvent.competitions[0];
        if (!competition.competitors || competition.competitors.length < 2) return;

        const status = mapEspnStatus(competition.status?.type);
         if (status === 'postponed' || status === 'cancelled') {
            return;
        }

        const originalEspnEventId = gameEvent.id;
        const eventIdForOurSystem = `espn-${originalEspnEventId}`;

        const homeComp = competition.competitors.find((c: any) => c.homeAway === 'home');
        const awayComp = competition.competitors.find((c: any) => c.homeAway === 'away');

        if (!homeComp || !awayComp || !homeComp.team || !awayComp.team) {
            console.warn(`Could not determine home/away teams for soccer schedule event ${gameEvent.id}, teamId: ${teamId}`);
            return;
        }

        const homeTeamData = homeComp.team;
        const awayTeamData = awayComp.team;

        const homeTeamName = (homeTeamData.displayName || homeTeamData.name || 'Home Team').trim();
        const awayTeamName = (awayTeamData.displayName || awayTeamData.name || 'Away Team').trim();

        // Canonical title for slug: Away Team Name vs Home Team Name
        const titleForSlugBase = `${awayTeamName} vs ${homeTeamName}`;
        // Display title can be more descriptive from event.name or fallback to canonical
        let displayEventTitle = (gameEvent.name || gameEvent.shortName || titleForSlugBase).trim();
        displayEventTitle = displayEventTitle.replace(/ at /gi, ' vs ');


        const homeTeam: Team = {
          id: `espn-team-${homeTeamData.id}`,
          name: homeTeamName,
          logoUrl: homeTeamData.logos?.[0]?.href || `https://placehold.co/64x64.png?text=${homeTeamData.abbreviation || 'H'}`,
          abbreviation: homeTeamData.abbreviation?.trim() || 'H',
        };
        const awayTeam: Team = {
          id: `espn-team-${awayTeamData.id}`,
          name: awayTeamName,
          logoUrl: awayTeamData.logos?.[0]?.href || `https://placehold.co/64x64.png?text=${awayTeamData.abbreviation || 'A'}`,
          abbreviation: awayTeamData.abbreviation?.trim() || 'A',
        };

        const homeScoreString = homeComp.score?.value !== undefined ? String(homeComp.score.value) : (typeof homeComp.score === 'string' || typeof homeComp.score === 'number' ? String(homeComp.score) : undefined);
        const awayScoreString = awayComp.score?.value !== undefined ? String(awayComp.score.value) : (typeof awayComp.score === 'string' || typeof awayComp.score === 'number' ? String(awayComp.score) : undefined);

        const parsedHomeScore = (homeScoreString !== undefined && homeScoreString !== null && homeScoreString.trim() !== '' && !isNaN(parseFloat(homeScoreString))) ? parseFloat(homeScoreString) : null;
        const parsedAwayScore = (awayScoreString !== undefined && awayScoreString !== null && awayScoreString.trim() !== '' && !isNaN(parseFloat(awayScoreString))) ? parseFloat(awayScoreString) : null;

        const scores: Score | undefined = (status === 'live' || status === 'finished' || status === 'halftime') && parsedHomeScore !== null && parsedAwayScore !== null
          ? {
              home: parsedHomeScore,
              away: parsedAwayScore,
              displayHome: homeComp.score?.displayValue ?? (parsedHomeScore !== null ? String(parsedHomeScore) : undefined),
              displayAway: awayComp.score?.displayValue ?? (parsedAwayScore !== null ? String(parsedAwayScore) : undefined),
            }
          : undefined;

        const slugBase = titleForSlugBase // Use the canonical "Away vs Home" for slug base
            .toLowerCase()
            .replace(/[^a-z0-9\s_]+/g, '')
            .trim()
            .replace(/[\s_]+/g, '-');
        const slug = `${slugBase}-${originalEspnEventId}`;

        const streamingLinks: SportEvent['streamingLinks'] = [];
        const streamingHash = `${encodeURIComponent(homeTeam.name)}%20vs%20${encodeURIComponent(awayTeam.name)}`;
        streamingLinks.push({ name: 'Watch Live', url: `https://club.sportsurge.uno/#${streamingHash}`, type: 'unofficial' });


        const homeStatsRaw = homeComp.statistics;
        const awayStatsRaw = awayComp.statistics;
        const gameHomeStats: StatisticItem[] = Array.isArray(homeStatsRaw) ? homeStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];
        const gameAwayStats: StatisticItem[] = Array.isArray(awayStatsRaw) ? awayStatsRaw.map((s: any) => ({ name: s.name, abbreviation: s.abbreviation, displayValue: s.displayValue })) : [];

        const gameMatchDetails: MatchDetailItem[] = [];
        if (competition.details && Array.isArray(competition.details)) {
            competition.details.forEach((detail: any) => {
                 const athletesInvolved: MatchDetailAthlete[] = detail.athletesInvolved?.map((ath: any) => ({
                    id: ath.id,
                    displayName: ath.displayName,
                    teamId: ath.team?.id,
                })) || [];

                let detailType = detail.type?.text || 'Event';
                if (detail.penaltyKick) detailType = 'Penalty';
                if (detail.ownGoal) detailType = 'Own Goal';

                gameMatchDetails.push({
                    type: detailType,
                    time: detail.clock?.displayValue || '',
                    teamId: detail.team?.id,
                    teamName: detail.team?.id === homeTeamData.id ? homeTeam.name : detail.team?.id === awayTeamData.id ? awayTeam.name : undefined,
                    athletesInvolved,
                    isGoal: detail.scoringPlay,
                    isOwnGoal: detail.ownGoal,
                    isPenalty: detail.penaltyKick,
                    isCard: detail.yellowCard || detail.redCard,
                    cardType: detail.yellowCard ? 'yellow' : detail.redCard ? 'red' : undefined,
                });
            });
        }


        const sportEvent: SportEvent = {
          id: eventIdForOurSystem,
          slug,
          title: displayEventTitle,
          sport: 'Soccer',
          league: gameEvent.league?.name?.trim() || data.season?.displayName?.trim() || 'League N/A',
          teams: { home: homeTeam, away: awayTeam },
          date: gameEvent.date,
          venue: (competition.venue?.fullName || 'N/A').trim(),
          status,
          scores,
          streamingLinks,
          broadcastInfo: competition.broadcasts?.[0]?.media?.shortName?.trim(),
          statistics: gameHomeStats.length > 0 || gameAwayStats.length > 0 ? { home: gameHomeStats, away: gameAwayStats } : null,
          details: gameMatchDetails.length > 0 ? gameMatchDetails : null,
        };
        upcomingGames.push(sportEvent);
      });
    }
  } catch (error) {
    console.error(`Failed to fetch or process schedule for soccer team ${teamId} from ESPN:`, error);
    return { teamDetails: null, upcomingGames: [] };
  }

  return { teamDetails, upcomingGames: upcomingGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
}

// Helper to look up team name by ID, useful for details array if only team ID is present
// This would require having team data available or fetching it.
// For simplicity, the transformEspnEvent assumes team names are available from home/away competitor data.
