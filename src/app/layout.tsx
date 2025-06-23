
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarSeparator } from '@/components/ui/sidebar';
import Link from 'next/link';
// sports import is no longer needed here directly for mapping
// import { sports } from '@/lib/data'; 
import { TvMinimalPlay, ListChecks, Zap, Users } from 'lucide-react';
import { LiveEventsSidebar } from '@/components/layout/LiveEventsSidebar';


export const metadata: Metadata = {
  title: {
    default: 'Sportsurge - Your Sports Event Hub',
    template: '%s | Sportsurge',
  },
  description: 'Find live scores, schedules, and streaming links for your favorite sports events. Soccer, Basketball, and more!',
  keywords: ['sports', 'streaming', 'live scores', 'soccer', 'basketball', 'football', 'events', 'schedule', 'sportsurge'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground flex flex-col">
        <SidebarProvider>
          <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="p-3">
              {/* Removed "Sportsurge" brand link */}
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem> 
                  <div className="px-3 py-1.5 flex items-center text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                    <Zap className="h-4 w-4 mr-2 text-destructive" />
                    Live Now
                  </div>
                  <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center h-8 w-8">
                     <Zap className="h-5 w-5 text-destructive" />
                  </div>
                </SidebarMenuItem>
                <LiveEventsSidebar />

                <SidebarSeparator className="my-2" />

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={{ children: "All Leagues", side: "right", align: "center" }}
                  >
                    <Link href="/leagues">
                      <ListChecks />
                      <span className="truncate">All Leagues</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={{ children: "All Teams", side: "right", align: "center" }}
                  >
                    <Link href="/teams">
                      <Users />
                      <span className="truncate">All Teams</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
