// src/index.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './styles.css';

// Types
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
    offset?: { x: number; y: number };
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

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

// Utility functions
const getElementPosition = (selector: string): Position | null => {
    const element = document.querySelector(selector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
};

const scrollToElement = (selector: string, behavior: 'smooth' | 'auto' = 'smooth') => {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior,
            block: 'center',
            inline: 'nearest'
        });
    }
};

const calculateTooltipPosition = (
    targetPos: Position,
    placement: string,
    tooltipSize: { width: number; height: number },
    offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
    const gap = 12;
    let top = 0;
    let left = 0;

    switch (placement) {
        case 'top':
            top = targetPos.top - tooltipSize.height - gap + offset.y;
            left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
            break;
        case 'bottom':
            top = targetPos.top + targetPos.height + gap + offset.y;
            left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
            break;
        case 'left':
            top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
            left = targetPos.left - tooltipSize.width - gap + offset.x;
            break;
        case 'right':
            top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
            left = targetPos.left + targetPos.width + gap + offset.x;
            break;
        default:
            top = targetPos.top - tooltipSize.height - gap + offset.y;
            left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;
    const scrollLeft = window.pageXOffset;

    if (left < scrollLeft) left = scrollLeft + 10;
    if (left + tooltipSize.width > scrollLeft + viewportWidth) {
        left = scrollLeft + viewportWidth - tooltipSize.width - 10;
    }
    if (top < scrollTop) top = scrollTop + 10;
    if (top + tooltipSize.height > scrollTop + viewportHeight) {
        top = scrollTop + viewportHeight - tooltipSize.height - 10;
    }

    return { top, left };
};

// Main Tour Component
interface GuideMeFastProps {
    isOpen: boolean;
    config: TourConfig;
    onClose: () => void;
}

export const GuideMeFast: React.FC<GuideMeFastProps> = ({ isOpen, config, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetPosition, setTargetPosition] = useState<Position | null>(null);
    const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 });
    const [loading, setLoading] = useState(false);

    const {
        steps,
        onComplete,
        onSkip,
        theme = 'light',
        showProgress = true,
        showStepNumbers = true,
        backdropOpacity = 0.7,
        highlightPadding = 8,
        scrollBehavior = 'smooth',
        zIndex = 9999,
        closeOnEscape = true,
        closeOnClickOutside = false,
        customStyles = {}
    } = config;

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    // Handle keyboard events
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape]);

    // Update position when step changes
    useEffect(() => {
        if (!isOpen || !currentStepData) return;

        const updatePosition = () => {
            const pos = getElementPosition(currentStepData.target);
            setTargetPosition(pos);

            if (pos) {
                scrollToElement(currentStepData.target, scrollBehavior);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(updatePosition, 100);
        return () => clearTimeout(timer);
    }, [currentStep, isOpen, currentStepData?.target, scrollBehavior]);

    const handleNext = useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onNext) {
                await currentStepData.onNext();
            }

            if (isLastStep) {
                onComplete?.();
                onClose();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } finally {
            setLoading(false);
        }
    }, [currentStepData, isLastStep, onComplete, onClose]);

    const handlePrev = useCallback(async () => {
        if (isFirstStep) return;

        setLoading(true);
        try {
            if (currentStepData?.onPrev) {
                await currentStepData.onPrev();
            }
            setCurrentStep(prev => prev - 1);
        } finally {
            setLoading(false);
        }
    }, [currentStepData, isFirstStep]);

    const handleSkip = useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onSkip) {
                await currentStepData.onSkip();
            } else if (onSkip) {
                await onSkip();
            }
        } finally {
            setLoading(false);
            onClose();
        }
    }, [currentStepData, onSkip, onClose]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const tooltipPosition = useMemo(() => {
        if (!targetPosition || !currentStepData) return { top: 0, left: 0 };

        return calculateTooltipPosition(
            targetPosition,
            currentStepData.placement || 'top',
            tooltipSize,
            currentStepData.offset
        );
    }, [targetPosition, currentStepData?.placement, currentStepData?.offset, tooltipSize]);

    const highlightStyle = useMemo(() => {
        if (!targetPosition) return {};

        return {
            position: 'absolute' as const,
            top: targetPosition.top - highlightPadding,
            left: targetPosition.left - highlightPadding,
            width: targetPosition.width + (highlightPadding * 2),
            height: targetPosition.height + (highlightPadding * 2),
            zIndex: zIndex + 1,
            ...customStyles.highlight
        };
    }, [targetPosition, highlightPadding, zIndex, customStyles.highlight]);

    if (!isOpen || !currentStepData) return null;

    return createPortal(
        <div className={`guidemefast-overlay guidemefast-theme-${theme}`}>
            {/* Backdrop */}
            <div
                className="guidemefast-backdrop"
                style={{
                    opacity: backdropOpacity,
                    zIndex,
                    ...customStyles.backdrop
                }}
                onClick={closeOnClickOutside ? handleClose : undefined}
            />

            {/* Highlight */}
            {targetPosition && (
                <div
                    className="guidemefast-highlight"
                    style={highlightStyle}
                />
            )}

            {/* Tooltip */}
            <div
                className={`guidemefast-tooltip ${currentStepData.customClass || ''}`}
                style={{
                    position: 'absolute',
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    zIndex: zIndex + 2,
                    ...customStyles.tooltip
                }}
                ref={(ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        if (rect.width !== tooltipSize.width || rect.height !== tooltipSize.height) {
                            setTooltipSize({ width: rect.width, height: rect.height });
                        }
                    }
                }}
            >
                {/* Close button */}
                <button
                    className="guidemefast-close"
                    onClick={handleClose}
                    aria-label="Close tour"
                >
                    ×
                </button>

                {/* Progress indicator */}
                {showProgress && (
                    <div className="guidemefast-progress">
                        <div
                            className="guidemefast-progress-bar"
                            style={{
                                width: `${((currentStep + 1) / steps.length) * 100}%`
                            }}
                        />
                    </div>
                )}

                {/* Step counter */}
                {showStepNumbers && (
                    <div className="guidemefast-step-counter">
                        {currentStep + 1} of {steps.length}
                    </div>
                )}

                {/* Content */}
                <div className="guidemefast-content">
                    {currentStepData.title && (
                        <h3 className="guidemefast-title">{currentStepData.title}</h3>
                    )}
                    <div className="guidemefast-body">
                        {currentStepData.content}
                    </div>
                </div>

                {/* Navigation */}
                <div className="guidemefast-navigation">
                    {!isFirstStep && currentStepData.showPrev !== false && (
                        <button
                            className="guidemefast-btn guidemefast-btn-secondary"
                            onClick={handlePrev}
                            disabled={loading}
                        >
                            Previous
                        </button>
                    )}

                    {currentStepData.showSkip !== false && !isLastStep && (
                        <button
                            className="guidemefast-btn guidemefast-btn-ghost"
                            onClick={handleSkip}
                            disabled={loading}
                        >
                            Skip Tour
                        </button>
                    )}

                    {currentStepData.showNext !== false && (
                        <button
                            className="guidemefast-btn guidemefast-btn-primary"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : (isLastStep ? 'Finish' : 'Next')}
                        </button>
                    )}
                </div>

                {/* Arrow */}
                <div
                    className={`guidemefast-arrow guidemefast-arrow-${currentStepData.placement || 'top'}`}
                />
            </div>
        </div>,
        document.body
    );
};

// Hook for easier usage
export const useGuideMeFast = (config: TourConfig) => {
    const [isOpen, setIsOpen] = useState(false);

    const startTour = useCallback(() => {
        setIsOpen(true);
    }, []);

    const endTour = useCallback(() => {
        setIsOpen(false);
    }, []);

    const TourComponent = useMemo(() => (
        <GuideMeFast
            isOpen={isOpen}
            config={config}
            onClose={endTour}
        />
    ), [isOpen, config, endTour]);

    return {
        startTour,
        endTour,
        isOpen,
        TourComponent
    };
};

export default GuideMeFast;