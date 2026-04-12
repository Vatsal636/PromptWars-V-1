// GET /api/ai/alerts
// Returns AI-generated real-time alerts from crowd, queue, and phase analysis.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = tick();

    const severityCounts = {
      emergency: state.alerts.filter(a => a.severity === 'emergency').length,
      critical: state.alerts.filter(a => a.severity === 'critical').length,
      warning: state.alerts.filter(a => a.severity === 'warning').length,
      info: state.alerts.filter(a => a.severity === 'info').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        phase: state.phase,
        phaseName: state.phaseName,
        totalAlerts: state.alerts.length,
        severityCounts,
        actionRequired: state.alerts.filter(a => a.actionRequired).length,
        alerts: state.alerts,
      }
    });
  } catch (error) {
    console.error('[API Auth] Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
