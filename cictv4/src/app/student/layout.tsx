'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StudentAuthProvider, useStudentAuth } from '@/context/StudentAuthContext';
import { Loader2, CalendarDays, Ticket, Clock, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, student, logout } = useStudentAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/student/login';

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && !isAuthenticated) {
      router.push('/student/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/student/events', label: 'Events', icon: CalendarDays },
    { href: '/student/registrations', label: 'Registrations', icon: Ticket },
    { href: '/student/attendance', label: 'Attendance', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm truncate max-w-[160px]">
              {student?.firstName} {student?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{student?.studentNumber}</span>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthProvider>
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </StudentAuthProvider>
  );
}
