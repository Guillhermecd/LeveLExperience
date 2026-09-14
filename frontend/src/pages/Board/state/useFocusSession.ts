import { useState } from 'react';
import type { FocusSession } from '../../../types/board';

/** The picker modal and the active session — the countdown itself is useFocusTimer.ts. */
export function useFocusSession() {
  const [focus, setFocus] = useState<FocusSession | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [pickMinutes, setPickMinutes] = useState('25');

  function openFocusPicker(cardId: string) {
    setPick(cardId);
    setPickMinutes('25');
  }

  function startFocus(cardId: string, sessionId: string, minutes: number) {
    const clamped = Math.min(180, Math.max(1, Math.round(minutes)));
    setFocus({ cardId, sessionId, totalSeconds: clamped * 60, leftSeconds: clamped * 60, running: true });
    setPick(null);
  }

  return {
    focus,
    setFocus,
    pick,
    pickMinutes,
    setPickMinutes,
    openFocusPicker,
    closeFocusPicker: () => setPick(null),
    startFocus,
    toggleFocusRunning: () =>
      setFocus((current) => (current ? { ...current, running: !current.running } : current)),
    endFocus: () => setFocus(null),
  };
}
