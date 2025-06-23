
import type { MatchDetailItem, Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Goal, RectangleVertical, Users, UserMinus, UserPlus, AlertCircle } from 'lucide-react'; // UserMinus/Plus for substitutions
import { cn } from '@/lib/utils';

interface MatchDetailsFeedProps {
  details?: MatchDetailItem[] | null;
  teamNames: { home: string; away: string };
  teamsById: { [key: string]: string }; // Mapping team ID to team name
}

function getDetailIcon(detail: MatchDetailItem) {
  if (detail.isGoal) {
    return <Goal className="h-5 w-5 text-green-500" />;
  }
  if (detail.isCard) {
    if (detail.cardType === 'yellow') {
      return <RectangleVertical className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
    }
    if (detail.cardType === 'red') {
      return <RectangleVertical className="h-5 w-5 text-red-500 fill-red-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-500" />; // Generic card
  }
  if (detail.type.toLowerCase().includes('substitution')) {
     return <Users className="h-5 w-5 text-blue-500" />;
  }
  return <Newspaper className="h-5 w-5 text-muted-foreground" />; // Default icon
}

export function MatchDetailsFeed({ details, teamNames, teamsById }: MatchDetailsFeedProps) {
  if (!details || details.length === 0) {
    return null; // Don't render if no details are available
  }

  // Sort details by time, assuming 'time' is like "45'", "90'+2'".
  // This is a basic sort and might need refinement for complex time formats.
  const sortedDetails = [...details].sort((a, b) => {
    const timeA = parseInt(a.time.replace(/[^0-9]/g, ''), 10);
    const timeB = parseInt(b.time.replace(/[^0-9]/g, ''), 10);
    return timeA - timeB;
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold font-headline flex items-center">
          <Newspaper className="h-6 w-6 mr-2 text-primary" /> Match Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {sortedDetails.map((detail, index) => {
          const playerInfo = detail.athletesInvolved && detail.athletesInvolved.length > 0
            ? detail.athletesInvolved.map(ath => ath.displayName).join(', ')
            : '';
          
          const teamName = detail.teamId && teamsById[detail.teamId] 
            ? teamsById[detail.teamId] 
            : detail.teamName;

          let eventDescription = detail.type;
          if (detail.isGoal) eventDescription = 'Goal';
          if (detail.isOwnGoal) eventDescription = 'Own Goal';
          if (detail.isPenalty && detail.isGoal) eventDescription = 'Penalty Scored';
          if (detail.isPenalty && !detail.isGoal) eventDescription = 'Penalty Missed/Saved';


          return (
            <div key={index} className="flex items-start space-x-3 p-3 bg-card hover:bg-muted/40 rounded-md transition-colors duration-150">
              <div className="flex-shrink-0 pt-0.5">{getDetailIcon(detail)}</div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">{eventDescription}</span>
                  <span className="text-xs text-muted-foreground">{detail.time}</span>
                </div>
                {playerInfo && (
                  <p className="text-foreground/90">
                    Player: <span className="font-medium">{playerInfo}</span>
                  </p>
                )}
                {teamName && (
                   <p className="text-xs text-muted-foreground">
                    Team: {teamName}
                  </p>
                )}
                {detail.notes && <p className="text-xs text-muted-foreground italic">{detail.notes}</p>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
