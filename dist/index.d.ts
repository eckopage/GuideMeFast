import React from 'react';
import './styles.css';
export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    showSkip?: boolean;
    showPrev?: boolean;
    showNext?: boolean;
    onNext?: () => void | Promise<void>;
    onPrev?: () => void | Promise<void>;
    onSkip?: () => void | Promise<void>;
    customClass?: string;
    offset?: {
        x: number;
        y: number;
    };
}
export interface TourConfig {
    steps: TourStep[];
    onComplete?: () => void;
    onSkip?: () => void;
    theme?: 'light' | 'dark' | 'material';
    showProgress?: boolean;
    showStepNumbers?: boolean;
    backdropOpacity?: number;
    highlightPadding?: number;
    scrollBehavior?: 'smooth' | 'auto';
    zIndex?: number;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    customStyles?: {
        tooltip?: React.CSSProperties;
        backdrop?: React.CSSProperties;
        highlight?: React.CSSProperties;
    };
}
interface GuideMeFastProps {
    isOpen: boolean;
    config: TourConfig;
    onClose: () => void;
}
export declare const GuideMeFast: React.FC<GuideMeFastProps>;
export declare const useGuideMeFast: (config: TourConfig) => {
    startTour: () => void;
    endTour: () => void;
    isOpen: boolean;
    TourComponent: import("react/jsx-runtime").JSX.Element;
};
export default GuideMeFast;
//# sourceMappingURL=index.d.ts.map