'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var reactDom = require('react-dom');

// Utility functions
const getElementPosition = (selector) => {
    const element = document.querySelector(selector);
    if (!element)
        return null;
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
const scrollToElement = (selector, behavior = 'smooth') => {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior,
            block: 'center',
            inline: 'nearest'
        });
    }
};
const calculateTooltipPosition = (targetPos, placement, tooltipSize, offset = { x: 0, y: 0 }) => {
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
    if (left < scrollLeft)
        left = scrollLeft + 10;
    if (left + tooltipSize.width > scrollLeft + viewportWidth) {
        left = scrollLeft + viewportWidth - tooltipSize.width - 10;
    }
    if (top < scrollTop)
        top = scrollTop + 10;
    if (top + tooltipSize.height > scrollTop + viewportHeight) {
        top = scrollTop + viewportHeight - tooltipSize.height - 10;
    }
    return { top, left };
};
const GuideMeFast = ({ isOpen, config, onClose }) => {
    const [currentStep, setCurrentStep] = react.useState(0);
    const [targetPosition, setTargetPosition] = react.useState(null);
    const [tooltipSize, setTooltipSize] = react.useState({ width: 320, height: 200 });
    const [loading, setLoading] = react.useState(false);
    const { steps, onComplete, onSkip, theme = 'light', showProgress = true, showStepNumbers = true, backdropOpacity = 0.7, highlightPadding = 8, scrollBehavior = 'smooth', zIndex = 9999, closeOnEscape = true, closeOnClickOutside = false, customStyles = {} } = config;
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    // Handle keyboard events
    react.useEffect(() => {
        if (!isOpen || !closeOnEscape)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape]);
    // Update position when step changes
    react.useEffect(() => {
        if (!isOpen || !currentStepData)
            return;
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
    const handleNext = react.useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onNext) {
                await currentStepData.onNext();
            }
            if (isLastStep) {
                onComplete?.();
                onClose();
            }
            else {
                setCurrentStep(prev => prev + 1);
            }
        }
        finally {
            setLoading(false);
        }
    }, [currentStepData, isLastStep, onComplete, onClose]);
    const handlePrev = react.useCallback(async () => {
        if (isFirstStep)
            return;
        setLoading(true);
        try {
            if (currentStepData?.onPrev) {
                await currentStepData.onPrev();
            }
            setCurrentStep(prev => prev - 1);
        }
        finally {
            setLoading(false);
        }
    }, [currentStepData, isFirstStep]);
    const handleSkip = react.useCallback(async () => {
        setLoading(true);
        try {
            if (currentStepData?.onSkip) {
                await currentStepData.onSkip();
            }
            else if (onSkip) {
                await onSkip();
            }
        }
        finally {
            setLoading(false);
            onClose();
        }
    }, [currentStepData, onSkip, onClose]);
    const handleClose = react.useCallback(() => {
        onClose();
    }, [onClose]);
    const tooltipPosition = react.useMemo(() => {
        if (!targetPosition || !currentStepData)
            return { top: 0, left: 0 };
        return calculateTooltipPosition(targetPosition, currentStepData.placement || 'top', tooltipSize, currentStepData.offset);
    }, [targetPosition, currentStepData?.placement, currentStepData?.offset, tooltipSize]);
    const highlightStyle = react.useMemo(() => {
        if (!targetPosition)
            return {};
        return {
            position: 'absolute',
            top: targetPosition.top - highlightPadding,
            left: targetPosition.left - highlightPadding,
            width: targetPosition.width + (highlightPadding * 2),
            height: targetPosition.height + (highlightPadding * 2),
            zIndex: zIndex + 1,
            ...customStyles.highlight
        };
    }, [targetPosition, highlightPadding, zIndex, customStyles.highlight]);
    if (!isOpen || !currentStepData)
        return null;
    return reactDom.createPortal(jsxRuntime.jsxs("div", { className: `guidemefast-overlay guidemefast-theme-${theme}`, children: [jsxRuntime.jsx("div", { className: "guidemefast-backdrop", style: {
                    opacity: backdropOpacity,
                    zIndex,
                    ...customStyles.backdrop
                }, onClick: closeOnClickOutside ? handleClose : undefined }), targetPosition && (jsxRuntime.jsx("div", { className: "guidemefast-highlight", style: highlightStyle })), jsxRuntime.jsxs("div", { className: `guidemefast-tooltip ${currentStepData.customClass || ''}`, style: {
                    position: 'absolute',
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    zIndex: zIndex + 2,
                    ...customStyles.tooltip
                }, ref: (ref) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        if (rect.width !== tooltipSize.width || rect.height !== tooltipSize.height) {
                            setTooltipSize({ width: rect.width, height: rect.height });
                        }
                    }
                }, children: [jsxRuntime.jsx("button", { className: "guidemefast-close", onClick: handleClose, "aria-label": "Close tour", children: "\u00D7" }), showProgress && (jsxRuntime.jsx("div", { className: "guidemefast-progress", children: jsxRuntime.jsx("div", { className: "guidemefast-progress-bar", style: {
                                width: `${((currentStep + 1) / steps.length) * 100}%`
                            } }) })), showStepNumbers && (jsxRuntime.jsxs("div", { className: "guidemefast-step-counter", children: [currentStep + 1, " of ", steps.length] })), jsxRuntime.jsxs("div", { className: "guidemefast-content", children: [currentStepData.title && (jsxRuntime.jsx("h3", { className: "guidemefast-title", children: currentStepData.title })), jsxRuntime.jsx("div", { className: "guidemefast-body", children: currentStepData.content })] }), jsxRuntime.jsxs("div", { className: "guidemefast-navigation", children: [!isFirstStep && currentStepData.showPrev !== false && (jsxRuntime.jsx("button", { className: "guidemefast-btn guidemefast-btn-secondary", onClick: handlePrev, disabled: loading, children: "Previous" })), currentStepData.showSkip !== false && !isLastStep && (jsxRuntime.jsx("button", { className: "guidemefast-btn guidemefast-btn-ghost", onClick: handleSkip, disabled: loading, children: "Skip Tour" })), currentStepData.showNext !== false && (jsxRuntime.jsx("button", { className: "guidemefast-btn guidemefast-btn-primary", onClick: handleNext, disabled: loading, children: loading ? 'Loading...' : (isLastStep ? 'Finish' : 'Next') }))] }), jsxRuntime.jsx("div", { className: `guidemefast-arrow guidemefast-arrow-${currentStepData.placement || 'top'}` })] })] }), document.body);
};
// Hook for easier usage
const useGuideMeFast = (config) => {
    const [isOpen, setIsOpen] = react.useState(false);
    const startTour = react.useCallback(() => {
        setIsOpen(true);
    }, []);
    const endTour = react.useCallback(() => {
        setIsOpen(false);
    }, []);
    const TourComponent = react.useMemo(() => (jsxRuntime.jsx(GuideMeFast, { isOpen: isOpen, config: config, onClose: endTour })), [isOpen, config, endTour]);
    return {
        startTour,
        endTour,
        isOpen,
        TourComponent
    };
};

exports.GuideMeFast = GuideMeFast;
exports.default = GuideMeFast;
exports.useGuideMeFast = useGuideMeFast;
//# sourceMappingURL=index.js.map
