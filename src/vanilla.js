/**
 * GuideMeFast - Vanilla JavaScript Implementation
 * Beautiful, lightweight library for creating interactive guided tours
 */

class GuideMeFast {
    constructor(config) {
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
            ...config
        };

        this.currentStep = 0;
        this.isActive = false;
        this.elements = {};
        this.loading = false;
        this.rafId = null;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.updatePositions = this.updatePositions.bind(this);
    }

    // Public API
    start() {
        if (this.isActive || !this.config.steps?.length) return;

        this.isActive = true;
        this.currentStep = 0;
        this.createElements();
        this.updateStep();
        this.attachEventListeners();
    }

    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        this.removeEventListeners();
        this.removeElements();
        this.currentStep = 0;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    next() {
        if (this.currentStep < this.config.steps.length - 1) {
            this.handleNext();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.handlePrev();
        }
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
            this.currentStep = stepIndex;
            this.updateStep();
        }
    }

    // Private methods
    createElements() {
        // Create overlay
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = `guidemefast-overlay guidemefast-theme-${this.config.theme}`;

        // Create backdrop - FIXED: Use fixed positioning
        this.elements.backdrop = document.createElement('div');
        this.elements.backdrop.className = 'guidemefast-backdrop';
        this.elements.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${this.config.zIndex};
            opacity: ${this.config.backdropOpacity};
        `;
        Object.assign(this.elements.backdrop.style, this.config.customStyles.backdrop || {});

        if (this.config.closeOnClickOutside) {
            this.elements.backdrop.addEventListener('click', this.handleClose);
        }

        // Create highlight - FIXED: Use fixed positioning
        this.elements.highlight = document.createElement('div');
        this.elements.highlight.className = 'guidemefast-highlight';
        this.elements.highlight.style.cssText = `
            position: fixed;
            z-index: ${this.config.zIndex + 1};
            pointer-events: none;
        `;
        Object.assign(this.elements.highlight.style, this.config.customStyles.highlight || {});

        // Create tooltip - FIXED: Use fixed positioning
        this.elements.tooltip = document.createElement('div');
        this.elements.tooltip.className = 'guidemefast-tooltip';
        this.elements.tooltip.style.cssText = `
            position: fixed;
            z-index: ${this.config.zIndex + 2};
        `;
        Object.assign(this.elements.tooltip.style, this.config.customStyles.tooltip || {});

        // Create tooltip content
        this.createTooltipContent();

        // Append to overlay
        this.elements.overlay.appendChild(this.elements.backdrop);
        this.elements.overlay.appendChild(this.elements.highlight);
        this.elements.overlay.appendChild(this.elements.tooltip);

        // Append to body
        document.body.appendChild(this.elements.overlay);
    }

    createTooltipContent() {
        this.elements.tooltip.innerHTML = `
      <button class="guidemefast-close" aria-label="Close tour">×</button>
      
      ${this.config.showProgress ? `
        <div class="guidemefast-progress">
          <div class="guidemefast-progress-bar"></div>
        </div>
      ` : ''}
      
      ${this.config.showStepNumbers ? `
        <div class="guidemefast-step-counter"></div>
      ` : ''}
      
      <div class="guidemefast-content">
        <h3 class="guidemefast-title"></h3>
        <div class="guidemefast-body"></div>
      </div>
      
      <div class="guidemefast-navigation">
        <button class="guidemefast-btn guidemefast-btn-ghost guidemefast-skip">Skip Tour</button>
        <button class="guidemefast-btn guidemefast-btn-secondary guidemefast-prev">Previous</button>
        <button class="guidemefast-btn guidemefast-btn-primary guidemefast-next">Next</button>
      </div>
      
      <div class="guidemefast-arrow"></div>
    `;

        // Get references to interactive elements
        this.elements.closeBtn = this.elements.tooltip.querySelector('.guidemefast-close');
        this.elements.skipBtn = this.elements.tooltip.querySelector('.guidemefast-skip');
        this.elements.prevBtn = this.elements.tooltip.querySelector('.guidemefast-prev');
        this.elements.nextBtn = this.elements.tooltip.querySelector('.guidemefast-next');
        this.elements.progressBar = this.elements.tooltip.querySelector('.guidemefast-progress-bar');
        this.elements.stepCounter = this.elements.tooltip.querySelector('.guidemefast-step-counter');
        this.elements.title = this.elements.tooltip.querySelector('.guidemefast-title');
        this.elements.body = this.elements.tooltip.querySelector('.guidemefast-body');
        this.elements.arrow = this.elements.tooltip.querySelector('.guidemefast-arrow');

        // Attach event listeners
        this.elements.closeBtn?.addEventListener('click', this.handleClose);
        this.elements.skipBtn?.addEventListener('click', this.handleSkip);
        this.elements.prevBtn?.addEventListener('click', this.handlePrev);
        this.elements.nextBtn?.addEventListener('click', this.handleNext);
    }

    updateStep() {
        const step = this.config.steps[this.currentStep];
        if (!step) return;

        // Update tooltip content first
        this.updateTooltipContent(step);

        // Then update positions
        this.updatePositions();

        // Scroll to element if needed
        this.scrollToElement(step.target);
    }

    // FIXED: More efficient position update with requestAnimationFrame
    updatePositions() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
            const step = this.config.steps[this.currentStep];
            if (!step) return;

            this.updateHighlight(step.target);
            this.updateTooltip(step);
        });
    }

    // FIXED: Use getBoundingClientRect for viewport-relative positioning
    updateHighlight(target) {
        const element = document.querySelector(target);
        if (!element) {
            this.elements.highlight.style.display = 'none';
            return;
        }

        const rect = element.getBoundingClientRect();

        // Use fixed positioning based on viewport coordinates
        const highlightStyle = {
            display: 'block',
            position: 'fixed',
            top: (rect.top - this.config.highlightPadding) + 'px',
            left: (rect.left - this.config.highlightPadding) + 'px',
            width: (rect.width + this.config.highlightPadding * 2) + 'px',
            height: (rect.height + this.config.highlightPadding * 2) + 'px'
        };

        Object.assign(this.elements.highlight.style, highlightStyle);
    }

    // FIXED: Simplified tooltip positioning
    updateTooltip(step) {
        const target = document.querySelector(step.target);
        if (!target) return;

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.elements.tooltip.getBoundingClientRect();

        const targetPos = {
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height
        };

        const tooltipSize = {
            width: tooltipRect.width || 320,
            height: tooltipRect.height || 200
        };

        const position = this.calculateTooltipPosition(
            targetPos,
            step.placement || 'top',
            tooltipSize,
            step.offset || { x: 0, y: 0 }
        );

        // Use fixed positioning
        this.elements.tooltip.style.position = 'fixed';
        this.elements.tooltip.style.top = position.top + 'px';
        this.elements.tooltip.style.left = position.left + 'px';
    }

    updateTooltipContent(step) {
        // Update title
        if (this.elements.title) {
            this.elements.title.textContent = step.title || '';
            this.elements.title.style.display = step.title ? 'block' : 'none';
        }

        // Update body
        if (this.elements.body) {
            this.elements.body.innerHTML = step.content || '';
        }

        // Update step counter
        if (this.elements.stepCounter && this.config.showStepNumbers) {
            this.elements.stepCounter.textContent = `${this.currentStep + 1} of ${this.config.steps.length}`;
        }

        // Update progress bar
        if (this.elements.progressBar && this.config.showProgress) {
            const progress = ((this.currentStep + 1) / this.config.steps.length) * 100;
            this.elements.progressBar.style.width = progress + '%';
        }

        // Update navigation buttons
        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        if (this.elements.prevBtn) {
            this.elements.prevBtn.style.display =
                (isFirstStep || step.showPrev === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.skipBtn) {
            this.elements.skipBtn.style.display =
                (isLastStep || step.showSkip === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.nextBtn) {
            this.elements.nextBtn.textContent = isLastStep ? 'Finish' : 'Next';
            this.elements.nextBtn.style.display = step.showNext === false ? 'none' : 'inline-flex';
        }

        // Update custom class
        if (step.customClass) {
            this.elements.tooltip.className = `guidemefast-tooltip ${step.customClass}`;
        }

        // Update arrow direction
        if (this.elements.arrow) {
            const placement = step.placement || 'top';
            this.elements.arrow.className = `guidemefast-arrow guidemefast-arrow-${placement}`;
        }
    }

    calculateTooltipPosition(targetPos, placement, tooltipSize, offset) {
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

        if (left < 10) left = 10;
        if (left + tooltipSize.width > viewportWidth - 10) {
            left = viewportWidth - tooltipSize.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipSize.height > viewportHeight - 10) {
            top = viewportHeight - tooltipSize.height - 10;
        }

        return { top, left };
    }

    scrollToElement(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: this.config.scrollBehavior,
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    // Event handlers
    async handleNext() {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        this.setLoading(true);

        try {
            if (step?.onNext) {
                await step.onNext();
            }

            if (isLastStep) {
                this.config.onComplete?.();
                this.stop();
            } else {
                this.currentStep++;
                this.updateStep();
            }
        } catch (error) {
            console.error('Error in onNext:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async handlePrev() {
        if (this.loading || this.currentStep === 0) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step?.onPrev) {
                await step.onPrev();
            }

            this.currentStep--;
            this.updateStep();
        } catch (error) {
            console.error('Error in onPrev:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async handleSkip() {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step?.onSkip) {
                await step.onSkip();
            } else if (this.config.onSkip) {
                await this.config.onSkip();
            }
        } catch (error) {
            console.error('Error in onSkip:', error);
        } finally {
            this.setLoading(false);
            this.stop();
        }
    }

    handleClose() {
        this.stop();
    }

    handleKeyDown(e) {
        if (!this.config.closeOnEscape || e.key !== 'Escape') return;
        this.handleClose();
    }

    // FIXED: Use requestAnimationFrame for smooth updates
    handleResize() {
        if (!this.isActive) return;
        this.updatePositions();
    }

    // FIXED: Use requestAnimationFrame for smooth scroll updates
    handleScroll() {
        if (!this.isActive) return;
        this.updatePositions();
    }

    setLoading(loading) {
        this.loading = loading;

        const buttons = [this.elements.nextBtn, this.elements.prevBtn, this.elements.skipBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = loading;
                if (btn === this.elements.nextBtn) {
                    if (loading) {
                        btn.dataset.originalText = btn.textContent;
                        btn.textContent = 'Loading...';
                    } else if (btn.dataset.originalText) {
                        btn.textContent = btn.dataset.originalText;
                        delete btn.dataset.originalText;
                    }
                }
            }
        });
    }

    attachEventListeners() {
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        // Use passive listeners for better performance
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
    }

    removeElements() {
        if (this.elements.overlay && this.elements.overlay.parentNode) {
            this.elements.overlay.parentNode.removeChild(this.elements.overlay);
        }
        this.elements = {};
    }

    // Utility methods (useful to keep)
    getCurrentStep() {
        return this.config.steps[this.currentStep];
    }

    getProgress() {
        return Math.round(((this.currentStep + 1) / this.config.steps.length) * 100);
    }

    addStep(step, index = null) {
        if (index === null) {
            this.config.steps.push(step);
        } else {
            this.config.steps.splice(index, 0, step);
        }
    }

    removeStep(index) {
        if (index >= 0 && index < this.config.steps.length) {
            this.config.steps.splice(index, 1);

            if (this.currentStep >= index && this.currentStep > 0) {
                this.currentStep--;
            }

            if (this.isActive) {
                this.updateStep();
            }
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        if (this.isActive && this.elements.overlay) {
            this.elements.overlay.className = `guidemefast-overlay guidemefast-theme-${this.config.theme}`;
        }
    }
}

// Global API for CDN usage
if (typeof window !== 'undefined') {
    window.GuideMeFast = GuideMeFast;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuideMeFast;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return GuideMeFast;
    });
}