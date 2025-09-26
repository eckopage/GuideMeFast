/**
 * @jest-environment jsdom
 */

describe('GuideMeFast Utility Functions', () => {

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

        // Utrzymuj tooltip w viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipSize.width > viewportWidth - 10) {
            left = viewportWidth - tooltipSize.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipSize.height > viewportHeight - 10) {
            top = viewportHeight - tooltipSize.height - 10;
        }

        return { top, left };
    };

    const getElementPosition = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
    };

    const validateStep = (step) => {
        const errors = [];

        if (!step.target) {
            errors.push('Step must have a target selector');
        }

        if (!step.content && !step.title) {
            errors.push('Step must have either title or content');
        }

        if (step.placement && !['top', 'bottom', 'left', 'right'].includes(step.placement)) {
            errors.push('Invalid placement value');
        }

        return errors;
    };

    beforeEach(() => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768
        });

        // Wyczyść DOM
        document.body.innerHTML = '';
    });

    describe('calculateTooltipPosition', () => {
        const targetPos = { top: 100, left: 200, width: 150, height: 50 };
        const tooltipSize = { width: 300, height: 200 };

        test('pozycjonuje tooltip na górze', () => {
            const position = calculateTooltipPosition(targetPos, 'top', tooltipSize);

            // Oczekiwana pozycja byłaby -112, ale funkcja ustawia minimum 10px
            expect(position.top).toBe(10); // viewport boundary constraint
            expect(position.left).toBe(targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2)); // 200 + 75 - 150 = 125
        });

        test('pozycjonuje tooltip na dole', () => {
            const position = calculateTooltipPosition(targetPos, 'bottom', tooltipSize);

            expect(position.top).toBe(targetPos.top + targetPos.height + 12); // 100 + 50 + 12 = 162
            expect(position.left).toBe(targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2)); // 125
        });

        test('pozycjonuje tooltip po lewej', () => {
            const position = calculateTooltipPosition(targetPos, 'left', tooltipSize);

            expect(position.top).toBe(targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2)); // 100 + 25 - 100 = 25
            // Oczekiwana pozycja byłaby -112, ale funkcja ustawia minimum 10px
            expect(position.left).toBe(10); // viewport boundary constraint
        });

        test('pozycjonuje tooltip po prawej', () => {
            const position = calculateTooltipPosition(targetPos, 'right', tooltipSize);

            expect(position.top).toBe(targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2)); // 25
            expect(position.left).toBe(targetPos.left + targetPos.width + 12); // 200 + 150 + 12 = 362
        });

        test('używa domyślnego pozycjonowania dla nieznanego placement', () => {
            const position = calculateTooltipPosition(targetPos, 'invalid', tooltipSize);

            // Powinno być takie samo jak 'top' - ale z viewport constraint
            expect(position.top).toBe(10); // viewport boundary constraint
            expect(position.left).toBe(targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2));
        });

        test('dodaje offset do pozycji', () => {
            const offset = { x: 20, y: 30 };
            const position = calculateTooltipPosition(targetPos, 'top', tooltipSize, offset);

            // Oczekiwana pozycja byłaby -82, ale funkcja ustawia minimum 10px
            expect(position.top).toBe(10); // viewport boundary constraint
            expect(position.left).toBe(targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x);
        });

        test('utrzymuje tooltip w granicach viewport - lewa strona', () => {
            const farLeftTarget = { top: 100, left: 5, width: 50, height: 50 };
            const position = calculateTooltipPosition(farLeftTarget, 'top', tooltipSize);

            expect(position.left).toBe(10); // Minimum 10px od lewej
        });

        test('utrzymuje tooltip w granicach viewport - prawa strona', () => {
            const farRightTarget = { top: 100, left: 900, width: 50, height: 50 };
            const position = calculateTooltipPosition(farRightTarget, 'top', tooltipSize);

            expect(position.left).toBe(1024 - 300 - 10); // viewport width - tooltip width - 10px
        });

        test('utrzymuje tooltip w granicach viewport - górna część', () => {
            const highTarget = { top: 50, left: 200, width: 50, height: 50 };
            const position = calculateTooltipPosition(highTarget, 'top', tooltipSize);

            expect(position.top).toBe(10); // Minimum 10px od góry
        });

        test('utrzymuje tooltip w granicach viewport - dolna część', () => {
            const lowTarget = { top: 700, left: 200, width: 50, height: 50 };
            const position = calculateTooltipPosition(lowTarget, 'bottom', tooltipSize);

            expect(position.top).toBe(768 - 200 - 10); // viewport height - tooltip height - 10px
        });
    });

    describe('getElementPosition', () => {
        test('zwraca pozycję istniejącego elementu', () => {
            document.body.innerHTML = '<div id="test-element">Test</div>';

            const element = document.querySelector('#test-element');
            // Mock getBoundingClientRect
            element.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 200,
                width: 150,
                height: 50,
                bottom: 150,
                right: 350,
                x: 200,
                y: 100
            }));

            const position = getElementPosition('#test-element');

            expect(position).toEqual({
                top: 100,
                left: 200,
                width: 150,
                height: 50
            });
        });

        test('zwraca null dla nieistniejącego elementu', () => {
            const position = getElementPosition('#non-existent');
            expect(position).toBeNull();
        });

        test('obsługuje różne selektory', () => {
            document.body.innerHTML = `
                <div class="test-class">Class Element</div>
                <div data-testid="test-id">TestID Element</div>
                <button type="button">Button Element</button>
            `;

            // Mock dla wszystkich elementów
            const elements = document.querySelectorAll('div, button');
            elements.forEach(element => {
                element.getBoundingClientRect = jest.fn(() => ({
                    top: 50, left: 100, width: 100, height: 30,
                    bottom: 80, right: 200, x: 100, y: 50
                }));
            });

            expect(getElementPosition('.test-class')).toBeTruthy();
            expect(getElementPosition('[data-testid="test-id"]')).toBeTruthy();
            expect(getElementPosition('button[type="button"]')).toBeTruthy();
        });
    });

    describe('validateStep', () => {
        test('validuje poprawny krok', () => {
            const step = {
                target: '#test-element',
                title: 'Test Title',
                content: 'Test content',
                placement: 'top'
            };

            const errors = validateStep(step);
            expect(errors).toEqual([]);
        });

        test('wykrywa brak target', () => {
            const step = {
                title: 'Test Title',
                content: 'Test content'
            };

            const errors = validateStep(step);
            expect(errors).toContain('Step must have a target selector');
        });

        test('wykrywa brak title i content', () => {
            const step = {
                target: '#test-element'
            };

            const errors = validateStep(step);
            expect(errors).toContain('Step must have either title or content');
        });

        test('akceptuje krok tylko z title', () => {
            const step = {
                target: '#test-element',
                title: 'Test Title'
            };

            const errors = validateStep(step);
            expect(errors).toEqual([]);
        });

        test('akceptuje krok tylko z content', () => {
            const step = {
                target: '#test-element',
                content: 'Test content'
            };

            const errors = validateStep(step);
            expect(errors).toEqual([]);
        });

        test('wykrywa niepoprawny placement', () => {
            const step = {
                target: '#test-element',
                title: 'Test Title',
                placement: 'invalid-placement'
            };

            const errors = validateStep(step);
            expect(errors).toContain('Invalid placement value');
        });

        test('akceptuje poprawne placement values', () => {
            const placements = ['top', 'bottom', 'left', 'right'];

            placements.forEach(placement => {
                const step = {
                    target: '#test-element',
                    title: 'Test Title',
                    placement
                };

                const errors = validateStep(step);
                expect(errors).toEqual([]);
            });
        });

        test('zbiera wiele błędów', () => {
            const step = {
                placement: 'invalid'
                // brak target, title, content
            };

            const errors = validateStep(step);
            expect(errors).toHaveLength(3);
            expect(errors).toContain('Step must have a target selector');
            expect(errors).toContain('Step must have either title or content');
            expect(errors).toContain('Invalid placement value');
        });
    });

    describe('CSS Class Utilities', () => {
        const addThemeClass = (element, theme) => {
            element.className = `guidemefast-overlay guidemefast-theme-${theme}`;
        };

        const removeAllClasses = (element) => {
            element.className = '';
        };

        const hasClass = (element, className) => {
            return element.classList.contains(className);
        };

        test('dodaje klasę theme', () => {
            const element = document.createElement('div');
            addThemeClass(element, 'dark');

            expect(element.className).toBe('guidemefast-overlay guidemefast-theme-dark');
        });

        test('usuwa wszystkie klasy', () => {
            const element = document.createElement('div');
            element.className = 'class1 class2 class3';

            removeAllClasses(element);

            expect(element.className).toBe('');
        });

        test('sprawdza obecność klasy', () => {
            const element = document.createElement('div');
            element.className = 'test-class another-class';

            expect(hasClass(element, 'test-class')).toBe(true);
            expect(hasClass(element, 'another-class')).toBe(true);
            expect(hasClass(element, 'non-existent')).toBe(false);
        });
    });

    describe('Event Utilities', () => {
        const createKeyboardEvent = (key) => {
            return new KeyboardEvent('keydown', { key });
        };

        const createMouseEvent = (type, coordinates = {}) => {
            return new MouseEvent(type, {
                clientX: coordinates.x || 0,
                clientY: coordinates.y || 0,
                bubbles: true
            });
        };

        test('tworzy keyboard event', () => {
            const event = createKeyboardEvent('Escape');

            expect(event.type).toBe('keydown');
            expect(event.key).toBe('Escape');
        });

        test('tworzy mouse event', () => {
            const event = createMouseEvent('click', { x: 100, y: 200 });

            expect(event.type).toBe('click');
            expect(event.clientX).toBe(100);
            expect(event.clientY).toBe(200);
            expect(event.bubbles).toBe(true);
        });

        test('tworzy mouse event bez współrzędnych', () => {
            const event = createMouseEvent('click');

            expect(event.clientX).toBe(0);
            expect(event.clientY).toBe(0);
        });
    });

    describe('Animation Utilities', () => {
        test('requestAnimationFrame jest dostępny', () => {
            expect(typeof requestAnimationFrame).toBe('function');
        });

        test('cancelAnimationFrame jest dostępny', () => {
            expect(typeof cancelAnimationFrame).toBe('function');
        });

        test('symuluje animację frame', (done) => {
            let called = false;

            requestAnimationFrame(() => {
                called = true;
                expect(called).toBe(true);
                done();
            });
        });
    });

    describe('Scroll Utilities', () => {
        const getScrollPosition = () => {
            return {
                x: window.pageXOffset || document.documentElement.scrollLeft,
                y: window.pageYOffset || document.documentElement.scrollTop
            };
        };

        test('pobiera pozycję scroll', () => {
            // Mock scroll position
            Object.defineProperty(window, 'pageXOffset', { value: 100, writable: true });
            Object.defineProperty(window, 'pageYOffset', { value: 200, writable: true });

            const position = getScrollPosition();

            expect(position.x).toBe(100);
            expect(position.y).toBe(200);
        });
    });
});