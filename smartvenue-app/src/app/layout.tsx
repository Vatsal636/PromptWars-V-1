import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import VenueProvider from "@/components/providers/VenueProvider";
import GlobalQueueEngine from "@/components/ui/GlobalQueueEngine";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartVenue — AI-Powered Stadium Experience",
  description: "Real-time venue intelligence platform for stadiums. Optimize crowd movement, reduce waiting times, and enhance attendee experience with AI and IoT.",
};

import { env } from "@/lib/env";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mapsApiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidMapKey = mapsApiKey && !mapsApiKey.includes('your-') && !mapsApiKey.includes('demo-');

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#07070d] text-gray-100 min-h-screen`}>
        {/* Google Maps JavaScript API */}
        {hasValidMapKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places,marker&v=weekly`}
            strategy="afterInteractive"
          />
        )}

        {/* Background ambient effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <VenueProvider>
          <GlobalQueueEngine />
          <Sidebar />

          {/* Main Content Area */}
          <main className="lg:pl-[220px] min-h-screen pb-20 lg:pb-0 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </VenueProvider>
      </body>
    </html>
  );
}
