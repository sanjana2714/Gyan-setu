'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import * as icons from 'lucide-react';
import { Button } from '../ui/button';

const Logo = () => {
    const { open } = useSidebar();
    return (
        <Link href="/" className={cn(
            "text-2xl font-bold font-headline text-primary tracking-tighter flex items-center gap-2",
            !open && "justify-center"
        )}>
          Gyan<span className="text-accent">Setu</span>
        </Link>
    );
}

export function AppSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const { open } = useSidebar();

  const filteredNavItems = navItems.filter(item => {
    if (item.role && item.role !== role) {
        return false;
    }
    return true;
  });

  return (
    <>
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className={cn("transition-all duration-300 ease-in-out", open ? 'opacity-100' : 'opacity-0 w-0')}>
            <Logo />
          </div>
          <SidebarTrigger className='h-8 w-8 hidden sm:flex' />
        </SidebarHeader>
        <Separator className='mx-4 w-auto bg-border' />
        <SidebarContent className="p-4">
            <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = icons[item.icon] as icons.LucideIcon;
              return (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                >
                    <Link href={`${item.href}?${searchParams.toString()}`}>
                    <Icon />
                    <span className={cn(!open && "hidden")}>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            </SidebarMenu>
        </SidebarContent>
    </>
  );
}