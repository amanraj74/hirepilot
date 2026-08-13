'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  KanbanSquare,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { signOutAction } from '@/app/(app)/dashboard/actions';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from '@/components/notification/notification-bell';

type Role = 'CANDIDATE' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER' | 'ADMIN';

const NAV_BY_ROLE: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  CANDIDATE: [
    { href: '/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/jobs', label: 'Browse jobs', icon: Briefcase },
    { href: '/applications', label: 'My applications', icon: KanbanSquare },
    { href: '/candidate/assessments', label: 'Assessments', icon: KanbanSquare },
    { href: '/profile', label: 'Profile', icon: Settings },
    { href: '/settings/security', label: 'Security', icon: ShieldCheck },
  ],
  RECRUITER: [
    { href: '/recruiter/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/recruiter/jobs/new', label: 'Post a job', icon: Briefcase },
    { href: '/recruiter/jobs', label: 'My jobs', icon: Briefcase },
    { href: '/recruiter/pipeline', label: 'Pipeline', icon: KanbanSquare },
    { href: '/recruiter/assessments', label: 'Assessments', icon: KanbanSquare },
    { href: '/companies', label: 'Company', icon: Building2 },
    { href: '/settings/security', label: 'Security', icon: ShieldCheck },
  ],
  HIRING_MANAGER: [
    { href: '/hiring-manager/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/hiring-manager/shortlist', label: 'Shortlist', icon: KanbanSquare },
    { href: '/recruiter/assessments', label: 'Assessments', icon: KanbanSquare },
    { href: '/settings/security', label: 'Security', icon: ShieldCheck },
  ],
  INTERVIEWER: [
    { href: '/interviewer/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/interviewer/assignments', label: 'My interviews', icon: KanbanSquare },
    { href: '/recruiter/interviews', label: 'Schedule', icon: Briefcase },
    { href: '/candidate/assessments', label: 'My assessments', icon: KanbanSquare },
    { href: '/settings/security', label: 'Security', icon: ShieldCheck },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Settings },
    { href: '/admin/companies', label: 'Companies', icon: Building2 },
    { href: '/admin/audit-logs', label: 'Audit logs', icon: BarChart3 },
    { href: '/settings/security', label: 'Security', icon: ShieldCheck },
  ],
};

export function AppSidebar({
  role,
  userName,
  unreadCount,
}: {
  role: Role;
  userName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>

      <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {role.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mb-2">
          <NotificationBell initialUnreadCount={unreadCount} />
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
