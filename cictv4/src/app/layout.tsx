import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { StudentAuthProvider } from "@/context/StudentAuthContext";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import MainLayout from "@/components/layout/MainLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "CICT",
  description: "College of Information and Communications Technology portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ReactQueryProvider>
          <AuthProvider>
            <StudentAuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <MainLayout>
                  {children}
                </MainLayout>
              </ThemeProvider>
            </StudentAuthProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
