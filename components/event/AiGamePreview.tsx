import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

interface AiGamePreviewProps {
  previewText?: string;
}

export function AiGamePreview({ previewText }: AiGamePreviewProps) {
  if (!previewText) {
    return null;
  }

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="text-xl font-semibold font-headline flex items-center">
          <Bot className="h-6 w-6 mr-2 text-primary" /> AI Game Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {previewText}
        </p>
      </CardContent>
    </Card>
  );
}
