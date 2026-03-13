import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { AppHeader } from '@/components/dashboard/app-header';
import type { NavItem } from '@/lib/types';

type DashboardLayoutProps = {
  navItems: NavItem[];
  children: ReactNode;
};

export function DashboardLayout({ navItems, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible='icon'>
          <AppSidebar navItems={navItems} />
        </Sidebar>
        <div className='flex flex-col sm:py-4 sm:pl-14 flex-1'>
          <AppHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
