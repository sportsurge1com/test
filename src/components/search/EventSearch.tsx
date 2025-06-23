
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import type { SportEvent } from '@/lib/types';
import { CalendarDays, Search } from 'lucide-react';

interface EventSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventSearch({ open, onOpenChange }: EventSearchProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SportEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (query.length > 1) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/search-events?q=${encodeURIComponent(query)}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Failed to fetch search results:', error);
          setResults([]);
        }
        setLoading(false);
      };

      const debounceTimeout = setTimeout(fetchResults, 300);
      return () => clearTimeout(debounceTimeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (slug: string) => {
    router.push(`/events/${slug}`);
    onOpenChange(false);
    setQuery('');
    setResults([]);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search events, teams, leagues..."
        value={query}
        onValueChange={setQuery}
        className="text-base"
      />
      <CommandList>
        {loading && query.length > 1 && <CommandEmpty>Loading...</CommandEmpty>}
        {!loading && query.length > 1 && results.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
        
        {results.length > 0 && (
          <CommandGroup heading="Suggestions">
            {results.map((event) => (
              <CommandItem
                key={event.id}
                value={`${event.title} ${event.teams.home.name} ${event.teams.away.name} ${event.league} ${event.sport}`}
                onSelect={() => handleSelect(event.slug)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-3 py-2">
                  {/* Abbreviation placeholders removed */}
                  <div className="flex flex-col">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{event.league} - {event.sport}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {query.length > 1 && results.length > 0 && <CommandSeparator />}
      </CommandList>
    </CommandDialog>
  );
}
