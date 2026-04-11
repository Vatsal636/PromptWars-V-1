// ─── Alert Engine ───
// Generates real-time intelligent alerts based on venue conditions.

import type { StadiumZone, QueueStation, AIAlert, MatchPhase } from '@/types';

let alertCounter = 0;

function nextAlertId(): string {
  alertCounter++;
  return `ai-alert-${Date.now()}-${alertCounter}`;
}

function now(): string {
  return 'Just now';
}

/**
 * Generate crowd density alerts.
 */
function generateCrowdAlerts(zones: StadiumZone[]): AIAlert[] {
  const alerts: AIAlert[] = [];

  for (const zone of zones) {
    if (zone.crowdPercentage >= 90) {
      alerts.push({
        id: nextAlertId(),
        severity: 'emergency',
        category: 'crowd',
        title: `Critical overcrowding at ${zone.name}`,
        description: `${zone.name} has reached ${zone.crowdPercentage}% capacity (${zone.currentCount.toLocaleString()}/${zone.capacity.toLocaleString()}). Immediate crowd dispersal required.`,
        zone: zone.name,
        timestamp: now(),
        actionRequired: true,
        suggestedAction: `Deploy crowd control to ${zone.name}. Redirect foot traffic to adjacent zones. Consider temporary closure.`,
      });
    } else if (zone.crowdPercentage >= 80) {
      alerts.push({
        id: nextAlertId(),
        severity: 'warning',
        category: 'crowd',
        title: `High density at ${zone.name}`,
        description: `${zone.name} is at ${zone.crowdPercentage}% capacity. Congestion may build up if trend continues.`,
        zone: zone.name,
        timestamp: now(),
        actionRequired: true,
        suggestedAction: `Monitor ${zone.name} closely. Pre-position staff for crowd management. Route attendees to less crowded areas.`,
      });
    }
  }

  return alerts;
}

/**
 * Generate queue-based alerts.
 */
function generateQueueAlerts(stations: QueueStation[]): AIAlert[] {
  const alerts: AIAlert[] = [];

  for (const station of stations) {
    if (station.status === 'closed') continue;

    if (station.waitTime >= 20) {
      alerts.push({
        id: nextAlertId(),
        severity: 'warning',
        category: 'queue',
        title: `Extreme wait at ${station.name}`,
        description: `Queue at ${station.name} has reached ${station.waitTime} min wait with ${station.queueLength} people. This exceeds acceptable thresholds.`,
        zone: station.name,
        timestamp: now(),
        actionRequired: true,
        suggestedAction: `Open additional service counters at ${station.name}. Send push notifications to attendees suggesting alternatives.`,
      });
    } else if (station.waitTime >= 15) {
      alerts.push({
        id: nextAlertId(),
        severity: 'info',
        category: 'queue',
        title: `Long queue at ${station.name}`,
        description: `${station.name} has a ${station.waitTime} min wait. Attendees may benefit from virtual queue activation.`,
        zone: station.name,
        timestamp: now(),
        actionRequired: false,
        suggestedAction: `Promote virtual queue for ${station.name} in attendee app notifications.`,
      });
    }
  }

  return alerts;
}

/**
 * Generate phase-specific alerts.
 */
function generatePhaseAlerts(phase: MatchPhase): AIAlert[] {
  const alerts: AIAlert[] = [];

  switch (phase) {
    case 'halftime':
      alerts.push({
        id: nextAlertId(),
        severity: 'info',
        category: 'system',
        title: 'Halftime break — high queue demand expected',
        description: 'Match halftime has started. Food and restroom queues typically spike 3-5x during break periods.',
        zone: 'All food courts',
        timestamp: now(),
        actionRequired: true,
        suggestedAction: 'Activate virtual queues for all food stalls. Enable seat delivery ordering. Staff all service points.',
      });
      break;
    case 'exit':
      alerts.push({
        id: nextAlertId(),
        severity: 'warning',
        category: 'crowd',
        title: 'Exit phase — crowd surge warning',
        description: 'Match has ended. All exit gates will experience high traffic in the next 15-20 minutes.',
        zone: 'All exit gates',
        timestamp: now(),
        actionRequired: true,
        suggestedAction: 'Open all gates. Deploy crowd control at high-traffic exits. Push staggered exit routes to attendees.',
      });
      break;
    case 'pre-match':
      alerts.push({
        id: nextAlertId(),
        severity: 'info',
        category: 'system',
        title: 'Pre-match entry phase active',
        description: 'Gate entry monitoring is active. AI is recommending optimal gates to incoming attendees.',
        zone: 'All entry gates',
        timestamp: now(),
        actionRequired: false,
        suggestedAction: 'Monitor gate throughput. Adjust recommendations if any gate reports issues.',
      });
      break;
  }

  return alerts;
}

/**
 * Generate all alerts from current venue state.
 */
export function generateAlerts(
  zones: StadiumZone[],
  stations: QueueStation[],
  phase: MatchPhase
): AIAlert[] {
  const crowdAlerts = generateCrowdAlerts(zones);
  const queueAlerts = generateQueueAlerts(stations);
  const phaseAlerts = generatePhaseAlerts(phase);

  // Deduplicate by combining and sorting by severity
  const all = [...crowdAlerts, ...queueAlerts, ...phaseAlerts];

  const severityOrder: Record<AIAlert['severity'], number> = {
    emergency: 0,
    critical: 1,
    warning: 2,
    info: 3,
  };

  all.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return all;
}

/**
 * Get count summary of alerts by severity.
 */
export function getAlertSummary(alerts: AIAlert[]) {
  return {
    total: alerts.length,
    emergency: alerts.filter(a => a.severity === 'emergency').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    actionRequired: alerts.filter(a => a.actionRequired).length,
  };
}
