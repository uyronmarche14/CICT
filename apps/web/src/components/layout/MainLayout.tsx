'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import FooterSection from '@/components/layout/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isStudentPage = pathname?.startsWith('/student');
  const isLoginPage = pathname === '/login';

  if (isAdminPage || isStudentPage || isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <FooterSection />
      </div>
    </div>
  );
}
