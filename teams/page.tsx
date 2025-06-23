
import { nflTeams } from '@/lib/nfl-teams';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Dribbble, Goal, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Teams',
  description: 'Discover all sports teams available on Sportsurge, including NFL, NBA, and Soccer teams.',
};

export default function TeamsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <Users className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">
          Browse Teams
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore your favorite teams across different sports on Sportsurge.
        </p>
      </section>

      {/* NFL Teams Section */}
      <section id="nfl-teams">
        <h2 className="text-3xl font-bold font-headline mb-8 flex items-center">
          <Trophy className="h-8 w-8 mr-3 text-primary" /> NFL Teams
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nflTeams.map(team => (
            <Card key={team.slug} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{team.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button asChild variant="outline" size="sm" className="w-full mt-auto">
                  <Link href={`/nfl/teams/${team.slug}`}>View Team Page</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* NBA Teams Section Placeholder */}
      <section id="nba-teams">
        <h2 className="text-3xl font-bold font-headline mb-8 flex items-center">
          <Dribbble className="h-8 w-8 mr-3 text-primary" /> NBA Teams
        </h2>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-muted-foreground">
              NBA team pages are coming soon.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              For now, you can find NBA games on the <Link href="/basketball" className="text-primary hover:underline">Basketball page</Link>.
            </p>
          </CardContent>
        </Card>
      </section>
      
      {/* Soccer Teams Section Placeholder */}
      <section id="soccer-teams">
        <h2 className="text-3xl font-bold font-headline mb-8 flex items-center">
          <Goal className="h-8 w-8 mr-3 text-primary" /> Soccer Teams
        </h2>
         <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Individual team pages for Soccer can be accessed from event pages.
            </p>
             <p className="text-sm text-muted-foreground mt-2">
              Due to the vast number of teams, a central directory is not available. Browse games on the <Link href="/soccer" className="text-primary hover:underline">Soccer page</Link>.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
