
import { getAllEvents, getAllSports, getSportBySlug } from '@/lib/data';
import { fetchAllEspnEvents } from '@/lib/espn-api';
import { fetchAllScores365Events } from '@/lib/scores365-api';
import type { SportEvent } from '@/lib/types';
import { EventCard } from '@/components/event/EventCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

interface SportPageProps {
  params: { sportSlug: string };
}

export async function generateStaticParams() {
  const sports = await getAllSports();
  return sports.map((sport) => ({
    sportSlug: sport.slug,
  }));
}

export async function generateMetadata({ params }: SportPageProps): Promise<Metadata> {
  const sport = await getSportBySlug(params.sportSlug);
  if (!sport) {
    return { title: 'Sport Not Found | Sportsurge' };
  }
  
  let sportPageTitle: string;
  let sportPageDescription: string;

  if (sport.slug === 'american-football') {
    sportPageTitle = "Sportsurge NFL";
    sportPageDescription = "Welcome to the ultimate hub for Sportsurge NFL action! Find live NFL scores, today's game schedules, and direct Sportsurge streaming links for all National Football League matchups, including pre-season and regular season games. Never miss a touchdown with Sportsurge.";
  } else if (sport.slug === 'ice-hockey') {
    sportPageTitle = "Sportsurge NHL";
    sportPageDescription = "Dive into the heart of the National Hockey League action with Sportsurge. Get up-to-the-minute live NHL scores, comprehensive game schedules, and reliable Sportsurge streaming links for all NHL matchups. From regular season clashes to the intensity of the Stanley Cup playoffs, Sportsurge is your ultimate source for NHL.";
  } else {
    sportPageTitle = `Sportsurge ${sport.name}`;
    sportPageDescription = `Explore all live events, upcoming schedules, and reliable Sportsurge streaming links for ${sport.name}. Sportsurge provides comprehensive coverage, including live scores and game details, making it your top destination for ${sport.name} action.`;
  }


  return {
    title: `${sportPageTitle} Events | Sportsurge`,
    description: sportPageDescription,
  };
}

export default async function SportPage({ params }: SportPageProps) {
  const sport = await getSportBySlug(params.sportSlug);
  if (!sport) {
    notFound();
  }

  const eventMap = new Map<string, SportEvent>();
  let espnEventsData: SportEvent[] = [];
  let scores365EventsData: SportEvent[] = [];

  if (sport.slug === 'american-football') {
    espnEventsData = await fetchAllEspnEvents(sport.slug).catch(e => { console.error("ESPN fetch error for NFL in SportPage:", e); return []; });
    espnEventsData.forEach(event => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
  } else if (params.sportSlug === 'baseball') { 
    scores365EventsData = await fetchAllScores365Events(params.sportSlug).catch(e => { console.error("365Scores fetch error in SportPage (MLB only):", e); return []; });
    scores365EventsData.forEach(event => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
  } else { 
    [espnEventsData, scores365EventsData] = await Promise.all([
      fetchAllEspnEvents(params.sportSlug).catch(e => { console.error("ESPN fetch error in SportPage:", e); return []; }),
      fetchAllScores365Events(params.sportSlug).catch(e => { console.error("365Scores fetch error in SportPage:", e); return []; }),
    ]);

    espnEventsData.forEach(event => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
    scores365EventsData.forEach(event => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
  }

  let fetchedEvents = Array.from(eventMap.values());
  let sortedEvents: SportEvent[];

  if (sport.slug === 'mma') {
    const mainEvents = fetchedEvents
      .filter(e => e.isMainEvent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const otherEvents = fetchedEvents
      .filter(e => !e.isMainEvent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedEvents = [...mainEvents, ...otherEvents];
  } else {
    sortedEvents = fetchedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  const displayEvents = sortedEvents.filter(event => event.status !== 'finished');

const boxingCustomHtml = `
<div class="space-y-6 text-foreground">
  <h3 class="text-3xl font-bold text-primary text-center">Sportsurge Free Boxing Live Stream</h3>
  <p class="text-center text-muted-foreground mb-6">Watch live stream Reddit boxing free. You can watch live boxing tonight fights free on Sport Surge boxing.</p>
  
  <!-- BOXING SPECIAL FIGHTS -->
  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Andrew%20Tabiti%20vs%20Jacob%20Dickson', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Andrew%20Tabiti%20vs%20Jacob%20Dickson" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Andrew Tabiti vs Jacob Dickson
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 13
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#LeAnna%20Cruz%20vs%20Regina%20Chavez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#LeAnna%20Cruz%20vs%20Regina%20Chavez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          LeAnna Cruz vs Regina Chavez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 13
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Richardson%20Hitchins%20vs%20George%20Kambosos', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Richardson%20Hitchins%20vs%20George%20Kambosos" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Richardson Hitchins vs George Kambosos
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 14
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Andy%20Cruz%20vs%20Hironori%20Mishiro', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Andy%20Cruz%20vs%20Hironori%20Mishiro" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Andy Cruz vs Hironori Mishiro
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 14
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Juan%20Francisco%20Estrada%20vs%20Karim%20Arce%20Lugo', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Juan%20Francisco%20Estrada%20vs%20Karim%20Arce%20Lugo" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Juan Francisco Estrada vs Karim Arce Lugo
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 14
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Nonito%20Donaire%20vs%20Andres%20Campos', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Nonito%20Donaire%20vs%20Andres%20Campos" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Nonito Donaire vs Andres Campos
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 14
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Brian%20Norman%20Jr.%20vs%20Jin%20Sasaki', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Brian%20Norman%20Jr.%20vs%20Jin%20Sasaki" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Brian Norman Jr. vs Jin Sasaki
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Thursday, June 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Cristian%20Araneta%20vs%20Thanongsak%20Simsri', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Cristian%20Araneta%20vs%20Thanongsak%20Simsri" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Cristian Araneta vs Thanongsak Simsri
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Thursday, June 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#David%20Stevens%20vs%20Petr%20Khamukov', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#David%20Stevens%20vs%20Petr%20Khamukov" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          David Stevens vs Petr Khamukov
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 20
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Vito%20Mielnicki%20vs%20Kamil%20Gardzielik', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Vito%20Mielnicki%20vs%20Kamil%20Gardzielik" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Vito Mielnicki vs Kamil Gardzielik
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Galal%20Yafai%20vs%20Francisco%20Rodriguez%20Jr.', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Galal%20Yafai%20vs%20Francisco%20Rodriguez%20Jr." target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Galal Yafai vs Francisco Rodriguez Jr.
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Shabaz%20Masoud%20vs%20Ionut%20Baluta', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Shabaz%20Masoud%20vs%20Ionut%20Baluta" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Shabaz Masoud vs Ionut Baluta
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Callum%20Walsh%20vs%20Elias%20Espadas', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Callum%20Walsh%20vs%20Elias%20Espadas" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Callum Walsh vs Elias Espadas
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Cain%20Sandoval%20vs%20Jesus%20Madueno%20Angulo', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Cain%20Sandoval%20vs%20Jesus%20Madueno%20Angulo" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Cain Sandoval vs Jesus Madueno Angulo
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Umar%20Dzambekov%20vs%20Roamer%20Alexis%20Angulo', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Umar%20Dzambekov%20vs%20Roamer%20Alexis%20Angulo" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Umar Dzambekov vs Roamer Alexis Angulo
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Iyana%20%22Roxy%22%20Verduzco%20vs%20Celene%20Roman', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Iyana%20%22Roxy%22%20Verduzco%20vs%20Celene%20Roman" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Iyana "Roxy" Verduzco vs Celene Roman
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 21
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Liam%20Paro%20vs%20Jonathan%20Navarro', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Liam%20Paro%20vs%20Jonathan%20Navarro" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Liam Paro vs Jonathan Navarro
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Wednesday, June 25
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Liam%20Wilson%20vs%20Ayrton%20Osmar%20Gimenez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Liam%20Wilson%20vs%20Ayrton%20Osmar%20Gimenez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Liam Wilson vs Ayrton Osmar Gimenez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Wednesday, June 25
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Deontay%20Wilder%20vs%20Tyrrell%20Herndon', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Deontay%20Wilder%20vs%20Tyrrell%20Herndon" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Deontay Wilder vs Tyrrell Herndon
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 27
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Christian%20Mbilli%20vs%20Maciej%20Sulecki', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Christian%20Mbilli%20vs%20Maciej%20Sulecki" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Christian Mbilli vs Maciej Sulecki
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 27
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Erik%20Bazinyan%20vs%20Steven%20Butler', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Erik%20Bazinyan%20vs%20Steven%20Butler" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Erik Bazinyan vs Steven Butler
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, June 27
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Jake%20Paul%20vs%20Julio%20Cesar%20Chavez%20Jr.', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Jake%20Paul%20vs%20Julio%20Cesar%20Chavez%20Jr." target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Jake Paul vs Julio Cesar Chavez Jr.
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Gilberto%20Ramirez%20vs%20Yuniel%20Dorticos', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Gilberto%20Ramirez%20vs%20Yuniel%20Dorticos" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Gilberto Ramirez vs Yuniel Dorticos
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Floyd%20Schofield%20vs%20Tevin%20Farmer', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Floyd%20Schofield%20vs%20Tevin%20Farmer" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Floyd Schofield vs Tevin Farmer
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Raul%20Curiel%20vs%20Victor%20Rodriguez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Raul%20Curiel%20vs%20Victor%20Rodriguez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Raul Curiel vs Victor Rodriguez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Avious%20Griffin%20vs%20Julian%20Rodriguez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Avious%20Griffin%20vs%20Julian%20Rodriguez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Avious Griffin vs Julian Rodriguez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Holly%20Holm%20vs%20Yolanda%20Vega', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Holly%20Holm%20vs%20Yolanda%20Vega" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Holly Holm vs Yolanda Vega
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Jean%20Pascal%20vs%20Michal%20Cieslak', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Jean%20Pascal%20vs%20Michal%20Cieslak" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Jean Pascal vs Michal Cieslak
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Kieran%20Molloy%20vs%20Kaisee%20Benjamin', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Kieran%20Molloy%20vs%20Kaisee%20Benjamin" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Kieran Molloy vs Kaisee Benjamin
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Shakan%20Pitters%20vs%20Bradley%20Rea', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Shakan%20Pitters%20vs%20Bradley%20Rea" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Shakan Pitters vs Bradley Rea
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, June 28
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Jack%20Catterall%20vs%20Harlem%20Eubank', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Jack%20Catterall%20vs%20Harlem%20Eubank" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Jack Catterall vs Harlem Eubank
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 5
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Katie%20Taylor%20vs%20Amanda%20Serrano', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Katie%20Taylor%20vs%20Amanda%20Serrano" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Katie Taylor vs Amanda Serrano
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Alycia%20Baumgardner%20vs%20Jennifer%20Miranda', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Alycia%20Baumgardner%20vs%20Jennifer%20Miranda" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Alycia Baumgardner vs Jennifer Miranda
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Ellie%20Scotney%20vs%20Yamileth%20Mercado', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Ellie%20Scotney%20vs%20Yamileth%20Mercado" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Ellie Scotney vs Yamileth Mercado
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Dina%20Thorslund%20vs%20Cherneka%20Johnson', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Dina%20Thorslund%20vs%20Cherneka%20Johnson" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Dina Thorslund vs Cherneka Johnson
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Savannah%20Marshall%20vs%20Shadasia%20Green', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Savannah%20Marshall%20vs%20Shadasia%20Green" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Savannah Marshall vs Shadasia Green
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Chantelle%20Cameron%20vs%20Jessica%20Camara', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Chantelle%20Cameron%20vs%20Jessica%20Camara" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Chantelle Cameron vs Jessica Camara
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Ramla%20Ali%20vs%20Lila%20Furtado', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Ramla%20Ali%20vs%20Lila%20Furtado" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Ramla Ali vs Lila Furtado
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Tamm%20Thibeault%20vs%20Mary%20Casamassa', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Tamm%20Thibeault%20vs%20Mary%20Casamassa" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Tamm Thibeault vs Mary Casamassa
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Erick%20Badillo%20vs%20Gerardo%20Zapata', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Erick%20Badillo%20vs%20Gerardo%20Zapata" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Erick Badillo vs Gerardo Zapata
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, July 11
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Shakur%20Stevenson%20vs%20William%20Zepeda', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Shakur%20Stevenson%20vs%20William%20Zepeda" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Shakur Stevenson vs William Zepeda
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 12
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Edgar%20Berlanga%20vs%20Hamzah%20Sheeraz', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Edgar%20Berlanga%20vs%20Hamzah%20Sheeraz" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Edgar Berlanga vs Hamzah Sheeraz
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 12
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Alberto%20Puello%20vs%20Subriel%20Matias', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Alberto%20Puello%20vs%20Subriel%20Matias" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Alberto Puello vs Subriel Matias
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 12
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#David%20Morrell%20vs%20Imam%20Khataev', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#David%20Morrell%20vs%20Imam%20Khataev" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          David Morrell vs Imam Khataev
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 12
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Lester%20Martinez%20vs%20Pierre%20DiBombe', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Lester%20Martinez%20vs%20Pierre%20DiBombe" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Lester Martinez vs Pierre DiBombe
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 12
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Oleksandr%20Usyk%20vs%20Daniel%20Dubois', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Oleksandr%20Usyk%20vs%20Daniel%20Dubois" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Oleksandr Usyk vs Daniel Dubois
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Jesse%20Rodriguez%20vs%20Phumelele%20Cafu', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Jesse%20Rodriguez%20vs%20Phumelele%20Cafu" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Jesse Rodriguez vs Phumelele Cafu
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Diego%20Pacheco%20vs%20Trevor%20McCumby', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Diego%20Pacheco%20vs%20Trevor%20McCumby" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Diego Pacheco vs Trevor McCumby
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Mario%20Barrios%20vs%20Manny%20Pacquiao', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Mario%20Barrios%20vs%20Manny%20Pacquiao" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Mario Barrios vs Manny Pacquiao
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Sebastian%20Fundora%20vs%20Tim%20Tszyu', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Sebastian%20Fundora%20vs%20Tim%20Tszyu" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Sebastian Fundora vs Tim Tszyu
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Isaac%20Cruz%20vs%20Angel%20Fierro', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Isaac%20Cruz%20vs%20Angel%20Fierro" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Isaac Cruz vs Angel Fierro
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Brandon%20Figueroa%20vs%20Joet%20Gonzalez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Brandon%20Figueroa%20vs%20Joet%20Gonzalez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Brandon Figueroa vs Joet Gonzalez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 19
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Claressa%20Shields%20vs%20Lani%20Daniels', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Claressa%20Shields%20vs%20Lani%20Daniels" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Claressa Shields vs Lani Daniels
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 26
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Samantha%20Worthington%20vs%20Victoire%20Piteau', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Samantha%20Worthington%20vs%20Victoire%20Piteau" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Samantha Worthington vs Victoire Piteau
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 26
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Caroline%20Veyre%20vs%20Licia%20Boudersa', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Caroline%20Veyre%20vs%20Licia%20Boudersa" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Caroline Veyre vs Licia Boudersa
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 26
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Xander%20Zayas%20vs%20Jorge%20Garcia%20Perez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Xander%20Zayas%20vs%20Jorge%20Garcia%20Perez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Xander Zayas vs Jorge Garcia Perez
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 26
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Bruce%20Carrington%20vs%20Mateus%20Heita', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Bruce%20Carrington%20vs%20Mateus%20Heita" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Bruce Carrington vs Mateus Heita
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, July 26
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Gervonta%20Davis%20vs%20Lamont%20Roach', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Gervonta%20Davis%20vs%20Lamont%20Roach" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Gervonta Davis vs Lamont Roach
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Saturday, August 16
      </div>
    </div>
  </div>

  <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://live.sportsurge.uno/#Saul%20Canelo%20Alvarez%20vs%20Terence%20Crawford', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://live.sportsurge.uno/#Saul%20Canelo%20Alvarez%20vs%20Terence%20Crawford" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
          Saul "Canelo" Alvarez vs Terence Crawford
        </a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
        Friday, September 12
      </div>
    </div>
  </div>
  
  <div class="text-sm text-muted-foreground space-y-2">
    <p>Watch all free <b>sportsurge <a href="https://www.sportsurge.uno/p/boxing.html" class="text-primary hover:underline">boxing</a> streams</b>, with sportsurge v3 boxing you can watch all <b>boxing streaming </b>with <b>reddit streams live.</b> Just choose the fight from the boxing live stream free list below and watch boxing streams live.</p>
    <ul class="list-disc list-inside pl-4 space-y-1">
      <li>Sportsurge Mike Tyson</li>
      <li>Sportsurge Jake Paul</li>
      <li>Sportsurge Canelo Alvarez</li>
      <li>Sportsurge Gervonta Davis</li>
      <li>Sportsurge David Benavidez</li>
      <li>Sportsurge David Morrell Jr</li>
    </ul>
  </div>
  <script>
        function updateMatchDates() {
          const matchCards = document.querySelectorAll('#matchcard');
          matchCards.forEach(card => {
            const timeElement = card.querySelector('#timeofthematch');
            if (timeElement) {
              const dateText = timeElement.textContent.trim();
              if (dateText) {
                const parts = dateText.split(',');
                if (parts.length < 2) return; 
                const dayName = parts[0].trim();
                const datePart = parts[1].trim();
                const monthDay = datePart.split(' ');
                if (monthDay.length < 2) return;
                const month = monthDay[0].trim();
                const dayNumber = monthDay[1].trim();
                const currentSysYear = new Date().getFullYear(); 
                
                const monthMap = {
                  'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
                  'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
                };
                const monthIndex = monthMap[month];
    
                if (typeof monthIndex === 'undefined' || !dayNumber || isNaN(parseInt(dayNumber))) {
                  return; 
                }
    
                let eventYear = currentSysYear; 
                const today = new Date();
                const currentMonth = today.getMonth(); 

                if (monthIndex === 0 && currentMonth === 11) { 
                  eventYear = currentSysYear + 1;
                } else if (monthIndex === 11 && currentMonth === 0) { 
                  eventYear = currentSysYear - 1;
                }

                const matchDate = new Date(eventYear, monthIndex, parseInt(dayNumber));
                
                if (isNaN(matchDate.getTime())) return;
    
                today.setHours(0,0,0,0); 
                matchDate.setHours(0,0,0,0);

                if (matchDate.getTime() === today.getTime()) {
                  timeElement.innerHTML = '<span class="text-destructive font-bold animate-pulse">LIVE NOW!</span>';
                }
              }
            }
          });
        }
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', updateMatchDates);
        } else {
            updateMatchDates();
        }
      </script>
</div>
`;

const wweCustomHtml = `
  <h2 class="text-3xl font-bold text-primary text-center mb-6">Sportsurge WWE</h2>
  <div class="space-y-4">
    <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://v3.sportsurge.uno/#WWE Money in the Bank 2025', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE</span>
          <a href="https://v3.sportsurge.uno/#WWE Money in the Bank 2025" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
            WWE Money in the Bank 2025
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>7 June</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://v3.sportsurge.uno/#WWE Night of Champions 2025', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE</span>
          <a href="https://v3.sportsurge.uno/#WWE Night of Champions 2025" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
            WWE Night of Champions 2025
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>28 June</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://v3.sportsurge.uno/#WWE RAW', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE</span>
          <a href="https://v3.sportsurge.uno/#WWE RAW" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
             WWE RAW ON NETFLIX
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>Monday</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-card p-4 rounded-lg shadow-lg border border-border/40 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://v3.sportsurge.uno/#WWE SMACKDOWN', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE</span>
          <a href="https://v3.sportsurge.uno/#WWE SMACKDOWN" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
            WWE SMACKDOWN
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>Friday</strong>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-8 text-sm text-muted-foreground space-y-2 leading-relaxed">
    <p>Sportsurge WWE Live Streaming. SportSurge WrestleMania 41 "StreamEast Live", Look no further for your ultimate live streaming solution - welcome to the go-to spot for all your live WWE broadcasts. Sportsurge WWE LIVE scours the globe to deliver top-notch live streaming of all your favorite events. Explore our extensive list of upcoming events today and beyond. WWE StreamEast offers a wide selection of WWE events, from Premium Live Events like WrestleMania, SummerSlam, and Royal Rumble to weekly shows like Raw and SmackDown, and NXT spanning different continents. Whether you're into the high-flying action of singles matches or the tag team chaos of tag team matches, we've got you covered. Don't miss out on the thrill of watching your favorite WWE Superstars battle it out in the ring. Tune in to StreamEast WWE LIVE for a premium live streaming experience that puts you right in the center of the action! 💪🔥</p>
  </div>
`;

  const pageTitle = sport.slug === 'american-football' ? 'Sportsurge NFL' : `Sportsurge ${sport.name}`;
  let pageDescription: string;
  if (sport.slug === 'american-football') {
    pageDescription = "Welcome to the ultimate hub for Sportsurge NFL action! Find live NFL scores, today's game schedules, and direct Sportsurge streaming links for all National Football League matchups, including pre-season and regular season games. Never miss a touchdown with Sportsurge.";
  } else if (sport.slug === 'ice-hockey') {
    pageDescription = "Dive into the heart of the National Hockey League action with Sportsurge. Get up-to-the-minute live NHL scores, comprehensive game schedules, and reliable Sportsurge streaming links for all NHL matchups. From regular season clashes to the intensity of the Stanley Cup playoffs, Sportsurge is your ultimate source for NHL.";
  }
  else {
    pageDescription = `Explore all live events, upcoming schedules, and reliable Sportsurge streaming links for ${sport.name}. Sportsurge provides comprehensive coverage, including live scores and game details, making it your top destination for ${sport.name} action.`;
  }


  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-primary via-primary/80 to-accent rounded-lg shadow-xl">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground mb-2">
          {pageTitle}
        </h1>
        <p className="text-lg text-primary-foreground/90 px-4 max-w-3xl mx-auto leading-relaxed">
          {pageDescription}
        </p>
      </section>

      {sport.slug === 'boxing' && displayEvents.length === 0 ? (
        <div
          className="space-y-6 text-foreground"
          dangerouslySetInnerHTML={{ __html: boxingCustomHtml }}
        />
      ) : displayEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : sport.slug === 'wwe' ? (
         <div
          className="space-y-6 text-foreground"
          dangerouslySetInnerHTML={{ __html: wweCustomHtml }}
        />
      ) : (
        <div className="text-center py-16">
          <Trophy className="mx-auto h-20 w-20 text-muted-foreground/70 mb-6" />
          <h2 className="text-2xl font-semibold text-foreground/90 mb-3">
            No Live or Upcoming {sport.name} Events Currently Listed on Sportsurge
          </h2>
          <p className="text-muted-foreground mb-6">
            Please check back later, or browse other sports. Finished events are not shown here but are still accessible via their direct URL or site search.
          </p>
          <Button asChild>
            <Link href="/">Explore All Sports</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export const revalidate = 1800; // Revalidate every 30 minutes for sport pages
