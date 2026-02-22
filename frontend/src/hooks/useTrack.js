import { useCallback, useRef } from 'react';
import { track } from '../api/client';

/**
 * useTrack — fire-and-forget feature tracking
 * Debounces rapid repeated calls for the same feature (300 ms).
 * Silently swallows errors so tracking never breaks the UI.
 */
export function useTrack() {
  const timers = useRef({});

  const trackFeature = useCallback((featureName) => {
    // Clear any pending timer for this feature
    if (timers.current[featureName]) {
      clearTimeout(timers.current[featureName]);
    }

    timers.current[featureName] = setTimeout(() => {
      track(featureName).catch(() => {
        // Silently ignore — tracking should never break UX
      });
    }, 300);
  }, []);

  return trackFeature;
}
