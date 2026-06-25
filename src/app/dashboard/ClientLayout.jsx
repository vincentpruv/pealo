"use client";

import { SessionProvider } from "next-auth/react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        {/* Desktop and Mobile Sidebar */}
        <DashboardSidebar />

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 h-9 w-9 rounded-xl text-foreground hover:bg-accent" />
            </div>
            <div className="font-bold text-lg text-sidebar-foreground">Pealo</div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
