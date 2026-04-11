// ─── Google Maps Service ───
// Manages map initialization, markers, and directions for the stadium venue.

import type { StadiumZone, AIAlert, GateData } from '@/types';

// Narendra Modi Stadium, Ahmedabad — center coordinates
export const VENUE_CENTER = { lat: 23.0927, lng: 72.5952 };
export const VENUE_ZOOM = 17;

/**
 * Venue Points of Interest with real coordinates around the stadium.
 */
export const VENUE_POIS = {
  gates: [
    { id: 'g1', name: 'Gate A', position: { lat: 23.0945, lng: 72.5935 }, icon: '🚪' },
    { id: 'g2', name: 'Gate B', position: { lat: 23.0940, lng: 72.5970 }, icon: '🚪' },
    { id: 'g3', name: 'Gate C', position: { lat: 23.0912, lng: 72.5975 }, icon: '🚪' },
    { id: 'g4', name: 'Gate D', position: { lat: 23.0905, lng: 72.5935 }, icon: '🚪' },
    { id: 'g5', name: 'Gate E', position: { lat: 23.0950, lng: 72.5952 }, icon: '🚪' },
    { id: 'g6', name: 'Gate F', position: { lat: 23.0900, lng: 72.5952 }, icon: '🚪' },
    { id: 'g7', name: 'Gate G', position: { lat: 23.0927, lng: 72.5930 }, icon: '🚪' },
    { id: 'g8', name: 'Gate H', position: { lat: 23.0927, lng: 72.5975 }, icon: '🚪' },
  ],
  food: [
    { id: 'f1', name: 'Burger Zone', position: { lat: 23.0935, lng: 72.5940 }, icon: '🍔' },
    { id: 'f2', name: 'Pizza Bay', position: { lat: 23.0920, lng: 72.5968 }, icon: '🍕' },
    { id: 'f3', name: 'Noodle Express', position: { lat: 23.0915, lng: 72.5938 }, icon: '🍜' },
    { id: 'f4', name: 'Beverage Station', position: { lat: 23.0938, lng: 72.5960 }, icon: '🥤' },
    { id: 'f5', name: 'Ice Cream Corner', position: { lat: 23.0910, lng: 72.5955 }, icon: '🍦' },
  ],
  restrooms: [
    { id: 'r1', name: 'North Restroom', position: { lat: 23.0942, lng: 72.5948 }, icon: '🚻' },
    { id: 'r2', name: 'South Restroom', position: { lat: 23.0912, lng: 72.5948 }, icon: '🚻' },
    { id: 'r3', name: 'East Restroom', position: { lat: 23.0927, lng: 72.5967 }, icon: '🚻' },
  ],
  medical: [
    { id: 'm1', name: 'Medical Bay', position: { lat: 23.0930, lng: 72.5935 }, icon: '🏥' },
    { id: 'm2', name: 'First Aid (East)', position: { lat: 23.0925, lng: 72.5970 }, icon: '🏥' },
  ],
  seating: [
    { id: 's1', name: 'North Stand', position: { lat: 23.0943, lng: 72.5952 }, icon: '🏟️' },
    { id: 's2', name: 'South Stand', position: { lat: 23.0911, lng: 72.5952 }, icon: '🏟️' },
    { id: 's3', name: 'East Stand', position: { lat: 23.0927, lng: 72.5965 }, icon: '🏟️' },
    { id: 's4', name: 'West Stand', position: { lat: 23.0927, lng: 72.5939 }, icon: '🏟️' },
  ],
  exits: [
    { id: 'e1', name: 'Emergency Exit N', position: { lat: 23.0948, lng: 72.5945 }, icon: '🚨' },
    { id: 'e2', name: 'Emergency Exit S', position: { lat: 23.0906, lng: 72.5960 }, icon: '🚨' },
  ],
  userLocation: { lat: 23.0927, lng: 72.5962 },
};

export type POIType = 'gates' | 'food' | 'restrooms' | 'medical' | 'seating' | 'exits';

/**
 * Get the color string for a crowd density percentage.
 */
export function getDensityColor(percentage: number): string {
  if (percentage < 40) return '#10b981';    // emerald
  if (percentage < 65) return '#f59e0b';    // amber
  if (percentage < 85) return '#f97316';    // orange
  return '#ef4444';                          // red
}

/**
 * Get alert marker color by severity.
 */
export function getAlertMarkerColor(severity: string): string {
  switch (severity) {
    case 'emergency': return '#ef4444';
    case 'critical': return '#f97316';
    case 'warning': return '#f59e0b';
    default: return '#3b82f6';
  }
}

/**
 * Build the Google Maps script URL.
 */
export function getGoogleMapsScriptUrl(): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions&v=weekly`;
}

/**
 * Create a custom marker label element for the map.
 */
export function createPOIMarkerContent(name: string, icon: string, crowdLevel?: string): HTMLDivElement {
  const div = document.createElement('div');
  div.style.cssText = `
    display: flex; align-items: center; gap: 4px; 
    background: rgba(15, 15, 25, 0.9); border: 1px solid rgba(255,255,255,0.1);
    padding: 4px 8px; border-radius: 8px; font-size: 11px; color: white;
    font-family: Inter, sans-serif; font-weight: 600; white-space: nowrap;
    backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;
  if (crowdLevel) {
    const borderColor = crowdLevel === 'low' ? '#10b981' : crowdLevel === 'moderate' ? '#f59e0b' : '#ef4444';
    div.style.borderColor = borderColor;
  }
  div.innerHTML = `<span style="font-size:14px">${icon}</span><span>${name}</span>`;
  return div;
}

/**
 * Map zones to overlay data for heatmap rendering.
 */
export function getZoneOverlays(zones: StadiumZone[]) {
  const zonePositions: Record<string, { lat: number; lng: number; radius: number }> = {
    z1: { lat: 23.0943, lng: 72.5952, radius: 60 },   // North Stand
    z2: { lat: 23.0911, lng: 72.5952, radius: 60 },   // South Stand
    z3: { lat: 23.0927, lng: 72.5965, radius: 60 },   // East Stand
    z4: { lat: 23.0927, lng: 72.5939, radius: 60 },   // West Stand
    z5: { lat: 23.0920, lng: 72.5968, radius: 30 },   // East Food Court
    z6: { lat: 23.0920, lng: 72.5938, radius: 30 },   // West Food Court
    z7: { lat: 23.0942, lng: 72.5948, radius: 40 },   // North Concourse
    z8: { lat: 23.0912, lng: 72.5948, radius: 40 },   // South Concourse
    z9: { lat: 23.0935, lng: 72.5960, radius: 25 },   // VIP Lounge
  };

  return zones
    .filter(z => zonePositions[z.id])
    .map(z => ({
      ...zonePositions[z.id],
      zone: z,
      color: getDensityColor(z.crowdPercentage),
    }));
}
