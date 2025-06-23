export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Sportsurge. All rights reserved.
        </p>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Data provided for entertainment purposes only. Sportsurge is your source for links.
        </p>
      </div>
    </footer>
  );
}