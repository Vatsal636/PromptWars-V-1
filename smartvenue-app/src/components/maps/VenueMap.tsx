// ─── Google Maps Venue Map Component ───
// Interactive Google Maps embed with venue POIs, crowd hotspots, and route display.

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  VENUE_CENTER, VENUE_ZOOM, VENUE_POIS, type POIType,
  getDensityColor, getAlertMarkerColor, getZoneOverlays,
} from '@/lib/google/maps';
import type { StadiumZone, AIAlert, GateData } from '@/types';

interface VenueMapProps {
  zones?: StadiumZone[];
  alerts?: AIAlert[];
  gates?: GateData[];
  showPOIs?: POIType[];
  showHotspots?: boolean;
  showAlertZones?: boolean;
  selectedDestination?: string | null;
  height?: string;
  className?: string;
}

// Dark map style for premium look
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b8b8b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default function VenueMap({
  zones = [],
  alerts = [],
  gates = [],
  showPOIs = ['gates', 'food', 'restrooms', 'medical'],
  showHotspots = false,
  showAlertZones = false,
  selectedDestination = null,
  height = '400px',
  className = '',
}: VenueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Check if Google Maps API is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setApiAvailable(true);
      return;
    }

    // Check periodically for script load
    const check = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setApiAvailable(true);
        clearInterval(check);
      }
    }, 500);

    // Timeout after 5s — show fallback
    const timeout = setTimeout(() => clearInterval(check), 5000);

    return () => {
      clearInterval(check);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!apiAvailable || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: VENUE_CENTER,
        zoom: VENUE_ZOOM,
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        backgroundColor: '#1a1a2e',
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch {
      // Maps API failed — fallback will show
    }
  }, [apiAvailable]);

  // Add POI markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];

    const map = mapInstanceRef.current;

    // Add user location marker
    try {
      const userDiv = document.createElement('div');
      userDiv.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%; background: #6366f1;
        border: 3px solid white; box-shadow: 0 0 12px rgba(99,102,241,0.6);
      `;
      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: VENUE_POIS.userLocation,
        map,
        content: userDiv,
        title: 'Your Location',
      });
      markersRef.current.push(userMarker);
    } catch {
      // AdvancedMarkerElement not available
    }

    // Add POI markers
    showPOIs.forEach(poiType => {
      const pois = VENUE_POIS[poiType] || [];
      pois.forEach(poi => {
        try {
          // Match with gate data for crowd levels
          const gateData = gates.find(g => g.id === poi.id);
          const crowdLevel = gateData?.crowd;

          const markerDiv = document.createElement('div');
          markerDiv.style.cssText = `
            display: flex; align-items: center; gap: 3px;
            background: rgba(10, 10, 20, 0.92); border: 1px solid rgba(255,255,255,0.12);
            padding: 3px 7px; border-radius: 6px; font-size: 10px; color: #e5e5e5;
            font-family: Inter, sans-serif; font-weight: 600; white-space: nowrap;
            backdrop-filter: blur(6px); cursor: pointer;
          `;
          if (crowdLevel) {
            const col = crowdLevel === 'low' ? '#10b981' : crowdLevel === 'moderate' ? '#f59e0b' : '#ef4444';
            markerDiv.style.borderColor = col;
          }
          markerDiv.innerHTML = `<span style="font-size:13px">${poi.icon}</span><span>${poi.name}</span>`;

          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: poi.position,
            map,
            content: markerDiv,
            title: poi.name,
          });
          markersRef.current.push(marker);
        } catch {
          // Fallback: skip marker
        }
      });
    });
  }, [mapLoaded, showPOIs, gates]);

  // Render crowd hotspot circles
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !showHotspots) return;

    // Clear previous circles
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];

    const overlays = getZoneOverlays(zones);
    overlays.forEach(overlay => {
      const circle = new google.maps.Circle({
        center: { lat: overlay.lat, lng: overlay.lng },
        radius: overlay.radius,
        fillColor: overlay.color,
        fillOpacity: 0.25,
        strokeColor: overlay.color,
        strokeOpacity: 0.5,
        strokeWeight: 1,
        map: mapInstanceRef.current,
      });
      circlesRef.current.push(circle);
    });
  }, [mapLoaded, zones, showHotspots]);

  // Render alert zone markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !showAlertZones || alerts.length === 0) return;

    alerts.forEach(alert => {
      // Find matching zone position
      const zonePOIs = [...VENUE_POIS.gates, ...VENUE_POIS.food, ...VENUE_POIS.restrooms, ...VENUE_POIS.seating];
      const match = zonePOIs.find(p => alert.zone.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
      if (!match) return;

      try {
        const alertDiv = document.createElement('div');
        const col = getAlertMarkerColor(alert.severity);
        alertDiv.style.cssText = `
          display: flex; align-items: center; gap: 3px;
          background: rgba(10, 10, 20, 0.95); border: 1px solid ${col};
          padding: 3px 7px; border-radius: 6px; font-size: 9px; color: ${col};
          font-family: Inter, sans-serif; font-weight: 700; white-space: nowrap;
          text-transform: uppercase; letter-spacing: 0.5px;
        `;
        alertDiv.innerHTML = `⚠ ${alert.severity}`;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: match.position,
          map: mapInstanceRef.current,
          content: alertDiv,
          title: alert.title,
        });
        markersRef.current.push(marker);
      } catch {
        // Skip
      }
    });
  }, [mapLoaded, alerts, showAlertZones]);

  // Directions API for Navigation Routes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear previous route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (!selectedDestination) return;

    // Find destination coordinates
    const allPOIs = [...VENUE_POIS.gates, ...VENUE_POIS.food, ...VENUE_POIS.restrooms, ...VENUE_POIS.medical, ...VENUE_POIS.seating, ...VENUE_POIS.exits];
    const destinationPOI = allPOIs.find(p => p.name.toLowerCase() === selectedDestination.toLowerCase() || selectedDestination.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
    
    if (!destinationPOI) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#6366f1',
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
      });

      directionsRendererRef.current = directionsRenderer;

      directionsService.route(
        {
          origin: VENUE_POIS.userLocation,
          destination: destinationPOI.position,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    } catch {
      // DirectionsService unavailable or failed
    }
  }, [mapLoaded, selectedDestination]);

  // ─── Fallback UI when Google Maps API is not loaded ───
  if (!apiAvailable) {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-white/[0.06] ${className}`} style={{ height }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0e0e1a] flex flex-col items-center justify-center gap-3">
          {/* Mini SVG stadium visualization as fallback */}
          <svg viewBox="0 0 200 120" className="w-48 h-28 opacity-60">
            <ellipse cx="100" cy="60" rx="90" ry="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
            <ellipse cx="100" cy="60" rx="60" ry="33" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            <ellipse cx="100" cy="60" rx="30" ry="17" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1"/>
            {/* Gate markers */}
            {[
              { x: 100, y: 10, label: 'N' }, { x: 100, y: 110, label: 'S' },
              { x: 10, y: 60, label: 'W' }, { x: 190, y: 60, label: 'E' },
            ].map(g => (
              <g key={g.label}>
                <circle cx={g.x} cy={g.y} r="5" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" strokeWidth="1"/>
                <text x={g.x} y={g.y + 3} textAnchor="middle" fill="rgba(99,102,241,0.8)" fontSize="5" fontWeight="bold">{g.label}</text>
              </g>
            ))}
            {/* Crowd density circles */}
            {zones.slice(0, 4).map((zone, i) => {
              const positions = [{ x: 100, y: 25 }, { x: 100, y: 95 }, { x: 155, y: 60 }, { x: 45, y: 60 }];
              const pos = positions[i];
              return (
                <g key={zone.id}>
                  <circle cx={pos.x} cy={pos.y} r="12" fill={getDensityColor(zone.crowdPercentage)} fillOpacity="0.15" stroke={getDensityColor(zone.crowdPercentage)} strokeOpacity="0.3" strokeWidth="0.5"/>
                  <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">{zone.crowdPercentage}%</text>
                </g>
              );
            })}
            {/* User marker */}
            <circle cx="130" cy="50" r="3" fill="#6366f1" stroke="white" strokeWidth="1">
              <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <div className="text-center">
            <p className="text-[11px] text-gray-500 font-semibold">Stadium Map</p>
            <p className="text-[9px] text-gray-600">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for full map</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-white/[0.06] ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {/* Map overlay legend */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/[0.08]">
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/><span className="text-gray-400">You</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/><span className="text-gray-400">Low</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/><span className="text-gray-400">Mod</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/><span className="text-gray-400">High</span></div>
        </div>
      </div>
    </div>
  );
}
