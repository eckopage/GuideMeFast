'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var material = require('@mui/material');
var iconsMaterial = require('@mui/icons-material');
var index = require('./index');

const MaterialUITour = ({ isOpen, config, onClose, variant = 'overlay' }) => {
    const theme = material.useTheme();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const { steps, showProgress = true, showStepNumbers = true } = config;
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    if (variant === 'overlay') {
        return jsxRuntime.jsx(index.GuideMeFast, { isOpen: isOpen, config: config, onClose: onClose });
    }
    const handleNext = async () => {
        setLoading(true);
        try {
            if (currentStepData?.onNext) {
                await currentStepData.onNext();
            }
            if (isLastStep) {
                config.onComplete?.();
                onClose();
            }
            else {
                setCurrentStep(prev => prev + 1);
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handlePrev = async () => {
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
    };
    const handleSkip = async () => {
        setLoading(true);
        try {
            if (currentStepData?.onSkip) {
                await currentStepData.onSkip();
            }
            else if (config.onSkip) {
                await config.onSkip();
            }
        }
        finally {
            setLoading(false);
            onClose();
        }
    };
    return (jsxRuntime.jsxs(material.Dialog, { open: isOpen, onClose: onClose, maxWidth: "sm", fullWidth: true, PaperProps: {
            sx: {
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                    ? material.alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                backdropFilter: 'blur(20px)',
            }
        }, TransitionComponent: material.Fade, transitionDuration: 300, children: [jsxRuntime.jsxs(material.Box, { sx: { p: 2, pb: 0 }, children: [jsxRuntime.jsxs(material.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [showStepNumbers && (jsxRuntime.jsx(material.Chip, { label: `${currentStep + 1} of ${steps.length}`, size: "small", color: "primary", variant: "outlined" })), jsxRuntime.jsx(material.IconButton, { onClick: onClose, size: "small", sx: { ml: 'auto' }, children: jsxRuntime.jsx(iconsMaterial.Close, {}) })] }), showProgress && (jsxRuntime.jsx(material.Box, { sx: { mt: 2 }, children: jsxRuntime.jsx(material.LinearProgress, { variant: "determinate", value: (currentStep + 1) / steps.length * 100, sx: {
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: material.alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                }
                            } }) }))] }), jsxRuntime.jsxs(material.DialogContent, { sx: { pt: 2 }, children: [currentStepData?.title && (jsxRuntime.jsx(material.Typography, { variant: "h6", component: "h2", gutterBottom: true, sx: { fontWeight: 600 }, children: currentStepData.title })), jsxRuntime.jsx(material.Typography, { variant: "body1", color: "text.secondary", sx: { lineHeight: 1.6 }, children: currentStepData?.content })] }), jsxRuntime.jsxs(material.DialogActions, { sx: { p: 2, pt: 0, gap: 1 }, children: [currentStepData?.showSkip !== false && !isLastStep && (jsxRuntime.jsx(material.Button, { onClick: handleSkip, disabled: loading, startIcon: jsxRuntime.jsx(iconsMaterial.SkipNext, {}), sx: { mr: 'auto' }, children: "Skip Tour" })), !isFirstStep && currentStepData?.showPrev !== false && (jsxRuntime.jsx(material.Button, { onClick: handlePrev, disabled: loading, startIcon: jsxRuntime.jsx(iconsMaterial.NavigateBefore, {}), variant: "outlined", children: "Previous" })), currentStepData?.showNext !== false && (jsxRuntime.jsx(material.Button, { onClick: handleNext, disabled: loading, variant: "contained", endIcon: isLastStep ? jsxRuntime.jsx(iconsMaterial.Check, {}) : jsxRuntime.jsx(iconsMaterial.NavigateNext, {}), children: loading ? 'Loading...' : (isLastStep ? 'Finish' : 'Next') }))] })] }));
};
// Hook for Material-UI integration
const useMaterialUITour = (config, variant = 'overlay') => {
    const [isOpen, setIsOpen] = React.useState(false);
    const startTour = React.useCallback(() => {
        setIsOpen(true);
    }, []);
    const endTour = React.useCallback(() => {
        setIsOpen(false);
    }, []);
    const TourComponent = React.useMemo(() => (jsxRuntime.jsx(MaterialUITour, { isOpen: isOpen, config: config, onClose: endTour, variant: variant })), [isOpen, config, endTour, variant]);
    return {
        startTour,
        endTour,
        isOpen,
        TourComponent
    };
};
// Material-UI themed tour step component
const MaterialUITourStep = ({ step, onNext, onPrev, onSkip, isFirst, isLast, stepNumber, totalSteps }) => {
    const theme = material.useTheme();
    return (jsxRuntime.jsxs(material.Paper, { elevation: 8, sx: {
            p: 3,
            maxWidth: 400,
            borderRadius: 2,
            background: theme.palette.mode === 'dark'
                ? material.alpha(theme.palette.background.paper, 0.95)
                : theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
        }, children: [stepNumber && totalSteps && (jsxRuntime.jsxs(material.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [jsxRuntime.jsx(material.Chip, { label: `${stepNumber} of ${totalSteps}`, size: "small", color: "primary", variant: "outlined" }), jsxRuntime.jsx(material.LinearProgress, { variant: "determinate", value: (stepNumber / totalSteps) * 100, sx: { flex: 1, mx: 2, height: 4, borderRadius: 2 } })] })), step.title && (jsxRuntime.jsx(material.Typography, { variant: "h6", component: "h3", gutterBottom: true, sx: { fontWeight: 600 }, children: step.title })), jsxRuntime.jsx(material.Typography, { variant: "body1", color: "text.secondary", sx: { mb: 3, lineHeight: 1.6 }, children: step.content }), jsxRuntime.jsxs(material.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [step.showSkip !== false && !isLast && onSkip && (jsxRuntime.jsx(material.Button, { onClick: onSkip, size: "small", children: "Skip Tour" })), jsxRuntime.jsxs(material.Box, { sx: { display: 'flex', gap: 1, ml: 'auto' }, children: [!isFirst && step.showPrev !== false && onPrev && (jsxRuntime.jsx(material.Button, { onClick: onPrev, variant: "outlined", size: "small", startIcon: jsxRuntime.jsx(iconsMaterial.NavigateBefore, {}), children: "Previous" })), step.showNext !== false && onNext && (jsxRuntime.jsx(material.Button, { onClick: onNext, variant: "contained", size: "small", endIcon: isLast ? jsxRuntime.jsx(iconsMaterial.Check, {}) : jsxRuntime.jsx(iconsMaterial.NavigateNext, {}), children: isLast ? 'Finish' : 'Next' }))] })] })] }));
};

exports.MaterialUITour = MaterialUITour;
exports.MaterialUITourStep = MaterialUITourStep;
exports.default = MaterialUITour;
exports.useMaterialUITour = useMaterialUITour;
//# sourceMappingURL=material-ui.js.map
