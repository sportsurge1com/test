
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, TvMinimalPlay } from 'lucide-react';
import { sports } from '@/lib/data';
import { CurrentTimeUTC } from './CurrentTimeUTC';
import React from 'react';
import { EventSearch } from '@/components/search/EventSearch';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

export function Header() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="flex items-center">
          <SidebarTrigger className="mr-2 md:hidden" /> 
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <TvMinimalPlay className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block text-lg">
              Sportsurge
            </span>
          </Link>
        </div>
        
        <nav className="ml-6 hidden md:flex items-center gap-1 text-sm"> 
            {sports.map((sport) => (
              <Button key={sport.id} variant="ghost" asChild>
                <Link
                  href={`/${sport.slug}`}
                  className="transition-colors hover:text-primary text-foreground/70 hover:bg-transparent px-2"
                >
                  {sport.name}
                </Link>
              </Button>
            ))}
             <Button variant="ghost" asChild>
                <Link
                  href="/leagues"
                  className="transition-colors hover:text-primary text-foreground/70 hover:bg-transparent px-2"
                >
                  Leagues
                </Link>
              </Button>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <CurrentTimeUTC />
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </Dialog>
          <EventSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
      </div>
    </header>
  );
}
