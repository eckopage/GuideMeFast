import './styles.css';
import GuideMeFast from './vanilla.js';

// Auto-initialize from HTML data attributes
document.addEventListener('DOMContentLoaded', () => {
    const autoInitElements = document.querySelectorAll('[data-guidemefast-auto]');

    autoInitElements.forEach(element => {
        const config = JSON.parse(element.getAttribute('data-guidemefast-config') || '{}');
        const triggerSelector = element.getAttribute('data-guidemefast-trigger');

        if (triggerSelector) {
            const triggerElement = document.querySelector(triggerSelector);
            if (triggerElement) {
                const tour = new GuideMeFast(config);
                triggerElement.addEventListener('click', () => {
                    tour.start();
                });
            }
        }
    });
});

// Export to global scope
window.GuideMeFast = GuideMeFast;

export default GuideMeFast;