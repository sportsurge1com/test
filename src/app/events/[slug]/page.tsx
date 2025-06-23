
import { getEventBySlug, getAllEventsCombined } from '@/lib/data';
import type { SportEvent } from '@/lib/types';
import { Scoreboard } from '@/components/event/Scoreboard';
import { StreamingPlaceholder } from '@/components/event/StreamingPlaceholder';
import { AiGamePreview } from '@/components/event/AiGamePreview';
import { EventStatistics } from '@/components/event/EventStatistics';
import { MatchDetailsFeed } from '@/components/event/MatchDetailsFeed'; // Import the new component
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, MapPin, Trophy, Users, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// ISR revalidation time (e.g., 1 hour for live/scheduled, longer for finished)
export async function generateRevalidate(event?: SportEvent) {
  if (event && event.status === 'finished') {
    return 60 * 60 * 24 * 7; // 1 week for finished events
  }
  return 60; // 60 seconds for other events
}


interface EventPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const allEvents = await getAllEventsCombined();
  // Allow static generation for all events, including finished ones
  return allEvents.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const event = await getEventBySlug(awaitedParams.slug);
  const siteBaseUrl = 'https://www.sportsurge.uno';

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The event you are looking for could not be found on Sportsurge.',
    };
  }

  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'PPPp'); // e.g., June 14th, 2024 at 7:00 PM

  let displayTitle = event.title;
  const teamSports = ['soccer', 'basketball', 'nfl', 'mlb', 'nhl', 'american-football', 'ice-hockey', 'baseball'];

  if (teamSports.includes(event.sport.toLowerCase().replace(/\s+/g, '-'))) {
    const atMatch = event.title.match(/(.*) at (.*)/i);
    if (atMatch && atMatch.length === 3) {
      displayTitle = `${atMatch[1].trim()} vs ${atMatch[2].trim()}`;
    } else if (!event.title.toLowerCase().includes(" vs ")) {
      displayTitle = `${event.teams.home.name} vs ${event.teams.away.name}`;
    }
  }

  let statusSuffix: string;
  if (event.status === 'live' || event.status === 'halftime') {
    statusSuffix = 'Live Score & Stream';
  } else if (event.status === 'finished') {
    statusSuffix = 'Result & Highlights';
  } else { // scheduled, postponed, etc.
    statusSuffix = 'Live Score & Stream';
  }

  let pageTitleSegment: string;
  if (event.sport.toLowerCase() === 'soccer') {
    pageTitleSegment = `${displayTitle} ${statusSuffix} - Sportsurge Soccer`;
  } else {
    pageTitleSegment = `${displayTitle} ${statusSuffix} - ${event.league}`;
  }

  const description = `Access ${displayTitle} ${event.status === 'finished' ? 'results, scores,' : 'live scores, match details,'} start time (${formattedDate}), venue (${event.venue}), and Sportsurge streaming information. ${event.sport.toLowerCase() === 'soccer' ? 'Sportsurge is your top source for sportsurge soccer streams.' : ''}`;

  const keywords = [
    event.sport,
    event.league,
    event.teams.home.name,
    event.teams.away.name,
    (event.status === 'live' || event.status === 'halftime') ? "live scores" : (event.status === 'finished' ? "results" : "schedule"),
    "match details",
    "sports schedule",
    "streaming links",
    "Sportsurge",
    displayTitle,
    event.venue,
    "sportsurge soccer",
  ];

  const canonicalUrl = `${siteBaseUrl}/events/${awaitedParams.slug}`;

  return {
    title: pageTitleSegment,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitleSegment,
      description,
      url: canonicalUrl,
      siteName: 'Sportsurge',
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitleSegment,
      description,
    },
  };
}

function getEventStatusSchema(status: SportEvent['status']) {
  switch (status) {
    case 'scheduled':
      return 'https://schema.org/EventScheduled';
    case 'live':
    case 'halftime':
      return 'https://schema.org/EventScheduled'; // Still considered scheduled while live/halftime
    case 'finished':
      return 'https://schema.org/EventCompleted';
    case 'postponed':
      return 'https://schema.org/EventPostponed';
    case 'cancelled':
      return 'https://schema.org/EventCancelled';
    default:
      return 'https://schema.org/EventScheduled';
  }
}


export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);

  let displayTitleForJsonLd = event.title;
  const teamSports = ['soccer', 'basketball', 'nfl', 'mlb', 'nhl', 'american-football', 'ice-hockey', 'baseball'];
  if (teamSports.includes(event.sport.toLowerCase().replace(/\s+/g, '-'))) {
    const atMatch = event.title.match(/(.*) at (.*)/i);
    if (atMatch && atMatch.length === 3) {
      displayTitleForJsonLd = `${atMatch[1].trim()} vs ${atMatch[2].trim()}`;
    } else if (!event.title.toLowerCase().includes(" vs ")) {
      displayTitleForJsonLd = `${event.teams.home.name} vs ${event.teams.away.name}`;
    }
  }

  let displayTitleForH1: string;
  if (teamSports.includes(event.sport.toLowerCase().replace(/\s+/g, '-'))) {
    const atMatch = event.title.match(/(.*) at (.*)/i);
    if (atMatch && atMatch.length === 3) {
      displayTitleForH1 = `${atMatch[1].trim()} vs ${atMatch[2].trim()}`;
    } else if (!event.title.toLowerCase().includes(" vs ")) {
      displayTitleForH1 = `${event.teams.home.name} vs ${event.teams.away.name}`;
    } else {
      displayTitleForH1 = event.title;
    }
  } else {
    displayTitleForH1 = event.title;
  }

  if (event.status === 'live' || event.status === 'halftime') {
    displayTitleForH1 = `${displayTitleForH1} Live Score & Stream`;
  } else if (event.status === 'finished') {
     displayTitleForH1 = `${displayTitleForH1} Final Score & Highlights`;
  } else {
    displayTitleForH1 = `${displayTitleForH1} Live Score & Stream`;
  }


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": displayTitleForJsonLd,
    "startDate": eventDate.toISOString(),
    "endDate": event.status === 'finished' && event.scores ? eventDate.toISOString() : undefined, // Approximation
    "eventStatus": getEventStatusSchema(event.status),
    "location": {
      "@type": "Place",
      "name": event.venue,
    },
    "competitor": [
      { "@type": "SportsTeam", "name": event.teams.home.name },
      { "@type": "SportsTeam", "name": event.teams.away.name }
    ],
    "organizer": {
      "@type": "Organization",
      "name": event.league
    },
    "description": `${(event.status === 'live' || event.status === 'halftime') ? 'Live updates, scores, and Sportsurge streaming details for' : event.status === 'finished' ? 'Final results and highlights for' : 'Sportsurge streaming details for'} ${displayTitleForJsonLd}, a ${event.league} ${event.sport} event on Sportsurge featuring ${event.teams.home.name} vs ${event.teams.away.name}. ${event.sport.toLowerCase() === 'soccer' ? 'Sportsurge is your top source for sportsurge soccer options.' : ''}`,
    "sport": event.sport,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="text-center py-6">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-2 pt-4">{displayTitleForH1}</h1>
        <p className="text-lg text-muted-foreground">{event.league} - {event.sport}</p>
      </section>

      <Scoreboard event={event} />

      <div className="grid md:grid-cols-2 gap-8">
        <StreamingPlaceholder event={event} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-headline flex items-center">
              <CalendarDays className="h-6 w-6 mr-2 text-primary" /> Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-muted-foreground" />
              <strong>League:</strong> <span className="ml-1">{event.league}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <strong>Teams:</strong> <span className="ml-1">{event.teams.home.name} vs {event.teams.away.name}</span>
            </div>
            <Separator className="my-2"/>
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground" />
              <strong>Date:</strong> <span className="ml-1">{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <strong>Time:</strong> <span className="ml-1">{format(eventDate, 'p')} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <strong>Venue:</strong> <span className="ml-1">{event.venue}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EventStatistics statistics={event.statistics} teamNames={{home: event.teams.home.name, away: event.teams.away.name}} />
      
      <MatchDetailsFeed details={event.details} teamNames={{ home: event.teams.home.name, away: event.teams.away.name }} teamsById={{[event.teams.home.id]: event.teams.home.name, [event.teams.away.id]: event.teams.away.name}} />

      {event.aiPreview && <AiGamePreview previewText={event.aiPreview} />}

      {!event.aiPreview && (
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-headline flex items-center">
              <Info className="h-6 w-6 mr-2 text-primary" /> About This Match on Sportsurge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Find {(event.status === 'live' || event.status === 'halftime') ? 'live scores, updates,' : event.status === 'finished' ? 'final scores, results,' : 'details,'} and Sportsurge streaming information for {event.title}.
              This {event.league} {event.sport} match {(event.status === 'live' || event.status === 'halftime' || event.status === 'scheduled') ? 'features' : 'featured'} {event.teams.home.name} facing off against {event.teams.away.name}
              at {event.venue} on {format(eventDate, 'EEEE, MMMM d, yyyy')} at {format(eventDate, 'p')}.
              {event.sport.toLowerCase() === 'soccer' && " Sportsurge is your top source for sportsurge soccer streams. "}
              Check Sportsurge for {(event.status === 'live' || event.status === 'halftime' || event.status === 'scheduled') ? 'live updates and post-match analysis.' : 'full match details and analysis.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
export const revalidate = 60; 

    