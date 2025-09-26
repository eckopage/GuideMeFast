// Test różnych opcji konfiguracyjnych
/**
 * @jest-environment jsdom
 */

describe('GuideMeFast Configuration Tests', () => {
    // Mock prostej klasy GuideMeFast do testów konfiguracji
    class MockGuideMeFast {
        constructor(config = {}) {
            this.config = {
                theme: 'light',
                showProgress: true,
                showStepNumbers: true,
                backdropOpacity: 0.7,
                highlightPadding: 8,
                scrollBehavior: 'smooth',
                zIndex: 9999,
                closeOnEscape: true,
                closeOnClickOutside: false,
                customStyles: {},
                steps: [],
                ...config
            };
            this.currentStep = 0;
            this.isActive = false;
        }

        validateConfig() {
            const errors = [];

            if (!Array.isArray(this.config.steps)) {
                errors.push('steps must be an array');
            }

            if (typeof this.config.theme !== 'string') {
                errors.push('theme must be a string');
            }

            if (!['light', 'dark', 'material'].includes(this.config.theme)) {
                errors.push('theme must be light, dark, or material');
            }

            if (typeof this.config.backdropOpacity !== 'number' ||
                this.config.backdropOpacity < 0 ||
                this.config.backdropOpacity > 1) {
                errors.push('backdropOpacity must be a number between 0 and 1');
            }

            return errors;
        }

        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
        }

        getConfig() {
            return this.config;
        }
    }

    test('domyślna konfiguracja', () => {
        const tour = new MockGuideMeFast();
        const config = tour.getConfig();

        expect(config.theme).toBe('light');
        expect(config.showProgress).toBe(true);
        expect(config.showStepNumbers).toBe(true);
        expect(config.backdropOpacity).toBe(0.7);
        expect(config.highlightPadding).toBe(8);
        expect(config.scrollBehavior).toBe('smooth');
        expect(config.zIndex).toBe(9999);
        expect(config.closeOnEscape).toBe(true);
        expect(config.closeOnClickOutside).toBe(false);
        expect(config.steps).toEqual([]);
    });

    test('nadpisanie domyślnej konfiguracji', () => {
        const customConfig = {
            theme: 'dark',
            backdropOpacity: 0.9,
            closeOnClickOutside: true,
            highlightPadding: 12
        };

        const tour = new MockGuideMeFast(customConfig);
        const config = tour.getConfig();

        expect(config.theme).toBe('dark');
        expect(config.backdropOpacity).toBe(0.9);
        expect(config.closeOnClickOutside).toBe(true);
        expect(config.highlightPadding).toBe(12);

        // Sprawdź że pozostałe wartości pozostały domyślne
        expect(config.showProgress).toBe(true);
        expect(config.zIndex).toBe(9999);
    });

    test('validacja konfiguracji - poprawne wartości', () => {
        const config = {
            theme: 'light',
            backdropOpacity: 0.5,
            steps: [
                { target: '#test', title: 'Test', content: 'Content' }
            ]
        };

        const tour = new MockGuideMeFast(config);
        const errors = tour.validateConfig();

        expect(errors).toEqual([]);
    });

    test('validacja konfiguracji - niepoprawny theme', () => {
        const config = {
            theme: 'invalid-theme',
            steps: []
        };

        const tour = new MockGuideMeFast(config);
        const errors = tour.validateConfig();

        expect(errors).toContain('theme must be light, dark, or material');
    });

    test('validacja konfiguracji - niepoprawny backdropOpacity', () => {
        const config = {
            backdropOpacity: 1.5, // Powyżej 1
            steps: []
        };

        const tour = new MockGuideMeFast(config);
        const errors = tour.validateConfig();

        expect(errors).toContain('backdropOpacity must be a number between 0 and 1');
    });

    test('validacja konfiguracji - brak steps', () => {
        const config = {
            theme: 'light'
            // celowo pomijamy steps, żeby były undefined
        };

        // Stwórz instancję bez domyślnego steps
        const tour = new MockGuideMeFast();
        // Nadpisz config bez steps
        tour.config = { ...tour.config, ...config, steps: undefined };

        const errors = tour.validateConfig();

        expect(errors).toContain('steps must be an array');
    });

    test('aktualizacja konfiguracji', () => {
        const tour = new MockGuideMeFast();

        expect(tour.getConfig().theme).toBe('light');

        tour.updateConfig({ theme: 'dark', backdropOpacity: 0.8 });

        const updatedConfig = tour.getConfig();
        expect(updatedConfig.theme).toBe('dark');
        expect(updatedConfig.backdropOpacity).toBe(0.8);
        expect(updatedConfig.showProgress).toBe(true); // Nie zmienione
    });

    test('konfiguracja custom styles', () => {
        const customStyles = {
            tooltip: { borderRadius: '10px' },
            backdrop: { backgroundColor: 'rgba(0,0,0,0.8)' },
            highlight: { boxShadow: '0 0 20px blue' }
        };

        const tour = new MockGuideMeFast({ customStyles });
        const config = tour.getConfig();

        expect(config.customStyles).toEqual(customStyles);
    });

    test('konfiguracja kroków (steps)', () => {
        const steps = [
            {
                target: '#step1',
                title: 'First Step',
                content: 'This is the first step',
                placement: 'bottom'
            },
            {
                target: '#step2',
                title: 'Second Step',
                content: 'This is the second step',
                placement: 'top',
                showSkip: false
            }
        ];

        const tour = new MockGuideMeFast({ steps });
        const config = tour.getConfig();

        expect(config.steps).toHaveLength(2);
        expect(config.steps[0].target).toBe('#step1');
        expect(config.steps[1].showSkip).toBe(false);
    });

    test('konfiguracja callbacków', () => {
        const onComplete = jest.fn();
        const onSkip = jest.fn();

        const tour = new MockGuideMeFast({
            onComplete,
            onSkip,
            steps: []
        });

        const config = tour.getConfig();

        expect(typeof config.onComplete).toBe('function');
        expect(typeof config.onSkip).toBe('function');
    });

    test('konfiguracja z wszystkimi opcjami', () => {
        const fullConfig = {
            steps: [
                { target: '#test', title: 'Test', content: 'Content' }
            ],
            theme: 'material',
            showProgress: false,
            showStepNumbers: false,
            backdropOpacity: 0.3,
            highlightPadding: 15,
            scrollBehavior: 'auto',
            zIndex: 10000,
            closeOnEscape: false,
            closeOnClickOutside: true,
            customStyles: {
                tooltip: { background: 'linear-gradient(45deg, red, blue)' }
            },
            onComplete: jest.fn(),
            onSkip: jest.fn()
        };

        const tour = new MockGuideMeFast(fullConfig);
        const config = tour.getConfig();

        Object.keys(fullConfig).forEach(key => {
            expect(config[key]).toEqual(fullConfig[key]);
        });
    });

    test('konfiguracja step-specific options', () => {
        const steps = [
            {
                target: '#step1',
                title: 'Step 1',
                content: 'Content 1',
                placement: 'top',
                showPrev: false,
                showNext: true,
                showSkip: true,
                customClass: 'custom-step-1',
                offset: { x: 10, y: 20 }
            }
        ];

        const tour = new MockGuideMeFast({ steps });
        const step = tour.getConfig().steps[0];

        expect(step.placement).toBe('top');
        expect(step.showPrev).toBe(false);
        expect(step.showNext).toBe(true);
        expect(step.showSkip).toBe(true);
        expect(step.customClass).toBe('custom-step-1');
        expect(step.offset).toEqual({ x: 10, y: 20 });
    });
});