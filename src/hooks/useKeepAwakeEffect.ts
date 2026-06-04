import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

/**
 * Custom hook to manage the screen-awake status during duels.
 * 
 * @param shouldKeepAwake Boolean flag to enforce keeping the screen on.
 */
export function useKeepAwakeEffect(shouldKeepAwake: boolean) {
  useEffect(() => {
    if (shouldKeepAwake) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }

    return () => {
      deactivateKeepAwake();
    };
  }, [shouldKeepAwake]);
}
export default useKeepAwakeEffect;
