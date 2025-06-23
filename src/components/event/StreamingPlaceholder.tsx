
import type { SportEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tv, Youtube, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface StreamingPlaceholderProps {
  event: SportEvent;
}

export function StreamingPlaceholder({ event }: StreamingPlaceholderProps) {
  const { streamingLinks } = event;

  const getLinkIcon = (type: SportEvent['streamingLinks'][0]['type']) => {
    switch(type) {
      case 'official': return <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />;
      case 'unofficial': return <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />;
      case 'highlight': return <Youtube className="h-4 w-4 mr-2 text-red-500" />;
      default: return <ExternalLink className="h-4 w-4 mr-2" />;
    }
  }

  const getButtonVariant = (type: SportEvent['streamingLinks'][0]['type']) => {
    if (type === 'official') return 'default';
    if (type === 'unofficial') return 'secondary'; 
    if (type === 'highlight') return 'outline';
    return 'secondary';
  }

  return (
    <Card className="border-primary/50 shadow-lg">
      <CardHeader className="bg-primary/10">
        <CardTitle className="text-xl font-semibold font-headline flex items-center text-primary">
          <Tv className="h-7 w-7 mr-3" /> Streaming & Broadcast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {event.broadcastInfo && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-foreground">
              <strong>Official Broadcast:</strong> <span className="text-primary font-medium">{event.broadcastInfo}</span>
            </p>
          </div>
        )}
        {streamingLinks && streamingLinks.length > 0 ? (
          <div className="space-y-3">
            {streamingLinks.map((link, index) => (
              <Button 
                key={index} 
                asChild 
                variant={getButtonVariant(link.type)}
                className="w-full justify-start text-left h-auto py-3 shadow-sm hover:shadow-md transition-shadow group"
                aria-label={`Watch on ${link.name} (${link.type})`}
              >
                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                  {getLinkIcon(link.type)}
                  <div className="flex flex-col">
                    <span className="font-extrabold">{link.name}</span>
                    {(link.type === 'official' || link.type === 'unofficial') && <span className="text-xs text-green-600 dark:text-green-400">Trusted Source</span>}
                     {link.type === 'highlight' && <span className="text-xs text-muted-foreground">Match Highlights</span>}
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Tv className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No Streaming Links Yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Links for Sportsurge are typically available closer to game time. Please check back!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
