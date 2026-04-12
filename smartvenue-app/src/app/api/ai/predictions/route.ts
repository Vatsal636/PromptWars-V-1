// GET /api/ai/predictions
// Returns congestion predictions and venue-wide trend analysis.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = tick();

    const predictions = state.predictions;
    const criticalZones = predictions.filter(p => p.warningLevel === 'critical' || p.warningLevel === 'warning');
    const risingZones = predictions.filter(p => p.trend === 'rising' || p.trend === 'critical');
    const avgCurrent = Math.round(predictions.reduce((s, p) => s + p.currentDensity, 0) / predictions.length);
    const avgPredicted = Math.round(predictions.reduce((s, p) => s + p.predictedDensity, 0) / predictions.length);

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        phase: state.phase,
        phaseName: state.phaseName,
        summary: {
          avgCurrentDensity: avgCurrent,
          avgPredictedDensity: avgPredicted,
          overallTrend: avgPredicted > avgCurrent + 3 ? 'rising' : avgPredicted < avgCurrent - 3 ? 'falling' : 'stable',
          criticalCount: criticalZones.length,
          risingCount: risingZones.length,
        },
        zones: predictions,
        criticalWarnings: criticalZones,
      }
    });
  } catch (error) {
    console.error('[API Predictions] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
