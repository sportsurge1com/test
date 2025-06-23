
import type { SportEvent, StatisticItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface EventStatisticsProps {
  statistics?: {
    home: StatisticItem[];
    away: StatisticItem[];
  } | null;
  teamNames: {
    home: string;
    away: string;
  };
}

// Define which statistics to display and their preferred labels
const displayedStatsConfig: { key: string; label: string }[] = [
  { key: 'possessionPct', label: 'Possession (%)' },
  { key: 'totalShots', label: 'Total Shots' },
  { key: 'shotsOnTarget', label: 'Shots on Target' },
  { key: 'wonCorners', label: 'Corners Won' },
  { key: 'foulsCommitted', label: 'Fouls Committed' },
  { key: 'goalAssists', label: 'Assists' },
  // Add more common stats here if needed, e.g., yellowCards, redCards, if available in a consistent format
  // { key: 'offsides', label: 'Offsides' },
];

export function EventStatistics({ statistics, teamNames }: EventStatisticsProps) {
  if (!statistics || (!statistics.home?.length && !statistics.away?.length)) {
    return null; // Don't render if no statistics are available
  }

  const getStatValue = (teamStats: StatisticItem[], statKey: string): string => {
    const stat = teamStats?.find(s => s.name === statKey || s.abbreviation === statKey);
    return stat?.displayValue || '-';
  };

  const relevantStats = displayedStatsConfig.filter(config => {
    const homeStat = statistics.home?.find(s => s.name === config.key || s.abbreviation === config.key);
    const awayStat = statistics.away?.find(s => s.name === config.key || s.abbreviation === config.key);
    // Only include the stat row if at least one team has a value for it (even if it's '0')
    return (homeStat && homeStat.displayValue !== undefined) || (awayStat && awayStat.displayValue !== undefined);
  });

  if (relevantStats.length === 0) {
     return null; // Don't render if no relevant statistics are found for display
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold font-headline flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-primary" /> Match Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left font-medium text-primary truncate max-w-[120px] sm:max-w-none">{teamNames.home}</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Statistic</th>
                <th className="py-2 px-3 text-right font-medium text-primary truncate max-w-[120px] sm:max-w-none">{teamNames.away}</th>
              </tr>
            </thead>
            <tbody>
              {relevantStats.map((statConfig) => (
                <tr key={statConfig.key} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 text-left font-semibold text-foreground">
                    {getStatValue(statistics.home, statConfig.key)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground">{statConfig.label}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                    {getStatValue(statistics.away, statConfig.key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
