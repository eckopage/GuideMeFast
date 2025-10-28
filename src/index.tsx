/**
 * index.tsx
 * Main export file with backward compatibility
 */

// Export enhanced version (primary)
export {
    EnhancedGuideMeFast,
    TourAIService,
    KeyboardNavigationService,
    defaultTranslations,
    GuideMeFast,
    useEnhancedGuideMeFast,
    useGuideMeFast
} from './enhanced-guidemefast';

// Re-export types
export type {
    TourConfig,
    TourStep,
    TourTranslations,
    AIConfig,
    KeyboardConfig
} from './enhanced-guidemefast';

// Import and re-export vanilla JS version
import GuideMeFastVanilla from './vanilla';
export { GuideMeFastVanilla };

// Import and re-export Material-UI components (conditionally)
export { MaterialUITour, useMaterialUITour, MaterialUITourStep } from './material-ui';

// Default export (backward compatible)
export { GuideMeFast as default } from './enhanced-guidemefast';
