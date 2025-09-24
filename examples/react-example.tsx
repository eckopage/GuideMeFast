import React, { useState } from 'react';
import { useGuideMeFast, TourConfig } from 'guidemefast';
import { useMaterialUITour } from '../dist/material-ui';
import { Button, Card, CardContent, Typography, Box, AppBar, Toolbar } from '@mui/material';
import 'guidemefast/dist/index.css';

// Basic Example
export const BasicExample: React.FC = () => {
    const basicTourConfig: TourConfig = {
        steps: [
            {
                target: '#welcome-card',
                title: 'Welcome to GuideMeFast! 🎉',
                content: 'This is your first step in the tour. GuideMeFast makes it easy to create beautiful guided tours.',
                placement: 'bottom'
            },
            {
                target: '#feature-button',
                title: 'Interactive Features',
                content: 'Click on interactive elements to explore different features of your application.',
                placement: 'top'
            },
            {
                target: '#settings-menu',
                title: 'Settings & Configuration',
                content: 'Access all your settings and preferences from this menu. You can customize everything here.',
                placement: 'left'
            }
        ],
        theme: 'light',
        showProgress: true,
        onComplete: () => {
            alert('Tour completed! 🎉');
        },
        onSkip: () => {
            console.log('Tour skipped');
        }
    };

    const { startTour, TourComponent } = useGuideMeFast(basicTourConfig);

    return (
        <Box sx={{ p: 3 }}>
            <Card id="welcome-card" sx={{ mb: 3, maxWidth: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Welcome! 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This is a sample card component that will be highlighted during the tour.
                    </Typography>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <Button
                    id="feature-button"
                    variant="contained"
                    color="primary"
                    sx={{ mr: 2 }}
                >
                    Interactive Feature
                </Button>

                <Button
                    variant="outlined"
                    onClick={startTour}
                >
                    Start Basic Tour
                </Button>
            </Box>

            <Card id="settings-menu" sx={{ maxWidth: 300 }}>
                <CardContent>
                    <Typography variant="h6">Settings</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configuration options and preferences
                    </Typography>
                </CardContent>
            </Card>

            {TourComponent}
        </Box>
    );
};

// Advanced Example with Async Operations
export const AdvancedExample: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const advancedTourConfig: TourConfig = {
        steps: [
            {
                target: '#async-feature',
                title: 'Async Data Loading',
                content: 'This step demonstrates how to handle async operations during your tour.',
                placement: 'right',
                onNext: async () => {
                    setLoading(true);
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setUserData({ name: 'John Doe', notifications: 5 });
                    setLoading(false);
                }
            },
            {
                target: '#user-profile',
                title: 'Dynamic Content',
                content: userData
                    ? `Welcome back, ${userData.name}! You have ${userData.notifications} new notifications.`
                    : 'Loading user data...',
                placement: 'bottom'
            },
            {
                target: '#dashboard-actions',
                title: 'Quick Actions',
                content: 'These buttons provide quick access to common tasks. Try clicking them!',
                placement: 'top',
                customClass: 'custom-tour-step'
            }
        ],
        theme: 'dark',
        backdropOpacity: 0.8,
        showStepNumbers: true,
        scrollBehavior: 'smooth',
        customStyles: {
            tooltip: {
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            },
            highlight: {
                boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.3)'
            }
        }
    };

    const { startTour, TourComponent } = useGuideMeFast(advancedTourConfig);

    return (
        <Box sx={{ p: 3, bgcolor: 'grey.100', minHeight: '100vh' }}>
            <AppBar position="static" sx={{ mb: 3 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Advanced Tour Example
                    </Typography>
                    <Button color="inherit" onClick={startTour}>
                        Start Advanced Tour
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Card id="async-feature" sx={{ minWidth: 300 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Async Feature
                        </Typography>
                        <Typography variant="body2">
                            {loading ? 'Loading data...' : 'Click next to load user data asynchronously.'}
                        </Typography>
                    </CardContent>
                </Card>

                <Card id="user-profile" sx={{ minWidth: 300 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            User Profile
                        </Typography>
                        {userData ? (
                            <Box>
                                <Typography variant="body1">Name: {userData.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Notifications: {userData.notifications}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No data loaded yet
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Card id="dashboard-actions" sx={{ minWidth: 300 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button size="small" variant="contained">Create</Button>
                            <Button size="small" variant="outlined">Edit</Button>
                            <Button size="small" variant="text">Delete</Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {TourComponent}
        </Box>
    );
};

// Material-UI Dialog Example
export const MaterialUIExample: React.FC = () => {
    const materialTourConfig: TourConfig = {
        steps: [
            {
                target: '#material-feature-1',
                title: 'Material Design Tour',
                content: 'This tour uses native Material-UI components for a consistent design experience.',
            },
            {
                target: '#material-feature-2',
                title: 'Seamless Integration',
                content: 'The tour automatically adapts to your Material-UI theme and follows Material Design principles.',
            },
            {
                target: '#material-feature-3',
                title: 'Responsive Design',
                content: 'Everything works perfectly on mobile devices with touch-friendly controls.',
            }
        ],
        theme: 'material'
    };

    const { startTour, TourComponent } = useMaterialUITour(materialTourConfig, 'dialog');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Material-UI Integration Example
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <Card id="material-feature-1">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Feature One
                        </Typography>
                        <Typography variant="body2">
                            This card demonstrates Material-UI integration with GuideMeFast.
                        </Typography>
                    </CardContent>
                </Card>

                <Card id="material-feature-2">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Feature Two
                        </Typography>
                        <Typography variant="body2">
                            Notice how the tour respects your Material-UI theme.
                        </Typography>
                    </CardContent>
                </Card>

                <Card id="material-feature-3">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Feature Three
                        </Typography>
                        <Typography variant="body2">
                            Responsive design ensures great user experience on all devices.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={startTour}>
                    Start Material-UI Tour
                </Button>
            </Box>

            {TourComponent}
        </Box>
    );
};

// Multi-theme Example
export const MultiThemeExample: React.FC = () => {
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'material'>('light');

    const createTourConfig = (theme: 'light' | 'dark' | 'material'): TourConfig => ({
        steps: [
            {
                target: '#theme-selector',
                title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Demo`,
                content: `This is how the tour looks with the ${theme} theme. You can easily switch between themes.`,
                placement: 'bottom'
            },
            {
                target: '#theme-preview',
                title: 'Theme Preview',
                content: 'Each theme has its own unique styling while maintaining the same functionality.',
                placement: 'top'
            }
        ],
        theme,
        showProgress: true,
        showStepNumbers: true
    });

    const { startTour, TourComponent } = useGuideMeFast(createTourConfig(currentTheme));

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Multi-Theme Example
            </Typography>

            <Card id="theme-selector" sx={{ mb: 3, maxWidth: 600 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Theme Selector
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                            variant={currentTheme === 'light' ? 'contained' : 'outlined'}
                            onClick={() => setCurrentTheme('light')}
                        >
                            Light
                        </Button>
                        <Button
                            variant={currentTheme === 'dark' ? 'contained' : 'outlined'}
                            onClick={() => setCurrentTheme('dark')}
                        >
                            Dark
                        </Button>
                        <Button
                            variant={currentTheme === 'material' ? 'contained' : 'outlined'}
                            onClick={() => setCurrentTheme('material')}
                        >
                            Material
                        </Button>
                    </Box>
                    <Button variant="contained" color="primary" onClick={startTour}>
                        Start {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Tour
                    </Button>
                </CardContent>
            </Card>

            <Card id="theme-preview" sx={{ maxWidth: 600 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Current Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This preview shows how the selected theme affects the tour appearance.
                    </Typography>
                </CardContent>
            </Card>

            {TourComponent}
        </Box>
    );
};

// Complete App Example
export const CompleteApp: React.FC = () => {
    const [activeExample, setActiveExample] = useState<'basic' | 'advanced' | 'material' | 'themes'>('basic');

    const examples = {
        basic: <BasicExample />,
        advanced: <AdvancedExample />,
        material: <MaterialUIExample />,
        themes: <MultiThemeExample />
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        GuideMeFast Examples
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            variant={activeExample === 'basic' ? 'outlined' : 'text'}
                            onClick={() => setActiveExample('basic')}
                        >
                            Basic
                        </Button>
                        <Button
                            color="inherit"
                            variant={activeExample === 'advanced' ? 'outlined' : 'text'}
                            onClick={() => setActiveExample('advanced')}
                        >
                            Advanced
                        </Button>
                        <Button
                            color="inherit"
                            variant={activeExample === 'material' ? 'outlined' : 'text'}
                            onClick={() => setActiveExample('material')}
                        >
                            Material-UI
                        </Button>
                        <Button
                            color="inherit"
                            variant={activeExample === 'themes' ? 'outlined' : 'text'}
                            onClick={() => setActiveExample('themes')}
                        >
                            Themes
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {examples[activeExample]}
        </Box>
    );
};

export default CompleteApp;