import React from 'react';
import { TourConfig, TourStep } from './index';
interface MaterialUITourProps {
    isOpen: boolean;
    config: TourConfig;
    onClose: () => void;
    variant?: 'dialog' | 'overlay';
}
export declare const MaterialUITour: React.FC<MaterialUITourProps>;
export declare const useMaterialUITour: (config: TourConfig, variant?: "dialog" | "overlay") => {
    startTour: () => void;
    endTour: () => void;
    isOpen: boolean;
    TourComponent: import("react/jsx-runtime").JSX.Element;
};
export declare const MaterialUITourStep: React.FC<{
    step: TourStep;
    onNext?: () => void;
    onPrev?: () => void;
    onSkip?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    stepNumber?: number;
    totalSteps?: number;
}>;
export default MaterialUITour;
//# sourceMappingURL=material-ui.d.ts.map