import { useUIStore } from './useUIStore';
import { useConfigStore } from './useConfigStore';

// Facade for backward compatibility during refactoring
export const useWorkbenchStore = (selector?: (state: any) => any) => {
  const uiState = useUIStore();
  const configState = useConfigStore();
  
  const combinedState = {
    ...uiState,
    ...configState
  };

  if (selector) {
    return selector(combinedState);
  }

  return combinedState;
};

