
import { getAllEventsCombined, getAllSports } from '@/lib/data';
import { nflTeams } from '@/lib/nfl-teams'; // Import NFL teams
import type { SportEvent } from '@/lib/types';
import type { MetadataRoute } from 'next';

const URL = 'https://sportsurge2.vercel.app';

export async function GET() {
  const events = await getAllEventsCombined(); 

  const eventUrls = events.map(event => {
    let changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'];
    let priority: number;

    switch (event.status) {
      case 'live':
      case 'halftime':
        changeFrequency = 'hourly';
        priority = 0.9;
        break;
      case 'scheduled':
        changeFrequency = 'daily';
        priority = 0.8;
        break;
      case 'finished':
        changeFrequency = 'yearly';
        priority = 0.3;
        break;
      case 'postponed':
      case 'cancelled':
        changeFrequency = 'weekly';
        priority = 0.4;
        break;
      default: // Fallback for any other unhandled statuses
        changeFrequency = 'monthly';
        priority = 0.5;
    }

    return {
      url: `${URL}/events/${event.slug}`,
      lastModified: new Date(event.date).toISOString(),
      changeFrequency,
      priority,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${URL}/leagues`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${URL}/teams`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const sportsData = await getAllSports();
  const sportUrls = sportsData.map(sport => ({
    url: `${URL}/${sport.slug}`, 
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: 0.8, 
  }));

  // Add NFL Team URLs
  const nflTeamUrls = nflTeams.map(team => ({
    url: `${URL}/nfl/teams/${team.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: 0.75, 
  }));


  const allUrls = [...staticUrls, ...eventUrls, ...sportUrls, ...nflTeamUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (item) => `
    <url>
      <loc>${item.url}</loc>
      <lastmod>${item.lastModified}</lastmod>
      <changefreq>${item.changeFrequency}</changefreq>
      <priority>${item.priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

