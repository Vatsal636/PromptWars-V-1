import type {
  Event ,Ticket, StadiumZone, QueueStation,
  NavDestination, NavRoute, Notification, Incident, AdminStats
} from '@/types';

// ─── Current Event ───
export const currentEvent: Event = {
  id: 'evt-001',
  title: 'IPL 2026 Final',
  venue: 'Narendra Modi Stadium',
  date: '2026-04-11',
  time: '19:30 IST',
  status: 'live',
};

// ─── User Ticket ───
export const userTicket: Ticket = {
  id: 'TKT-2026-04110042',
  eventId: 'evt-001',
  section: 'East Stand',
  row: 'G',
  seat: '14',
  gate: 'Gate C',
  gateWaitTime: 4,
  qrCode: 'SMARTVENUE-TKT-2026-04110042',
};

// ─── Stadium Zones ───
export const stadiumZones: StadiumZone[] = [
  { id: 'z1', name: 'North Stand',        section: 'N',  crowdPercentage: 35, status: 'low',      capacity: 12000, currentCount: 4200 },
  { id: 'z2', name: 'South Stand',        section: 'S',  crowdPercentage: 62, status: 'moderate',  capacity: 12000, currentCount: 7440 },
  { id: 'z3', name: 'East Stand',         section: 'E',  crowdPercentage: 78, status: 'high',      capacity: 15000, currentCount: 11700 },
  { id: 'z4', name: 'West Stand',         section: 'W',  crowdPercentage: 45, status: 'moderate',  capacity: 15000, currentCount: 6750 },
  { id: 'z5', name: 'East Food Court',    section: 'EF', crowdPercentage: 88, status: 'critical',  capacity: 3000,  currentCount: 2640 },
  { id: 'z6', name: 'West Food Court',    section: 'WF', crowdPercentage: 52, status: 'moderate',  capacity: 3000,  currentCount: 1560 },
  { id: 'z7', name: 'North Concourse',    section: 'NC', crowdPercentage: 28, status: 'low',       capacity: 5000,  currentCount: 1400 },
  { id: 'z8', name: 'South Concourse',    section: 'SC', crowdPercentage: 71, status: 'high',      capacity: 5000,  currentCount: 3550 },
  { id: 'z9', name: 'VIP Lounge',         section: 'VIP', crowdPercentage: 40, status: 'low',      capacity: 2000,  currentCount: 800 },
  { id: 'z10', name: 'Parking Zone A',    section: 'PA', crowdPercentage: 55, status: 'moderate',  capacity: 8000,  currentCount: 4400 },
  { id: 'z11', name: 'Parking Zone B',    section: 'PB', crowdPercentage: 30, status: 'low',       capacity: 8000,  currentCount: 2400 },
  { id: 'z12', name: 'Main Entrance',     section: 'ME', crowdPercentage: 82, status: 'high',      capacity: 4000,  currentCount: 3280 },
];

// ─── Queue Stations ───
export const queueStations: QueueStation[] = [
  { id: 'q1', name: 'Burger Zone',        type: 'food',        waitTime: 12, queueLength: 28,  status: 'busy',  icon: '🍔' },
  { id: 'q2', name: 'Pizza Bay',          type: 'food',        waitTime: 4,  queueLength: 8,   status: 'open',  icon: '🍕' },
  { id: 'q3', name: 'Noodle Express',     type: 'food',        waitTime: 8,  queueLength: 18,  status: 'busy',  icon: '🍜' },
  { id: 'q4', name: 'Beverage Station',   type: 'food',        waitTime: 3,  queueLength: 5,   status: 'open',  icon: '🥤' },
  { id: 'q5', name: 'Ice Cream Corner',   type: 'food',        waitTime: 6,  queueLength: 12,  status: 'open',  icon: '🍦' },
  { id: 'q6', name: 'North Restroom',     type: 'restroom',    waitTime: 5,  queueLength: 10,  status: 'open',  icon: '🚻' },
  { id: 'q7', name: 'South Restroom',     type: 'restroom',    waitTime: 14, queueLength: 30,  status: 'busy',  icon: '🚻' },
  { id: 'q8', name: 'East Restroom',      type: 'restroom',    waitTime: 2,  queueLength: 3,   status: 'open',  icon: '🚻' },
  { id: 'q9', name: 'Official Merch',     type: 'merchandise', waitTime: 18, queueLength: 35,  status: 'busy',  icon: '👕' },
  { id: 'q10', name: 'Fan Store',         type: 'merchandise', waitTime: 7,  queueLength: 14,  status: 'open',  icon: '🧢' },
  { id: 'q11', name: 'Parking Exit A',    type: 'parking',     waitTime: 22, queueLength: 45,  status: 'busy',  icon: '🅿️' },
  { id: 'q12', name: 'Parking Exit B',    type: 'parking',     waitTime: 8,  queueLength: 15,  status: 'open',  icon: '🅿️' },
];

// ─── Navigation Destinations ───
export const navDestinations: NavDestination[] = [
  { id: 'n1', name: 'My Seat — East Stand G14', type: 'seat',     distance: '120m', walkTime: '3 min',  crowdLevel: 'moderate', icon: '💺' },
  { id: 'n2', name: 'Nearest Restroom',          type: 'restroom', distance: '45m',  walkTime: '1 min',  crowdLevel: 'low',      icon: '🚻' },
  { id: 'n3', name: 'Pizza Bay',                  type: 'food',     distance: '80m',  walkTime: '2 min',  crowdLevel: 'low',      icon: '🍕' },
  { id: 'n4', name: 'Beverage Station',           type: 'food',     distance: '60m',  walkTime: '1.5 min', crowdLevel: 'low',     icon: '🥤' },
  { id: 'n5', name: 'Gate C (Exit)',              type: 'exit',     distance: '200m', walkTime: '5 min',  crowdLevel: 'moderate', icon: '🚪' },
  { id: 'n6', name: 'Gate A (Exit)',              type: 'exit',     distance: '310m', walkTime: '8 min',  crowdLevel: 'high',     icon: '🚪' },
  { id: 'n7', name: 'Medical Aid Station',        type: 'medical',  distance: '150m', walkTime: '4 min',  crowdLevel: 'low',      icon: '🏥' },
];

// ─── Navigation Routes ───
export const navRoutes: NavRoute[] = [
  {
    id: 'r1',
    label: 'Fastest Route',
    type: 'fastest',
    estimatedTime: '3 min',
    distance: '120m',
    crowdLevel: 'moderate',
    steps: ['Exit Row G', 'Turn left at Aisle 4', 'Take stairs down to Level 1', 'Follow signs to East Stand entrance'],
  },
  {
    id: 'r2',
    label: 'Least Crowded',
    type: 'least-crowded',
    estimatedTime: '5 min',
    distance: '180m',
    crowdLevel: 'low',
    steps: ['Exit Row G', 'Turn right at Aisle 6', 'Use North Concourse ramp', 'Follow green path markers'],
  },
  {
    id: 'r3',
    label: 'Accessible Route',
    type: 'accessible',
    estimatedTime: '6 min',
    distance: '200m',
    crowdLevel: 'low',
    steps: ['Exit Row G', 'Take elevator to Level 1', 'Follow accessible corridor', 'Use ramp to destination'],
  },
];

// ─── Notifications ───
export const notifications: Notification[] = [
  { id: 'nt1', type: 'success',   title: 'Gate Recommendation Updated',     message: 'Gate C is now recommended — only 4 min wait time.',                         timestamp: '2 min ago',  read: false, icon: '🚪' },
  { id: 'nt2', type: 'warning',   title: 'East Food Court Crowded',          message: 'East Food Court is at 88% capacity. Consider West Food Court instead.',      timestamp: '5 min ago',  read: false, icon: '⚠️' },
  { id: 'nt3', type: 'info',      title: 'Match Update',                     message: 'Innings break in 15 minutes. Virtual queues are now active for food stalls.', timestamp: '8 min ago',  read: false, icon: '🏏' },
  { id: 'nt4', type: 'info',      title: 'Weather Update',                   message: 'Clear skies expected for the rest of the evening. Temperature: 28°C.',        timestamp: '12 min ago', read: true,  icon: '🌤️' },
  { id: 'nt5', type: 'success',   title: 'Queue Token Ready',                message: 'Your token #A-042 at Burger Zone is ready. Proceed to counter.',              timestamp: '18 min ago', read: true,  icon: '✅' },
  { id: 'nt6', type: 'warning',   title: 'Parking Zone A Congested',         message: 'Parking Exit A has 22 min wait. Use Exit B for faster departure.',            timestamp: '25 min ago', read: true,  icon: '🅿️' },
  { id: 'nt7', type: 'info',      title: 'Event Schedule',                   message: 'Post-match ceremony begins 10 minutes after the final ball.',                 timestamp: '30 min ago', read: true,  icon: '📅' },
  { id: 'nt8', type: 'emergency', title: 'Emergency Drill Completed',        message: 'Stadium emergency drill completed successfully. All exits operational.',      timestamp: '1 hr ago',   read: true,  icon: '🔴' },
];

// ─── Incidents (Admin) ───
export const incidents: Incident[] = [
  { id: 'inc1', type: 'crowd',    title: 'East Food Court overcrowding',    location: 'East Food Court',   severity: 'high',     status: 'active',    reportedAt: '3 min ago' },
  { id: 'inc2', type: 'medical',  title: 'Medical assistance requested',   location: 'South Stand Row K', severity: 'medium',   status: 'responding', reportedAt: '7 min ago' },
  { id: 'inc3', type: 'facility', title: 'Blocked turnstile at Gate D',    location: 'Gate D',            severity: 'low',      status: 'responding', reportedAt: '15 min ago' },
  { id: 'inc4', type: 'security', title: 'Unauthorized zone access attempt', location: 'VIP Lounge',      severity: 'medium',   status: 'resolved',   reportedAt: '22 min ago' },
  { id: 'inc5', type: 'crowd',    title: 'Surge warning at Main Entrance', location: 'Main Entrance',     severity: 'critical', status: 'active',     reportedAt: '1 min ago' },
];

// ─── Admin Stats ───
export const adminStats: AdminStats = {
  totalAttendees: 48250,
  crowdHotspots: 3,
  avgQueueTime: 9,
  activeIncidents: 3,
  gatesOpen: 6,
  totalGates: 8,
  satisfaction: 87,
  revenue: 2450000,
};

// ─── Gate Data ───
export const gateData = [
  { id: 'g1', name: 'Gate A', waitTime: 18, crowd: 'high'     as const, status: 'open' as const },
  { id: 'g2', name: 'Gate B', waitTime: 12, crowd: 'moderate' as const, status: 'open' as const },
  { id: 'g3', name: 'Gate C', waitTime: 4,  crowd: 'low'      as const, status: 'open' as const },
  { id: 'g4', name: 'Gate D', waitTime: 0,  crowd: 'low'      as const, status: 'closed' as const },
  { id: 'g5', name: 'Gate E', waitTime: 9,  crowd: 'moderate' as const, status: 'open' as const },
  { id: 'g6', name: 'Gate F', waitTime: 15, crowd: 'high'     as const, status: 'open' as const },
  { id: 'g7', name: 'Gate G', waitTime: 6,  crowd: 'low'      as const, status: 'open' as const },
  { id: 'g8', name: 'Gate H', waitTime: 0,  crowd: 'low'      as const, status: 'closed' as const },
];

// ─── Live Stats for Dashboard ───
export const liveStats = {
  crowdDensity: 64,
  avgWaitTime: 9,
  openGates: 6,
  activeAlerts: 3,
};
