'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getWorkspaceState,
  subscribeWorkspace,
  type WorkspaceState,
  computeAnalytics,
} from '@/lib/presentation-builder/store';

export function usePresentationStore() {
  const [state, setState] = useState<WorkspaceState>(() =>
    typeof window === 'undefined' ? getWorkspaceState() : getWorkspaceState(),
  );

  useEffect(() => {
    setState(getWorkspaceState());
    return subscribeWorkspace(() => setState(getWorkspaceState()));
  }, []);

  const refresh = useCallback(() => setState(getWorkspaceState()), []);
  const analytics = computeAnalytics(state);
  const activeDeck = state.activeDeckId
    ? state.decks.find((d) => d.id === state.activeDeckId) || null
    : null;

  return { state, refresh, analytics, activeDeck };
}
