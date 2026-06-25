"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", emoji: "📈", label: "Analytics" },
  { href: "/dashboard/feedbacks", emoji: "📥", label: "Inbox" },
  { href: "/dashboard/projects", emoji: "🔌", label: "Widgets" },
  { href: "/dashboard/events", emoji: "⚡", label: "Events" },
  { href: "/dashboard/billing", emoji: "💳", label: "Billing" },
  { href: "/dashboard/settings", emoji: "⚙️", label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setOpenMobile } = useSidebar();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <ShadcnSidebar variant="inset">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <img src="/logo.png" alt="Pealo" className="w-6 h-6 shrink-0 object-contain" />
        <span className="font-bold text-lg text-sidebar-foreground tracking-tight truncate">Pealo</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        <span className="text-lg mr-1">{item.emoji}</span>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {session?.user && (
            <SidebarMenuItem>
              <div className="mb-2 px-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                  {session.user.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    (session.user.name || session.user.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">Signed in as</p>
                  <p className="text-xs text-foreground truncate font-medium" title={session.user.email}>
                    {session.user.name || session.user.email}
                  </p>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <span className="text-lg mr-1">👋</span>
                <span>Sign out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
