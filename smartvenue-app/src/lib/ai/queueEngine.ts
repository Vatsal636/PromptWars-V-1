// ─── Queue Intelligence Engine ───
// Recommends the best queue/stall based on current wait, incoming users, and congestion trend.

import type { QueueStation, QueueRecommendation } from '@/types';

const INCOMING_FACTOR = 0.5;

/**
 * Predict future wait time based on current wait and simulated incoming users.
 */
function predictWait(current: number, queueLength: number): number {
  // Simulate incoming users as a fraction of current queue length
  const incomingUsers = Math.max(0, Math.round(queueLength * 0.15 + (Math.random() * 4 - 2)));
  return Math.max(0, Math.round(current + incomingUsers * INCOMING_FACTOR));
}

/**
 * Determine congestion trend by comparing predicted vs current wait.
 */
function getTrend(current: number, predicted: number): 'decreasing' | 'stable' | 'increasing' {
  const delta = predicted - current;
  if (delta <= -2) return 'decreasing';
  if (delta >= 2) return 'increasing';
  return 'stable';
}

/**
 * Recommend queues by type. Returns sorted by predicted wait (best first).
 */
export function recommendQueues(
  stations: QueueStation[],
  filterType?: 'food' | 'restroom' | 'merchandise' | 'parking'
): QueueRecommendation[] {
  const filtered = filterType
    ? stations.filter(s => s.type === filterType && s.status !== 'closed')
    : stations.filter(s => s.status !== 'closed');

  const recommendations: QueueRecommendation[] = filtered.map(station => {
    const predicted = predictWait(station.waitTime, station.queueLength);
    const trend = getTrend(station.waitTime, predicted);
    return {
      stationId: station.id,
      stationName: station.name,
      currentWait: station.waitTime,
      predictedWait: predicted,
      trend,
      recommended: false,
      reasoning: '',
      icon: station.icon,
    };
  });

  recommendations.sort((a, b) => a.predictedWait - b.predictedWait);

  // Mark best as recommended and generate reasoning
  recommendations.forEach((rec, index) => {
    if (index === 0) {
      rec.recommended = true;
      const savings = recommendations.length > 1
        ? recommendations[recommendations.length - 1].predictedWait - rec.predictedWait
        : 0;
      rec.reasoning = `${rec.stationName} is the best choice — predicted ${rec.predictedWait} min wait, ${savings} min faster than the busiest option`;
    } else {
      const extraWait = rec.predictedWait - recommendations[0].predictedWait;
      if (rec.trend === 'decreasing') {
        rec.reasoning = `${rec.stationName} is clearing up — wait time trending down, currently ${rec.currentWait} min`;
      } else if (rec.trend === 'increasing') {
        rec.reasoning = `${rec.stationName} is getting busier — predicted ${rec.predictedWait} min, ${extraWait} min more than best option`;
      } else {
        rec.reasoning = `${rec.stationName} has stable wait at ${rec.predictedWait} min — ${extraWait} min more than recommended`;
      }
    }
  });

  return recommendations;
}

/**
 * Get single best queue recommendation for a given type.
 */
export function getBestQueue(
  stations: QueueStation[],
  type?: 'food' | 'restroom' | 'merchandise' | 'parking'
): QueueRecommendation | null {
  const recs = recommendQueues(stations, type);
  return recs.length > 0 ? recs[0] : null;
}

/**
 * Get aggregated queue insights (for admin dashboard).
 */
export function getQueueInsights(stations: QueueStation[]) {
  const open = stations.filter(s => s.status !== 'closed');
  const avgWait = open.length > 0
    ? Math.round(open.reduce((sum, s) => sum + s.waitTime, 0) / open.length)
    : 0;
  const totalInQueue = open.reduce((sum, s) => sum + s.queueLength, 0);
  const busiest = [...open].sort((a, b) => b.waitTime - a.waitTime)[0] || null;
  const fastest = [...open].sort((a, b) => a.waitTime - b.waitTime)[0] || null;
  const congested = open.filter(s => s.waitTime > 12).length;

  return { avgWait, totalInQueue, busiest, fastest, congested, totalStations: open.length };
}
