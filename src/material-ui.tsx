import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    LinearProgress,
    Box,
    IconButton,
    Chip,
    Paper,
    Fade,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    SkipNext as SkipIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { GuideMeFast, TourConfig, TourStep } from './index';

interface MaterialUITourProps {
    isOpen: boolean;
    config: TourConfig;
    onClose: () => void;
    variant?: 'dialog' | 'overlay';
}

export const MaterialUITour: React.FC<MaterialUITourProps> = ({
      isOpen,
      config,
      onClose,
      variant = 'overlay'
}) => {
    const theme = useTheme();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const { steps, showProgress = true, showStepNumbers = true } = config;
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    // For overlay variant, use the fixed GuideMeFast component
    if (variant === 'overlay') {
        return <GuideMeFast isOpen={isOpen} config={config} onClose={onClose} />;
    }

    // Reset step when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (currentStepData?.onNext) {
                await currentStepData.onNext();
            }

            if (isLastStep) {
                config.onComplete?.();
                onClose();
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = async () => {
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
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            if (currentStepData?.onSkip) {
                await currentStepData.onSkip();
            } else if (config.onSkip) {
                await config.onSkip();
            }
        } finally {
            setLoading(false);
            onClose();
        }
    };

    // Scroll to element when step changes
    React.useEffect(() => {
        if (isOpen && currentStepData?.target) {
            const timer = setTimeout(() => {
                const element = document.querySelector(currentStepData.target);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [currentStep, isOpen, currentStepData?.target]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.paper, 0.95)
                        : theme.palette.background.paper,
                    backdropFilter: 'blur(20px)',
                }
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
            sx={{
                '& .MuiDialog-container': {
                    zIndex: 10000,
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {showStepNumbers && (
                        <Chip
                            label={`${currentStep + 1} of ${steps.length}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ ml: 'auto' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {showProgress && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(currentStep + 1) / steps.length * 100}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    transition: 'transform 0.3s ease',
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* Content */}
            <DialogContent sx={{ pt: 2 }}>
                <Fade in={true} key={currentStep} timeout={300}>
                    <Box>
                        {currentStepData?.title && (
                            <Typography
                                variant="h6"
                                component="h2"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                            >
                                {currentStepData.title}
                            </Typography>
                        )}
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ lineHeight: 1.6 }}
                        >
                            {currentStepData?.content}
                        </Typography>
                    </Box>
                </Fade>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
                {currentStepData?.showSkip !== false && !isLastStep && (
                    <Button
                        onClick={handleSkip}
                        disabled={loading}
                        startIcon={<SkipIcon />}
                        sx={{ mr: 'auto' }}
                    >
                        Skip Tour
                    </Button>
                )}

                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    {!isFirstStep && currentStepData?.showPrev !== false && (
                        <Button
                            onClick={handlePrev}
                            disabled={loading}
                            startIcon={<PrevIcon />}
                            variant="outlined"
                        >
                            Previous
                        </Button>
                    )}

                    {currentStepData?.showNext !== false && (
                        <Button
                            onClick={handleNext}
                            disabled={loading}
                            variant="contained"
                            endIcon={isLastStep ? <CheckIcon /> : <NextIcon />}
                        >
                            {loading ? 'Loading...' : (isLastStep ? 'Finish' : 'Next')}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

// Hook for Material-UI integration
export const useMaterialUITour = (config: TourConfig, variant: 'dialog' | 'overlay' = 'overlay') => {
    const [isOpen, setIsOpen] = React.useState(false);

    const startTour = React.useCallback(() => {
        setIsOpen(true);
    }, []);

    const endTour = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    const TourComponent = React.useMemo(() => (
        <MaterialUITour
            isOpen={isOpen}
            config={config}
            onClose={endTour}
            variant={variant}
        />
    ), [isOpen, config, endTour, variant]);

    return {
        startTour,
        endTour,
        isOpen,
        TourComponent
    };
};

// Material-UI themed tour step component
export const MaterialUITourStep: React.FC<{
    step: TourStep;
    onNext?: () => void;
    onPrev?: () => void;
    onSkip?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    stepNumber?: number;
    totalSteps?: number;
}> = ({
          step,
          onNext,
          onPrev,
          onSkip,
          isFirst,
          isLast,
          stepNumber,
          totalSteps
      }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={8}
            sx={{
                p: 3,
                maxWidth: 400,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Header */}
            {stepNumber && totalSteps && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                        label={`${stepNumber} of ${totalSteps}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    <LinearProgress
                        variant="determinate"
                        value={(stepNumber / totalSteps) * 100}
                        sx={{ flex: 1, mx: 2, height: 4, borderRadius: 2 }}
                    />
                </Box>
            )}

            {/* Content */}
            {step.title && (
                <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                >
                    {step.title}
                </Typography>
            )}

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
            >
                {step.content}
            </Typography>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {step.showSkip !== false && !isLast && onSkip && (
                    <Button onClick={onSkip} size="small">
                        Skip Tour
                    </Button>
                )}

                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                    {!isFirst && step.showPrev !== false && onPrev && (
                        <Button
                            onClick={onPrev}
                            variant="outlined"
                            size="small"
                            startIcon={<PrevIcon />}
                        >
                            Previous
                        </Button>
                    )}

                    {step.showNext !== false && onNext && (
                        <Button
                            onClick={onNext}
                            variant="contained"
                            size="small"
                            endIcon={isLast ? <CheckIcon /> : <NextIcon />}
                        >
                            {isLast ? 'Finish' : 'Next'}
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default MaterialUITour;