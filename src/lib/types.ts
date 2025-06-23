import type { LucideIcon } from 'lucide-react';

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  abbreviation?: string;
}

export interface Score {
  home: number | null;
  away: number | null;
  displayHome?: string;
  displayAway?: string;
}

export type EventStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' | 'halftime';

export interface StatisticItem {
  name: string; // e.g., "foulsCommitted", "possessionPct"
  abbreviation: string; // e.g., "FC", "PP"
  displayValue: string; // e.g., "10", "65.3"
}

export interface MatchDetailAthlete {
  id: string;
  displayName: string;
  teamId?: string; // To know which team the athlete belongs to
}

export interface MatchDetailItem {
  type: 'Goal' | 'Yellow Card' | 'Red Card' | 'Substitution' | 'Penalty Scored' | 'Penalty Missed' | 'Own Goal' | string; // string for other types
  time: string; // e.g., "34'", "45'+3'"
  teamId?: string; // ID of the team involved (home or away)
  teamName?: string; // Name of the team involved
  athletesInvolved?: MatchDetailAthlete[];
  isGoal?: boolean;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
  isCard?: boolean;
  cardType?: 'yellow' | 'red';
  notes?: string; // Additional notes, e.g., "(Penalty)"
}

export interface SportEvent {
  id: string;
  slug: string;
  title: string;
  sport: string;
  league: string;
  teams: {
    home: Team;
    away: Team;
  };
  date: string;
  venue: string;
  status: EventStatus;
  scores?: Score;
  streamingLinks?: { name: string; url: string; type: 'official' | 'unofficial' | 'highlight' }[];
  aiPreview?: string;
  broadcastInfo?: string;
  isMainEvent?: boolean;
  statistics?: {
    home: StatisticItem[];
    away: StatisticItem[];
  } | null;
  details?: MatchDetailItem[] | null;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: LucideIcon;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  sportSlug: string;
  logoUrl?: string;
  description?: string;
}

export interface NflTeam {
  slug: string;
  name: string;
  id365: string;
  abbreviation: string;
  logoUrl?: string;
  record?: string;
}

export interface SoccerTeamDetailedInfo {
  id: string; // ESPN's numeric ID
  name: string;
  displayName: string;
  abbreviation?: string;
  logoUrl: string;
  recordSummary?: string;
  standingSummary?: string;
  clubhouseUrl?: string;
  color?: string;
  alternateColor?: string;
  seasonYear?: number;
  seasonDisplayName?: string;
}
