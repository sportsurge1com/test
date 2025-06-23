import { getAllLeagues, getAllSports } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import Image from 'next/image'; // Image component removed
import { List } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Leagues',
  description: 'Discover all sports leagues available on Sportsurge, including Premier League, NBA, La Liga, and more.',
};

export default async function LeaguesPage() {
  const leagues = await getAllLeagues();
  const sports = await getAllSports();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">
          Browse Leagues
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore various sports leagues and find your favorite on Sportsurge.
        </p>
      </section>

      {sports.map(sport => {
        const sportLeagues = leagues.filter(league => league.sportSlug === sport.slug);
        if (sportLeagues.length === 0) return null;

        return (
          <section key={sport.id} className="mb-10">
            <h2 className="text-2xl font-semibold font-headline mb-4 flex items-center">
              {sport.icon && <sport.icon className="h-7 w-7 mr-2 text-primary" />} {sport.name} Leagues
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sportLeagues.map(league => (
                <Card key={league.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-3">
                      {/* Image for league logo removed */}
                       {!league.logoUrl && sport.icon && <sport.icon className="h-8 w-8 text-muted-foreground" />}
                       {!league.logoUrl && !sport.icon && <List className="h-8 w-8 text-muted-foreground" />}
                      <CardTitle className="text-lg font-medium">{league.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3 h-10">
                      {league.description || `Part of ${sport.name}`}
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/${sport.slug}`}>View Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
