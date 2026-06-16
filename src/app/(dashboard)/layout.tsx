'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  GraduationCap,
  Award,
  Map,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}

function SidebarItem({ href, icon: Icon, label, active }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <Icon className="h-4.5 w-4.5" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState('Student');
  const [profileLevel, setProfileLevel] = useState('Class 12');

  // Load profile preview
  useEffect(() => {
    const rawProfile = localStorage.getItem('student_profile');
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile);
        if (parsed.name) setProfileName(parsed.name);
        if (parsed.level) {
          const lvMap: Record<string, string> = {
            class_10: 'Class 10 Student',
            class_11: 'Class 11 Student',
            class_12: 'Class 12 Student',
            ug: 'UG Student',
            graduate: 'Graduate',
          };
          setProfileLevel(lvMap[parsed.level] || parsed.level);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [pathname]);

  const sidebarItems = [
    { href: '/dashboard', icon: Compass, label: 'Dashboard' },
    { href: '/careers', icon: Sparkles, label: 'Career Matcher' },
    { href: '/colleges', icon: GraduationCap, label: 'College Predictor' },
    { href: '/scholarships', icon: Award, label: 'Scholarships' },
    { href: '/skills', icon: Map, label: 'Skill Roadmaps' },
    { href: '/resume', icon: FileText, label: 'Resume Analyzer' },
    { href: '/coach', icon: MessageSquare, label: 'AI Coach' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('onboarding_completed');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-border bg-card/40 backdrop-blur-md fixed h-screen top-0 left-0 z-20 p-5 justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group px-2">
            <div className="relative flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">
              PathFinder <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        {/* Footer info card */}
        <div className="flex flex-col gap-4 border-t border-border/80 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {profileName[0]?.toUpperCase() || 'S'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate leading-tight">{profileName}</h4>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{profileLevel}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-3.5 h-10"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-4 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-sans text-base font-bold tracking-tight">
            PathFinder <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-background/95 backdrop-blur-sm pt-20 px-4 pb-6 flex flex-col justify-between animate-accordion-down">
          <nav className="flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-border pt-4 mt-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 text-destructive border-destructive/20 hover:bg-destructive/5"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      )}

      {/* 2. MAIN PAGE WRAPPER */}
      <div className="flex-grow lg:pl-[260px] pt-16 lg:pt-0 min-h-screen flex flex-col">
        <main className="flex-grow p-4 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
