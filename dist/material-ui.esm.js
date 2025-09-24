import { jsx, jsxs } from 'react/jsx-runtime';
import React from 'react';
import { useTheme, Dialog, Fade, alpha, Box, Chip, IconButton, LinearProgress, DialogContent, Typography, DialogActions, Button, Paper } from '@mui/material';
import { Close, SkipNext, NavigateBefore, Check, NavigateNext } from '@mui/icons-material';
import { GuideMeFast } from './index';

const MaterialUITour = ({ isOpen, config, onClose, variant = 'overlay' }) => {
    const theme = useTheme();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const { steps, showProgress = true, showStepNumbers = true } = config;
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    if (variant === 'overlay') {
        return jsx(GuideMeFast, { isOpen: isOpen, config: config, onClose: onClose });
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
    return (jsxs(Dialog, { open: isOpen, onClose: onClose, maxWidth: "sm", fullWidth: true, PaperProps: {
            sx: {
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                backdropFilter: 'blur(20px)',
            }
        }, TransitionComponent: Fade, transitionDuration: 300, children: [jsxs(Box, { sx: { p: 2, pb: 0 }, children: [jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [showStepNumbers && (jsx(Chip, { label: `${currentStep + 1} of ${steps.length}`, size: "small", color: "primary", variant: "outlined" })), jsx(IconButton, { onClick: onClose, size: "small", sx: { ml: 'auto' }, children: jsx(Close, {}) })] }), showProgress && (jsx(Box, { sx: { mt: 2 }, children: jsx(LinearProgress, { variant: "determinate", value: (currentStep + 1) / steps.length * 100, sx: {
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                }
                            } }) }))] }), jsxs(DialogContent, { sx: { pt: 2 }, children: [currentStepData?.title && (jsx(Typography, { variant: "h6", component: "h2", gutterBottom: true, sx: { fontWeight: 600 }, children: currentStepData.title })), jsx(Typography, { variant: "body1", color: "text.secondary", sx: { lineHeight: 1.6 }, children: currentStepData?.content })] }), jsxs(DialogActions, { sx: { p: 2, pt: 0, gap: 1 }, children: [currentStepData?.showSkip !== false && !isLastStep && (jsx(Button, { onClick: handleSkip, disabled: loading, startIcon: jsx(SkipNext, {}), sx: { mr: 'auto' }, children: "Skip Tour" })), !isFirstStep && currentStepData?.showPrev !== false && (jsx(Button, { onClick: handlePrev, disabled: loading, startIcon: jsx(NavigateBefore, {}), variant: "outlined", children: "Previous" })), currentStepData?.showNext !== false && (jsx(Button, { onClick: handleNext, disabled: loading, variant: "contained", endIcon: isLastStep ? jsx(Check, {}) : jsx(NavigateNext, {}), children: loading ? 'Loading...' : (isLastStep ? 'Finish' : 'Next') }))] })] }));
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
    const TourComponent = React.useMemo(() => (jsx(MaterialUITour, { isOpen: isOpen, config: config, onClose: endTour, variant: variant })), [isOpen, config, endTour, variant]);
    return {
        startTour,
        endTour,
        isOpen,
        TourComponent
    };
};
// Material-UI themed tour step component
const MaterialUITourStep = ({ step, onNext, onPrev, onSkip, isFirst, isLast, stepNumber, totalSteps }) => {
    const theme = useTheme();
    return (jsxs(Paper, { elevation: 8, sx: {
            p: 3,
            maxWidth: 400,
            borderRadius: 2,
            background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.95)
                : theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
        }, children: [stepNumber && totalSteps && (jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [jsx(Chip, { label: `${stepNumber} of ${totalSteps}`, size: "small", color: "primary", variant: "outlined" }), jsx(LinearProgress, { variant: "determinate", value: (stepNumber / totalSteps) * 100, sx: { flex: 1, mx: 2, height: 4, borderRadius: 2 } })] })), step.title && (jsx(Typography, { variant: "h6", component: "h3", gutterBottom: true, sx: { fontWeight: 600 }, children: step.title })), jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 3, lineHeight: 1.6 }, children: step.content }), jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [step.showSkip !== false && !isLast && onSkip && (jsx(Button, { onClick: onSkip, size: "small", children: "Skip Tour" })), jsxs(Box, { sx: { display: 'flex', gap: 1, ml: 'auto' }, children: [!isFirst && step.showPrev !== false && onPrev && (jsx(Button, { onClick: onPrev, variant: "outlined", size: "small", startIcon: jsx(NavigateBefore, {}), children: "Previous" })), step.showNext !== false && onNext && (jsx(Button, { onClick: onNext, variant: "contained", size: "small", endIcon: isLast ? jsx(Check, {}) : jsx(NavigateNext, {}), children: isLast ? 'Finish' : 'Next' }))] })] })] }));
};

export { MaterialUITour, MaterialUITourStep, MaterialUITour as default, useMaterialUITour };
//# sourceMappingURL=material-ui.esm.js.map
