
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
  } else if (sport.slug === 'hockey') { // Changed from ice-hockey
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
      scores365EventsData = await fetchAllScores365Events(sport.slug).catch(e => { console.error(`365Scores fetch error for ${sport.slug} in SportPage:`, e); return []; });
      scores365EventsData.forEach(event => {
        if (event && event.id && !eventMap.has(event.id)) {
            eventMap.set(event.id, event);
        }
      });
  } else if (sport.slug === 'baseball') {
      scores365EventsData = await fetchAllScores365Events(sport.slug).catch(e => { console.error(`365Scores fetch error for ${sport.slug} in SportPage:`, e); return []; });
      scores365EventsData.forEach(event => {
        if (event && event.id && !eventMap.has(event.id)) {
            eventMap.set(event.id, event);
        }
      });
  } else if (sport.slug === 'hockey') { // Changed from ice-hockey
      espnEventsData = await fetchAllEspnEvents(sport.slug).catch(e => { console.error(`ESPN fetch error for ${sport.slug} in SportPage:`, e); return []; });
      espnEventsData.forEach(event => {
          if (event && event.id && !eventMap.has(event.id)) {
              eventMap.set(event.id, event);
          }
      });
      // Optionally, fetch from 365Scores for NHL if desired and add to map
      // scores365EventsData = await fetchAllScores365Events(sport.slug).catch(e => { console.error(`365Scores fetch error for ${sport.slug} in SportPage:`, e); return []; });
      // scores365EventsData.forEach(event => { /* ... add to map ... */ });
  } else if (sport.slug === 'soccer') {
      espnEventsData = await fetchAllEspnEvents(sport.slug).catch(e => { console.error(`ESPN fetch error for ${sport.slug} in SportPage:`, e); return []; });
      scores365EventsData = await fetchAllScores365Events(sport.slug).catch(e => { console.error(`365Scores fetch error for ${sport.slug} in SportPage:`, e); return []; });
      
      (espnEventsData || []).forEach(event => {
          if (event && event.id && !eventMap.has(event.id)) {
              eventMap.set(event.id, event);
          }
      });
      (scores365EventsData || []).forEach(event => {
          if (event && event.id && !eventMap.has(event.id)) { // Prioritize ESPN if already added
              eventMap.set(event.id, event);
          }
      });
  } else if (sport.slug === 'tennis') {
      // Tennis page uses custom HTML for client-side fetching, but we can still attempt a server-side ESPN fetch.
      espnEventsData = await fetchAllEspnEvents(sport.slug).catch(e => { console.error(`ESPN fetch error for ${sport.slug} (Tennis) in SportPage:`, e); return []; });
      (espnEventsData || []).forEach(event => {
          if (event && event.id && !eventMap.has(event.id)) {
              eventMap.set(event.id, event);
          }
      });
  } else {
      // Default for other sports (Golf, MMA, Boxing, WWE, Motor Sports): try both ESPN and 365Scores
      espnEventsData = await fetchAllEspnEvents(sport.slug).catch(e => { console.error(`ESPN fetch error for ${sport.slug} in SportPage:`, e); return []; });
      scores365EventsData = await fetchAllScores365Events(sport.slug).catch(e => { console.error(`365Scores fetch error for ${sport.slug} in SportPage:`, e); return []; });

      (espnEventsData || []).forEach(event => {
          if (event && event.id && !eventMap.has(event.id)) {
              eventMap.set(event.id, event);
          }
      });
      (scores365EventsData || []).forEach(event => { // Prioritize ESPN if already added
          if (event && event.id && !eventMap.has(event.id)) {
              eventMap.set(event.id, event);
          }
      });
  }
  
  let fetchedEvents = Array.from(eventMap.values());
  let sortedEvents: SportEvent[];

  if (sport.slug === 'mma-ufc') { 
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
<div class="space-y-6 text-foreground" id="sportsurge-boxing-events-container">
  <h3 class="text-3xl font-bold text-primary text-center">Sportsurge Free Boxing Live Stream</h3>
  <p class="text-center text-muted-foreground mb-6">Watch live stream Reddit boxing free. You can watch live boxing tonight fights free on Sport Surge boxing.</p>
  
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JBrian%20Norman%20Jr.%20vs%20Jin%20Sasaki', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JBrian%20Norman%20Jr.%20vs%20Jin%20Sasaki" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Brian Norman Jr. vs Jin Sasaki</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Thursday, June 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JCristian%20Araneta%20vs%20Thanongsak%20Simsri', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JCristian%20Araneta%20vs%20Thanongsak%20Simsri" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Cristian Araneta vs Thanongsak Simsri</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Thursday, June 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDavid%20Stevens%20vs%20Petr%20Khamukov', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDavid%20Stevens%20vs%20Petr%20Khamukov" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">David Stevens vs Petr Khamukov</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 20</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JVito%20Mielnicki%20vs%20Kamil%20Gardzielik', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JVito%20Mielnicki%20vs%20Kamil%20Gardzielik" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Vito Mielnicki vs Kamil Gardzielik</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JGalal%20Yafai%20vs%20Francisco%20Rodriguez%20Jr.', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JGalal%20Yafai%20vs%20Francisco%20Rodriguez%20Jr." target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Galal Yafai vs Francisco Rodriguez Jr.</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JShabaz%20Masoud%20vs%20Ionut%20Baluta', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JShabaz%20Masoud%20vs%20Ionut%20Baluta" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Shabaz Masoud vs Ionut Baluta</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JCallum%20Walsh%20vs%20Elias%20Espadas', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JCallum%20Walsh%20vs%20Elias%20Espadas" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Callum Walsh vs Elias Espadas</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JCain%20Sandoval%20vs%20TBA', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JCain%20Sandoval%20vs%20TBA" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Cain Sandoval vs TBA</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JUmar%20Dzambekov%20vs%20Roamer%20Alexis%20Angulo', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JUmar%20Dzambekov%20vs%20Roamer%20Alexis%20Angulo" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Umar Dzambekov vs Roamer Alexis Angulo</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JIyana%20%22Roxy%22%20Verduzco%20vs%20Celene%20Roman', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JIyana%20%22Roxy%22%20Verduzco%20vs%20Celene%20Roman" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Iyana "Roxy" Verduzco vs Celene Roman</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 21</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JLiam%20Paro%20vs%20Jonathan%20Navarro', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JLiam%20Paro%20vs%20Jonathan%20Navarro" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Liam Paro vs Jonathan Navarro</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, June 25</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JLiam%20Wilson%20vs%20Ayrton%20Osmar%20Gimenez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JLiam%20Wilson%20vs%20Ayrton%20Osmar%20Gimenez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Liam Wilson vs Ayrton Osmar Gimenez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, June 25</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDeontay%20Wilder%20vs%20Tyrrell%20Herndon', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDeontay%20Wilder%20vs%20Tyrrell%20Herndon" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Deontay Wilder vs Tyrrell Herndon</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 27</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JChristian%20Mbilli%20vs%20Maciej%20Sulecki', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JChristian%20Mbilli%20vs%20Maciej%20Sulecki" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Christian Mbilli vs Maciej Sulecki</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 27</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJose%20De%20Jesus%20Macias%20vs%20Steven%20Butler', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJose%20De%20Jesus%20Macias%20vs%20Steven%20Butler" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jose De Jesus Macias vs Steven Butler</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 27</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JArslanbek%20Makhmudov%20vs%20Ricardo%20Brown', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JArslanbek%20Makhmudov%20vs%20Ricardo%20Brown" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Arslanbek Makhmudov vs Ricardo Brown</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 27</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJhon%20Orobio%20vs%20Zsolt%20Osadan', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJhon%20Orobio%20vs%20Zsolt%20Osadan" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jhon Orobio vs Zsolt Osadan</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, June 27</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJake%20Paul%20vs%20Julio%20Cesar%20Chavez%20Jr.', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJake%20Paul%20vs%20Julio%20Cesar%20Chavez%20Jr." target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jake Paul vs Julio Cesar Chavez Jr.</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JGilberto%20Ramirez%20vs%20Yuniel%20Dorticos', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JGilberto%20Ramirez%20vs%20Yuniel%20Dorticos" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Gilberto Ramirez vs Yuniel Dorticos</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JFloyd%20Schofield%20vs%20Tevin%20Farmer', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JFloyd%20Schofield%20vs%20Tevin%20Farmer" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Floyd Schofield vs Tevin Farmer</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JRaul%20Curiel%20vs%20Victor%20Rodriguez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JRaul%20Curiel%20vs%20Victor%20Rodriguez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Raul Curiel vs Victor Rodriguez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAvious%20Griffin%20vs%20Julian%20Rodriguez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAvious%20Griffin%20vs%20Julian%20Rodriguez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Avious Griffin vs Julian Rodriguez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JHolly%20Holm%20vs%20Yolanda%20Vega', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JHolly%20Holm%20vs%20Yolanda%20Vega" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Holly Holm vs Yolanda Vega</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJean%20Pascal%20vs%20Michal%20Cieslak', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJean%20Pascal%20vs%20Michal%20Cieslak" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jean Pascal vs Michal Cieslak</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JShakan%20Pitters%20vs%20Bradley%20Rea', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JShakan%20Pitters%20vs%20Bradley%20Rea" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Shakan Pitters vs Bradley Rea</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, June 28</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAlbert%20Batyrgaziev%20vs%20Jazza%20Dickens', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAlbert%20Batyrgaziev%20vs%20Jazza%20Dickens" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Albert Batyrgaziev vs Jazza Dickens</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, July 2</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJack%20Catterall%20vs%20Harlem%20Eubank', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJack%20Catterall%20vs%20Harlem%20Eubank" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jack Catterall vs Harlem Eubank</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 5</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JKatie%20Taylor%20vs%20Amanda%20Serrano', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JKatie%20Taylor%20vs%20Amanda%20Serrano" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Katie Taylor vs Amanda Serrano</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAlycia%20Baumgardner%20vs%20Jennifer%20Miranda', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAlycia%20Baumgardner%20vs%20Jennifer%20Miranda" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Alycia Baumgardner vs Jennifer Miranda</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JEllie%20Scotney%20vs%20Yamileth%20Mercado', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JEllie%20Scotney%20vs%20Yamileth%20Mercado" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Ellie Scotney vs Yamileth Mercado</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDina%20Thorslund%20vs%20Cherneka%20Johnson', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDina%20Thorslund%20vs%20Cherneka%20Johnson" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Dina Thorslund vs Cherneka Johnson</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JSavannah%20Marshall%20vs%20Shadasia%20Green', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JSavannah%20Marshall%20vs%20Shadasia%20Green" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Savannah Marshall vs Shadasia Green</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JChantelle%20Cameron%20vs%20Jessica%20Camara', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JChantelle%20Cameron%20vs%20Jessica%20Camara" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Chantelle Cameron vs Jessica Camara</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JRamla%20Ali%20vs%20Lila%20Furtado', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JRamla%20Ali%20vs%20Lila%20Furtado" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Ramla Ali vs Lila Furtado</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JTamm%20Thibeault%20vs%20Mary%20Casamassa', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JTamm%20Thibeault%20vs%20Mary%20Casamassa" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Tamm Thibeault vs Mary Casamassa</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, July 11</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JShakur%20Stevenson%20vs%20William%20Zepeda', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JShakur%20Stevenson%20vs%20William%20Zepeda" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Shakur Stevenson vs William Zepeda</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JEdgar%20Berlanga%20vs%20Hamzah%20Sheeraz', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JEdgar%20Berlanga%20vs%20Hamzah%20Sheeraz" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Edgar Berlanga vs Hamzah Sheeraz</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAlberto%20Puello%20vs%20Subriel%20Matias', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAlberto%20Puello%20vs%20Subriel%20Matias" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Alberto Puello vs Subriel Matias</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDavid%20Morrell%20vs%20Imam%20Khataev', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDavid%20Morrell%20vs%20Imam%20Khataev" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">David Morrell vs Imam Khataev</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JLester%20Martinez%20vs%20Pierre%20DiBombe', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JLester%20Martinez%20vs%20Pierre%20DiBombe" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Lester Martinez vs Pierre DiBombe</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JErick%20Badillo%20vs%20Gerardo%20Zapata', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JErick%20Badillo%20vs%20Gerardo%20Zapata" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Erick Badillo vs Gerardo Zapata</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 12</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JOleksandr%20Usyk%20vs%20Daniel%20Dubois', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JOleksandr%20Usyk%20vs%20Daniel%20Dubois" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Oleksandr Usyk vs Daniel Dubois</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JLawrence%20Okolie%20vs%20Kevin%20Lerena', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JLawrence%20Okolie%20vs%20Kevin%20Lerena" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Lawrence Okolie vs Kevin Lerena</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDaniel%20Lapin%20vs%20Lewis%20Edmondson', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDaniel%20Lapin%20vs%20Lewis%20Edmondson" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Daniel Lapin vs Lewis Edmondson</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JJesse%20Rodriguez%20vs%20Phumelele%20Cafu', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JJesse%20Rodriguez%20vs%20Phumelele%20Cafu" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Jesse Rodriguez vs Phumelele Cafu</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JDiego%20Pacheco%20vs%20Trevor%20McCumby', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JDiego%20Pacheco%20vs%20Trevor%20McCumby" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Diego Pacheco vs Trevor McCumby</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAustin%20Williams%20vs%20Etinosa%20Oliha', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAustin%20Williams%20vs%20Etinosa%20Oliha" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Austin Williams vs Etinosa Oliha</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JMario%20Barrios%20vs%20Manny%20Pacquiao', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JMario%20Barrios%20vs%20Manny%20Pacquiao" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Mario Barrios vs Manny Pacquiao</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JSebastian%20Fundora%20vs%20Tim%20Tszyu', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JSebastian%20Fundora%20vs%20Tim%20Tszyu" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Sebastian Fundora vs Tim Tszyu</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JIsaac%20Cruz%20vs%20Angel%20Fierro', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JIsaac%20Cruz%20vs%20Angel%20Fierro" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Isaac Cruz vs Angel Fierro</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JBrandon%20Figueroa%20vs%20Joet%20Gonzalez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JBrandon%20Figueroa%20vs%20Joet%20Gonzalez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Brandon Figueroa vs Joet Gonzalez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 19</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JManuel%20Flores%20vs%20Jorge%20Chavez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JManuel%20Flores%20vs%20Jorge%20Chavez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Manuel Flores vs Jorge Chavez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Thursday, July 24</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JClaressa%20Shields%20vs%20Lani%20Daniels', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JClaressa%20Shields%20vs%20Lani%20Daniels" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Claressa Shields vs Lani Daniels</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JSamantha%20Worthington%20vs%20Victoire%20Piteau', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JSamantha%20Worthington%20vs%20Victoire%20Piteau" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Samantha Worthington vs Victoire Piteau</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JCaroline%20Veyre%20vs%20Licia%20Boudersa', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JCaroline%20Veyre%20vs%20Licia%20Boudersa" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Caroline Veyre vs Licia Boudersa</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JXander%20Zayas%20vs%20Jorge%20Garcia%20Perez', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JXander%20Zayas%20vs%20Jorge%20Garcia%20Perez" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Xander Zayas vs Jorge Garcia Perez</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JBruce%20Carrington%20vs%20Mateus%20Heita', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JBruce%20Carrington%20vs%20Mateus%20Heita" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Bruce Carrington vs Mateus Heita</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JRyan%20Garner%20vs%20Reece%20Bellotti', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JRyan%20Garner%20vs%20Reece%20Bellotti" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Ryan Garner vs Reece Bellotti</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, July 26</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JKenshiro%20Teraji%20vs%20Ricardo%20Sandoval', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JKenshiro%20Teraji%20vs%20Ricardo%20Sandoval" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Kenshiro Teraji vs Ricardo Sandoval</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, July 30</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAntonio%20Vargas%20vs%20Daigo%20Higa', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAntonio%20Vargas%20vs%20Daigo%20Higa" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Antonio Vargas vs Daigo Higa</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, July 30</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JErick%20Rosa%20vs%20Kyosuke%20Takami', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JErick%20Rosa%20vs%20Kyosuke%20Takami" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Erick Rosa vs Kyosuke Takami</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Wednesday, July 30</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JPanya%20Pradabsri%20vs%20Carlos%20Canizales', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JPanya%20Pradabsri%20vs%20Carlos%20Canizales" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Panya Pradabsri vs Carlos Canizales</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Friday, August 1</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JOscar%20Duarte%20vs%20Kenneth%20Sims%20Jr.', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JOscar%20Duarte%20vs%20Kenneth%20Sims%20Jr." target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Oscar Duarte vs Kenneth Sims Jr.</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 2</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JGervonta%20Davis%20vs%20Lamont%20Roach', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JGervonta%20Davis%20vs%20Lamont%20Roach" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Gervonta Davis vs Lamont Roach</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 16</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JMoses%20Itauma%20vs%20Dillian%20Whyte', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JMoses%20Itauma%20vs%20Dillian%20Whyte" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Moses Itauma vs Dillian Whyte</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 16</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JNick%20Ball%20vs%20Sam%20Goodman', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JNick%20Ball%20vs%20Sam%20Goodman" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Nick Ball vs Sam Goodman</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 16</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JAnthony%20Cacace%20vs%20Raymond%20Ford', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JAnthony%20Cacace%20vs%20Raymond%20Ford" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Anthony Cacace vs Raymond Ford</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 16</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JFilip%20Hrgovic%20vs%20David%20Adeleye', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JFilip%20Hrgovic%20vs%20David%20Adeleye" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Filip Hrgovic vs David Adeleye</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, August 16</div>
    </div>
  </div>
  <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#JSaul%20%22Canelo%22%20Alvarez%20vs%20Terence%20Crawford', '_blank')">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex-grow">
        <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">Boxing</span>
        <a href="https://club.sportsurge.uno/#JSaul%20%22Canelo%22%20Alvarez%20vs%20Terence%20Crawford" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">Saul "Canelo" Alvarez vs Terence Crawford</a>
      </div>
      <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">Saturday, September 13</div>
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
  <script> function updateMatchDates() {   const matchCards = document.querySelectorAll('#matchcard');    matchCards.forEach(card => {     const timeElement = card.querySelector('#timeofthematch');     const dateText = timeElement.textContent.trim();      if (dateText) {       const parts = dateText.split(',');       const day = parts[0].trim();       const datePart = parts[1].trim();       const monthDay = datePart.split(' ');       const month = monthDay[0].trim();       const dayNumber = monthDay[1].trim();        const year = new Date().getFullYear();       const matchDate = new Date(\`\${month} \${dayNumber}, \${year}\`);        const today = new Date();       matchDate.setHours(0,0,0,0);       today.setHours(0,0,0,0);        if (matchDate.getTime() === today.getTime()) {         timeElement.innerHTML = '<span class="live">LIVE NOW!</span>';       }     }   }); }  window.addEventListener('DOMContentLoaded', updateMatchDates);   </script>
</div>
`;

const wweCustomHtml = `
<div class="space-y-6 text-foreground">
  <h2 class="text-3xl font-bold text-primary text-center mb-6">Sportsurge WWE</h2>
  <div class="space-y-4">
    <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#WWE Money in the Bank 2025', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE PPV</span>
          <a href="https://club.sportsurge.uno/#WWE Money in the Bank 2025" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
            WWE Money in the Bank 2025
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>7 June</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#WWE Night of Champions 2025', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE PPV</span>
          <a href="https://club.sportsurge.uno/#WWE Night of Champions 2025" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
            WWE Night of Champions 2025
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>28 June</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#WWE RAW', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE Weekly</span>
          <a href="https://club.sportsurge.uno/#WWE RAW" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
             WWE RAW ON NETFLIX
          </a>
        </div>
        <div class="text-sm text-muted-foreground sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
          <strong>Monday</strong>
        </div>
      </div>
    </div>
    <div class="not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out" onclick="window.open('https://club.sportsurge.uno/#WWE SMACKDOWN', '_blank')">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex-grow">
          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">WWE Weekly</span>
          <a href="https://club.sportsurge.uno/#WWE SMACKDOWN" target="_blank" class="text-lg font-medium text-primary hover:text-accent focus:outline-none">
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
</div>
`;

const tennisCustomHtml = `
<div class="text-foreground space-y-6">
  <h2 class="text-3xl font-bold text-primary text-center">Sportsurge Tennis</h2>
  <div id="espntennis" class="space-y-4">
    <!-- Tennis matches will be dynamically inserted here by the script -->
  </div>
  <div class="mt-8 text-sm text-muted-foreground space-y-2 leading-relaxed text-justify">
    <b>Sportsurge Tennis</b> Live Streaming. Sport Surge French Open "Roland Garros StreamEast Live", Look no further for your ultimate live streaming solution - welcome to the go-to spot for all your live tennis broadcasts. <b>Sport Surge Tennis</b> LIVE scours the globe to deliver top-notch live streaming of all your favorite matches. Explore our extensive list of upcoming games today and beyond. <b>Tennis StreamEast&nbsp;</b> offers a wide selection of <b>tennis </b>events , from Grand Slam tournaments like Wimbledon, <b><a href="#usopenmen" class="text-primary hover:underline">US Open</a></b>, and <b><a href="#australianopenmen" class="text-primary hover:underline">Australian Open</a></b> to <b>ATP </b>and <b>WTA </b>tours spanning different continents. Whether you're into the fast-paced action of singles matches or the strategic intensity of doubles, we've got you covered.  Don't miss out on the thrill of watching your favorite tennis stars battle it out on the court. Tune in to <b>Sportsurge Tennis LIVE </b>for a premium live streaming experience that puts you right in the center of the action!&nbsp;
  </div>
  <script>
    async function getTennisFixture() {
      const API_URL_TENNIS = 'https://site.web.api.espn.com/apis/personalized/v2/scoreboard/header?sport=tennis';
      try {
        const response = await fetch(API_URL_TENNIS);
        if (!response.ok) {
          console.error("ESPN Tennis API error:", response.status, response.statusText);
          const container = document.querySelector('#espntennis');
          if (container) container.innerHTML = '<p class="text-center text-destructive">Could not load tennis matches at this time.</p>';
          return;
        }
        const data = await response.json();
        // console.log("Full API Response:", data); 

        const sports = data.sports;
        let matchesFound = false;
        const container = document.querySelector('#espntennis');

        if (!container) {
          console.error("Error: Container element with ID \'espntennis\' not found in HTML.");
          return;
        }
        container.innerHTML = ''; 

        if (sports && Array.isArray(sports)) {
          for (const sport of sports) {
            if (sport.leagues && Array.isArray(sport.leagues)) {
              for (const league of sport.leagues) {
                if (league.events && Array.isArray(league.events)) {
                  for (const event of league.events) {
                    // console.log("Event:", event); 
                    
                    const eventName = event.name || 'Tennis Event';
                    const competitionType = event.competitionType?.text || '';
                    const eventStatus = event.status?.type?.name?.toLowerCase() || event.status?.toLowerCase() || 'pre';

                    const competitors = event.competitors;
                    if (!competitors || competitors.length < 2) continue;

                    const competitor1 = competitors[0]?.displayName || 'Player 1';
                    const competitor2 = competitors[1]?.displayName || 'Player 2';
                    
                    const tennis_URL = \`https://club.sportsurge.uno/#\${encodeURIComponent(competitor1)}%20vs%20\${encodeURIComponent(competitor2)}\`;
                    const eventDate = new Date(event.date);

                    let statusDisplay = "";
                    let statusClass = "text-muted-foreground";

                    if (eventStatus === "pre" || eventStatus === "scheduled" || eventStatus === "status_scheduled") {
                      statusDisplay = \`<div class="countdown-timer text-sm" data-event-date="\${eventDate.toISOString()}">Calculating...</div>\`;
                    } else if (eventStatus === "in" || eventStatus === "inprogress" || eventStatus === "live" || eventStatus === "status_inprogress") {
                      statusDisplay = 'LIVE NOW!';
                      statusClass = "text-destructive font-bold animate-pulse";
                    } else if (eventStatus === "post" || eventStatus === "final" || eventStatus === "status_final" || eventStatus === "ft" || eventStatus === "full-time" || eventStatus === "ended") {
                      statusDisplay = 'Final';
                      statusClass = "text-muted-foreground font-semibold";
                    } else {
                        statusDisplay = event.status?.type?.shortDetail || event.status?.shortDetail || 'Status N/A';
                    }

                    matchesFound = true;
                    const teamContainer = document.createElement('div');
                    teamContainer.className = 'not-prose bg-white/5 backdrop-blur-xl p-4 rounded-lg shadow-lg border border-white/10 mb-4 cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.02] transition-all duration-200 ease-in-out';
                    teamContainer.onclick = () => window.open(tennis_URL, '_blank');
                    teamContainer.innerHTML = \`
                      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div class="flex-grow">
                          <span class="text-xs font-semibold text-primary block mb-1 uppercase tracking-wider">\${eventName}</span>
                          <div class="text-lg font-medium text-primary group-hover:text-accent">\${competitor1} vs \${competitor2}</div>
                          \${competitionType ? \`<p class="text-sm text-muted-foreground">\${competitionType}</p>\` : ''}
                        </div>
                        <div class="\${statusClass} sm:text-right mt-2 sm:mt-0 shrink-0 whitespace-nowrap">
                          \${statusDisplay}
                        </div>
                      </div>
                    \`;
                    container.appendChild(teamContainer);
                  }
                }
              }
            }
          }
        }
        
        if (!matchesFound && container) {
            container.innerHTML = '<p class="text-center text-lg text-muted-foreground py-8">No live or upcoming Tennis matches found at the moment. Please check back later.</p>';
        }

        // Start countdowns
        document.querySelectorAll('.countdown-timer').forEach(timerElement => {
          const eventDateStr = timerElement.getAttribute('data-event-date');
          if (eventDateStr) {
            const countdownDate = new Date(eventDateStr).getTime();
            function updateCountdown() {
              const currentTime = new Date().getTime();
              const distance = countdownDate - currentTime;
              if (distance < 0) {
                timerElement.textContent = "Event Started!";
                // Optionally, might want to clear interval here if it's stored globally or via another attribute
                return;
              }
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              timerElement.textContent = \`\${days > 0 ? days + "d " : ""}\${hours}h \${minutes}m \${seconds}s\`;
            }
            updateCountdown(); // Initial call
            setInterval(updateCountdown, 1000); // Update every second
          }
        });

      } catch (error) {
        console.error("Error fetching tennis fixtures:", error);
        const container = document.querySelector('#espntennis');
        if (container) container.innerHTML = '<p class="text-center text-destructive">Error loading tennis matches. Please try again later.</p>';
      }
    }
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', getTennisFixture);
    } else {
      getTennisFixture();
    }
  </script>
  <style>
    .post-meta { display: none!important; }
  </style>
</div>
`;


  const pageTitle = sport.slug === 'american-football' ? 'Sportsurge NFL' : 
                    sport.slug === 'hockey' ? 'Sportsurge NHL' : // Changed from ice-hockey
                    `Sportsurge ${sport.name}`;
  
  let pageDescriptionText: string;
  if (sport.slug === 'american-football') {
    pageDescriptionText = "Welcome to the ultimate hub for Sportsurge NFL action! Find live NFL scores, today's game schedules, and direct Sportsurge streaming links for all National Football League matchups, including pre-season and regular season games. Never miss a touchdown with Sportsurge.";
  } else if (sport.slug === 'hockey') { // Changed from ice-hockey
    pageDescriptionText = "Dive into the heart of the National Hockey League action with Sportsurge. Get up-to-the-minute live NHL scores, comprehensive game schedules, and reliable Sportsurge streaming links for all NHL matchups. From regular season clashes to the intensity of the Stanley Cup playoffs, Sportsurge is your ultimate source for NHL.";
  }
  else {
    pageDescriptionText = `Explore all live events, upcoming schedules, and reliable Sportsurge streaming links for ${sport.name}. Sportsurge provides comprehensive coverage, including live scores and game details, making it your top destination for ${sport.name} action.`;
  }


  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">
          {pageTitle}
        </h1>
        <p className="text-lg text-muted-foreground px-4 max-w-3xl mx-auto leading-relaxed">
          {pageDescriptionText}
        </p>
      </section>

      {sport.slug === 'boxing' && displayEvents.length === 0 ? (
        <div
          dangerouslySetInnerHTML={{ __html: boxingCustomHtml }}
        />
      ) : sport.slug === 'tennis' && displayEvents.length === 0 ? (
        <div
          dangerouslySetInnerHTML={{ __html: tennisCustomHtml }}
        />
      ) : displayEvents.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : sport.slug === 'wrestling-wwe' && displayEvents.length === 0 ? ( 
         <div
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

export const revalidate = 60;
