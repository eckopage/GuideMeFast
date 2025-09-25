/**
 * @jest-environment jsdom
 */

const GuideMeFast = require('../vanilla.js');

describe('GuideMeFast Vanilla', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="test-target">Target</div>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('creates instance with config', () => {
        const config = {
            steps: [
                {
                    target: '#test-target',
                    title: 'Test',
                    content: 'Test content',
                },
            ],
        };

        const tour = new GuideMeFast(config);
        expect(tour.config.steps).toHaveLength(1);
    });

    test('starts and stops tour', () => {
        const tour = new GuideMeFast({
            steps: [{ target: '#test-target', title: 'Test', content: 'Test' }],
        });

        tour.start();
        expect(tour.isActive).toBe(true);

        tour.stop();
        expect(tour.isActive).toBe(false);
    });
});