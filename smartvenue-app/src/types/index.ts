// ─── SmartVenue Type Definitions ───

export interface Event {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'ended';
}

export interface Ticket {
  id: string;
  eventId: string;
  section: string;
  row: string;
  seat: string;
  gate: string;
  gateWaitTime: number;
  qrCode: string;
}

export interface StadiumZone {
  id: string;
  name: string;
  section: string;
  crowdPercentage: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  capacity: number;
  currentCount: number;
}

export interface QueueStation {
  id: string;
  name: string;
  type: 'food' | 'restroom' | 'merchandise' | 'parking';
  waitTime: number;
  queueLength: number;
  status: 'open' | 'busy' | 'closed';
  icon: string;
}

export interface QueueToken {
  id: string;
  stationId: string;
  stationName: string;
  tokenNumber: string;
  estimatedTime: number;
  status: 'waiting' | 'ready' | 'completed' | 'cancelled';
  position: number;
}

export interface NavDestination {
  id: string;
  name: string;
  type: 'seat' | 'restroom' | 'food' | 'exit' | 'medical';
  distance: string;
  walkTime: string;
  crowdLevel: 'low' | 'moderate' | 'high';
  icon: string;
}

export interface NavRoute {
  id: string;
  label: string;
  type: 'fastest' | 'least-crowded' | 'accessible';
  estimatedTime: string;
  distance: string;
  crowdLevel: 'low' | 'moderate' | 'high';
  steps: string[];
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export interface Incident {
  id: string;
  type: 'crowd' | 'medical' | 'security' | 'facility';
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved';
  reportedAt: string;
}

export interface AdminStats {
  totalAttendees: number;
  crowdHotspots: number;
  avgQueueTime: number;
  activeIncidents: number;
  gatesOpen: number;
  totalGates: number;
  satisfaction: number;
  revenue: number;
}

// ─── AI Engine Types ───

export type MatchPhase = 'pre-match' | 'live' | 'halftime' | 'second-half' | 'exit';

export interface GateRecommendation {
  gateId: string;
  gateName: string;
  score: number;
  waitTime: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  recommended: boolean;
  reasoning: string;
  timeSaved: number;
}

export interface QueueRecommendation {
  stationId: string;
  stationName: string;
  currentWait: number;
  predictedWait: number;
  trend: 'decreasing' | 'stable' | 'increasing';
  recommended: boolean;
  reasoning: string;
  icon: string;
}

export interface CongestionPrediction {
  zoneId: string;
  zoneName: string;
  currentDensity: number;
  previousDensity: number;
  predictedDensity: number;
  trend: 'falling' | 'stable' | 'rising' | 'critical';
  trendDelta: number;
  warningLevel: 'normal' | 'watch' | 'warning' | 'critical';
  recommendation: string;
}

export interface RouteRecommendation {
  routeId: string;
  label: string;
  type: 'fastest' | 'least-crowded' | 'safest';
  score: number;
  time: number;
  crowdDensity: number;
  safetyRisk: number;
  recommended: boolean;
  reasoning: string;
  steps: string[];
}

export interface AIAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  category: 'crowd' | 'queue' | 'safety' | 'weather' | 'system';
  title: string;
  description: string;
  zone: string;
  timestamp: string;
  actionRequired: boolean;
  suggestedAction: string;
}

export interface SimulationState {
  phase: MatchPhase;
  phaseName: string;
  phaseProgress: number;
  elapsedMinutes: number;
  zones: StadiumZone[];
  queues: QueueStation[];
  gates: GateData[];
  alerts: AIAlert[];
  stats: LiveStats;
  predictions: CongestionPrediction[];
  gateRecommendations: GateRecommendation[];
  queueRecommendations: QueueRecommendation[];
  routeRecommendations: RouteRecommendation[];
}

export interface GateData {
  id: string;
  name: string;
  waitTime: number;
  crowd: 'low' | 'moderate' | 'high';
  status: 'open' | 'closed';
  distance: number;
}

export interface LiveStats {
  crowdDensity: number;
  avgWaitTime: number;
  openGates: number;
  activeAlerts: number;
  totalAttendees: number;
  satisfaction: number;
  avgQueueTime: number;
  crowdHotspots: number;
  activeIncidents: number;
  revenue: number;
}
