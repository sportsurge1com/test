
import Link from 'next/link';
import type { SportEvent } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, Tv, PlayCircle, Users, ArrowRight, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { nflTeams } from '@/lib/nfl-teams';

interface EventCardProps {
  event: SportEvent;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  const getStatusBadgeVariant = (status: SportEvent['status']) => {
    switch (status) {
      case 'live':
        return 'destructive';
      case 'finished':
        return 'secondary';
      case 'scheduled':
        return 'default';
      default:
        return 'outline';
    }
  };

  const displayTitle = event.title.replace(/ at /gi, ' vs ');
  const isMmaMainEvent = event.isMainEvent && event.sport.toLowerCase() === 'mma';

  const isNflEvent = event.league === 'NFL';
  const isSoccerEvent = event.sport.toLowerCase() === 'soccer';

  const getTeamLinkPath = (team: SportEvent['teams']['home'] | SportEvent['teams']['away']): string | null => {
    if (isNflEvent) {
      const nflTeam = nflTeams.find(nt => nt.name.toLowerCase() === team.name.toLowerCase() || nt.id365 === team.id.replace('365scores-team-', ''));
      if (nflTeam) {
        return `/nfl/teams/${nflTeam.slug}`;
      }
    } else if (isSoccerEvent) {
      const espnTeamIdMatch = team.id.match(/^espn-team-(\d+)$/i);
      if (espnTeamIdMatch && espnTeamIdMatch[1]) {
        return `/soccer/teams/${espnTeamIdMatch[1]}`;
      }
    }
    return null;
  };


  const TeamDisplay = ({ team }: { team: SportEvent['teams']['home'] | SportEvent['teams']['away'] }) => {
    const linkPath = getTeamLinkPath(team);
    const content = (
      <>
        <span className="text-sm font-medium truncate w-full">{team.name}</span>
      </>
    );

    if (linkPath) {
      return (
        <Link href={linkPath} className="flex flex-col items-center text-center w-full sm:w-2/5 hover:opacity-80 transition-opacity">
          {content}
        </Link>
      );
    }
    return <div className="flex flex-col items-center text-center w-full sm:w-2/5">{content}</div>;
  };


  return (
    <Card className={cn(
      "group flex flex-col h-full border border-border/40 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-primary/60 transform hover:scale-[1.02] transition-all duration-300 ease-in-out relative",
      { 'border-accent/80 ring-2 ring-accent/70 shadow-accent/30 shadow-lg': isMmaMainEvent }
    )}>
      <CardHeader className="p-4 bg-muted/20">
        {isMmaMainEvent && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-sm px-3 py-1.5 animate-pulse z-10 flex items-center">
            <Star className="h-5 w-5 mr-1.5 fill-current" />
            MAIN EVENT
          </Badge>
        )}
        <div className="flex justify-between items-start mb-1">
          <CardTitle className={cn(
            "text-lg font-headline leading-tight group-hover:text-primary transition-colors duration-300 pr-20 sm:pr-24",
            isMmaMainEvent && "text-accent font-bold text-xl"
          )}>
            <Link href={`/events/${event.slug}`} className="hover:underline">
              {displayTitle}
            </Link>
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(event.status)} className="ml-2 shrink-0 capitalize text-xs px-2 py-0.5">
            {event.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{event.league} - {event.sport}</p>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex flex-col sm:flex-row items-center sm:justify-around mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <TeamDisplay team={event.teams.home} />
          <div className="text-2xl font-bold text-muted-foreground">
            {(event.status === 'live' || event.status === 'finished') && event.scores && event.scores.home !== null && event.scores.away !== null ? (
              <span className='text-foreground'>{event.scores.displayHome ?? event.scores.home} - {event.scores.displayAway ?? event.scores.away}</span>
            ) : (
              'VS'
            )}
          </div>
          <TeamDisplay team={event.teams.away} />
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            {format(eventDate, 'EEE, MMM d, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            {format(eventDate, 'p')} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </div>
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            {event.venue}
          </div>
           {event.broadcastInfo && (
            <div className="flex items-center">
              <Tv className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
              {event.broadcastInfo}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-border/20">
        <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" variant="secondary">
          <Link href={`/events/${event.slug}`}>
            <PlayCircle className="mr-2 h-4 w-4" /> View Event & Streams <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
