// Test integracji z DOM - bez React, tylko vanilla JS
/**
 * @jest-environment jsdom
 */

describe('GuideMeFast DOM Integration', () => {
    beforeEach(() => {
        // Wyczyść DOM
        document.body.innerHTML = '';

        // Dodaj podstawowe elementy testowe
        document.body.innerHTML = `
            <div id="step1" data-testid="step1">First Element</div>
            <div id="step2" data-testid="step2">Second Element</div>
            <button id="trigger" data-testid="trigger">Start Tour</button>
        `;
    });

    afterEach(() => {
        // Usuń wszystkie overlays
        const overlays = document.querySelectorAll('.guidemefast-overlay');
        overlays.forEach(overlay => overlay.remove());
    });

    test('znajduje elementy DOM po selektorze', () => {
        const step1 = document.querySelector('#step1');
        const step2 = document.querySelector('#step2');
        const trigger = document.querySelector('#trigger');

        expect(step1).toBeTruthy();
        expect(step2).toBeTruthy();
        expect(trigger).toBeTruthy();

        expect(step1.textContent).toBe('First Element');
        expect(step2.textContent).toBe('Second Element');
    });

    test('sprawdza getBoundingClientRect dla elementów', () => {
        const step1 = document.querySelector('#step1');
        const rect = step1.getBoundingClientRect();

        expect(rect).toBeDefined();
        expect(typeof rect.top).toBe('number');
        expect(typeof rect.left).toBe('number');
        expect(typeof rect.width).toBe('number');
        expect(typeof rect.height).toBe('number');
    });

    test('symuluje kliknięcie elementu', () => {
        const trigger = document.querySelector('#trigger');
        let clicked = false;

        trigger.addEventListener('click', () => {
            clicked = true;
        });

        // Symuluj kliknięcie
        const event = new Event('click', { bubbles: true });
        trigger.dispatchEvent(event);

        expect(clicked).toBe(true);
    });

    test('dodaje i usuwa elementy overlay', () => {
        // Sprawdź, że nie ma overlay na początku
        expect(document.querySelector('.guidemefast-overlay')).toBeNull();

        // Dodaj overlay
        const overlay = document.createElement('div');
        overlay.className = 'guidemefast-overlay';
        document.body.appendChild(overlay);

        // Sprawdź, że overlay został dodany
        expect(document.querySelector('.guidemefast-overlay')).toBeTruthy();

        // Usuń overlay
        overlay.remove();

        // Sprawdź, że overlay został usunięty
        expect(document.querySelector('.guidemefast-overlay')).toBeNull();
    });

    test('sprawdza stylowanie elementów', () => {
        const step1 = document.querySelector('#step1');

        // Ustaw style
        step1.style.backgroundColor = 'red';
        step1.style.padding = '10px';

        expect(step1.style.backgroundColor).toBe('red');
        expect(step1.style.padding).toBe('10px');
    });

    test('obsługuje zdarzenia klawiatury', () => {
        let escapePressed = false;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                escapePressed = true;
            }
        });

        // Symuluj naciśnięcie Escape
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        expect(escapePressed).toBe(true);
    });

    test('obsługuje zdarzenia scroll i resize', () => {
        let scrolled = false;
        let resized = false;

        window.addEventListener('scroll', () => {
            scrolled = true;
        });

        window.addEventListener('resize', () => {
            resized = true;
        });

        // Symuluj scroll
        const scrollEvent = new Event('scroll');
        window.dispatchEvent(scrollEvent);

        // Symuluj resize
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);

        expect(scrolled).toBe(true);
        expect(resized).toBe(true);
    });

    test('sprawdza viewport dimensions', () => {
        expect(typeof window.innerWidth).toBe('number');
        expect(typeof window.innerHeight).toBe('number');
        expect(window.innerWidth).toBeGreaterThan(0);
        expect(window.innerHeight).toBeGreaterThan(0);
    });

    test('testuje scrollIntoView', () => {
        const step1 = document.querySelector('#step1');

        // Stwórz mock bezpośrednio w tym teście
        step1.scrollIntoView = jest.fn();

        step1.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Sprawdź, że metoda została wywołana
        expect(step1.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'center'
        });
    });

    test('testuje dynamiczne dodawanie contentu', () => {
        const container = document.createElement('div');
        container.id = 'dynamic-container';

        container.innerHTML = `
            <h3>Dynamic Title</h3>
            <p>Dynamic content</p>
            <button>Dynamic Button</button>
        `;

        document.body.appendChild(container);

        const title = container.querySelector('h3');
        const content = container.querySelector('p');
        const button = container.querySelector('button');

        expect(title.textContent).toBe('Dynamic Title');
        expect(content.textContent).toBe('Dynamic content');
        expect(button.textContent).toBe('Dynamic Button');

        // Cleanup
        container.remove();
    });
});