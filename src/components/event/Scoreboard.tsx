
import type { SportEvent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface ScoreboardProps {
  event: SportEvent;
}

export function Scoreboard({ event }: ScoreboardProps) {
  const { teams, scores, status, date } = event;
  const eventDate = new Date(date);

  const getStatusText = () => {
    if (status === 'halftime') return 'Halftime';
    return status;
  };

  const getBadgeVariant = () => {
    if (status === 'live' || status === 'halftime') return 'destructive';
    if (status === 'finished') return 'secondary';
    return 'default';
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold font-headline">Match Status</h3>
          <Badge variant={getBadgeVariant()} className="capitalize text-sm px-3 py-1">
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center text-center gap-4 sm:gap-2">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <span className="font-medium text-base sm:text-lg">{teams.home.name}</span>
          </div>

          {/* Scores / VS */}
          <div className="flex flex-col items-center">
            {status === 'live' || status === 'finished' || status === 'halftime' ? (
              <div className="text-4xl sm:text-5xl font-bold text-accent">
                <span>{scores?.home ?? 0}</span>
                <span className="mx-2">-</span>
                <span>{scores?.away ?? 0}</span>
              </div>
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">VS</span>
            )}
             {status === 'scheduled' && (
              <p className="text-xs text-muted-foreground mt-1">Match starts soon</p>
            )}
            {status === 'postponed' && (
              <p className="text-xs text-muted-foreground mt-1">Postponed</p>
            )}
             {status === 'cancelled' && (
              <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
            )}
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {format(eventDate, 'EEE, MMM d, yyyy - p')} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <span className="font-medium text-base sm:text-lg">{teams.away.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
