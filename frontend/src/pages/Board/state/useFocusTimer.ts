import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FocusSession } from '../../../types/board';

/**
 * Owns the 1s countdown interval for the active focus session. Extracted so
 * useBoardState.ts doesn't carry timer plumbing alongside card/goal state.
 */
export function useFocusTimer(
  focus: FocusSession | null,
  setFocus: Dispatch<SetStateAction<FocusSession | null>>,
  onComplete: (cardId: string, plannedMinutes: number) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!focus?.running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setFocus((current) => {
        if (!current || !current.running) return current;
        if (current.leftSeconds <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete(current.cardId, Math.round(current.totalSeconds / 60));
          return null;
        }
        return { ...current, leftSeconds: current.leftSeconds - 1 };
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [focus?.running, setFocus, onComplete]);
}
