'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCrmState,
  subscribeCrm,
  type CrmWorkspaceState,
} from '@/lib/crm/store';

export function useCrmStore() {
  const [state, setState] = useState<CrmWorkspaceState>(() =>
    typeof window === 'undefined' ? getCrmState() : getCrmState(),
  );

  useEffect(() => {
    setState(getCrmState());
    return subscribeCrm(() => setState(getCrmState()));
  }, []);

  const refresh = useCallback(() => setState(getCrmState()), []);
  return { state, refresh };
}
