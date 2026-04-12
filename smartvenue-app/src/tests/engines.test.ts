import { describe, it, expect } from 'vitest';
import { recommendRoutes, generateRouteVariants } from '../lib/ai/routeEngine';

describe('AI Route Engine', () => {
  it('handles empty gate arrays / routes safely', () => {
    const result = recommendRoutes([]);
    expect(result).toEqual([]);
  });

  it('handles equal congestion scenarios gracefully', () => {
    const identicalRoutes = [
      { id: 'route1', label: 'Main', timeMinutes: 5, crowdDensity: 50, safetyRisk: 2, steps: [] },
      { id: 'route2', label: 'Alt', timeMinutes: 5, crowdDensity: 50, safetyRisk: 2, steps: [] },
    ];
    
    // Engine should deterministically pick the first optimal one or balance them
    const result = recommendRoutes(identicalRoutes);
    expect(result[0].recommended).toBe(true);
    expect(result[1].recommended).toBe(false); // Only one should be 'overall' recommended
  });

  it('prioritizes low congestion during high crowd scenarios', () => {
    const routes = [
      { id: 'R1', label: 'Fast but Crowded', timeMinutes: 2, crowdDensity: 90, safetyRisk: 1, steps: [] },
      { id: 'R2', label: 'Slow but Empty', timeMinutes: 8, crowdDensity: 10, safetyRisk: 1, steps: [] },
    ];

    const result = recommendRoutes(routes);
    const best = result.find(r => r.recommended);
    // Score R1: 2*0.5 + 9*0.4 + 1*0.1 = 1 + 3.6 + 0.1 = 4.7
    // Score R2: 8*0.5 + 1*0.4 + 1*0.1 = 4 + 0.4 + 0.1 = 4.5
    // R2 should be recommended due to extreme crowd penalty on R1
    expect(best?.routeId).toBe('R2');
  });

  it('generates distinct variants properly', () => {
    const variants = generateRouteVariants('Gate B', { 'z1': 60, 'z2': 80 });
    expect(variants.length).toBe(3);
    expect(variants[0].id).toBe('fast');
    expect(variants[1].id).toBe('quiet');
    expect(variants[2].id).toBe('safe');

    // Quiet route should have lower density computationally
    expect(variants[1].crowdDensity).toBeLessThan(variants[0].crowdDensity);
  });
});
