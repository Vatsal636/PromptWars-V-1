// ─── Predictive Congestion Engine ───
// Forecasts crowd density trends using delta-based projection.

import type { StadiumZone, CongestionPrediction } from '@/types';

// Store previous densities for trend calculation
const densityHistory: Map<string, number[]> = new Map();

/**
 * Record current density snapshot for a zone.
 */
function recordDensity(zoneId: string, density: number) {
  const history = densityHistory.get(zoneId) || [];
  history.push(density);
  // Keep last 10 readings
  if (history.length > 10) history.shift();
  densityHistory.set(zoneId, history);
}

/**
 * Get previous density (or current if no history).
 */
function getPreviousDensity(zoneId: string, currentDensity: number): number {
  const history = densityHistory.get(zoneId) || [];
  if (history.length >= 2) {
    return history[history.length - 2];
  }
  return currentDensity;
}

/**
 * Classify congestion trend from delta.
 */
function classifyTrend(delta: number): 'falling' | 'stable' | 'rising' | 'critical' {
  if (delta <= -5) return 'falling';
  if (delta <= 3) return 'stable';
  if (delta <= 10) return 'rising';
  return 'critical';
}

/**
 * Determine warning level based on predicted density.
 */
function getWarningLevel(predicted: number): 'normal' | 'watch' | 'warning' | 'critical' {
  if (predicted < 50) return 'normal';
  if (predicted < 70) return 'watch';
  if (predicted < 85) return 'warning';
  return 'critical';
}

/**
 * Generate a human-readable recommendation based on prediction.
 */
function generateRecommendation(zone: StadiumZone, predicted: number, trend: string): string {
  if (predicted >= 85) {
    return `⚠️ ${zone.name} is approaching critical capacity. Recommend diverting foot traffic to adjacent zones.`;
  }
  if (predicted >= 70 && trend === 'rising') {
    return `${zone.name} density is rising. Pre-emptive crowd management suggested within 5 minutes.`;
  }
  if (trend === 'falling') {
    return `${zone.name} is clearing up. Density trending downward — suitable for incoming attendees.`;
  }
  if (predicted < 40) {
    return `${zone.name} has comfortable capacity. Good option for attendee routing.`;
  }
  return `${zone.name} is at moderate levels. Monitoring for changes.`;
}

/**
 * Generate congestion predictions for all zones.
 */
export function predictCongestion(zones: StadiumZone[]): CongestionPrediction[] {
  return zones.map(zone => {
    // Record this reading
    recordDensity(zone.id, zone.crowdPercentage);

    const previousDensity = getPreviousDensity(zone.id, zone.crowdPercentage);
    const trendDelta = zone.crowdPercentage - previousDensity;

    // Predict future density using trend extrapolation
    const predictedDensity = Math.max(0, Math.min(100,
      Math.round(zone.crowdPercentage + trendDelta * 2)
    ));

    const trend = classifyTrend(trendDelta);
    const warningLevel = getWarningLevel(predictedDensity);
    const recommendation = generateRecommendation(zone, predictedDensity, trend);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      currentDensity: zone.crowdPercentage,
      previousDensity,
      predictedDensity,
      trend,
      trendDelta: Math.round(trendDelta * 10) / 10,
      warningLevel,
      recommendation,
    };
  });
}

/**
 * Get zones that are predicted to become critical.
 */
export function getCriticalPredictions(zones: StadiumZone[]): CongestionPrediction[] {
  return predictCongestion(zones).filter(p =>
    p.warningLevel === 'warning' || p.warningLevel === 'critical'
  );
}

/**
 * Get overall venue prediction summary.
 */
export function getVenuePredictionSummary(zones: StadiumZone[]) {
  const predictions = predictCongestion(zones);
  const avgCurrent = Math.round(predictions.reduce((s, p) => s + p.currentDensity, 0) / predictions.length);
  const avgPredicted = Math.round(predictions.reduce((s, p) => s + p.predictedDensity, 0) / predictions.length);
  const risingCount = predictions.filter(p => p.trend === 'rising' || p.trend === 'critical').length;
  const criticalCount = predictions.filter(p => p.warningLevel === 'critical').length;
  const warningCount = predictions.filter(p => p.warningLevel === 'warning').length;

  return {
    avgCurrentDensity: avgCurrent,
    avgPredictedDensity: avgPredicted,
    overallTrend: avgPredicted > avgCurrent + 3 ? 'rising' as const : avgPredicted < avgCurrent - 3 ? 'falling' as const : 'stable' as const,
    risingZones: risingCount,
    criticalZones: criticalCount,
    warningZones: warningCount,
    predictions,
  };
}
