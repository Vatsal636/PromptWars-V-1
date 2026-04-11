// ─── VenueProvider ───
// Wraps app with shared venue data context so all pages share a single data source.

'use client';

import { type ReactNode } from 'react';
import { useLiveVenueData, VenueDataContext } from '@/lib/hooks/useLiveVenueData';

export default function VenueProvider({ children }: { children: ReactNode }) {
  const venueData = useLiveVenueData(3000);

  return (
    <VenueDataContext.Provider value={venueData}>
      {children}
    </VenueDataContext.Provider>
  );
}
