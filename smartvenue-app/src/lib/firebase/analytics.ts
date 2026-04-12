// ─── Firebase Analytics Service ───
// Event tracking for user interactions across SmartVenue.

import { getAnalytics, logEvent, isSupported, type Analytics } from 'firebase/analytics';
import { getFirebaseApp } from './config';

let analyticsInstance: Analytics | null = null;

/**
 * Initialize analytics (client-side only).
 */
async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;

  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported();
  if (!supported) return null;

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    analyticsInstance = getAnalytics(app);
    return analyticsInstance;
  } catch {
    console.warn('Firebase Analytics not available');
    return null;
  }
}

// ─── Event Tracking Functions ───

/**
 * Track route request event.
 */
export async function trackRouteRequest(destination: string, routeType: string) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'route_request', { destination, route_type: routeType });
  }
}

/**
 * Track SOS button usage.
 */
export async function trackSOSUsage(sosType: string) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'sos_triggered', { sos_type: sosType });
  }
}

/**
 * Track crowd alert views.
 */
export async function trackAlertView(alertId: string, severity: string) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'alert_viewed', { alert_id: alertId, severity });
  }
}

/**
 * Track queue joins.
 */
export async function trackQueueJoin(stationId: string, stationName: string, waitTime: number) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'queue_joined', {
      station_id: stationId,
      station_name: stationName,
      wait_time: waitTime,
    });
  }
}

/**
 * Track page navigation.
 */
export async function trackPageView(pageName: string) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'page_view', { page_name: pageName });
  }
}

/**
 * Track gate recommendation clicks.
 */
export async function trackGateSelection(gateName: string, waitTime: number, isRecommended: boolean) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'gate_selected', {
      gate_name: gateName,
      wait_time: waitTime,
      is_recommended: isRecommended,
    });
  }
}

/**
 * Track navigation start.
 */
export async function trackNavigationStart(destination: string, routeType: string, estimatedTime: number) {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, 'navigation_started', {
      destination,
      route_type: routeType,
      estimated_time: estimatedTime,
    });
  }
}
