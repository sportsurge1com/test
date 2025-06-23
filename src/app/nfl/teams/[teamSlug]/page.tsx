
import { getNflTeamBySlug, nflTeams } from '@/lib/nfl-teams';
import { fetchScores365TeamDetails, fetchScores365TeamGames } from '@/lib/scores365-api';
import type { SportEvent, NflTeam as NflTeamDetails } from '@/lib/types';
import { EventCard } from '@/components/event/EventCard';
import { notFound } from 'next/navigation';
import { CalendarDays, ShieldCheck, ListOrdered, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NflTeamPageProps {
  params: { teamSlug: string };
}

export async function generateStaticParams() {
  return nflTeams.map((team) => ({
    teamSlug: team.slug,
  }));
}

export async function generateMetadata({ params }: NflTeamPageProps): Promise<Metadata> {
  const teamInfo = getNflTeamBySlug(params.teamSlug);
  if (!teamInfo) {
    return {
      title: 'NFL Team Not Found | Sportsurge',
      description: 'The NFL team page you are looking for could not be found on Sportsurge.',
    };
  }
  return {
    title: `${teamInfo.name} Schedule & Info | Sportsurge NFL`,
    description: `Find the latest game schedule, scores, and information for the ${teamInfo.name} on Sportsurge. Your source for ${teamInfo.name} NFL action, including Sportsurge NFL updates and nflbite ${teamInfo.name} details.`,
  };
}

export default async function NflTeamPage({ params }: NflTeamPageProps) {
  const teamBaseInfo = getNflTeamBySlug(params.teamSlug);

  if (!teamBaseInfo) {
    notFound();
  }

  const teamDetails = await fetchScores365TeamDetails(teamBaseInfo.id365);
  const teamScheduleRaw = await fetchScores365TeamGames(teamBaseInfo.id365);

  const upcomingGames = teamScheduleRaw
    .filter(event => event.status !== 'finished' && event.status !== 'postponed' && event.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const teamDisplayInfo: NflTeamDetails = {
    ...teamBaseInfo,
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Image placeholder removed */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">
            {teamDisplayInfo.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your comprehensive guide to the {teamDisplayInfo.name} on Sportsurge NFL. Get the latest game schedules, live scores, team news, and nflbite {teamDisplayInfo.name} insights. Follow every touchdown and play with Sportsurge.
          </p>
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
                No upcoming games currently scheduled for the {teamDisplayInfo.name} or the season has concluded.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check back later for updates, or view all NFL games.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
       <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/american-football">View All NFL Games</Link>
          </Button>
        </div>
    </div>
  );
}

export const revalidate = 3600; // Revalidate team pages every hour
