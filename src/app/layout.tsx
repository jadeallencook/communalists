import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider, SidebarTrigger } from "@/components/atoms/sidebar";
import { Navigation } from "@/components/organisms/navigation";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme";

export const metadata: Metadata = {
  title: "Communalists | Mutual Aid Tools & Resources",
  description:
    "Tools and resources for communities to build and sustain mutual aid networks.",
};

export default function ThemeToggler({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Navigation />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
