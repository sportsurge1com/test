
import { fetchEspnSoccerTeamScheduleAndInfo } from '@/lib/espn-api';
import type { SportEvent, SoccerTeamDetailedInfo } from '@/lib/types';
import { EventCard } from '@/components/event/EventCard';
import { notFound } from 'next/navigation';
import { CalendarDays, Trophy, Users, BarChart3, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SoccerTeamPageProps {
  params: { teamId: string }; // ESPN numeric team ID
}

// Since the number of soccer teams is vast, we won't pre-generate all.
// Pages will be generated on demand.
export async function generateStaticParams() {
  return []; 
}

export async function generateMetadata({ params }: SoccerTeamPageProps): Promise<Metadata> {
  const { teamDetails } = await fetchEspnSoccerTeamScheduleAndInfo(params.teamId);
  
  if (!teamDetails) {
    return {
      title: 'Soccer Team Not Found | Sportsurge',
      description: 'The soccer team page you are looking for could not be found on Sportsurge.',
    };
  }
  return {
    title: `${teamDetails.displayName} Schedule & Info | Sportsurge Soccer`,
    description: `Find the latest game schedule, scores, and information for ${teamDetails.displayName} on Sportsurge. Your source for ${teamDetails.displayName} soccer action.`,
  };
}

export default async function SoccerTeamPage({ params }: SoccerTeamPageProps) {
  const { teamDetails, upcomingGames: allFetchedGames } = await fetchEspnSoccerTeamScheduleAndInfo(params.teamId);

  if (!teamDetails) {
    notFound();
  }

  const upcomingGames = allFetchedGames.filter(event => event.status !== 'finished' && event.status !== 'postponed' && event.status !== 'cancelled');

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Image placeholder removed */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">
            {teamDetails.displayName}
          </h1>
          <p className="text-lg text-muted-foreground mb-1">
            {teamDetails.seasonDisplayName || `Soccer Team Page`} | Sportsurge
          </p>
          {teamDetails.recordSummary && (
            <p className="text-sm text-muted-foreground">Record: {teamDetails.recordSummary}</p>
          )}
          {teamDetails.standingSummary && (
            <p className="text-sm text-muted-foreground">{teamDetails.standingSummary}</p>
          )}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6 text-primary flex items-center">
          <CalendarDays className="h-8 w-8 mr-3" /> Upcoming Games
        </h2>
        {upcomingGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingGames.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground/70 mb-6" />
              <p className="text-xl text-muted-foreground">
                No upcoming games currently scheduled for {teamDetails.displayName} or the season has concluded.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check back later for updates, or view all soccer games.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
       <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/soccer">View All Soccer Games</Link>
          </Button>
        </div>
    </div>
  );
}

export const revalidate = 3600; // Revalidate team pages every hour
