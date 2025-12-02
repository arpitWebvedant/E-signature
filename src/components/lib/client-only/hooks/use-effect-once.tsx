import { useEffect } from 'react';

/**
 * Dangerously runs an effect "once" by ignoring the dependencies of a given effect.
 *
 * DANGER: The effect will run twice in concurrent React and development environments.
 */
export const useUnsafeEffectOnce = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};
