
import { getAllSports, getAllLeagues } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, ListChecks, Zap } from 'lucide-react';

export default async function HomePage({ searchParams }: { searchParams?: { sport?: string; league?: string; search?: string } }) {
  const sports = await getAllSports();
  const leagues = await getAllLeagues();

  return (
    <div className="space-y-12">
      <section className="text-center py-16 md:py-24">
        <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground mb-4 px-4">
          Welcome to Sportsurge
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
          Your ultimate destination for live sports scores, schedules, and streaming information. Sportsurge brings you the best in sports, instantly.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/leagues">
              Explore Leagues <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#sports-section">
              Browse Sports
            </Link>
          </Button>
        </div>
      </section>

      <Separator className="my-12 bg-border/40" />

      <section id="sports-section">
        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center text-foreground">
          Explore Sports & Leagues on Sportsurge
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {sports.map((sport) => {
            const SportIcon = sport.icon;
            const displaySportName = `Sportsurge ${sport.name}`;
            return (
              <Card
                key={sport.id}
                className="group flex flex-col border border-border/40 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-primary/60 transform hover:scale-[1.03] transition-all duration-300 ease-in-out"
              >
                <CardHeader className="flex-row items-center space-x-4 p-5 bg-muted/20">
                  {SportIcon && <SportIcon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />}
                  <CardTitle className="text-xl font-semibold">{displaySportName}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Browse events and news for {displaySportName} on Sportsurge. Find live scores, updates, and more.
                  </p>
                </CardContent>
                <CardFooter className="p-5 border-t border-border/20">
                  <Button asChild variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Link href={`/${sport.slug}`}>
                      View {displaySportName} <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          <Card
            key="all-leagues"
            className="group flex flex-col border border-border/40 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-primary/60 transform hover:scale-[1.03] transition-all duration-300 ease-in-out"
          >
            <CardHeader className="flex-row items-center space-x-4 p-5 bg-muted/20">
              <ListChecks className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="text-xl font-semibold">All Leagues</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover all available sports leagues on Sportsurge, from major tournaments to local championships.
              </p>
            </CardContent>
            <CardFooter className="p-5 border-t border-border/20">
              <Button asChild variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Link href="/leagues">
                  Browse Leagues <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
